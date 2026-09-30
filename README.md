# 白日慵懶香水訂購網站

這是畢業製作「香水夢遊 Parfum Tournée」訂購網站的重新改寫版本。原版使用純 HTML/CSS/JS 開發，資料透過 Google Sheet 串接；此版本改用 React + Vite 重構前端，以 Cloudflare Worker 作為後端 API，資料庫使用 Supabase。

使用者會依序經過四個步驟認識品牌與香水，最後填寫訂購資料、選擇香水數量與收件方式，確認後送出訂單並取得訂單編號。

**線上展示：** https://pangpang-perfume-order.ykk910309.workers.dev/

> 本網站目前為作品集展示使用，目前暫無正式的交易內容。

## 功能特色

- 分步驟訂購流程，底部固定導覽列附進度條
  1. 品牌介紹
  2. 品牌影片
  3. 香味介紹（前中後調、商品圖）
  4. 訂購表單
- 訂購表單：訂購人、收件人、收件門市、備註、隱私權同意，必填欄位以 `*` 標示
- 個資保存 30 天，到期自動清除，只保留訂單統計資料
- 香水數量選擇（小瓶／大瓶，含自訂數量），即時顯示訂單明細與金額
- 送出前的確認視窗，送出後顯示訂單編號（例如 `PP260929-7K3QX`）
- 下單後自動寄出訂單確認信（含匯款資訊）給顧客，並寄新訂單通知給店家
- RWD：手機到大螢幕皆可瀏覽，大螢幕時內容寬度與字級會跟著放大

## 系統架構

```text
瀏覽器 ──FormData──▶ Cloudflare Worker  POST /api/orders ──secret key──▶ Supabase
                      ├ Rate Limiting：每個 IP 每分鐘最多 5 次
                      ├ Turnstile 人機驗證（siteverify），同一個 token 只能建立一筆訂單
                      ├ 驗證表單（與前端共用 shared/orderForm.js）
                      ├ 後端計算金額（shared/orderTotal.js）
                      ├ 產生訂單編號
                      └ 背景寄信（EmailJS + Gmail）：顧客確認信、新訂單通知
```

- 前端不持有任何資料庫權限；訪客無法直接讀寫 Supabase
- 驗證與金額計算前後端共用同一份程式，前端的檢查是為了使用體驗，後端的檢查才是真正的防線
- 金額一律由後端依 `shared/pricing.js` 計算，不採用瀏覽器傳來的數字
- 網頁設有 CSP 等安全標頭（`public/_headers`），新增外部資源（例如新的字型或嵌入服務）時需同步放行，否則會被瀏覽器擋下
- 不需要會員登入：顧客以 Email 確認信保存訂單編號與匯款資訊；寄信在回應顧客之後於背景進行（`ctx.waitUntil`），寄信失敗不影響下單

## 使用技術

- React 19
- Vite
- Tailwind CSS v4
- lucide-react（icon）
- Cloudflare Workers（後端 API、靜態網站託管、Rate Limiting）
- Cloudflare Turnstile（人機驗證）
- EmailJS（透過店家 Gmail 寄送確認信與通知信）
- Supabase（PostgreSQL，Worker 透過 REST API 寫入）
- Vitest（單元測試）
- Oxlint

## 專案結構

```text
src/                      # 前端
├── components/
│   ├── OrderForm.jsx     # 訂購流程入口：步驟設定（INTRO_STEPS）與步驟切換
│   ├── layout/           # 頁面框架：頁首（SiteHeader）、底部導覽列與進度條（WizardFooter）
│   ├── steps/            # 四個步驟頁與共用的 StepHeader
│   ├── form/             # 表單輸入：訂購人、收件人、數量、必填標示、Turnstile
│   ├── order/            # 訂單顯示：訂單明細、確認視窗、成功視窗
│   ├── product/          # 商品圖與商品資訊
│   └── icons/            # 自製 icon（Instagram）
├── hooks/
│   ├── useOrderSubmit.js # 送出訂單流程：驗證、確認、送出、錯誤處理
│   └── useDialog.js      # 原生 <dialog> 的開關與點背景關閉
├── data/                 # 品牌故事、商品文案、圖片等內容資料
├── services/             # 呼叫 /api/orders
└── index.css             # 全站設計系統
worker/                   # 後端（Cloudflare Worker）
├── index.js              # 路由與 Rate Limiting
├── orders.js             # 建立訂單：人機驗證、驗證、計算金額、產生編號、寫入 Supabase
├── turnstile.js          # Turnstile siteverify 與 token 雜湊
└── email.js              # 透過 EmailJS 寄出顧客確認信與新訂單通知
shared/                   # 前後端共用（修改時兩邊都會受影響）
├── orderForm.js          # 表單欄位、驗證規則、長度與數量上限
├── orderTotal.js         # 金額計算
├── pricing.js            # 價格與運費
└── *.test.js             # 單元測試
docs/
└── bug-log.md            # Bug 紀錄、架構檢查與功能規劃
public/_headers           # 安全標頭（CSP 等），套用於網頁與靜態檔案
wrangler.jsonc            # Worker 設定（靜態檔案、Rate Limiting）
```

