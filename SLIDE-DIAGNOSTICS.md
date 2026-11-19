# 投影片幾何診斷工具

工具檔案在 [public/slide-diagnostics.js](public/slide-diagnostics.js)。它只讀取目前頁面，不修改 CSS，也不加入畫面元件。

## 使用方式

1. 在專案目錄執行 `npm run dev -- --host 0.0.0.0 --port 4173`。
2. 用 Safari 或 Chrome 開啟 `http://127.0.0.1:4173/`。
3. 切換到 Presentation Mode。
4. 開啟開發者工具的 Console。
5. 在 Console 貼上並執行以下程式。

```js
await fetch('/slide-diagnostics.js').then((response) => response.text()).then((script) => eval(script))
```

6. 先執行目前畫面的檢查。

```js
const report = await window.runSlideDiagnostics()
```

7. 逐頁自動捲動、列印每頁元素位置並下載 JSON。

```js
const report = await window.runSlideDiagnostics({ autoScroll: true, downloadJson: true })
copy(JSON.stringify(report, null, 2))
```

## 報告內容

工具會列出所有 `.story-section`，並測量 `.slide-content`、標題、文字、圖片、卡片、互動元件的 bounding rectangle。它會分開記錄 Frame 溢出、視窗溢出、元素內部捲動、固定定位、overflow hidden、transform 層數，以及根文件的 Scroll Snap 設定。

陰影不會被當成溢出，因為檢查使用元素的實際 `getBoundingClientRect()`。動畫中的 transform 仍會記錄在 `transforms`，方便辨識暫時動畫與真正的多重縮放。

把 Console 輸出的完整 JSON 貼回來，或附上下載的 `slide-diagnostics-*.json` 內容，我就能依頁面與元素指出實際問題。
