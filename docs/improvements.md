# 改善紀錄

每次做架構或資安檢查時發現的問題、怎麼改的、對應哪個 commit。

踩到的錯誤放在 [`bug-log.md`](bug-log.md)，之後要做的功能放在 [`roadmap.md`](roadmap.md)。

## 收斂階段（2026-09-30）

新功能暫停，只處理這 4 項：

- [x] S2 所有帳號開兩步驟驗證（細節見下方資安檢查）
  - [x] Cloudflare：原本只用 GitHub 登入，沒有密碼。要先用「忘記密碼」設一組密碼才能開兩步驟驗證。wrangler 和自動部署都不受影響
  - [x] 個人和店家的 Gmail
  - [x] GitHub：開完之後 git push 一樣正常
  - [x] Supabase：用 GitHub 登入，靠 GitHub 的兩步驟驗證保護
  - [x] EmailJS
- [x] 把資料庫結構整理成 `supabase/schema.sql`：資料表、權限、個資清除的函式和排程都在裡面，可以重複執行。也跟正式資料庫逐項比對過欄位（型別、必填、預設值）和限制（主鍵、兩個 unique），確認一致（`fc13038`）
- [x] 開 Workers Logs：`wrangler.jsonc` 加上 `observability`（`enabled: true`、`head_sampling_rate: 1`），正式環境的請求和 `console` 輸出都會留下來（`a5c0692`）
- [ ] 每週核對 Supabase 的訂單和寄信紀錄（例行工作）

## 資安檢查（2026-09-30，全部完成）

這次主要檢查兩件事：個資會不會外洩、API 會不會被亂刷。

先確認過沒問題的部分：

- 機密金鑰（Supabase secret key、Turnstile secret、EmailJS private key）只放在 Worker secret 和 `.dev.vars`，git 歷史裡從來沒出現過
- 訪客沒辦法直接讀寫 Supabase
- `/api/orders` 有限流、Turnstile、token 不能重複三層保護
- 正式環境用到的套件沒有已知漏洞

找到的問題照優先順序處理：

- [x] **S1 EmailJS 可以被冒用寄信（高）**

  Public Key、Service ID、Template ID 都在公開的 repo 裡。我實測從別的網站、不帶 Private Key 呼叫 EmailJS，信照樣寄得出去。也就是說別人可以用店家的 Gmail 寄任何內容給任何人（釣魚、垃圾信），還會把每月 200 封的額度用光。

  原本想在 EmailJS 開「Use Private Key」擋掉，結果它只擋非瀏覽器的請求，假裝成瀏覽器還是只要 Public Key 就能寄；限制網域又是付費功能。

  最後的做法：兩個範本砍掉重建，拿到新的 Template ID，只存在 `.dev.vars` 和 Worker secret（`EMAILJS_CUSTOMER_TEMPLATE_ID`、`EMAILJS_OWNER_TEMPLATE_ID`），不再寫進 `wrangler.jsonc`，舊範本刪掉。用舊 ID 模擬攻擊會回 `400 The template ID not found`，正式網站下單兩封信都正常（`79b5248`）。

  還剩的風險：新的 Template ID 如果外洩，一樣可以被冒用，到時候要再重建一次範本。

- [x] **S2 帳號安全（高）**

  GitHub（公開 repo、push 就部署）、Cloudflare、Supabase、EmailJS、兩個 Gmail 都開了兩步驟驗證，2026-09-30 全部完成。

  Cloudflare 和 Supabase 都用 GitHub 登入，所以 GitHub 等於是三個服務的鑰匙。Cloudflare 另外先設了密碼、再開它自己的兩步驟驗證，把「用 Email 重設密碼」這個入口也擋掉。

