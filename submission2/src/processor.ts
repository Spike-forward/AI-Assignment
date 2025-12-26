import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { initDatabase, getStats, markAsProcessed } from './database';

// 資料夾路徑
const IMAGES_DIR = path.join(__dirname, '..', 'images');
const PROCESSED_DIR = path.join(__dirname, '..', 'processed');

// 確保資料夾存在
function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`已建立資料夾: ${dir}`);
  }
}

// 處理單張圖片
async function processImage(inputPath: string, outputPath: string): Promise<boolean> {
  try {
    const maxSize = 500;
    const maxFileSize = 50 * 1024; // 50KB
    let quality = 80;
    let currentSize = maxSize;
    
    // 讀取圖片資訊
    const metadata = await sharp(inputPath).metadata();
    if (!metadata.width || !metadata.height) {
      return false;
    }
    
    // 計算裁剪尺寸（取較小邊）
    const minDimension = Math.min(metadata.width, metadata.height);
    const cropSize = Math.min(minDimension, maxSize);
    
    // 處理圖片：置中裁剪 + 調整大小 + 轉換為 JPEG
    let buffer = await sharp(inputPath)
      .resize(cropSize, cropSize, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality })
      .toBuffer();
    
    // 如果檔案太大，逐步降低品質和尺寸
    while (buffer.length > maxFileSize && (quality > 50 || currentSize > 100)) {
      if (quality > 50) {
        quality -= 10;
      } else {
        currentSize = Math.floor(currentSize * 0.8);
      }
      
      buffer = await sharp(inputPath)
        .resize(currentSize, currentSize, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality })
        .toBuffer();
    }
    
    // 儲存處理後的圖片
    fs.writeFileSync(outputPath, buffer);
    return true;
  } catch {
    return false;
  }
}

// 主程式
async function main() {
  console.log('=============================================');
  console.log('=== Step 4: 圖片處理 ===');
  console.log('=============================================');
  console.log('處理規格：');
  console.log('  - 尺寸：不超過 500×500 像素');
  console.log('  - 格式：JPEG');
  console.log('  - 品質：50-80');
  console.log('  - 大小：不超過 50KB\n');
  
  // 初始化
  initDatabase();
  ensureDirectoryExists(PROCESSED_DIR);
  
  // 取得所有圖片檔案
  const files = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.jpg'));
  const totalFiles = files.length;
  
  console.log(`找到 ${totalFiles} 張圖片待處理\n`);
  
  let processedCount = 0;
  let failedCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(IMAGES_DIR, file);
    const outputPath = path.join(PROCESSED_DIR, file);
    
    const success = await processImage(inputPath, outputPath);
    
    if (success) {
      processedCount++;
      // 從檔名取得 ID 並標記為已處理
      const id = parseInt(file.replace('.jpg', ''));
      if (!isNaN(id)) {
        markAsProcessed(id);
      }
    } else {
      failedCount++;
    }
    
    // 顯示進度
    if ((i + 1) % 100 === 0 || i === files.length - 1) {
      const percent = Math.round((i + 1) / totalFiles * 100);
      console.log(`進度: ${i + 1}/${totalFiles} (${percent}%) - 成功: ${processedCount}, 失敗: ${failedCount}`);
    }
  }
  
  // 統計處理後的檔案大小
  const processedFiles = fs.readdirSync(PROCESSED_DIR).filter(f => f.endsWith('.jpg'));
  let totalSize = 0;
  let maxFileSize = 0;
  let minFileSize = Infinity;
  
  for (const file of processedFiles) {
    const filePath = path.join(PROCESSED_DIR, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
    maxFileSize = Math.max(maxFileSize, stats.size);
    minFileSize = Math.min(minFileSize, stats.size);
  }
  
  const avgSize = totalSize / processedFiles.length;
  
  // 最終統計
  console.log('\n=============================================');
  console.log('=== 處理完成 ===');
  console.log(`成功處理: ${processedCount} 張`);
  console.log(`處理失敗: ${failedCount} 張`);
  console.log(`\n檔案大小統計：`);
  console.log(`  平均: ${(avgSize / 1024).toFixed(2)} KB`);
  console.log(`  最小: ${(minFileSize / 1024).toFixed(2)} KB`);
  console.log(`  最大: ${(maxFileSize / 1024).toFixed(2)} KB`);
  console.log(`\n處理後圖片儲存於: ${PROCESSED_DIR}`);
  console.log('=============================================');
}

// 執行
main().catch(console.error);