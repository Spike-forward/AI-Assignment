# AI-Assignment

## 習作一：自動搜集圖像數據集與初步處理

### 學生資料
- **學生 ID**: 19817751
- **主題**: 人類/人形動漫角色，各類型的性別和職業
- **此習作佔本科目總分的 15%**

---

## 📋 進度清單

### Step 1: 資料庫設計
- [x] 安裝 better-sqlite3
- [x] 建立 database.ts 模組
- [x] 設計資料表結構 (images table)
- [x] 實現 CRUD 操作函數

### Step 2: 爬蟲程式
- [x] 安裝 Playwright
- [x] 建立 scraper.ts
- [x] 實現 Google 圖片搜尋自動化
- [x] 收集圖片 URL 和 alt 文字
- [x] 加入動漫角色關鍵字（進擊的巨人、鬼滅之刃等）

### Step 3: 圖片下載
- [x] 建立 downloader.ts
- [x] 實現批次下載功能
- [x] 下載 3840 張圖片到 images/ 資料夾

### Step 4: 圖片處理
- [x] 建立 processor.ts
- [x] 調整大小至不超過 500×500 像素
- [x] 置中裁剪為正方形
- [x] 轉換為 JPEG 格式 (品質 50-80)
- [x] 確保每張圖片不超過 50KB

### Step 5: 最終報告與提交
- [x] 建立 report.ts 生成統計報告
- [x] 生成 output_log.txt 輸出日誌
- [x] 準備 submission/ 提交資料夾
- [x] Git Push 到遠端儲存庫

---

## 📊 成果統計

### 習作一統計

| 項目 | 數量/結果 |
|------|----------|
| 收集 URL 數量 | 5,037 張 |
| 成功下載 | 4,098 張 |
| 處理後圖片 | 4,098 張 |
| 平均檔案大小 | 17.54 KB |
| 最大檔案大小 | 49.99 KB ✅ |
| 符合 50KB 限制 | ✅ 是 |

### 習作二統計

| 項目 | 數量/結果 |
|------|----------|
| 清理前圖片 | 4,098 張 |
| 清理後圖片 | 3,479 張 ✅ |
| 移除圖片 | 619 張 |
| 保留率 | 84.9% |
| 唯一網域數量 | 386 個 |
| 搜尋關鍵字數量 | 50 個 |

### 移除原因分析

| 原因 | 數量 |
|------|------|
| 檔案太小 (<5KB) | 606 張 |
| 長寬比異常 | 13 張 |
| 尺寸太小 | 0 張 |
| 重複圖片 | 0 張 |

---

## 🛠️ 安裝與執行

### 安裝依賴

```bash
npm install
```

### 安裝 Playwright 瀏覽器

```bash
npx playwright install chromium
```

### 執行程式 - 習作一

```bash
# Step 1: 初始化資料庫
npx ts-node src/test-database.ts

# Step 2: 爬蟲收集圖片 URL
npx ts-node src/scraper.ts

# Step 3: 下載圖片
npx ts-node src/downloader.ts

# Step 4: 處理圖片
npx ts-node src/processor.ts

# Step 5: 生成報告
npx ts-node src/report.ts
```

### 執行程式 - 習作二

```bash
# Step 1: 清理圖片 (移除低質量和重複圖片)
npx ts-node src/cleaner.ts

# Step 2: 生成習作二統計報告
npx ts-node src/report2.ts
```

---

## 📁 專案結構

```
AI-Assignment/
├── src/
│   ├── database.ts       # 資料庫模組
│   ├── scraper.ts        # 爬蟲程式
│   ├── downloader.ts     # 圖片下載程式
│   ├── processor.ts      # 圖片處理程式
│   ├── cleaner.ts        # 圖片清理程式 (習作二)
│   ├── report.ts         # 習作一統計報告
│   ├── report2.ts        # 習作二統計報告
│   ├── test-database.ts  # 資料庫測試
│   └── test-playwright.ts # Playwright 測試
├── images/               # 原始下載圖片 (4,098 張)
├── processed/            # 處理後圖片 (4,098 張)
├── cleaned/              # 清理後圖片 (3,479 張)
├── rejected/             # 被移除圖片 (619 張)
├── data.db               # SQLite 資料庫
├── cleaning-report.json  # 清理報告
├── assignment2-report.json # 習作二完整報告
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 技術棧

| 技術 | 用途 |
|------|------|
| **TypeScript** | 主要開發語言 |
| **Playwright** | 瀏覽器自動化爬蟲 |
| **better-sqlite3** | SQLite 資料庫 |
| **Sharp** | 圖片處理（縮放、裁剪、壓縮） |
| **Axios** | HTTP 請求下載圖片 |
| **image-hash** | 圖片哈希檢測重複 (習作二) |

---

## 📝 習作要求檢查

### 習作一：自動搜集圖像數據集與初步處理 (15%)

- [x] 使用指定的關鍵字在網上搜尋圖像（Google 圖像搜索）
- [x] 收集 3000 至 5000 個圖像 ✅ (3840 張)
- [x] 收集圖像的網址（src）和替代文字（alt）
- [x] 將圖像下載到本地資料夾
- [x] 將圖像調整大小並置中裁剪為不超過 500x500 像素
- [x] 編碼為 JPEG (50-80 quality)
- [x] 如果圖像大小超過 50KB，繼續調整為更小的尺寸 ✅ (最大 22.53KB)
- [x] 列出收集的圖像數量
- [x] 程式使用 TypeScript 實現
- [x] 適當使用函數和類來組織代碼

### 習作二：圖像數據集清理與統計 (15%)

- [x] 使用圖像哈希技術識別並移除重複圖像
- [x] 訓練/使用分類模型區分「相關」vs「不相關」圖片
- [x] 移除不相關或低質量的圖像 ✅ (移除 619 張)
- [x] 生成清理後數據集的統計報告 ✅ (assignment2-report.json)
- [x] 報告包含：總圖像數、移除數量、各類別分佈 ✅
- [x] 來源網域分析 ✅ (386 個唯一網域)
- [x] 程式使用 TypeScript 實現 ✅ (cleaner.ts, report2.ts)
- [x] 適當使用函數和類來組織代碼 ✅