- [x] **S3 錯誤紀錄可能帶到個資（中）**

  Supabase 寫入失敗時，錯誤內容可能包含整筆訂單，然後被寫進 Worker 的 log。

  新增 `summarizeSupabaseError`，log 只留 Supabase 錯誤的 `code` 和 `message`，可能含整筆資料的 `details` 不要；解析不了就只記一段固定文字。用含假個資的錯誤內容測過，輸出裡沒有個資（`278fbf7`）。

- [x] **S4 確認資料庫權限（中）**

  舊的 publishable key 還有效，而且以前放在前端公開過，要確認 anon 對 `orders` 真的沒有權限。

  檢查結果：`public` 只有 `orders` 一張表，RLS 有開、沒有任何 policy，anon 和 authenticated 已經不能讀寫。但它們還留著 `REFERENCES`、`TRIGGER`、`TRUNCATE`，其中 TRUNCATE 不受 RLS 限制。

  所以執行 `revoke all on table public.orders from anon, authenticated;`，也把 service_role 用不到的 `truncate, references, trigger` 收回，只留 `INSERT, SELECT, UPDATE`，舊的 publishable key 刪掉。驗證過 Worker 的 key 讀寫正常，無效或已刪除的 key 會回 401。

- [x] **S5 沒有安全標頭（中）**

  網站沒有 CSP、`X-Frame-Options`、`X-Content-Type-Options`、`Referrer-Policy` 這些標頭。

  新增 `public/_headers`，網頁和靜態檔案加上 CSP（只放行 Turnstile、Google 字型、YouTube）、`X-Frame-Options`、`X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`。

  `_headers` 管不到 Worker 的回應，所以 `worker/index.js` 拆出 `route`，再用 `withSecurityHeaders` 幫 API 回應加上 `nosniff` 和 `Cache-Control: no-store`。用 `npm run preview` 檢查標頭，瀏覽器走完四個步驟沒有 CSP 錯誤，YouTube、字型、Turnstile 都正常（`b2e1dcc`）。

- [x] **S6 開發套件漏洞（低）**

  `wrangler`／`miniflare` 用到的 `undici` 有 4 個中度漏洞，只影響本機開發。

  等到要處理時已經變成 3 個中度、1 個高風險（`undici` 的 TLS 憑證驗證可能被繞過）。跑 `npm audit fix` 之後，`wrangler` 4.143.0 → 4.144.0、`@cloudflare/vite-plugin` 1.62.0 → 1.62.2、`undici` 7.29.0 → 7.29.1，`npm audit` 變成 0 個漏洞，測試和 build 都正常（`35a0528`）。

- [x] **S7 個資保存期限（低）**

  訂單個資一直留著沒刪，資料庫裡也還有測試訂單。

  2026-09-30 決定：個資留 30 天，到期只清掉個資（姓名、電話、Email、IG、地址、收件人、備註），訂單編號、數量、金額、日期留著做統計，用 Supabase 的 pg_cron 每天跑。

  做法：新增 `anonymized_at` 欄位和 `public.anonymize_old_orders()` 函式，並收回 public、anon、authenticated 的執行權限（Worker 的 key 呼叫會回 403）。用 pg_cron 排程 `anonymize-old-orders`，每天 UTC 19:00（台灣 03:00）執行。拿一筆 31 天前的假訂單測試，清除成功。隱私權同意文字也補上「於下單 30 天後刪除」（`945fca7`）。

  EmailJS 的 Email History 和店家 Gmail 的通知信要自己手動清（Gmail 搜尋 `subject:新訂單 older_than:30d`）。

## 第二次架構檢查（2026-09-29，全部完成）

第二階段（送出訂單改走 Worker 的 `/api/orders`）做完之後再檢查一次，照下面的順序處理。

