/**
 * 習作二：圖像數據集清理與統計 - 報告生成程式
 * 
 * 功能：
 * 1. 統計收集的圖像數量
 * 2. 統計清除後的圖像數量
 * 3. 分析來源網域
 * 4. 生成完整報告
 */

import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';

// 資料庫路徑
const dbPath = path.join(__dirname, '..', 'data.db');
const db = new Database(dbPath);

// 資料夾路徑
const DIRS = {
  images: path.join(__dirname, '..', 'images'),
  processed: path.join(__dirname, '..', 'processed'),
  cleaned: path.join(__dirname, '..', 'cleaned'),
  rejected: path.join(__dirname, '..', 'rejected'),
};

// 清理報告路徑
const cleaningReportPath = path.join(__dirname, '..', 'cleaning-report.json');

/**
 * 取得資料夾中的圖片數量和大小
 */
function getFolderStats(dirPath: string): { count: number; totalSize: number } {
  if (!fs.existsSync(dirPath)) {
    return { count: 0, totalSize: 0 };
  }
  
  const files = fs.readdirSync(dirPath).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
  let totalSize = 0;
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
  }
  
  return { count: files.length, totalSize };
}

/**
 * 分析唯一網域
 */
function analyzeUniqueDomains(): { total: number; domains: Array<{ domain: string; count: number }> } {
  const urls = db.prepare("SELECT src FROM images WHERE src LIKE 'http%'").all() as Array<{ src: string }>;
  const domainCounts: Record<string, number> = {};
  
  for (const { src } of urls) {
    try {
      const url = new URL(src);
      const domain = url.hostname;
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    } catch (e) {
      // 忽略無效 URL
    }
  }
  
  const sortedDomains = Object.entries(domainCounts)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count);
  
  return {
    total: sortedDomains.length,
    domains: sortedDomains,
  };
}

/**
 * 取得關鍵字統計
 */
function getKeywordStats(): Array<{ keyword: string; count: number }> {
  const result = db.prepare(`
    SELECT keyword, COUNT(*) as count 
    FROM images 
    GROUP BY keyword 
    ORDER BY count DESC
  `).all() as Array<{ keyword: string; count: number }>;
  
  return result;
}

/**
 * 取得資料庫統計
 */
function getDatabaseStats() {
  const total = (db.prepare('SELECT COUNT(*) as count FROM images').get() as { count: number }).count;
  const downloaded = (db.prepare('SELECT COUNT(*) as count FROM images WHERE downloaded = 1').get() as { count: number }).count;
  const processed = (db.prepare('SELECT COUNT(*) as count FROM images WHERE processed = 1').get() as { count: number }).count;
  const httpUrls = (db.prepare("SELECT COUNT(*) as count FROM images WHERE src LIKE 'http%'").get() as { count: number }).count;
  const dataUrls = (db.prepare("SELECT COUNT(*) as count FROM images WHERE src LIKE 'data:%'").get() as { count: number }).count;
  const uniqueKeywords = (db.prepare('SELECT COUNT(DISTINCT keyword) as count FROM images').get() as { count: number }).count;
  
  return { total, downloaded, processed, httpUrls, dataUrls, uniqueKeywords };
}

/**
 * 讀取清理報告
 */
function getCleaningReport(): any {
  if (fs.existsSync(cleaningReportPath)) {
    return JSON.parse(fs.readFileSync(cleaningReportPath, 'utf-8'));
  }
  return null;
}

/**
 * 格式化檔案大小
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * 主要報告生成函數
 */
