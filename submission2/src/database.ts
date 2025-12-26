import Database from 'better-sqlite3';
import path from 'path';

// 資料庫檔案路徑
const dbPath = path.join(__dirname, '..', 'data.db');

// 建立資料庫連接
const db = new Database(dbPath);

// 初始化資料表
function initDatabase() { 
  db.exec(` 
    CREATE TABLE IF NOT EXISTS images ( 
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL, 
      src TEXT NOT NULL UNIQUE,
      alt TEXT, 
      downloaded INTEGER DEFAULT 0, 
      processed INTEGER DEFAULT 0, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP 
    )
  `); 
  console.log('資料庫初始化完成！'); 
}

// 新增圖片記錄
function insertImage(keyword: string, src: string, alt: string | null) { // 新增圖片記錄
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO images (keyword, src, alt) 
    VALUES (?, ?, ?) 
  `);
  stmt.run(keyword, src, alt); // 執行更新
}

// 取得未下載的圖片
function getPendingImages(limit: number = 100) { // 取得未下載的圖片    
  const stmt = db.prepare(` 
    SELECT * FROM images WHERE downloaded = 0 LIMIT ? 
  `);
  return stmt.all(limit); // 返回結果
}

// 標記圖片為已下載
function markAsDownloaded(id: number) { // 標記圖片為已下載
  const stmt = db.prepare(` 
    UPDATE images SET downloaded = 1 WHERE id = ? 
  `);
  stmt.run(id); // 執行更新
}

// 標記圖片為已處理
function markAsProcessed(id: number) { // 標記圖片為已處理
  const stmt = db.prepare(`
    UPDATE images SET processed = 1 WHERE id = ?
  `);
  stmt.run(id);
}

// 取得統計資料
function getStats() {
  const total = db.prepare('SELECT COUNT(*) as count FROM images').get() as { count: number };
  const downloaded = db.prepare('SELECT COUNT(*) as count FROM images WHERE downloaded = 1').get() as { count: number };
  const processed = db.prepare('SELECT COUNT(*) as count FROM images WHERE processed = 1').get() as { count: number };
  
  return {
    total: total.count,
    downloaded: downloaded.count,
    processed: processed.count
  };
}

// 匯出所有函數
export {
  db,
  initDatabase,
  insertImage,
  getPendingImages,
  markAsDownloaded,
  markAsProcessed,
  getStats
};