import { chromium } from 'playwright';
import { initDatabase, insertImage, getStats } from './database';

// 動漫角色關鍵字列表（主題：人類/人形動漫角色，各類型的性別和職業）
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

// 搜尋 Google 圖片並收集 URL
async function scrapeGoogleImages(keyword: string, maxScrolls: number = 15) {
  console.log(`\n開始搜尋: ${keyword}`);
  
  // 啟動瀏覽器
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  let collectedInThisSearch = 0;
  
  try {
    // 前往 Google 圖片搜尋
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&tbm=isch&hl=en`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    
    // 等待頁面載入
    await page.waitForTimeout(2000);
    
    let lastHeight = 0;
    let noChangeCount = 0;
    let scrollCount = 0;
    
    // 持續滾動頁面收集圖片
    while (noChangeCount < 3 && scrollCount < maxScrolls) {
      scrollCount++;
      
      // 取得所有圖片元素的 src
      const images = await page.evaluate(() => {
        const results: { src: string; alt: string }[] = [];
        
        // 取得所有 img 標籤
        const imgElements = document.querySelectorAll('img');
        imgElements.forEach((img) => {
          const src = img.src || img.getAttribute('data-src') || '';
          const alt = img.alt || '';
          
          // 收集有效的圖片 URL（長度 > 100 通常是真正的圖片）
          if (src && src.length > 100) {
            results.push({ src, alt });
          }
        });
        
        return results;
      });
      
      // 儲存到資料庫
      for (const img of images) {
        try {
          insertImage(keyword, img.src, img.alt);
        } catch {
          // 忽略重複的圖片
        }
      }
      
      collectedInThisSearch = images.length;
      
      // 顯示進度
      const stats = getStats();
      console.log(`  滾動 ${scrollCount}/${maxScrolls} - 本次找到: ${collectedInThisSearch} 張, 資料庫總共: ${stats.total} 張`);
      
      // 滾動頁面載入更多圖片
      const currentHeight = await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight * 2);
        return document.body.scrollHeight;
      });
      
      // 檢查頁面高度是否有變化
      if (currentHeight === lastHeight) {
        noChangeCount++;
        
        // 嘗試點擊「顯示更多結果」按鈕
        try {
          const buttons = await page.$$('input[type="button"], button');
          for (const btn of buttons) {
            const text = await btn.textContent();
            if (text && (text.includes('Show more') || text.includes('更多'))) {
              await btn.click();
              await page.waitForTimeout(2000);
              noChangeCount = 0;
              break;
            }
          }
        } catch {
          // 忽略錯誤
        }
      } else {
        noChangeCount = 0;
      }
      
      lastHeight = currentHeight;
      await page.waitForTimeout(1000);
    }
    
  } catch (error) {
    console.error(`搜尋 ${keyword} 時發生錯誤:`, error);
  } finally {
    await browser.close();
  }
  
  return collectedInThisSearch;
}

// 主程式
async function main() {
  console.log('=============================================');
  console.log('=== 習作一：自動搜集圖像數據集與初步處理 ===');
  console.log('=============================================');
  console.log('主題：人類/人形動漫角色，各類型的性別和職業');
  console.log('目標：3000 - 5000 張圖片\n');
  
  // 初始化資料庫
  initDatabase();
  
  // 顯示初始狀態
  const initialStats = getStats();
  console.log(`資料庫中已有: ${initialStats.total} 張圖片\n`);
  
  // 搜尋每個關鍵字
  for (const keyword of ANIME_KEYWORDS) {
    await scrapeGoogleImages(keyword, 15);
    
    // 顯示目前進度
    const stats = getStats();
    console.log(`\n==> 目前總共收集: ${stats.total} 張圖片`);
    console.log(`==> 進度: ${Math.min(100, Math.round(stats.total / 50))}% (目標: 5000 張)\n`);
    
    // 如果已經收集超過 5000 張，停止
    if (stats.total >= 5000) {
      console.log('🎉 已達到目標數量！');
      break;
    }
    
    // 等待一下再繼續下一個關鍵字（避免被 Google 封鎖）
    console.log('等待 2 秒後繼續下一個關鍵字...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 最終統計
  const finalStats = getStats();
  console.log('\n=============================================');
  console.log('=== 收集完成 ===');
  console.log(`總共收集: ${finalStats.total} 張圖片`);
  console.log('=============================================');
}

// 執行主程式
main().catch(console.error);