## 修改內容與樣式

- **價格與運費**：`shared/pricing.js`，前端顯示與後端計算會同時更新。
- **欄位規則**：收件方式選項、數量上限、各欄位長度上限在 `shared/orderForm.js`，前端輸入框的 `maxLength` 也讀取同一份設定。
- **文字內容**：品牌故事在 `src/data/brandStory.js`，商品文案、付款與寄送說明在 `src/data/productContent.js`，圖片在 `src/data/productMedia.js`。
- **顏色、字級、字型**：統一在 `src/index.css` 的 `@theme` 設定。大螢幕的字級與內容寬度在同一個檔案的 `@variant` 區塊調整。
- **共用樣式**：輸入框用 `field`、欄位名稱用 `field-label`、按鈕用 `btn` 搭配 `btn-primary` 或 `btn-outline`、彈出視窗用 `modal`、卡片用 `card`，都定義在 `src/index.css`。
- **步驟**：介紹步驟的順序與按鈕文字在 `src/components/OrderForm.jsx` 的 `INTRO_STEPS` 陣列，新增步驟只要加一行，總步數與進度條會自動計算；訂購表單固定為最後一步。

## 本機開發

```bash
npm install
npm run dev
```

`npm run dev` 會透過 `@cloudflare/vite-plugin` 同時啟動網站與 Worker，`http://localhost:5173/api/orders` 可直接測試 API。修改 `wrangler.jsonc` 或 `.dev.vars` 後需要重新啟動。

## 環境變數設定

**前端**：建立 `.env.local`，參考 `.env.example`：

```env
# 正式網址（不含結尾斜線），用於社群分享預覽
VITE_SITE_URL=
```

`VITE_` 開頭的變數會在 build 時寫進網頁，任何人都看得到，不可放入金鑰。

**Worker**：建立 `.dev.vars`（已被 `.gitignore` 排除，不可 commit）：

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
TURNSTILE_SECRET=
TURNSTILE_HOSTNAMES=localhost
EMAILJS_PRIVATE_KEY=
EMAILJS_CUSTOMER_TEMPLATE_ID=
EMAILJS_OWNER_TEMPLATE_ID=
```

`SUPABASE_SECRET_KEY` 在 Supabase **Project Settings → API Keys → Secret keys** 取得。這把 key 會略過 RLS，只能放在 Worker。

`TURNSTILE_SECRET` 是 Turnstile widget 的 Secret Key；Site Key 為公開值，寫在 `src/components/TurnstileWidget.jsx`。`TURNSTILE_HOSTNAMES` 是允許取得 token 的網址（逗號分隔），正式環境的值寫在 `wrangler.jsonc` 的 `vars`，只包含正式網址，本機由 `.dev.vars` 覆蓋為 `localhost`。Turnstile widget 需登記正式網址與 `localhost` 兩個 hostname。

EmailJS 的 Service ID 與 Public Key 寫在 `wrangler.jsonc` 的 `vars`；`EMAILJS_PRIVATE_KEY` 與兩個 Template ID（`EMAILJS_CUSTOMER_TEMPLATE_ID`、`EMAILJS_OWNER_TEMPLATE_ID`）必須保密，只放在 `.dev.vars` 與 Worker secret。EmailJS 允許瀏覽器端只用 Public Key 寄信，Template ID 一旦公開，任何人都能用店家的 Gmail 寄信，因此不可寫進 repo。EmailJS 需在 **Account → Security** 開啟非瀏覽器應用程式的 API 存取。信件內容與匯款資訊在 EmailJS 的範本中編輯，不在程式碼裡。

## Supabase 設定

`orders` 資料表除了訂單欄位外，需有 `order_number`（text、unique）、`subtotal`、`shipping_fee`、`total`（int4），皆為 not null；以及 `turnstile_token_hash`（text、unique），防止同一個 Turnstile token 重複建立訂單。權限設定：

```sql
-- Worker 使用的 service_role：只能新增、讀取、更新（不可刪除、清空）
grant select, insert, update on table public.orders to service_role;
revoke truncate, references, trigger on table public.orders from service_role;

