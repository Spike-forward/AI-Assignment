# AI-Assignment-1

## 習作一：自動搜集圖像數據集與初步處理

### 習作簡介

本習作旨在透過編程實作，加強學生在使用編程實現自動化圖像數據集搜集和初步處理方面的技能。
學生實踐自動化網絡搜索、圖片下載和預處理圖像，為後續分析做好準備。
此習作佔本科目總分的 15%。

### 習作要求

- ✅ 使用指定的關鍵字在網上搜尋圖像（例如：Google 圖像搜索）
- ✅ 需有 3000 至 5000 個圖像
- ✅ 收集圖像的網址（src）和替代文字（alt）
- ✅ 將圖像下載到本地資料夾
- ✅ 將圖像調整大小並置中裁剪為不超過 500x500 像素，編碼為 JPEG (50-80 quality)
- ✅ 如果圖像大小超過 50KB，繼續調整為更小的尺寸，直至符合要求
- ✅ 列出收集的圖像數量
- ✅ 程式使用 TypeScript 實現

---

## 安裝依賴

```bash
npm install
```

## 使用方法

### 開發模式（推薦）

```bash
npm run dev [關鍵字] [目標數量]
```

範例：
```bash
npm run dev nature 3000
npm run dev cat 5000
```

### 編譯後執行

```bash
npm run build
npm start [關鍵字] [目標數量]
```

## 專案結構

```
AI-Assignment-1/
├── src/
│   ├── index.ts           # 主程式：圖像搜集邏輯
│   └── imageProcessor.ts  # 圖像處理模組
├── images/                # 輸出目錄（自動創建）
│   ├── image_1.jpg
│   ├── image_1.txt       # 元數據
│   └── report.txt        # 統計報告
├── dist/                  # 編譯輸出
├── package.json
├── tsconfig.json
└── README.md
```

## 功能特點

1. **智能圖像搜集** - 從 Unsplash 等免費圖庫獲取高質量圖像
2. **自動圖像處理** - 使用 Sharp 進行高效處理、裁剪和壓縮
3. **完整元數據記錄** - 每張圖像附帶詳細信息
4. **錯誤處理** - 自動跳過失敗的圖像並生成統計報告

## 技術棧

- **TypeScript** - 類型安全的開發
- **Axios** - HTTP 請求
- **Cheerio** - HTML 解析
- **Sharp** - 高性能圖像處理
