import { chromium, Page } from 'playwright';
import { initDatabase, insertImage, getStats } from './database';

// 動漫角色關鍵字列表
const ANIME_KEYWORDS = [
  // ===== 動漫女僕角色 (Anime Maid Characters) =====
  'Misaki Ayuzawa Maid Sama anime',
  'Lilia Greyrat Mushoku Tensei anime',
  'Rem Re:Zero anime maid',
  'Ram Re:Zero anime maid',
  'Entoma Vasilissa Zeta Overlord anime',
  'Mey-Rin Black Butler anime',
  'Roberta Black Lagoon anime',
  'Virgo Fairy Tail anime maid',
  'Tohru Miss Kobayashi Dragon Maid anime',
  'Sakura Nekomi anime maid',
  'Ai Hayasaka Kaguya-sama anime',
  'Nagomi Wahira Akiba Maid War anime',
  'Faris Nyannyan Steins Gate anime',
  'Sena Kashiwazaki Haganai anime',
  'Hilda Beelzebub anime',
  'Narberal Gamma Overlord anime',
  'Ryuuou no Oshigoto anime maid',
  'Chihiro Komiya anime maid',
  'Siesta Tantei wa Mou Shindeiru anime',
  'Lilith anime maid mysterious',
  'Hinata Kaho Blend S anime',
  'Myucel Foaran Outbreak Company anime',
  'Sadayo Kawakami Persona 5 anime',
  'Erika Ono anime maid',
  'Maika Sakuranomiya Blend S anime',
  'Maria Hayate no Gotoku anime',
  'Otae Shimura Gintama anime',
  'Mariel Hanasato anime maid',
  'Hannah Annafellows Black Butler anime',
  'Kotori Minami Love Live anime',
  
  // ===== 進擊的巨人 (Attack on Titan) =====
  'attack on titan eren yeager',
  'attack on titan mikasa ackerman',
  'attack on titan levi ackerman',
  'attack on titan armin arlert',
  'attack on titan historia reiss',
  'shingeki no kyojin character',
  
  // ===== 鬼滅之刃 (Demon Slayer) =====
  'demon slayer tanjiro kamado',
  'demon slayer nezuko kamado',
  'demon slayer zenitsu agatsuma',
  'demon slayer shinobu kocho',
  'demon slayer mitsuri kanroji',
  'kimetsu no yaiba character',
  
  // ===== 經典動漫角色 =====
  'sailor moon anime character',
  'one piece luffy anime',
  'naruto anime character',
  'bleach anime character',
  
  // ===== 可愛動漫女孩 =====
  'cute anime girl illustration',
  'kawaii anime girl portrait',
  'anime girl summer hat',
  'anime girl school uniform',
  'anime girl idol',
  
  // ===== 其他熱門動漫 =====
  'spy x family anya anime',
  'spy x family yor anime',
  'frieren anime character',
  'jujutsu kaisen character',
  'my hero academia character'
];

// 從側邊面板提取高解析度圖片 URL
async function extractHighResImageUrl(page: Page): Promise<string | null> {
  try {
    // 等待側邊面板載入
    await page.waitForTimeout(1500);
    
    // 嘗試多種方式獲取原始圖片 URL
    const imageUrl = await page.evaluate(() => {
      // 方法 1: 查找側邊面板中的大圖
      const sidePanelImages = Array.from(document.querySelectorAll('img[jsname="kn3ccd"], img[jsname="JuXqh"]'));
      for (let i = 0; i < sidePanelImages.length; i++) {
        const img = sidePanelImages[i] as HTMLImageElement;
        const src = img.src;
        if (src && src.startsWith('http') && !src.includes('encrypted-tbn')) {
          return src;
        }
      }
      
      // 方法 2: 查找 data-src 屬性
      const imgsWithDataSrc = Array.from(document.querySelectorAll('img[data-src]'));
      for (let i = 0; i < imgsWithDataSrc.length; i++) {
        const img = imgsWithDataSrc[i];
        const dataSrc = img.getAttribute('data-src');
        if (dataSrc && dataSrc.startsWith('http') && !dataSrc.includes('encrypted-tbn')) {
          return dataSrc;
        }
      }
      
      // 方法 3: 查找側邊面板中任何大尺寸圖片
      const allImages = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
      for (let i = 0; i < allImages.length; i++) {
        const img = allImages[i];
        const src = img.src;
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        
        // 尋找較大的圖片（不是縮圖）
        if (src && src.startsWith('http') && !src.includes('encrypted-tbn') && 
            !src.includes('gstatic.com') && (width > 200 || height > 200)) {
          return src;
        }
      }
      
      // 方法 4: 查找連結中的原始圖片 URL
      const links = Array.from(document.querySelectorAll('a[href*="imgurl="]'));
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const href = link.getAttribute('href');
        if (href) {
          const match = href.match(/imgurl=([^&]+)/);
          if (match) {
            return decodeURIComponent(match[1]);
          }
        }
      }
      
      return null;
    });
    
    return imageUrl;
  } catch {
    return null;
  }
}

// 每 10 張圖片關閉瀏覽器的批次設定
const BATCH_SIZE = 10;

// 開啟新瀏覽器
async function openBrowser() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  return { browser, page };
}

