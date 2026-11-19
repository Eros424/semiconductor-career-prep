# Cloudflare Pages 部署

本專案是 Vite 靜態網站，正式輸出資料夾是 `dist/`。`vite.config.ts` 使用 `base: './'`，圖片、CSS 與 JavaScript 會以相對路徑輸出，適合 Cloudflare Pages。

## 建置檢查

```bash
npm ci
npm run build
```

Cloudflare Pages 的設定如下：

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `22`

## GitHub Actions 部署

工作流程位於 `.github/workflows/deploy-cloudflare-pages.yml`。它會在 `main` 分支更新時執行：

1. 安裝依賴
2. 執行 `npm run build`
3. 將 `dist/` 發布到 Cloudflare Pages

在 GitHub repository 設定以下項目：

- Secret `CLOUDFLARE_API_TOKEN`，只授予 Pages 編輯權限
- Secret `CLOUDFLARE_ACCOUNT_ID`
- Repository variable `CLOUDFLARE_PAGES_PROJECT`，填入 Pages project name

Token 不要寫入 repository、`.env`、workflow 檔案或 command line。

## 第一次建立 Pages project

第一次可在 Cloudflare Dashboard 建立 Pages project，選擇 GitHub repository，或在已登入且具備權限的電腦執行：

```bash
npx wrangler pages project create <project-name>
npx wrangler pages deploy dist --project-name=<project-name>
```

這一步需要 Cloudflare 登入或 API Token。完成後 Cloudflare 會提供 `https://<project-name>.pages.dev` 網址。這個授權步驟必須由網站擁有者在自己的 Cloudflare 帳號中完成。

## 更新網站

```bash
git add .
git commit -m "update portfolio"
git push origin main
```

推送到 `main` 後，GitHub Actions 會重新建置並發布新的 `dist/`。

## PWA 狀態

目前專案沒有 `manifest.webmanifest`、Service Worker 或 `navigator.serviceWorker.register()`。HTTPS 網站可以正常部署，但現版本不會提供離線快取。若要恢復離線 PWA，需要另行新增 manifest、Service Worker、快取版本策略與離線驗證，這不包含在本次部署準備中。

## 驗證清單

部署後請在 Safari、Chrome、Windows 瀏覽器與手機檢查：

- HTTPS 網址可開啟
- 圖片與字體正常載入
- Scroll Mode 可自然捲動
- Presentation Mode 可逐頁切換
- 右側導覽可點擊
- 全螢幕按鈕依瀏覽器支援狀態運作
- 更新 content.json 後推送即可重新部署
