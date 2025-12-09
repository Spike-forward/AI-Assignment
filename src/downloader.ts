import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { initDatabase, getPendingImages, markAsDownloaded, getStats } from './database';

// 圖片儲存資料夾
const IMAGES_DIR = path.join(__dirname, '..', 'images');

// 確保資料夾存在
function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`已建立資料夾: ${dir}`);
  }
}

// 下載單張圖片
async function downloadImage(url: string, filename: string): Promise<boolean> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // 檢查是否為有效的圖片資料
    if (response.data && response.data.length > 1000) {
      const filepath = path.join(IMAGES_DIR, filename);
      fs.writeFileSync(filepath, response.data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// 主程式
async function main() {
  console.log('=============================================');
  console.log('=== Step 3: 下載圖片到本地 ===');
  console.log('=============================================\n');
  
  // 初始化
  initDatabase();
  ensureDirectoryExists(IMAGES_DIR);
  
  // 取得統計
  let stats = getStats();
  console.log(`資料庫中共有: ${stats.total} 張圖片`);
  console.log(`已下載: ${stats.downloaded} 張`);
  console.log(`待下載: ${stats.total - stats.downloaded} 張\n`);
  
  // 如果已經全部下載完成
  if (stats.downloaded >= stats.total) {
    console.log('所有圖片已下載完成！');
    return;
  }
  
  // 批次下載
  const batchSize = 50;
  let downloadedCount = 0;
  let failedCount = 0;
  let totalProcessed = 0;
  
  while (true) {
    // 取得未下載的圖片
    const images = getPendingImages(batchSize) as Array<{
      id: number;
      keyword: string;
      src: string;
      alt: string;
    }>;
    
    if (images.length === 0) {
      console.log('\n所有圖片已處理完成！');
      break;
    }
    
    console.log(`\n正在處理第 ${totalProcessed + 1} - ${totalProcessed + images.length} 張...`);
    
    for (const img of images) {
      // 產生檔案名稱
      const filename = `${img.id}.jpg`;
      
      // 下載圖片
      const success = await downloadImage(img.src, filename);
      
      // 不論成功或失敗，都標記為已處理（避免無限重試）
      markAsDownloaded(img.id);
      
      if (success) {
        downloadedCount++;
      } else {
        failedCount++;
      }
      
      totalProcessed++;
      
      // 每 10 張顯示一次進度
      if (totalProcessed % 10 === 0) {
        process.stdout.write(`  進度: ${downloadedCount} 成功, ${failedCount} 失敗\r`);
      }
    }
    
    // 顯示進度
    stats = getStats();
    const remaining = stats.total - stats.downloaded;
    console.log(`  已處理: ${stats.downloaded} / ${stats.total} | 剩餘: ${remaining} 張`);
    
    // 稍微等待，避免請求過快
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // 計算實際下載的圖片數量
  const actualFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.jpg')).length;
  
  // 最終統計
  console.log('\n=============================================');
  console.log('=== 下載完成 ===');
  console.log(`本次成功下載: ${downloadedCount} 張`);
  console.log(`本次下載失敗: ${failedCount} 張`);
  console.log(`資料夾中共有: ${actualFiles} 張圖片`);
  console.log(`圖片儲存於: ${IMAGES_DIR}`);
  console.log('=============================================');
}

// 執行
main().catch(console.error);
