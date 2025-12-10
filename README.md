# AI-Assignment-1

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
- [ ] 建立 report.ts 生成統計報告
- [ ] 截圖程式輸出
- [ ] 壓縮 ZIP 檔案提交

---

## 📊 成果統計

| 項目 | 數量/結果 |
|------|----------|
| 收集 URL 數量 | 3858 張 |
| 成功下載 | 3840 張 |
| 處理後圖片 | 3840 張 |
| 平均檔案大小 | 4.21 KB |
| 最大檔案大小 | 22.53 KB ✅ |
| 符合 50KB 限制 | ✅ 是 |

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

### 執行程式

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

---

## 📁 專案結構

```
AI-Assignment-1/
├── src/
│   ├── database.ts       # 資料庫模組
│   ├── scraper.ts        # 爬蟲程式
│   ├── downloader.ts     # 圖片下載程式
│   ├── processor.ts      # 圖片處理程式
│   ├── report.ts         # 統計報告生成
│   ├── test-database.ts  # 資料庫測試
│   └── test-playwright.ts # Playwright 測試
├── images/               # 原始下載圖片 (3840 張)
├── processed/            # 處理後圖片 (3840 張)
├── data.db               # SQLite 資料庫
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

---

## 📝 習作要求檢查

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
