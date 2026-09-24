# Bug 紀錄

記錄開發與上線過程中遇到的問題：症狀、原因、修正方式與狀態。新問題請加在對應區塊的最上方。

## 總覽

| # | 問題 | 類型 | 狀態 | Commit |
|---|---|---|---|---|
| B1 | 點「繼續」進入最後一步時表單被誤送出 | 程式 | ✅ 已修正 | `b962b1f` |
| B2 | 窄螢幕時 Colleen 角色圖消失 | 版面 | ✅ 已修正 | `b962b1f` |
| B3 | 輸入框與按鈕字級不會隨螢幕放大 | 樣式 | ✅ 已修正 | `b962b1f` |
| B4 | 選「其他」數量後輸入框被擠到下一行 | 版面 | ✅ 已修正 | `4cee7c0` |
| B5 | 分享預覽網址顯示 `%VITE_SITE_URL%` | 部署 | ✅ 已修正 | 部署設定 |
| B6 | push 到 GitHub 後 Cloudflare 沒有自動 build | 部署 | ✅ 已修正 | 部署設定 |
| B7 | 正式網站變成空白頁 | 部署 | ✅ 已修正 | 部署設定 |
| B8 | 從第四步返回再回來，已填的欄位被清空 | 程式 | ✅ 已修正 | `8bce6a1` |
| B9 | 缺少 Supabase 環境變數時整個網站空白 | 程式 | ✅ 已修正 | `815deab` |

## 已修正

### B9 缺少 Supabase 環境變數時整個網站空白

- **症狀：** 部署時少了 Supabase 變數，整個網站無法顯示，包含不需要資料庫的介紹頁（見 B7）。
- **原因：** `src/lib/supabaseClient.js` 在檔案最外層檢查變數並 `throw`，檔案一被 import 就執行，錯誤讓整個 React App 停住。
- **修正：** 改成 `getSupabase()` 函式，送出訂單時才檢查變數並建立 client（用 `??=` 只建立一次）。缺少變數時，錯誤會被 `OrderForm` 的 `try...catch` 接住，只在表單顯示「訂單送出失敗」。
- **驗證：** 用空的 Supabase 變數 build 測試，四個步驟都正常顯示，送出時才出現錯誤訊息，已填的資料也保留。
- **狀態：** 已修正（`815deab`）。

### B8 從第四步返回再回來，已填的欄位被清空

- **症狀：** 在訂購表單填好姓名、電話後按「返回」，再回到第四步，文字欄位變成空白；數量選擇則會保留。
- **原因：** `OrderForm.jsx` 用 `{currentStep === 4 && <StepOrder />}` 切換步驟，離開第四步時元件被卸載。文字欄位是非受控 `<input>`，值只存在 DOM 元素上，元件卸載後就消失。數量存在 `OrderForm` 的 state，所以不受影響。
- **修正：** 讓 `StepOrder` 保持掛載，不是第四步時用 `hidden` 屬性隱藏。其他步驟維持條件渲染，因為第二步的 YouTube iframe 隱藏後仍會繼續播放。
- **狀態：** 已修正（`8bce6a1`）。

### B7 正式網站變成空白頁

