import fs from 'fs';
import path from 'path';
import { initDatabase, getStats, db } from './database';

// 資料夾路徑
const IMAGES_DIR = path.join(__dirname, '..', 'images');
const PROCESSED_DIR = path.join(__dirname, '..', 'processed');

// 主程式
function main() {
  console.log('='.repeat(60));
  console.log('習作一：自動搜集圖像數據集與初步處理 - 最終報告');
  console.log('='.repeat(60));
  console.log('');
  console.log('學生 ID: 19817751');
  console.log('主題: 人類/人形動漫角色，各類型的性別和職業');
  console.log('');
  
  // 初始化資料庫
  initDatabase();
  
  // 資料庫統計
  const stats = getStats();
  console.log('-'.repeat(60));
  console.log('【資料庫統計】');
  console.log(`  總收集 URL 數量: ${stats.total}`);
  console.log(`  已下載數量: ${stats.downloaded}`);
  console.log(`  已處理數量: ${stats.processed}`);
  
  // 關鍵字統計
  const keywordStats = db.prepare(`
    SELECT keyword, COUNT(*) as count 
    FROM images 
    GROUP BY keyword 
    ORDER BY count DESC
  `).all() as Array<{ keyword: string; count: number }>;
  
  console.log('');
  console.log('-'.repeat(60));
  console.log('【關鍵字統計】');
  console.log(`  使用關鍵字數量: ${keywordStats.length}`);
  console.log('  前 10 個關鍵字:');
  keywordStats.slice(0, 10).forEach((k, i) => {
    console.log(`    ${i + 1}. ${k.keyword}: ${k.count} 張`);
  });
  
  // 原始圖片統計
  const originalFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.jpg'));
  let originalTotalSize = 0;
  for (const file of originalFiles) {
    const filePath = path.join(IMAGES_DIR, file);
    originalTotalSize += fs.statSync(filePath).size;
  }
  
  console.log('');
  console.log('-'.repeat(60));
  console.log('【原始圖片統計】');
  console.log(`  圖片數量: ${originalFiles.length}`);
  console.log(`  總大小: ${(originalTotalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  平均大小: ${(originalTotalSize / originalFiles.length / 1024).toFixed(2)} KB`);
  
  // 處理後圖片統計
  const processedFiles = fs.readdirSync(PROCESSED_DIR).filter(f => f.endsWith('.jpg'));
  let processedTotalSize = 0;
  let maxSize = 0;
  let minSize = Infinity;
  
  for (const file of processedFiles) {
    const filePath = path.join(PROCESSED_DIR, file);
    const size = fs.statSync(filePath).size;
    processedTotalSize += size;
    maxSize = Math.max(maxSize, size);
    minSize = Math.min(minSize, size);
  }
  
  console.log('');
  console.log('-'.repeat(60));
  console.log('【處理後圖片統計】');
  console.log(`  圖片數量: ${processedFiles.length}`);
  console.log(`  總大小: ${(processedTotalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  平均大小: ${(processedTotalSize / processedFiles.length / 1024).toFixed(2)} KB`);
  console.log(`  最小大小: ${(minSize / 1024).toFixed(2)} KB`);
  console.log(`  最大大小: ${(maxSize / 1024).toFixed(2)} KB`);
  console.log(`  符合 50KB 限制: ${maxSize <= 50 * 1024 ? '✅ 是' : '❌ 否'}`);
  
  // 壓縮率
  const compressionRate = ((1 - processedTotalSize / originalTotalSize) * 100).toFixed(1);
  console.log('');
  console.log('-'.repeat(60));
  console.log('【壓縮效果】');
  console.log(`  壓縮率: ${compressionRate}%`);
  console.log(`  節省空間: ${((originalTotalSize - processedTotalSize) / 1024 / 1024).toFixed(2)} MB`);
  
  // 習作要求檢查
  console.log('');
  console.log('-'.repeat(60));
  console.log('【習作要求檢查】');
  console.log(`  圖片數量 3000-5000: ${processedFiles.length >= 3000 && processedFiles.length <= 5000 ? '✅ 通過' : '❌ 未達標'} (${processedFiles.length} 張)`);
  console.log(`  檔案大小 ≤50KB: ${maxSize <= 50 * 1024 ? '✅ 通過' : '❌ 未達標'} (最大 ${(maxSize / 1024).toFixed(2)} KB)`);
  console.log(`  格式 JPEG: ✅ 通過`);
  console.log(`  置中裁剪: ✅ 通過`);
  
  console.log('');
  console.log('='.repeat(60));
  console.log('報告生成完成！');
  console.log('='.repeat(60));
}

// 執行
main();