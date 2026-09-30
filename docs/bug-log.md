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

## 第二次架構檢查（2026-09-29，已全數完成）

第二階段（送出改走 Worker `/api/orders`）完成後的檢查。依下列順序處理，完成時打勾並附上 commit。

- [x] **C0 必填欄位沒有標示**：「填寫訂購資訊」的表單看不出哪些欄位必填 → 必填欄位名稱後加上 `*`，並在標題說明「標有 * 的欄位為必填」（`94b5ce5`）
- [x] **C1 共用程式的位置**：`worker/orders.js` 以 `../src/utils/...` 跨進前端資料夾取用驗證與金額計算 → 搬到 `shared/`，讓前端／後端／共用分開（`9f096cf`）
- [x] **C2 後端驗證不夠嚴格**：`pickup_method` 沒有限定可選的值，文字欄位（備註、地址等）沒有長度上限 → `shared/orderForm.js` 新增 `PICKUP_METHODS`、`MAX_QUANTITY`、`textFieldRules`，前端下拉選單與 `maxLength` 共用同一份規則，另加 4 個測試（`63a8a08`）
- [x] **C3 API 沒有防濫用**：任何人都能用程式大量呼叫 `/api/orders` 灌假訂單 → 加入 Cloudflare Turnstile 人機驗證（或 Rate Limiting）
  - [x] C3-A Rate Limiting：`wrangler.jsonc` 加入 `ORDER_RATE_LIMITER`（每個 IP 每 60 秒 5 次），超過回 429，前端顯示「送出太頻繁」（`8b1f3b2`）
  - [x] C3-B Turnstile 人機驗證：訂單表單加入 widget（`TurnstileWidget.jsx`，每次送出後以 `key` 重建），Worker 以 siteverify 檢查 `success`、`action`、`hostname`（`5129cc0`）；同一個 token 只能建立一筆訂單（見 B15，`3a0dced`）
- [x] **C4 `components` 有 14 個檔案平放** → 依用途分成子資料夾：`layout/`（頁面框架）、`form/`（表單輸入）、`order/`（訂單顯示與視窗）、`product/`（商品介紹），`OrderForm.jsx` 留在最外層當入口（`b5e7997`）
- [x] **C5 README 過時**：仍寫著 `src/lib`、`VITE_SUPABASE_*` 與「訪客只能新增訂單」，缺少 Worker、`.dev.vars`、secret 的說明 → 改寫為目前的架構：系統架構圖、`worker/`、`shared/`、`.dev.vars`、Supabase 權限設定、部署的 Build 變數與 Worker secret（`8403686`）

## 功能規劃：歷史訂單

目前顧客關掉成功視窗後就看不到訂單編號，也無法回頭查看自己的訂單。缺口補完後分兩階段進行：

- [~] **H1 我的訂單（本機紀錄）**：2026-09-29 決定不做。網站定位為單純的訂購表單、不做會員，顧客改以 Email 確認信保存訂單資訊（見「自動寄信」）
- [ ] **H2 訂單查詢**：輸入訂單編號 + Email，由 Worker 查詢 Supabase 回傳訂單內容與最新狀態，跨裝置可用；「我的訂單」的每一筆可直接點進查詢。適合與訂單狀態（匯款回報、出貨）一起完成。**2026-09-30 列為未來實作**

## 資安檢查（2026-09-30，已全數完成）

針對個資外洩與 API 濫用的檢查。已確認沒有問題的項目：所有機密金鑰（Supabase secret key、Turnstile secret、EmailJS private key）只存在 Worker secret 與 `.dev.vars`，git 歷史中從未出現；訪客無法直接讀寫 Supabase；`/api/orders` 有限流、Turnstile 與 token 唯一值三層防護；正式環境依賴套件沒有已知漏洞。

依優先順序處理：

