# 改善紀錄

記錄架構、資安與收斂的檢查結果：發現什麼、怎麼改、對應的 commit。遇到的錯誤見 [`bug-log.md`](bug-log.md)，未來的功能規劃見 [`roadmap.md`](roadmap.md)。

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

## 第二次架構檢查（2026-09-29，已全數完成）

第二階段（送出改走 Worker `/api/orders`）完成後的檢查。依下列順序處理，完成時打勾並附上 commit。

- [x] **C0 必填欄位沒有標示**：「填寫訂購資訊」的表單看不出哪些欄位必填 → 必填欄位名稱後加上 `*`，並在標題說明「標有 * 的欄位為必填」（`94b5ce5`）
- [x] **C1 共用程式的位置**：`worker/orders.js` 以 `../src/utils/...` 跨進前端資料夾取用驗證與金額計算 → 搬到 `shared/`，讓前端／後端／共用分開（`9f096cf`）
- [x] **C2 後端驗證不夠嚴格**：`pickup_method` 沒有限定可選的值，文字欄位（備註、地址等）沒有長度上限 → `shared/orderForm.js` 新增 `PICKUP_METHODS`、`MAX_QUANTITY`、`textFieldRules`，前端下拉選單與 `maxLength` 共用同一份規則，另加 4 個測試（`63a8a08`）
- [x] **C3 API 沒有防濫用**：任何人都能用程式大量呼叫 `/api/orders` 灌假訂單 → 加入 Cloudflare Turnstile 人機驗證（或 Rate Limiting）
  - [x] C3-A Rate Limiting：`wrangler.jsonc` 加入 `ORDER_RATE_LIMITER`（每個 IP 每 60 秒 5 次），超過回 429，前端顯示「送出太頻繁」（`8b1f3b2`）
  - [x] C3-B Turnstile 人機驗證：訂單表單加入 widget（`TurnstileWidget.jsx`，每次送出後以 `key` 重建），Worker 以 siteverify 檢查 `success`、`action`、`hostname`（`5129cc0`）；同一個 token 只能建立一筆訂單（見 [`bug-log.md`](bug-log.md) 的 B15，`3a0dced`）
- [x] **C4 `components` 有 14 個檔案平放** → 依用途分成子資料夾：`layout/`（頁面框架）、`form/`（表單輸入）、`order/`（訂單顯示與視窗）、`product/`（商品介紹），`OrderForm.jsx` 留在最外層當入口（`b5e7997`）
- [x] **C5 README 過時**：仍寫著 `src/lib`、`VITE_SUPABASE_*` 與「訪客只能新增訂單」，缺少 Worker、`.dev.vars`、secret 的說明 → 改寫為目前的架構：系統架構圖、`worker/`、`shared/`、`.dev.vars`、Supabase 權限設定、部署的 Build 變數與 Worker secret（`8403686`）

## 第一次架構檢查（2026-09-24，已全數完成）

來自 2026-09-24 的程式架構檢查。不算 bug，但會影響維護性或效能。**2026-09-25 全數完成。**

- [x] 首次載入的 JS 有一大半是 supabase-js → `orderService` 改用動態 `import()`，主程式 454KB → 240KB，Supabase（215KB）在送出時才下載（`815deab`）
- [x] `OrderForm` 負責太多事 → 拆出 `SiteHeader` 元件與 `hooks/useOrderSubmit` 自訂 Hook，送出成功後的重設由 `OrderForm` 透過 `onSuccess` 決定；`OrderForm.jsx` 由 118 行減為 77 行（`a37636d`）
- [x] 步驟設定分散在多處 → `OrderForm` 以 `INTRO_STEPS` 陣列描述介紹步驟與按鈕文字，總步數由陣列長度推算，`WizardFooter` 改由 `continueLabel` prop 取得按鈕文字；另在 `.oxlintrc.json` 開啟 `no-undef` 並設定 browser 環境，未定義變數在 lint 階段就會被抓到（`0957895`）
- [x] 成功視窗缺少 Esc 關閉、`role="dialog"` 與焦點管理 → 改用原生 `<dialog>` + `showModal()`，加上 `aria-labelledby`；Esc、✕、點背景都能關閉，開啟時焦點移到關閉按鈕（`445c5d4`）
- [x] `utils/orderForm.js` 沒有單元測試 → 加入 Vitest，`orderForm.test.js` 共 9 個測試（`npm test`），並以變異測試確認能抓到錯誤；同時把必填欄位的錯誤訊息拆成姓名／電話／Email 各自提示（`731e4f6`）
- [x] `productContent.js` 在資料中控制排版 → 改為 `promotion`／`prices`／`notes` 結構，排版交給 `ProductInfo`（`df43903`）
- [x] 移除 `console.log("訂單送出成功")`（`df43903`）
- [x] `ProductInfo` 的標題 `<h1>` 改為 `<h2>`（`df43903`）
