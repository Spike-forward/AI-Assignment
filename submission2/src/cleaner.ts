/**
 * 習作二：圖片清理模組
 * 功能：
 * 1. 規則過濾 - 過濾太小、比例異常的圖片
 * 2. 重複檢測 - 使用 perceptual hash 檢測相似圖片
 * 3. 統計分析 - 生成清理報告
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import * as imageHashModule from 'image-hash';
import { promisify } from 'util';

// 將 imageHash 轉換為 Promise 版本
const imageHashFn = (imageHashModule as any).imageHash || (imageHashModule as any).default || imageHashModule;
const getImageHash = promisify(imageHashFn);

// 設定參數
const CONFIG = {
  // 圖片來源資料夾
  sourceDir: path.join(__dirname, '..', 'images'),
  // 清理後的輸出資料夾
  cleanedDir: path.join(__dirname, '..', 'cleaned'),
  // 被移除圖片的資料夾（用於檢查）
  rejectedDir: path.join(__dirname, '..', 'rejected'),
  
  // 過濾規則
  rules: {
    minWidth: 100,        // 最小寬度
    minHeight: 100,       // 最小高度
    maxAspectRatio: 3.0,  // 最大長寬比 (避免橫幅廣告)
    minAspectRatio: 0.33, // 最小長寬比 (避免細長圖片)
    minFileSize: 5000,    // 最小檔案大小 (5KB)
    maxFileSize: 10000000, // 最大檔案大小 (10MB)
  },
  
  // Hash 相似度閾值 (越小越嚴格)
  hashSimilarityThreshold: 5,
};

// 統計數據
interface CleaningStats {
  total: number;
  passed: number;
  rejected: {
    tooSmall: number;
    badAspectRatio: number;
    tooSmallFile: number;
    tooLargeFile: number;
    duplicate: number;
    corrupted: number;
  };
}

const stats: CleaningStats = {
  total: 0,
  passed: 0,
  rejected: {
    tooSmall: 0,
    badAspectRatio: 0,
    tooSmallFile: 0,
    tooLargeFile: 0,
    duplicate: 0,
    corrupted: 0,
  },
};

// 已處理圖片的 hash 集合（用於檢測重複）
const processedHashes: Map<string, string> = new Map();

/**
 * 確保資料夾存在
 */
