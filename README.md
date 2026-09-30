# 白日慵懶香水訂購網站

畢業製作「香水夢遊 Parfum Tournée」訂購網站的重寫版本：原版是純 HTML/CSS/JS 加 Google Sheet，這一版改成 React 前端、Cloudflare Worker 後端，資料庫用 Supabase。

**線上展示：** https://pangpang-perfume-order.ykk910309.workers.dev/

> 本網站目前為作品集展示使用，目前暫無正式的交易內容。

## 功能

- 四步驟訂購流程：品牌介紹 → 品牌影片 → 香味介紹 → 訂購表單，底部導覽列附進度條
- 訂購表單：訂購人、收件人、收件門市、備註、隱私權同意；必填欄位以 `*` 標示
- 數量選擇（小瓶／大瓶，可自訂），即時顯示訂單明細與金額
- 送出前確認視窗，送出後顯示訂單編號（例如 `PP260929-7K3QX`）
- 自動寄出顧客確認信（含匯款資訊）與店家新訂單通知
- 個資保存 30 天，到期自動清除，只保留統計資料
- RWD：手機到大螢幕都能瀏覽

## 架構

```text
瀏覽器 ──FormData──▶ Worker  POST /api/orders ──secret key──▶ Supabase
                      1 限流：每個 IP 每分鐘 5 次
                      2 Turnstile 人機驗證，同一個 token 只能建立一筆訂單
                      3 驗證表單、後端計算金額（與前端共用 shared/）
                      4 產生訂單編號、寫入資料庫
                      5 背景寄信（EmailJS + Gmail）
```

| 層 | 技術 |
| --- | --- |
| 前端 | React 19、Vite、Tailwind CSS v4、lucide-react |
| 後端 | Cloudflare Workers（API、靜態網站、Rate Limiting）、Cloudflare Turnstile |
| 資料庫 | Supabase（PostgreSQL），Worker 透過 REST API 寫入 |
| 寄信 | EmailJS + 店家 Gmail |
| 測試與檢查 | Vitest、Oxlint |

- 前端不連資料庫，訪客對資料庫沒有任何權限
- 前端驗證是為了使用體驗，後端驗證才是防線；金額一律由後端計算
- 不需要會員：訂單資訊透過 Email 確認信提供；寄信失敗不影響下單

## 專案結構

```text
src/                  # 前端
├── components/       # OrderForm（入口）、layout/、steps/、form/、order/、product/、icons/
├── hooks/            # useOrderSubmit（送出流程）、useDialog（原生 <dialog>）
├── data/             # 品牌故事、商品文案、圖片
├── services/         # 呼叫 /api/orders
└── index.css         # 設計系統（@theme、共用 class）
worker/               # 後端：index（路由、限流）、orders、turnstile、email
shared/               # 前後端共用：驗證規則、金額計算、價格（含 22 個測試）
public/_headers       # 安全標頭（CSP 等）
wrangler.jsonc        # Worker 設定
supabase/schema.sql   # 資料庫結構、權限、個資清除排程
docs/bug-log.md       # Bug 紀錄、檢查清單與規劃
```

## 常見修改

| 要改的東西 | 位置 |
| --- | --- |
| 價格、運費 | `shared/pricing.js`（前後端同時生效） |
| 收件方式、數量與字數上限 | `shared/orderForm.js` |
| 文案、圖片 | `src/data/` |
| 顏色、字級 | `src/index.css` 的 `@theme`；共用 class：`field`、`btn`、`card`、`modal` |
| 介紹步驟 | `src/components/OrderForm.jsx` 的 `INTRO_STEPS` |
| 信件內容、匯款資訊 | EmailJS 後台的範本（不用部署） |
| 新增外部資源 | `public/_headers` 的 CSP 要放行 |

## 本機開發

```bash
npm install
npm run dev        # http://localhost:5173，網站與 /api/* 同時啟動
npx vitest run     # 單元測試
npm run lint       # 程式檢查
npm run build      # 輸出 dist/client 與 dist/pangpang_perfume_order
npm run preview    # 本機跑正式版（含安全標頭）
```

修改 `wrangler.jsonc` 或 `.dev.vars` 後要重開 `npm run dev`。

## 環境變數

| 變數 | 類型 | 本機 | 正式環境 |
| --- | --- | --- | --- |
| `VITE_SITE_URL` | 公開（寫進前端） | `.env.local` | Build 變數 |
| `TURNSTILE_HOSTNAMES`、`EMAILJS_SERVICE_ID`、`EMAILJS_PUBLIC_KEY` | 公開 | `wrangler.jsonc`（`.dev.vars` 可覆蓋） | `wrangler.jsonc` |
| `SUPABASE_URL`、`SUPABASE_SECRET_KEY` | **機密** | `.dev.vars` | Worker secret |
| `TURNSTILE_SECRET` | **機密** | `.dev.vars` | Worker secret |
| `EMAILJS_PRIVATE_KEY`、`EMAILJS_CUSTOMER_TEMPLATE_ID`、`EMAILJS_OWNER_TEMPLATE_ID` | **機密** | `.dev.vars` | Worker secret |

- `.dev.vars` 與 `.env.local` 不可 commit；格式為 `名稱=值`
- 本機 `TURNSTILE_HOSTNAMES=localhost`；正式環境只允許正式網址。Turnstile widget 要登記這兩個 hostname，Site Key 寫在 `src/components/form/TurnstileWidget.jsx`
- EmailJS 允許只用 Public Key 寄信，所以 **Template ID 必須保密**，外洩就重建範本換新 ID；後台 Account → Security 要開啟非瀏覽器 API 存取與 Use Private Key

## 資料庫（Supabase）

完整結構在 [`supabase/schema.sql`](supabase/schema.sql)：在新的 Supabase 專案的 SQL Editor 整份執行即可重建，可重複執行。

- `orders` 一張表；`order_number`、`turnstile_token_hash` 為 unique，金額欄位為 not null
- RLS 開啟且沒有任何 policy；Worker（service_role）只有 `INSERT`、`SELECT`、`UPDATE`，訪客沒有權限
- 個資 30 天後由 pg_cron 每天自動清除（台灣 03:00），執行紀錄查 `cron.job_run_details`
- EmailJS 的 Email History 與店家 Gmail 的通知信需每月手動清理
- 在後台修改資料庫後，要同步更新 `schema.sql`

## 部署

push 到 `main` 後由 Cloudflare Workers Builds 自動部署（Build：`npm run build`，Deploy：`npx wrangler deploy`）。

- Build 變數：`VITE_SITE_URL`、`NODE_VERSION=22`
- Worker secret：上表標為機密的 6 個，用 `npx wrangler secret put <名稱>` 設定；後台設定時類型要選 Secret
- 確認上線：`npx wrangler deployments list` 顯示新版本，且首頁 JS 換成新檔名
- 正式環境 log：已開啟 Workers Logs，到 Cloudflare 後台 → Observability 查詢；即時查看用 `npx wrangler tail`

開發過程遇到的問題見 [`docs/bug-log.md`](docs/bug-log.md)。

## 未來規劃

- [ ] 訂單查詢：訂單編號 + Email 查詢內容與狀態
- [ ] 訂單管理頁：登入後篩選、更新訂單狀態
- [ ] 匯款回報與出貨通知

## 授權

本專案僅供作品展示，程式碼不開放重製或商業使用。