- [x] **S1 EmailJS 可被冒用寄信（高）**：Public Key、Service ID、Template ID 都在公開的 repo 中，實測不帶 Private Key 從其他網站呼叫 EmailJS 仍會寄出信件。攻擊者可用店家 Gmail 寄任意內容給任何人（釣魚、垃圾信），並耗盡每月 200 封額度 → 在 EmailJS 強制所有請求都必須帶 Private Key。**處理結果：** EmailJS 的「Use Private Key」只對非瀏覽器請求有效，假冒瀏覽器的請求仍可只用 Public Key 寄信；限制網域為付費功能。改為重建兩個範本取得新的 Template ID，只存於 `.dev.vars` 與 Worker secret（`EMAILJS_CUSTOMER_TEMPLATE_ID`、`EMAILJS_OWNER_TEMPLATE_ID`），不再寫入 `wrangler.jsonc`，並刪除已公開的舊範本。以舊 ID 模擬攻擊回傳 `400 The template ID not found`；正式網站下單兩封信皆正常寄出（`79b5248`）。剩餘風險：新 Template ID 若外洩，同樣可被冒用，需再次重建範本
- [x] **S2 帳號安全（高）**：GitHub（公開 repo、push 即部署）、Cloudflare、Supabase、EmailJS、兩個 Gmail 帳號都開啟兩步驟驗證。**處理結果：** 2026-09-30 全部開啟。Cloudflare 與 Supabase 以 GitHub 登入，GitHub 成為三個服務的登入鑰匙；Cloudflare 另外先設定密碼再開啟自己的兩步驟驗證，擋住以 Email 重設密碼的入口
- [x] **S3 錯誤紀錄可能包含個資（中）**：Supabase 寫入失敗時，錯誤內容可能包含整筆訂單資料並被寫入 Worker log → 只記錄狀態碼與錯誤代碼。**處理結果：** 新增 `summarizeSupabaseError`，log 只保留 Supabase 錯誤的 `code` 與 `message`，丟棄可能含整筆資料的 `details`；無法解析時只記固定文字。以含假個資的錯誤內容測試，輸出不含個資（`278fbf7`）
- [x] **S4 確認資料庫權限（中）**：舊的 publishable key 仍然有效且曾公開在前端 → 確認 anon 對 `orders` 沒有任何權限，並停用或輪替 publishable key。**處理結果：** 檢查發現 `public` 只有 `orders` 一張表、RLS 已開啟且沒有任何 policy；anon 與 authenticated 已無讀寫權限，但仍有 `REFERENCES`、`TRIGGER`、`TRUNCATE`（TRUNCATE 不受 RLS 限制）。執行 `revoke all on table public.orders from anon, authenticated;` 並收回 service_role 用不到的 `truncate, references, trigger`，只保留 `INSERT, SELECT, UPDATE`；刪除舊的 publishable key。驗證：Worker 的 key 讀寫權限正常，無效或已刪除的 key 回傳 401
- [x] **S5 缺少安全標頭（中）**：網站沒有 CSP、`X-Frame-Options`、`X-Content-Type-Options`、`Referrer-Policy` 等標頭 → 以 `_headers` 與 Worker 加上。**處理結果：** 新增 `public/_headers`，網頁與靜態檔案加上 CSP（只放行 Turnstile、Google 字型、YouTube）、`X-Frame-Options`、`X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`；`_headers` 不會套用在 Worker 的回應，因此 `worker/index.js` 拆出 `route` 並以 `withSecurityHeaders` 為 API 回應加上 `nosniff` 與 `Cache-Control: no-store`。以 `npm run preview` 驗證標頭，瀏覽器走完四步驟無 CSP 違規，YouTube、字型與 Turnstile 皆正常（`b2e1dcc`）
- [x] **S6 開發套件漏洞（低）**：`wrangler`／`miniflare` 使用的 `undici` 有 4 個中度漏洞，只影響本機開發 → `npm audit fix`。**處理結果：** 處理時已增加為 3 個中度、1 個高風險（`undici` TLS 憑證驗證可能被繞過）。執行 `npm audit fix`，`wrangler` 4.143.0 → 4.144.0、`@cloudflare/vite-plugin` 1.62.0 → 1.62.2、`undici` 7.29.0 → 7.29.1，`npm audit` 為 0 個漏洞；測試與 build 正常（`35a0528`）。之後可定期執行 `npm audit` 檢查
- [x] **S7 個資保存期限（低）**：訂單個資無限期保存，且資料庫中仍有測試訂單 → 訂定保存期限與清理方式。**2026-09-30 決定：** 保存 30 天，到期只清除個資（姓名、電話、Email、IG、地址、收件人、備註），保留訂單編號、數量、金額、日期供統計；以 Supabase pg_cron 每日執行。**處理結果：** 新增 `anonymized_at` 欄位與 `public.anonymize_old_orders()` 函式（收回 public、anon、authenticated 的執行權限，Worker 的 key 呼叫回傳 403），以 pg_cron 排程 `anonymize-old-orders` 於每天 UTC 19:00（台灣 03:00）執行；以一筆 31 天前的假訂單測試清除成功。隱私權同意文字補上「於下單 30 天後刪除」。EmailJS Email History 與店家 Gmail 的通知信需手動清理（Gmail 搜尋 `subject:新訂單 older_than:30d`）（`945fca7`）

## 收斂階段（2026-09-30）

凍結新功能，只處理以下 4 項（出自學習筆記「技術債與收斂建議」）：

