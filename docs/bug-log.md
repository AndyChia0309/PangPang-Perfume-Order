# Bug 紀錄

記錄開發與上線過程中遇到的錯誤：症狀、原因、修正方式與狀態。新問題請加在對應區塊的最上方。架構與資安的檢查結果見 [`improvements.md`](improvements.md)，未來的功能規劃見 [`roadmap.md`](roadmap.md)。

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
| B10 | 加入 Cloudflare Vite 外掛後 `npm test` 無法啟動 | 程式 | ✅ 已修正 | `590954b` |
| B11 | Supabase 新增 `order_number` 欄位失敗 | 資料庫 | ✅ 已修正 | 資料庫設定 |
| B12 | Worker 用 secret key 讀寫 `orders` 被拒絕 | 資料庫 | ✅ 已修正 | 資料庫設定 |
| B13 | 新增 Worker 檔案後 build 失敗、本機 API 全部回 500 | 程式 | ✅ 已修正 | `25cf5f7` |
| B14 | 在 Cloudflare 後台設定的 secret 沒有生效 | 部署 | ✅ 已修正 | 部署設定 |
| B15 | 同一個 Turnstile token 可以重複通過驗證 | 安全 | ✅ 已修正 | `3a0dced` |
| B16 | Worker 呼叫 EmailJS 寄信失敗，顧客與店家都沒收到信 | 串接 | ✅ 已修正 | `df32925` |

## 已修正

### B16 Worker 呼叫 EmailJS 寄信失敗，顧客與店家都沒收到信

- **症狀：** 本機下單成功、訂單已寫入 Supabase，但兩個信箱都沒有收到信。
- **原因：** 有兩個問題。① EmailJS 預設只接受瀏覽器發出的請求，Worker 呼叫時回傳 `403 API access from non-browser environments is currently disabled`。② EmailJS 的網站也在 Cloudflare 後面，沒有 `User-Agent` 或看起來像腳本的請求可能被擋下（`error code: 1010`）。寄信錯誤被 `try/catch` 接住，所以訂單仍然成功，只是沒有寄出信件。
- **修正：** 在 EmailJS **Account → Security** 開啟非瀏覽器應用程式的 API 存取；`worker/email.js` 呼叫 EmailJS 時帶上 `User-Agent: pangpang-order-worker/1.0`。
- **狀態：** 已修正（`df32925`）。

### B15 同一個 Turnstile token 可以重複通過驗證

- **症狀：** 以同一個 token 呼叫 siteverify 兩次，兩次都回傳 `success: true`，本機（`localhost`）與正式網址皆同。官方文件的說法是 token 只能驗證一次，重送應回傳 `timeout-or-duplicate`。
- **原因：** Cloudflare 端未如文件所述拒絕重複的 token，原因不明。Worker 的 `verifyTurnstile` 相信 siteverify 的結果，因此重送的 token 也能建立訂單。
- **修正：** 不依賴 siteverify 的重複檢查，自行補上防線：`orders` 新增 `turnstile_token_hash`（text、unique），Worker 以 SHA-256 雜湊 token 後隨訂單寫入。重送時資料庫回傳 409（`23505`），Worker 判斷錯誤內容含 `turnstile_token_hash` 後回傳 403。
- **驗證：** 以既有訂單的雜湊值再寫入一次，資料庫回傳 `409 duplicate key value violates unique constraint "orders_turnstile_token_hash_key"`，未建立訂單。部署後在正式網站以同一個 token 送出兩次完整訂單：第一次 201，第二次 403。
- **狀態：** 已修正（`3a0dced`）。

### B14 在 Cloudflare 後台設定的 secret 沒有生效

- **症狀：** 在後台新增 `SUPABASE_URL`、`SUPABASE_SECRET_KEY` 後，`wrangler secret list` 仍回傳 `[]`，線上也沒有產生新版本。
- **原因：** 後台新增變數後還需要按 **Deploy** 才會套用；只按新增或直接關閉視窗不會生效。另外要確認是放在 **Settings → Variables and Secrets**，而不是 Build 底下的 Build Variables。
- **修正：** 改用 `wrangler secret bulk` 從 `.dev.vars` 讀取並上傳，兩個 secret 皆設為 Secret 類型（Text 類型會在下次 `wrangler deploy` 時被 `wrangler.jsonc` 的設定清除）。上傳後以 `wrangler secret list` 確認，push 部署後新版本仍保留 secret。
- **狀態：** 已修正（部署設定）。

### B13 新增 Worker 檔案後 build 失敗、本機 API 全部回 500

- **症狀：** `npm run build` 出現 `Could not resolve './orders.js' in worker/index.js`；修正檔名後，本機 `/api/health` 仍回 500。
- **原因：** 檔案建立成 `worker/order.js`，與 import 的 `./orders.js` 不符。修正後 dev server 仍保留舊的載入錯誤，且 `.dev.vars` 只在啟動時讀取一次。
- **修正：** 檔名改為 `orders.js`（與 `/api/orders` 一致），並重新啟動 `npm run dev`。Worker 的檔案結構或 `.dev.vars`、`wrangler.jsonc` 變動後都需要重開。
- **狀態：** 已修正（`25cf5f7`）。

### B12 Worker 用 secret key 讀寫 `orders` 被拒絕

- **症狀：** 以 secret key 呼叫 Supabase REST API 回傳 `42501 permission denied for table orders`。
- **原因：** `orders` 使用自訂的 Data API 權限，只授權 anon 新增。secret key 對應的 `service_role` 雖然會略過 RLS，仍需要資料表的 GRANT 權限。
- **修正：** `grant select, insert, update on table public.orders to service_role;`。刻意不給 `delete`，程式不需要刪除訂單。
- **狀態：** 已修正（資料庫設定）。

### B11 Supabase 新增 `order_number` 欄位失敗

- **症狀：** 新增欄位時出現 `23502: column "order_number" of relation "orders" contains null values`。
- **原因：** 沒有勾選 Allow Nullable（等於 not null），但表中已有舊訂單，新欄位在這些列上只能是 null。
- **修正：** 先以可為 null 的方式建立 `order_number`、`subtotal`、`shipping_fee`、`total`，等 Worker 上線、舊測試訂單清除後，再以 `alter column ... set not null` 改為必填。
- **狀態：** 已修正（資料庫設定）。

### B10 加入 Cloudflare Vite 外掛後 `npm test` 無法啟動

- **症狀：** 執行測試出現 `Error: There is already a server associated with the config.`。
- **原因：** Vitest 預設讀取 `vite.config.js`，因此也載入了 `cloudflare()` 外掛並嘗試再啟動一次 Worker 環境。
- **修正：** 新增獨立的 `vitest.config.js`，Vitest 會優先使用它，不再載入 Cloudflare 外掛；以 `include` 指定測試位置。
- **狀態：** 已修正（`590954b`）。

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