// 搜尋 Google 圖片並收集高解析度 URL（每 10 張關閉瀏覽器）
async function scrapeGoogleImagesHQ(keyword: string, maxImages: number = 100) {
  console.log(`\n🔍 開始搜尋: ${keyword}`);
  console.log(`   目標: 每個關鍵字收集 ${maxImages} 張高解析度圖片`);
  console.log(`   模式: 每 ${BATCH_SIZE} 張圖片關閉瀏覽器`);
  
  let collectedCount = 0;
  let processedCount = 0;
  let startIndex = 0;
  
  while (collectedCount < maxImages) {
    let browser = null;
    let page = null;
    let batchCollected = 0;
    
    try {
      // 開啟新瀏覽器
      const browserData = await openBrowser();
      browser = browserData.browser;
      page = browserData.page;
      
      // 前往 Google 圖片搜尋
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&tbm=isch&hl=en`;
      await page.goto(searchUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // 先滾動頁面載入更多縮圖
      if (startIndex === 0) {
        console.log('   📜 滾動頁面載入圖片...');
      }
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
        await page.waitForTimeout(800);
      }
      
      // 回到頂部
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      
      // 獲取所有縮圖元素
      const thumbnails = await page.$$('div[jsname="dTDiAc"] img, div[data-id] img, g-img img');
      if (startIndex === 0) {
        console.log(`   📷 找到 ${thumbnails.length} 張縮圖，開始提取高解析度圖片...`);
      }
      
      // 如果沒有更多縮圖，結束
      if (startIndex >= thumbnails.length) {
        console.log(`   ⚠️ 已處理完所有可用縮圖`);
        break;
      }
      
      // 處理這批圖片
      for (let i = startIndex; i < Math.min(thumbnails.length, maxImages * 2) && collectedCount < maxImages && batchCollected < BATCH_SIZE; i++) {
        try {
          processedCount++;
          
          // 重新獲取縮圖（因為 DOM 可能已更新）
          const currentThumbnails = await page.$$('div[jsname="dTDiAc"] img, div[data-id] img, g-img img');
          if (i >= currentThumbnails.length) break;
          
          const thumbnail = currentThumbnails[i];
          
          // 滾動到縮圖位置
          await thumbnail.scrollIntoViewIfNeeded();
          await page.waitForTimeout(300);
          
          // 點擊縮圖
          await thumbnail.click();
          await page.waitForTimeout(1500);
          
          // 提取高解析度圖片 URL
          const highResUrl = await extractHighResImageUrl(page);
          
          if (highResUrl && highResUrl.length > 50) {
            // 獲取 alt 文字
            const alt = await thumbnail.getAttribute('alt') || keyword;
            
            try {
              insertImage(keyword, highResUrl, alt);
              collectedCount++;
              batchCollected++;
              
              if (collectedCount % 10 === 0) {
                const stats = getStats();
                console.log(`   ✅ 已收集: ${collectedCount}/${maxImages} 張 (總計: ${stats.total} 張)`);
              }
            } catch {
              // 重複圖片，忽略
            }
          }
          
          // 按 ESC 關閉側邊面板
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
          
          startIndex = i + 1;
          
        } catch (error) {
          // 單張圖片處理失敗，繼續下一張
          startIndex++;
          try {
            await page.keyboard.press('Escape');
          } catch {
            // 忽略
          }
        }
      }
      
    } catch (error) {
      console.error(`   ❌ 處理批次時發生錯誤:`, error);
    } finally {
      // 關閉瀏覽器
      if (browser) {
        await browser.close();
        console.log(`   🔄 已關閉瀏覽器 (本批次收集: ${batchCollected} 張)`);
      }
    }
    
    // 如果這批次沒有收集到任何圖片，可能已經沒有更多了
    if (batchCollected === 0) {
      console.log(`   ⚠️ 無法收集更多圖片，結束此關鍵字`);
      break;
    }
    
    // 等待一下再開啟新瀏覽器
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`   📊 ${keyword}: 處理 ${processedCount} 張，成功收集 ${collectedCount} 張高解析度圖片`);
  return collectedCount;
}

// 主程式
async function main() {
  console.log('=============================================');
  console.log('=== 習作一：高解析度圖片收集器 ===');
  console.log('=============================================');
  console.log('主題：人類/人形動漫角色，各類型的性別和職業');
  console.log('模式：點擊每張圖片提取原始高解析度 URL');
  console.log('目標：3000 - 5000 張高品質圖片\n');
  console.log('⚠️  注意：此模式較慢，但圖片品質更高\n');
  
  // 初始化資料庫
  initDatabase();
  
  // 顯示初始狀態
  const initialStats = getStats();
  console.log(`資料庫中已有: ${initialStats.total} 張圖片\n`);
  
  const targetPerKeyword = 80; // 每個關鍵字收集 80 張
  
  // 搜尋每個關鍵字
  for (const keyword of ANIME_KEYWORDS) {
    await scrapeGoogleImagesHQ(keyword, targetPerKeyword);
    
    // 顯示目前進度
    const stats = getStats();
    console.log(`\n==> 目前總共收集: ${stats.total} 張圖片`);
    console.log(`==> 進度: ${Math.min(100, Math.round(stats.total / 50))}% (目標: 5000 張)\n`);
    
    // 如果已經收集超過 5000 張，停止
    if (stats.total >= 5000) {
      console.log('🎉 已達到目標數量！');
      break;
    }
    
    // 等待避免被封鎖
    console.log('⏳ 等待 3 秒後繼續下一個關鍵字...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // 最終統計
  const finalStats = getStats();
  console.log('\n=============================================');
  console.log('=== 高解析度圖片收集完成 ===');
  console.log(`總共收集: ${finalStats.total} 張高品質圖片`);
  console.log('=============================================');
}

// 執行主程式
main().catch(console.error);