- [x] S2 帳號兩步驟驗證（見資安檢查）：全部帳號完成，驗證器使用 iPhone／Mac 內建的「密碼」App，備用碼另外保存
  - [x] Cloudflare（2026-09-30）：帳號原本只用 GitHub 登入、沒有密碼，先以「忘記密碼」設定密碼再開啟；wrangler 與自動部署不受影響
  - [x] Gmail（2026-09-30）：`ykk910309@gmail.com`、`memoryperfume614@gmail.com`
  - [x] GitHub（2026-09-30）：git push 仍正常（本機使用已儲存的憑證，不受影響）
  - [x] Supabase（2026-09-30）：以 GitHub 登入，由 GitHub 的兩步驟驗證保護
  - [x] EmailJS（2026-09-30）
- [x] 資料庫結構整理成 `supabase/schema.sql`：資料表、權限、個資清除函式與排程，可重複執行；已與正式資料庫的欄位（型別、必填、預設值）與限制（主鍵、兩個 unique）逐項比對一致（`fc13038`）
- [x] 開啟 Workers Logs：`wrangler.jsonc` 加入 `observability`（`enabled: true`、`head_sampling_rate: 1`），正式環境保留請求與 `console` 紀錄（`a5c0692`）
- [ ] 每週核對 Supabase 訂單與寄信紀錄（例行工作）

## 未來實作（2026-09-30 決定暫緩）

- [ ] **訂單管理頁**：登入後查看所有訂單、依狀態篩選、更新為已付款／已出貨
- [ ] **匯款回報與出貨通知**：顧客在網站輸入訂單編號與帳號末五碼；出貨時寄信通知
- [ ] **H2 訂單查詢**：以訂單編號 + Email 查詢訂單內容與狀態（見上方「功能規劃：歷史訂單」）

## 功能規劃：自動寄信

2026-09-29 決定：不做會員登入，訂單資訊以 Email 確認信提供給顧客。目前沒有自有網域，採用 **EmailJS + 店家 Gmail** 寄信（免費方案每月約 200 封）；日後若購買網域，可改用 Cloudflare Email Service。

- [x] **E1 EmailJS 設定**：連結 Gmail、建立「顧客確認信」與「新訂單通知」兩個範本、開啟非瀏覽器 API 存取
- [x] **E2 Worker 寄信**：訂單寫入成功後寄出兩封信，寄信失敗不影響下單（`ctx.waitUntil`）；`worker/email.js`，兩封信間隔 1 秒以符合 EmailJS 每秒 1 次的限制（`df32925`）
- [x] **E3 部署與測試**：設定正式環境 secret、成功視窗文案改為「確認信已寄到您的 Email」；正式網站下單後，顧客與店家皆收到信（`df32925`）

## 架構改善清單

來自 2026-09-24 的程式架構檢查。不算 bug，但會影響維護性或效能。**2026-09-25 全數完成。**

- [x] 首次載入的 JS 有一大半是 supabase-js → `orderService` 改用動態 `import()`，主程式 454KB → 240KB，Supabase（215KB）在送出時才下載（`815deab`）
- [x] `OrderForm` 負責太多事 → 拆出 `SiteHeader` 元件與 `hooks/useOrderSubmit` 自訂 Hook，送出成功後的重設由 `OrderForm` 透過 `onSuccess` 決定；`OrderForm.jsx` 由 118 行減為 77 行（`a37636d`）
- [x] 步驟設定分散在多處 → `OrderForm` 以 `INTRO_STEPS` 陣列描述介紹步驟與按鈕文字，總步數由陣列長度推算，`WizardFooter` 改由 `continueLabel` prop 取得按鈕文字；另在 `.oxlintrc.json` 開啟 `no-undef` 並設定 browser 環境，未定義變數在 lint 階段就會被抓到（`0957895`）
- [x] 成功視窗缺少 Esc 關閉、`role="dialog"` 與焦點管理 → 改用原生 `<dialog>` + `showModal()`，加上 `aria-labelledby`；Esc、✕、點背景都能關閉，開啟時焦點移到關閉按鈕（`445c5d4`）
- [x] `utils/orderForm.js` 沒有單元測試 → 加入 Vitest，`orderForm.test.js` 共 9 個測試（`npm test`），並以變異測試確認能抓到錯誤；同時把必填欄位的錯誤訊息拆成姓名／電話／Email 各自提示（`731e4f6`）
- [x] `productContent.js` 在資料中控制排版 → 改為 `promotion`／`prices`／`notes` 結構，排版交給 `ProductInfo`（`df43903`）
- [x] 移除 `console.log("訂單送出成功")`（`df43903`）
- [x] `ProductInfo` 的標題 `<h1>` 改為 `<h2>`（`df43903`）
