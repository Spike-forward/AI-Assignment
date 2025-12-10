# 習作一提交檔案準備腳本
# 學生 ID: 19817751

Write-Host "=== 準備習作一提交檔案 ===" -ForegroundColor Green

# 建立提交資料夾
$submissionDir = "submission"
$studentId = "19817751"

if (Test-Path $submissionDir) {
    Remove-Item -Recurse -Force $submissionDir
}
New-Item -ItemType Directory -Path $submissionDir | Out-Null
New-Item -ItemType Directory -Path "$submissionDir/screenshots" | Out-Null

Write-Host "1. 複製 src/ 資料夾..." -ForegroundColor Yellow
Copy-Item -Recurse "src" "$submissionDir/src"

Write-Host "2. 複製 processed/ 資料夾..." -ForegroundColor Yellow
Copy-Item -Recurse "processed" "$submissionDir/processed"

Write-Host "3. 複製 data.db..." -ForegroundColor Yellow
Copy-Item "data.db" "$submissionDir/data.db"

Write-Host "4. 複製設定檔..." -ForegroundColor Yellow
Copy-Item "package.json" "$submissionDir/package.json"
Copy-Item "tsconfig.json" "$submissionDir/tsconfig.json"
Copy-Item "README.md" "$submissionDir/README.md"

Write-Host "5. 生成程式輸出日誌..." -ForegroundColor Yellow
npx ts-node src/report.ts > "$submissionDir/output_log.txt"

Write-Host ""
Write-Host "=== 提交資料夾已準備完成 ===" -ForegroundColor Green
Write-Host "位置: $submissionDir/" -ForegroundColor Cyan
Write-Host ""
Write-Host "請手動完成以下步驟:" -ForegroundColor Yellow
Write-Host "  1. 將截圖放入 submission/screenshots/ 資料夾"
Write-Host "  2. 右鍵 submission 資料夾 -> 傳送到 -> 壓縮的資料夾"
Write-Host "  3. 將 ZIP 檔案命名為: ${studentId}_習作一.zip"
Write-Host ""

# 顯示資料夾內容
Write-Host "=== 提交資料夾內容 ===" -ForegroundColor Green
Get-ChildItem -Recurse $submissionDir | Where-Object { !$_.PSIsContainer } | 
    Group-Object Directory | 
    ForEach-Object {
        Write-Host $_.Name -ForegroundColor Cyan
        $_.Group | ForEach-Object { Write-Host "  - $($_.Name)" }
    }

# 計算總大小
$totalSize = (Get-ChildItem -Recurse $submissionDir | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host ""
Write-Host "總大小: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Yellow