function ensureDirectories() {
  [CONFIG.cleanedDir, CONFIG.rejectedDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 已建立資料夾: ${dir}`);
    }
  });
}

/**
 * 計算兩個 hash 的漢明距離
 */
function hammingDistance(hash1: string, hash2: string): number {
  let distance = 0;
  for (let i = 0; i < Math.min(hash1.length, hash2.length); i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}

/**
 * 檢查圖片是否為重複
 */
function isDuplicate(hash: string): { isDup: boolean; originalFile?: string } {
  for (const [existingHash, fileName] of processedHashes) {
    if (hammingDistance(hash, existingHash) <= CONFIG.hashSimilarityThreshold) {
      return { isDup: true, originalFile: fileName };
    }
  }
  return { isDup: false };
}

/**
 * 分析並過濾單張圖片
 */
async function analyzeImage(filePath: string): Promise<{
  passed: boolean;
  reason?: string;
  metadata?: sharp.Metadata;
  hash?: string;
}> {
  const fileName = path.basename(filePath);
  
  try {
    // 1. 檢查檔案大小
    const fileStats = fs.statSync(filePath);
    if (fileStats.size < CONFIG.rules.minFileSize) {
      return { passed: false, reason: 'tooSmallFile' };
    }
    if (fileStats.size > CONFIG.rules.maxFileSize) {
      return { passed: false, reason: 'tooLargeFile' };
    }
    
    // 2. 讀取圖片元數據
    const metadata = await sharp(filePath).metadata();
    
    if (!metadata.width || !metadata.height) {
      return { passed: false, reason: 'corrupted' };
    }
    
    // 3. 檢查尺寸
    if (metadata.width < CONFIG.rules.minWidth || metadata.height < CONFIG.rules.minHeight) {
      return { passed: false, reason: 'tooSmall' };
    }
    
    // 4. 檢查長寬比
    const aspectRatio = metadata.width / metadata.height;
    if (aspectRatio > CONFIG.rules.maxAspectRatio || aspectRatio < CONFIG.rules.minAspectRatio) {
      return { passed: false, reason: 'badAspectRatio' };
    }
    
    // 5. 計算圖片 hash 並檢查重複
    try {
      const hash = await getImageHash(filePath, 16, true) as string;
      const dupCheck = isDuplicate(hash);
      
      if (dupCheck.isDup) {
        console.log(`⚠️ 重複圖片: ${fileName}`);
        console.log(`   - 原始檔案: ${dupCheck.originalFile}`);
        console.log(`   - 哈希值: ${hash}`);
        console.log(`   - 漢明距離: ${hammingDistance(hash, processedHashes.get(dupCheck.originalFile!)!)}`);
        return { passed: false, reason: 'duplicate', hash };
      }
      
      // 記錄這個 hash
      processedHashes.set(hash, fileName);
      
      return { passed: true, metadata, hash };
    } catch (hashError) {
      // Hash 計算失敗，但圖片本身可能是好的
      console.warn(`⚠️ Hash 計算失敗: ${fileName}`);
      return { passed: true, metadata };
    }
    
  } catch (error) {
    return { passed: false, reason: 'corrupted' };
  }
}

/**
 * 處理單張圖片
 */
async function processImage(filePath: string): Promise<void> {
  const fileName = path.basename(filePath);
  stats.total++;
  
  const result = await analyzeImage(filePath);
  
  if (result.passed) {
    // 複製到 cleaned 資料夾
    const destPath = path.join(CONFIG.cleanedDir, fileName);
    fs.copyFileSync(filePath, destPath);
    stats.passed++;
  } else {
    // 移動到 rejected 資料夾
    const reason = result.reason as keyof typeof stats.rejected;
    if (stats.rejected[reason] !== undefined) {
      stats.rejected[reason]++;
    }
    
    // 建立子資料夾分類被拒絕的圖片
    const rejectSubDir = path.join(CONFIG.rejectedDir, reason);
    if (!fs.existsSync(rejectSubDir)) {
      fs.mkdirSync(rejectSubDir, { recursive: true });
    }
    fs.copyFileSync(filePath, path.join(rejectSubDir, fileName));
  }
}

/**
 * 顯示進度條
 */
function showProgress(current: number, total: number, message: string) {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filled = Math.round(barLength * current / total);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  
  process.stdout.write(`\r[${bar}] ${percentage}% (${current}/${total}) ${message}`);
}

/**
 * 主要清理函數
 */
async function cleanImages() {
  console.log('🧹 開始圖片清理程序...\n');
  console.log('📋 過濾規則:');
  console.log(`   - 最小尺寸: ${CONFIG.rules.minWidth}x${CONFIG.rules.minHeight}`);
  console.log(`   - 長寬比範圍: ${CONFIG.rules.minAspectRatio} ~ ${CONFIG.rules.maxAspectRatio}`);
  console.log(`   - 檔案大小: ${CONFIG.rules.minFileSize / 1000}KB ~ ${CONFIG.rules.maxFileSize / 1000000}MB`);
  console.log(`   - 重複檢測閾值: ${CONFIG.hashSimilarityThreshold}\n`);
  
  // 確保資料夾存在
  ensureDirectories();
  
  // 檢查來源資料夾
  if (!fs.existsSync(CONFIG.sourceDir)) {
    console.error(`❌ 找不到圖片資料夾: ${CONFIG.sourceDir}`);
    console.log('請先執行 downloader.ts 下載圖片！');
    return;
  }
  
  // 讀取所有圖片檔案
  const files = fs.readdirSync(CONFIG.sourceDir)
    .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
  
  if (files.length === 0) {
    console.log('⚠️ 沒有找到任何圖片檔案');
    return;
  }
  
  console.log(`📷 找到 ${files.length} 張圖片\n`);
  
  // 處理每張圖片
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(CONFIG.sourceDir, files[i]);
    await processImage(filePath);
    showProgress(i + 1, files.length, files[i].substring(0, 20));
  }
  
  console.log('\n\n');
  printReport();
}

/**
 * 列印清理報告
 */
function printReport() {
  console.log('═'.repeat(50));
  console.log('📊 圖片清理報告');
  console.log('═'.repeat(50));
  
  console.log(`\n📷 總圖片數: ${stats.total}`);
  console.log(`✅ 通過審核: ${stats.passed} (${Math.round(stats.passed / stats.total * 100)}%)`);
  console.log(`❌ 被移除: ${stats.total - stats.passed} (${Math.round((stats.total - stats.passed) / stats.total * 100)}%)`);
  
  console.log('\n📋 移除原因分析:');
  console.log(`   🔸 尺寸太小: ${stats.rejected.tooSmall}`);
  console.log(`   🔸 長寬比異常: ${stats.rejected.badAspectRatio}`);
  console.log(`   🔸 檔案太小: ${stats.rejected.tooSmallFile}`);
  console.log(`   🔸 檔案太大: ${stats.rejected.tooLargeFile}`);
  console.log(`   🔸 重複圖片: ${stats.rejected.duplicate}`);
  console.log(`   🔸 損壞圖片: ${stats.rejected.corrupted}`);
  
  console.log('\n📁 輸出位置:');
  console.log(`   ✅ 清理後圖片: ${CONFIG.cleanedDir}`);
  console.log(`   ❌ 被移除圖片: ${CONFIG.rejectedDir}`);
  
  console.log('\n' + '═'.repeat(50));
  
  // 儲存報告到檔案
  const reportPath = path.join(__dirname, '..', 'cleaning-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    stats,
    config: CONFIG.rules,
  }, null, 2));
  console.log(`💾 報告已儲存: ${reportPath}`);
}

// 執行清理
cleanImages().catch(console.error);


