# P107 Campus Busy Screen — 校園營運忙碌螢幕

## 專案名稱
**P107 Campus Busy Screen**  
**校園營運忙碌螢幕**

## 版本說明
本版保留原本 V1「文字雨總控台」概念，新增 V2「八區塊校園營運智慧牆」。本次小修重點如下：

1. **修正版面裁切問題**：縮短 V2 上方說明區與八區塊卡片高度，並讓主要介面在螢幕高度不足時可捲動，避免第二排卡片文字被切掉。
2. **數據跳動更真實**：人流、Wi‑Fi、停車剩餘、CO₂、LMS 登入等數值改為「小幅連續漂移」，避免突然大幅跳動。
3. **商情訊號流改為滑動式**：Business Intelligence Stream 改為緩慢滑動 ticker，方便閱讀；滑鼠移到該區塊可暫停滑動。

上方提供兩個切換按鈕：

- **V1 文字雨總控台**：科技感、Matrix 文字雨、AI 資料流、地圖、即時指標與圖表。
- **V2 八區塊營運牆**：依照校園經營管理意義，分成 8 個 Dashboard 區塊。

## V2 八個區塊

1. **Campus Live Pulse 校園即時脈動**  
   人流、Wi‑Fi 裝置、噪音分貝。

2. **Operation Map 校園營運地圖**  
   清潔任務、教室使用率、停車剩餘。

3. **Business Intelligence Stream 商情訊號流**  
   校園活動、商情關鍵字、服務流程與趨勢訊號。

4. **Facility Management 設施管理**  
   空調負載、照明效率、維修處理。

5. **Learning Analytics 學習分析**  
   LMS 登入、作業繳交率、教材點閱。

6. **System Monitor 系統監控**  
   API 請求、資料庫查詢、CPU 負載。

7. **Environmental Intelligence 環境智慧監測**  
   CO₂、PM2.5、溫濕度與環境趨勢線。

8. **Decision Support Index 決策支援指標**  
   空間效率、服務負載、能源效率與綜合決策指數。

## 使用方式

1. 解壓縮 ZIP。
2. 開啟資料夾中的 `index.html`。
3. 可直接在本機瀏覽器執行，不需要 Supabase、不需要 Edge Function、不需要網路。
4. 若要放到 GitHub Pages，直接上傳整個資料夾內的檔案即可。

## 檔案結構

```text
P107_Campus_Busy_Screen_v2_1/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 注意事項

本系統目前所有資料皆為前端 JavaScript 模擬資料，適合展示、教學、導覽與概念驗證，不代表真實校園資料。