- **症狀：** 重新連接 Cloudflare 的 Git 後，正式網站打開一片空白。
- **原因：** 這次 build 沒有拿到 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`。`supabaseClient.js` 一載入就 `throw`，打包工具判斷後續程式碼不會執行，把整個 App 移除了（JS 從 454KB 變成 228KB）。當時另一個 Worker `pangpang-perfume-preorder` 也連著同一個 repo，變數很可能設在那個 Worker 上。
- **修正：** 在 `pangpang-perfume-order` 的 **Settings → Build → Build Variables and Secrets** 補上變數並重新 build，刪除多餘的 preorder Worker。
- **後續：** 程式本身的脆弱點記錄在 B9。

### B6 push 到 GitHub 後 Cloudflare 沒有自動 build

- **症狀：** push 後等了 7 分鐘以上，正式網站仍是舊版；Cloudflare 的 build 紀錄只有手動觸發的項目。
- **原因：** GitHub 上的 commit 完全沒有 Cloudflare 的檢查紀錄，代表 push 通知沒有送到 Cloudflare（GitHub App 權限或 Git 連線問題）。
- **修正：** 檢查 GitHub App「Cloudflare Workers and Pages」的 repository 存取權限，並在 Cloudflare 重新連接 Git。之後 push 約 2 分鐘就會自動部署。

### B5 分享預覽網址顯示 `%VITE_SITE_URL%`

- **症狀：** 正式網站的 `og:url`、`og:image` 仍是 `%VITE_SITE_URL%`，分享到 LINE、IG 時沒有預覽圖。
- **原因：** `VITE_` 變數在 build 時才寫進網頁。Cloudflare Workers 的變數分成 build 用和執行時用兩區，變數沒有放在 build 那一區，或是設定後沒有重新 build。
- **修正：** 把 `VITE_SITE_URL` 設在 **Settings → Build → Build Variables and Secrets**，然後重新 build。

### B4 選「其他」數量後輸入框被擠到下一行

- **症狀：** 視窗寬度約 703px 時，選了「其他」後數量輸入框換到下一行。
- **原因：** 表單變成兩欄後右欄約 320px，數字按鈕固定 50px 加上輸入框 88px，總寬度超過欄寬。
- **修正：** 5 個選項改成等寬、可以一起縮小的格子（最寬 64px），「其他」直接在原位變成輸入框。

### B3 輸入框與按鈕字級不會隨螢幕放大

- **症狀：** 大螢幕時內文放大到 20px，輸入框和按鈕的字仍停在 16px。
- **原因：** `index.css` 裡 `button, input, select { font: inherit; }` 這條重設沒有放在 layer 裡，優先權高於 Tailwind 的 utility class，蓋掉了 `text-body`。
- **修正：** 重設移到 `@layer base`。之後又整理成只保留 Tailwind preflight 沒有處理的部分。

### B2 窄螢幕時 Colleen 角色圖消失

- **症狀：** 手機寬度下第三步的 Colleen 圖片完全不見。
- **原因：** 圖片用 `absolute` 定位，外層容器靠 grid 列高撐開。窄螢幕改成單欄時，容器沒有自己的高度，變成 0。
- **修正：** 改成任何寬度都維持左右兩欄，窄螢幕時縮小圖片那一欄，讓容器永遠有高度。

### B1 點「繼續」進入最後一步時表單被誤送出

- **症狀：** 在第三步點「繼續」，進入第四步時表單立刻被送出，或跳出瀏覽器的必填提示。
- **原因：** 「繼續」和「送出訂單」是同一個按鈕元素，只切換 `type`。React 在點擊事件處理完就重新渲染，瀏覽器接著處理按鈕的預設行為時，它已經變成 `type="submit"`，於是觸發送出。
- **修正：** 給兩個按鈕不同的 `key`，讓 React 建立兩個獨立的元素。

## 待處理

目前沒有。

## 架構改善清單

來自 2026-09-24 的程式架構檢查。不算 bug，但會影響維護性或效能：

- [x] 首次載入的 JS 有一大半是 supabase-js → `orderService` 改用動態 `import()`，主程式 454KB → 240KB，Supabase（215KB）在送出時才下載（`815deab`）
- [ ] `OrderForm` 負責太多事，可拆出 `SiteHeader`、`useOrderSubmit`
- [x] 步驟設定分散在多處 → `OrderForm` 以 `INTRO_STEPS` 陣列描述介紹步驟與按鈕文字，總步數由陣列長度推算，`WizardFooter` 改由 `continueLabel` prop 取得按鈕文字；另在 `.oxlintrc.json` 開啟 `no-undef` 並設定 browser 環境，未定義變數在 lint 階段就會被抓到（`0957895`）
- [x] 成功視窗缺少 Esc 關閉、`role="dialog"` 與焦點管理 → 改用原生 `<dialog>` + `showModal()`，加上 `aria-labelledby`；Esc、✕、點背景都能關閉，開啟時焦點移到關閉按鈕（`445c5d4`）
- [x] `utils/orderForm.js` 沒有單元測試 → 加入 Vitest，`orderForm.test.js` 共 9 個測試（`npm test`），並以變異測試確認能抓到錯誤；同時把必填欄位的錯誤訊息拆成姓名／電話／Email 各自提示（`731e4f6`）
- [x] `productContent.js` 在資料中控制排版 → 改為 `promotion`／`prices`／`notes` 結構，排版交給 `ProductInfo`（`df43903`）
- [x] 移除 `console.log("訂單送出成功")`（`df43903`）
- [x] `ProductInfo` 的標題 `<h1>` 改為 `<h2>`（`df43903`）
