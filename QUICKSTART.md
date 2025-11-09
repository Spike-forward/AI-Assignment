# Quick Start Guide / 快速入門指南

## English

### Installation (One-time setup)

```bash
# 1. Clone the repository
git clone https://github.com/Spike-forward/AI-Assignment-1.git
cd AI-Assignment-1

# 2. Install dependencies
pip install -r requirements.txt
```

### Usage

**Basic command:**
```bash
python image_collector.py "your_keyword"
```

**Examples:**

1. Collect cat images:
```bash
python image_collector.py "cat"
```

2. Collect landscape images to a custom folder:
```bash
python image_collector.py "landscape" --output my_landscapes
```

3. Collect up to 4000 images:
```bash
python image_collector.py "architecture" --max-images 4000
```

### What happens?

1. The script searches Bing Images for your keyword
2. Downloads up to 5000 images (configurable)
3. Processes each image:
   - Resizes to maximum 500×500 pixels
   - Center-crops to maintain aspect ratio
   - Converts to JPEG format
   - Optimizes quality (50-80)
   - Ensures file size ≤ 50KB
4. Saves metadata (URL, alt text) to `metadata.json`
5. Shows statistics when complete

### Output Structure

```
images/                    # Output folder (default)
├── image_00001.jpg       # Processed images
├── image_00002.jpg
├── ...
└── metadata.json         # Image metadata
```

---

## 中文

### 安裝（一次性設置）

```bash
# 1. 克隆倉庫
git clone https://github.com/Spike-forward/AI-Assignment-1.git
cd AI-Assignment-1

# 2. 安裝依賴
pip install -r requirements.txt
```

### 使用方法

**基本命令：**
```bash
python image_collector.py "關鍵字"
```

**範例：**

1. 收集貓的圖像：
```bash
python image_collector.py "cat"
```

2. 收集風景圖像到自定義文件夾：
```bash
python image_collector.py "landscape" --output my_landscapes
```

3. 收集最多 4000 張圖像：
```bash
python image_collector.py "architecture" --max-images 4000
```

### 程序會做什麼？

1. 在 Bing 圖像搜索您的關鍵字
2. 下載最多 5000 張圖像（可配置）
3. 處理每張圖像：
   - 調整大小至最大 500×500 像素
   - 置中裁剪以保持寬高比
   - 轉換為 JPEG 格式
   - 優化質量（50-80）
   - 確保文件大小 ≤ 50KB
4. 將元數據（URL、alt 文字）保存到 `metadata.json`
5. 完成時顯示統計信息

### 輸出結構

```
images/                    # 輸出文件夾（默認）
├── image_00001.jpg       # 處理後的圖像
├── image_00002.jpg
├── ...
└── metadata.json         # 圖像元數據
```

---

## Testing / 測試

Run the test suite to verify functionality:
```bash
python test_collector.py
```

See usage examples:
```bash
python example_usage.py
```

---

## Requirements / 系統要求

- Python 3.7 or higher / Python 3.7 或更高版本
- Internet connection / 網絡連接
- ~500MB free disk space (for 5000 images) / 約 500MB 可用磁盤空間（5000 張圖像）

---

## Tips / 提示

- Use specific keywords for better results / 使用具體關鍵字以獲得更好結果
- The script handles network errors automatically / 腳本自動處理網絡錯誤
- Downloaded images are excluded from git via .gitignore / 通過 .gitignore 排除下載的圖像
- Press Ctrl+C to stop collection early / 按 Ctrl+C 提前停止收集

---

## Troubleshooting / 疑難排解

**Issue:** Module not found error  
**Solution:** Run `pip install -r requirements.txt`

**問題：** 模塊未找到錯誤  
**解決方案：** 運行 `pip install -r requirements.txt`

---

**Issue:** Few images downloaded  
**Solution:** Try different keywords or increase search pages

**問題：** 下載的圖像很少  
**解決方案：** 嘗試不同的關鍵字或增加搜索頁數

---

## Support / 支持

For issues or questions, please open a GitHub issue.

如有問題，請在 GitHub 上提出 issue。
