import { firefox } from 'playwright';  // 引入 Firefox 瀏覽器

async function test() { // 測試函數
    console.log('正在啟動瀏覽器...'); // 印出正在啟動瀏覽器
  
  // 啟動 Firefox
  const browser = await firefox.launch({ headless: false });  // 啟動 Firefox 瀏覽器
  
  const page = await browser.newPage(); // 建立新分頁
  await page.goto('https://www.google.com'); // 前往 Google 首頁
  console.log('已開啟 Google！'); // 印出已開啟 Google
  
  await page.waitForTimeout(3000); // 等待 3 秒
  await browser.close(); // 關閉瀏覽器
  console.log('測試完成！'); // 印出測試完成
}

test();// 執行測試