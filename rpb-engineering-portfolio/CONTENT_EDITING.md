# 投影片內容編輯說明

網站文字集中在 `src/data/content.json`。`src/data/story.ts` 只負責型別、章節索引與相容匯出，`src/App.tsx` 讀取同一份內容供 Scroll Mode 和 Presentation Mode 使用。

## 修改內容

- 修改首頁標題與說明，編輯 `intro.titleLines`、`intro.description`。
- 修改案例標題與段落，編輯對應 `slides[]` 項目的 `title`、`description`。
- 修改卡片，編輯該 Slide 的 `cards` 陣列，每張卡使用 `label` 與 `text`。
- 修改 Overflow Action 互動按鈕，編輯該 Slide 的 `resultButtons`。
- 增加中文對照時，可在同一欄位旁新增 `titleZh`、`descriptionZh` 或 `textZh`。目前介面沒有顯示中文欄位，加入內容後再由元件決定顯示方式。
- 更換圖片，只修改對應 Slide 的 `image` 路徑，圖片放在 `public/images/`。
- 修改右側導覽標題，編輯頂層 `navigationTitles`。Slide ID 與順序維持不變。

每個 Slide 的 `id` 是固定識別碼。修改標題時不要修改 `id`，否則章節導覽與深連結會失效。

## 預覽與驗證

```bash
npm run dev -- --host 0.0.0.0 --port 4173
```

用 Safari 或 Chrome 開啟 `http://127.0.0.1:4173/`，分別檢查 Scroll Mode 與 Presentation Mode。

建置網站：

```bash
npm run build
```

Playwright 環境可用時執行幾何檢查：

```bash
npm run test:slides
```

沒有自動化瀏覽器時，可在 Safari Console 載入 `public/slide-diagnostics.js`：

```js
await fetch('/slide-diagnostics.js').then((response) => response.text()).then((script) => eval(script))
const report = await window.runSlideDiagnostics({ autoScroll: true, downloadJson: true })
copy(JSON.stringify(report, null, 2))
```

診斷報告會指出 Frame 溢出、元素自身內容溢出，以及較長的卡片文字。文字過長時先查看報告，再決定是否調整文字或拆分投影片。工具不會自行刪減內容。

## Git 回溯點

修改前先確認工作目錄，並建立本機 Commit：

```bash
git status --short
git add src/data/content.json src/data/story.ts src/App.tsx CONTENT_EDITING.md
git commit -m "update portfolio content"
```

需要回看版本時使用 `git log --oneline` 找到 Commit ID，再以 Git 工具檢視差異。不要使用強制重置清除未提交內容。