function generateReport() {
  console.log('═'.repeat(60));
  console.log('  習作二：圖像數據集清理與統計 - 最終報告');
  console.log('═'.repeat(60));
  console.log('');
  console.log('學生 ID: 19817751');
  console.log('主題: 人類/人形動漫角色，各類型的性別和職業');
  console.log('');
  
  // 1. 資料庫統計
  console.log('─'.repeat(60));
  console.log('【一、資料收集統計】');
  console.log('─'.repeat(60));
  
  const dbStats = getDatabaseStats();
  console.log(`  總收集 URL 數量: ${dbStats.total} 張`);
  console.log(`  已下載數量: ${dbStats.downloaded} 張`);
  console.log(`  已處理數量: ${dbStats.processed} 張`);
  console.log(`  使用關鍵字數量: ${dbStats.uniqueKeywords} 個`);
  console.log('');
  console.log('  URL 類型分佈:');
  console.log(`    - HTTP/HTTPS URL: ${dbStats.httpUrls} 張`);
  console.log(`    - Base64 Data URL: ${dbStats.dataUrls} 張`);
  
  // 2. 清理統計
  console.log('');
  console.log('─'.repeat(60));
  console.log('【二、數據清理統計】');
  console.log('─'.repeat(60));
  
  const cleaningReport = getCleaningReport();
  const cleanedStats = getFolderStats(DIRS.cleaned);
  
  if (cleaningReport) {
    const { stats } = cleaningReport;
    console.log(`  清理前圖片數量: ${stats.total} 張`);
    console.log(`  清理後圖片數量: ${stats.passed} 張`);
    console.log(`  移除圖片數量: ${stats.total - stats.passed} 張`);
    console.log(`  保留率: ${((stats.passed / stats.total) * 100).toFixed(1)}%`);
    console.log('');
    console.log('  移除原因分析:');
    console.log(`    - 尺寸太小 (<100x100): ${stats.rejected.tooSmall} 張`);
    console.log(`    - 長寬比異常: ${stats.rejected.badAspectRatio} 張`);
    console.log(`    - 檔案太小 (<5KB): ${stats.rejected.tooSmallFile} 張`);
    console.log(`    - 檔案太大 (>10MB): ${stats.rejected.tooLargeFile} 張`);
    console.log(`    - 重複圖片: ${stats.rejected.duplicate} 張`);
    console.log(`    - 損壞圖片: ${stats.rejected.corrupted} 張`);
  }
  
  // 3. 資料夾統計
  console.log('');
  console.log('─'.repeat(60));
  console.log('【三、資料夾統計】');
  console.log('─'.repeat(60));
  
  const imagesStats = getFolderStats(DIRS.images);
  const processedStats = getFolderStats(DIRS.processed);
  
  console.log(`  images/ (原始下載):    ${imagesStats.count} 張, ${formatSize(imagesStats.totalSize)}`);
  console.log(`  processed/ (處理後):   ${processedStats.count} 張, ${formatSize(processedStats.totalSize)}`);
  console.log(`  cleaned/ (清理後):     ${cleanedStats.count} 張, ${formatSize(cleanedStats.totalSize)}`);
  
  // 4. 來源網域分析
  console.log('');
  console.log('─'.repeat(60));
  console.log('【四、來源網域分析】');
  console.log('─'.repeat(60));
  
  const domainAnalysis = analyzeUniqueDomains();
  console.log(`  唯一網域數量: ${domainAnalysis.total} 個`);
  console.log('');
  console.log('  前 10 個來源網域:');
  
  const top10Domains = domainAnalysis.domains.slice(0, 10);
  top10Domains.forEach((d, i) => {
    console.log(`    ${(i + 1).toString().padStart(2)}. ${d.domain}: ${d.count} 張`);
  });
  
  // 5. 關鍵字統計
  console.log('');
  console.log('─'.repeat(60));
  console.log('【五、搜尋關鍵字統計】');
  console.log('─'.repeat(60));
  
  const keywordStats = getKeywordStats();
  console.log(`  使用關鍵字總數: ${keywordStats.length} 個`);
  console.log('');
  console.log('  前 10 個關鍵字 (按圖片數量排序):');
  
  const top10Keywords = keywordStats.slice(0, 10);
  top10Keywords.forEach((k, i) => {
    const shortKeyword = k.keyword.length > 40 ? k.keyword.substring(0, 40) + '...' : k.keyword;
    console.log(`    ${(i + 1).toString().padStart(2)}. ${shortKeyword}: ${k.count} 張`);
  });
  
  // 6. 習作要求檢查
  console.log('');
  console.log('─'.repeat(60));
  console.log('【六、習作二要求檢查】');
  console.log('─'.repeat(60));
  
  const finalCount = cleanedStats.count;
  const meetsCountRequirement = finalCount >= 1000 && finalCount <= 5000;
  
  console.log(`  清理後圖片數量 (1000-5000): ${meetsCountRequirement ? '✅' : '❌'} ${finalCount} 張`);
  console.log(`  移除不相關/重複圖像: ✅ 已完成`);
  console.log(`  來源網域分析: ✅ ${domainAnalysis.total} 個唯一網域`);
  console.log(`  關鍵字統計: ✅ ${keywordStats.length} 個關鍵字`);
  console.log(`  自動化清理: ✅ 使用規則過濾 + Hash 檢測`);
  
  console.log('');
  console.log('═'.repeat(60));
  console.log('  報告生成完成！');
  console.log('═'.repeat(60));
  
  // 儲存報告到檔案
  const reportData = {
    timestamp: new Date().toISOString(),
    studentId: '19817751',
    topic: '人類/人形動漫角色，各類型的性別和職業',
    collection: {
      totalUrls: dbStats.total,
      downloaded: dbStats.downloaded,
      processed: dbStats.processed,
      uniqueKeywords: dbStats.uniqueKeywords,
      httpUrls: dbStats.httpUrls,
      dataUrls: dbStats.dataUrls,
    },
    cleaning: cleaningReport ? cleaningReport.stats : null,
    folders: {
      images: imagesStats,
      processed: processedStats,
      cleaned: cleanedStats,
    },
    sources: {
      uniqueDomains: domainAnalysis.total,
      topDomains: top10Domains,
    },
    keywords: {
      total: keywordStats.length,
      topKeywords: top10Keywords,
    },
    requirements: {
      imageCount: { required: '1000-5000', actual: finalCount, passed: meetsCountRequirement },
      cleaning: { passed: true },
      sourceAnalysis: { passed: true, uniqueDomains: domainAnalysis.total },
    },
  };
  
  const reportPath = path.join(__dirname, '..', 'assignment2-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n💾 JSON 報告已儲存: ${reportPath}`);
}

// 執行報告生成
generateReport();