- [x] **C0 看不出哪些欄位必填**：「填寫訂購資訊」的表單沒有標示 → 必填欄位名稱後面加 `*`，標題說明加上「標有 * 的欄位為必填」（`94b5ce5`）
- [x] **C1 共用程式放錯地方**：`worker/orders.js` 用 `../src/utils/...` 跑去前端資料夾拿驗證和金額計算 → 搬到 `shared/`，前端、後端、共用分開（`9f096cf`）
- [x] **C2 後端驗證不夠嚴**：`pickup_method` 沒限定可以選哪些值，文字欄位（備註、地址等）沒有長度上限 → `shared/orderForm.js` 新增 `PICKUP_METHODS`、`MAX_QUANTITY`、`textFieldRules`，前端的下拉選單和 `maxLength` 也用同一份規則，另外加了 4 個測試（`63a8a08`）
- [x] **C3 API 沒有防濫用**：任何人都能寫程式狂打 `/api/orders` 灌假訂單 → 加上限流和 Turnstile 人機驗證
  - [x] C3-A 限流：`wrangler.jsonc` 加 `ORDER_RATE_LIMITER`（每個 IP 每 60 秒 5 次），超過回 429，前端顯示「送出太頻繁」（`8b1f3b2`）
  - [x] C3-B Turnstile：訂單表單加上 widget（`TurnstileWidget.jsx`，每次送出後換 `key` 重建），Worker 用 siteverify 檢查 `success`、`action`、`hostname`（`5129cc0`）；同一個 token 只能建一筆訂單（見 [`bug-log.md`](bug-log.md) 的 B15，`3a0dced`）
- [x] **C4 `components` 有 14 個檔案全部平放** → 照用途分資料夾：`layout/`（頁面框架）、`form/`（表單輸入）、`order/`（訂單顯示和視窗）、`product/`（商品介紹），`OrderForm.jsx` 留在最外層當入口（`b5e7997`）
- [x] **C5 README 過時**：還寫著 `src/lib`、`VITE_SUPABASE_*` 和「訪客只能新增訂單」，也沒提到 Worker、`.dev.vars`、secret → 照現在的架構重寫：架構圖、`worker/`、`shared/`、`.dev.vars`、Supabase 權限、部署的 Build 變數和 Worker secret（`8403686`）

## 第一次架構檢查（2026-09-24，全部完成）

這些不算 bug，但會影響之後好不好維護或效能。2026-09-25 全部處理完。

- [x] 首次載入的 JS 有一大半是 supabase-js → `orderService` 改用動態 `import()`，主程式從 454KB 降到 240KB，Supabase（215KB）等到送出時才下載（`815deab`）
- [x] `OrderForm` 管太多事 → 拆出 `SiteHeader` 元件和 `hooks/useOrderSubmit`，送出成功後要怎麼重設交給 `OrderForm` 透過 `onSuccess` 決定；`OrderForm.jsx` 從 118 行變 77 行（`a37636d`）
- [x] 步驟設定散在好幾個地方 → `OrderForm` 用 `INTRO_STEPS` 陣列描述介紹步驟和按鈕文字，總步數直接看陣列長度，`WizardFooter` 改從 `continueLabel` prop 拿按鈕文字。另外在 `.oxlintrc.json` 開了 `no-undef` 並設定 browser 環境，沒定義的變數在 lint 就會抓到（`0957895`）
- [x] 成功視窗不能按 Esc 關、沒有 `role="dialog"`、沒處理焦點 → 改用原生 `<dialog>` + `showModal()`，加上 `aria-labelledby`；Esc、✕、點背景都能關，打開時焦點會移到關閉按鈕（`445c5d4`）
- [x] `utils/orderForm.js` 沒有測試 → 加入 Vitest，`orderForm.test.js` 共 9 個測試（`npm test`），也用變異測試確認真的抓得到錯。順便把必填的錯誤訊息拆成姓名／電話／Email 各自提示（`731e4f6`）
- [x] `productContent.js` 在資料裡控制排版 → 改成 `promotion`／`prices`／`notes` 的結構，排版交給 `ProductInfo`（`df43903`）
- [x] 拿掉 `console.log("訂單送出成功")`（`df43903`）
- [x] `ProductInfo` 的標題從 `<h1>` 改成 `<h2>`（`df43903`）