-- 訪客與登入者：沒有任何權限（前端不直接連線資料庫）
revoke all on table public.orders from anon, authenticated;
```

RLS 保持開啟且不設定任何 policy。前端不使用 Supabase，publishable key 已刪除。

**個資保存期限（30 天）**：訂單建立 30 天後，由 pg_cron 每天自動清除個資（姓名、電話、Email、IG、地址、收件人、備註），保留訂單編號、數量、金額與日期。需新增欄位、建立清除函式並收回執行權限，再開啟 `pg_cron` 擴充功能並建立排程：

```sql
alter table public.orders add column anonymized_at timestamptz;

create or replace function public.anonymize_old_orders()
returns integer
language sql
set search_path = ''
as $$
  with updated as (
    update public.orders
    set customer_name = '（已清除）',
        phone = '（已清除）',
        email = '（已清除）',
        instagram = '',
        pickup_store_address = '（已清除）',
        recipient_name = '（已清除）',
        recipient_phone = '（已清除）',
        note = '',
        anonymized_at = now()
    where created_at < now() - interval '30 days'
      and anonymized_at is null
    returning 1
  )
  select count(*)::integer from updated;
$$;

revoke execute on function public.anonymize_old_orders() from public, anon, authenticated;

select cron.schedule(
  'anonymize-old-orders',
  '0 19 * * *',  -- UTC 19:00 = 台灣 03:00
  $$select public.anonymize_old_orders();$$
);
```

執行記錄可查詢 `cron.job_run_details`。EmailJS 的 Email History 與店家 Gmail 的新訂單通知信需另外手動清理。

## 建置與預覽

```bash
npm run build     # 輸出 dist/client（網站）與 dist/pangpang_perfume_order（Worker）
npm run preview
```

## 測試與程式檢查

```bash
npm test          # 單元測試（監看模式，存檔自動重跑）
npx vitest run    # 單元測試（執行一次）
npm run lint      # Oxlint，已開啟 no-undef 檢查未定義變數
```

測試位於 `shared/`，共 22 個，涵蓋數量與「其他」數量、必填欄位、收件人預設值、收件方式、長度與數量上限，以及金額計算。

## 部署

部署於 Cloudflare Workers，push 到 `main` 後會自動 build 並部署。

- Build command：`npm run build`
- Deploy command：`npx wrangler deploy`（讀取 `wrangler.jsonc`）
- **Build 變數**（Settings → Build → Build Variables and Secrets）：`VITE_SITE_URL`、`NODE_VERSION=22`
- **Worker secret**（Settings → Variables and Secrets，類型選 Secret）：`SUPABASE_URL`、`SUPABASE_SECRET_KEY`、`TURNSTILE_SECRET`、`EMAILJS_PRIVATE_KEY`、`EMAILJS_CUSTOMER_TEMPLATE_ID`、`EMAILJS_OWNER_TEMPLATE_ID`。也可以用 `npx wrangler secret put <名稱>` 設定。類型若選 Text，會在下次部署時被 `wrangler.jsonc` 的設定清除

開發與部署過程遇到的問題記錄在 [`docs/bug-log.md`](docs/bug-log.md)。

## 未來規劃

- [ ] 訂單查詢：以訂單編號 + Email 查詢訂單內容與狀態
- [ ] 訂單管理頁：登入後依狀態篩選、更新訂單狀態
- [ ] 匯款回報與出貨通知

## 授權

本專案僅供作品展示，程式碼不開放重製或商業使用。
