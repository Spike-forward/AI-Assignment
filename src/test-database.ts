import { initDatabase, insertImage, getStats } from './database';

// 初始化資料庫
initDatabase();

// 測試新增資料
insertImage('persian cat', 'https://example.com/cat1.jpg', '可愛的波斯貓');
insertImage('persian cat', 'https://example.com/cat2.jpg', '白色波斯貓');
insertImage('maine coon', 'https://example.com/cat3.jpg', '緬因貓');

// 查看統計
const stats = getStats();
console.log('統計資料:', stats);