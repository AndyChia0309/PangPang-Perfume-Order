# 維護手冊

網站上線之後要定期做的事、改東西的流程，還有出問題時先查哪裡。

## 例行檢查

| 頻率 | 要做的事 | 在哪裡 |
| --- | --- | --- |
| 每週 | 對帳：資料庫的新訂單數量跟店家 Gmail 的「新訂單通知」對得起來 | Supabase → Table Editor → `orders`；店家 Gmail |
| 每週 | 看有沒有錯誤 log（`Supabase 寫入失敗`、`寄信失敗`、`Turnstile 驗證失敗`） | Cloudflare → Workers → `pangpang-perfume-order` → Observability |
| 每週 | Supabase 專案有沒有被暫停（免費方案閒置大約一週會暫停，暫停時下單會失敗） | Supabase 後台首頁；收到暫停通知信就按 Restore |
| 每月 | 清個資的排程有沒有正常跑（見下方 SQL） | Supabase → SQL Editor |
| 每月 | 清掉 EmailJS 的 Email History 和店家 Gmail 的通知信（裡面有個資） | EmailJS → Email History；店家 Gmail |
| 每月 | 看 EmailJS 這個月寄了幾封（免費方案大約 200 封，一筆訂單 2 封） | EmailJS → Dashboard |
| 每季 | 更新套件（見「更新套件」） | 本機 |
| 每季 | 確認每個帳號的兩步驟驗證都還開著：Cloudflare、GitHub、兩個 Gmail、EmailJS | 各服務的安全性設定 |

查排程紀錄：

```sql
select status, return_message, start_time
from cron.job_run_details
order by start_time desc
limit 5;
```

`status` 都是 `succeeded` 就正常。

## 修改流程

每次改東西都照這個順序：

```bash
npm run dev        # 本機改完先自己測
npx vitest run     # 22 個測試全過
npm run lint       # 沒有錯誤
npm run build      # 可以正常打包
git add ... && git commit -m "..."
git push           # 自動部署
```

push 完要確認真的上線：`npx wrangler deployments list` 最上面是新版本、100%，而且首頁的 JS 換成新檔名。在這之前不要急著測試會寫入資料的功能，可能會打到舊版。

### 常見修改要改哪裡

| 要改的東西 | 位置 | 注意事項 |
| --- | --- | --- |
| 價格、運費 | `shared/pricing.js` | 前後端一起生效；改完記得更新 `shared/*.test.js` 的預期金額 |
| 收件方式、數量和字數上限 | `shared/orderForm.js` | 新增欄位的話資料庫也要加，並同步 `supabase/schema.sql` |
| 文案、圖片 | `src/data/` | 圖片要設定 `width`、`height` |
| 信件內容、匯款資訊 | EmailJS 後台範本 | 不用部署；**直接改內容就好，不要重建範本**，重建會換 Template ID，`.dev.vars` 和 Worker secret 都要跟著改 |
| 個資保存天數 | `supabase/schema.sql` 的 `interval '30 days'` | 前端 `RecipientFields.jsx` 的隱私權文字也要一起改 |
| 新增外部資源（字型、影片、API） | `public/_headers` 的 CSP | 只放行用得到的網域；`script-src` 不要加 `unsafe-eval`、`unsafe-inline` |
| 網址（例如買了網域） | `wrangler.jsonc` 的 `TURNSTILE_HOSTNAMES`、Build 變數 `VITE_SITE_URL`、Turnstile 後台的 hostname | 三個地方都要改，不然人機驗證會失敗 |

### 修改資料庫

1. 先在 Supabase 的 SQL Editor 執行。
2. 同樣的修改寫進 `supabase/schema.sql`，整份要能重複執行。
3. 新增 not null 欄位時，先建成可以是 null，舊資料補完再改 not null（B11 踩過）。
4. 不給 `anon`、`authenticated` 任何權限，也不建 RLS policy；Worker 一樣不給 `DELETE`。

刪測試訂單要自己在 SQL Editor 跑（Worker 沒有刪除權限）：

```sql
delete from public.orders where order_number = 'PP260930-XXXXX';
```

## 更新套件

```bash
npm outdated                 # 看有哪些可以更新
npm update                   # 只更新同一個大版本內的小版本
npx vitest run && npm run lint && npm run build
npm run dev                  # 手動走一次下單流程
```

- 大版本更新（例如 Vite 8 → 9、React 19 → 20）先看官方的升級說明，一次只升一個。
- `wrangler.jsonc` 的 `compatibility_date` 不用追最新。要升的話先看 Cloudflare 的 compatibility flags 說明，本機測過再 push。
- `npm audit` 出現高風險就先處理。

## 部署出問題：回到上一版

```bash
npx wrangler deployments list    # 找到上一個正常的版本
npx wrangler rollback            # 回到上一版（也可以在後台 Deployments 按 Rollback）
```

回滾只會換掉 Worker 和網頁，資料庫和 secret 不受影響。程式修好之後再照常 push。

## 出問題時怎麼查

| 症狀 | 先檢查 |
| --- | --- |
| 下單顯示「訂單送出失敗，請稍後再試」 | Observability 的 log → Supabase 專案是不是被暫停了 → `SUPABASE_URL`、`SUPABASE_SECRET_KEY` 這兩個 secret 還在不在（`npx wrangler secret list`） |
| 一直顯示人機驗證失敗 | `TURNSTILE_HOSTNAMES` 跟實際網址一不一樣 → Turnstile 後台的 hostname → `TURNSTILE_SECRET` |
| 顯示「送出太頻繁」 | 同一個 IP 1 分鐘內超過 5 次，等 1 分鐘就好；如果常發生再調 `wrangler.jsonc` 的 `ratelimits` |
| 有訂單但沒收到信 | EmailJS 這個月的額度 → Email History 的錯誤訊息 → Gmail 連結是不是失效了（重新連結）→ 三個 EmailJS secret |
| 本機正常、正式環境不正常 | 新版本到底有沒有上線（`deployments list`）→ Worker secret 跟 `.dev.vars` 有沒有一致 |
| 本機 `/api/*` 找不到或 `fetch failed` | 改過 `wrangler.jsonc` 或 `.dev.vars` 就要重開 `npm run dev` |
| Console 出現 `flexible?lang=auto` 的警告 | 那是 Turnstile iframe 自己的訊息，不用管 |

以前踩過的錯誤在 [`bug-log.md`](bug-log.md)，遇到新的，解決後也記在那裡。

## 金鑰外洩或需要更換

| 金鑰 | 更換方式 |
| --- | --- |
| Supabase secret key | Supabase → Project Settings → API Keys 建立新的 → `npx wrangler secret put SUPABASE_SECRET_KEY` → 更新 `.dev.vars` → 確認下單正常後刪除舊 key |
| Turnstile secret | Turnstile 後台 Rotate secret → `npx wrangler secret put TURNSTILE_SECRET` → 更新 `.dev.vars` |
| EmailJS private key | EmailJS → Account → API keys 重新產生 → `npx wrangler secret put EMAILJS_PRIVATE_KEY` → 更新 `.dev.vars` |
| EmailJS Template ID | 重建範本換新 ID → 更新兩個 secret 與 `.dev.vars` → 刪除舊範本（S1） |

- 機密只放 `.dev.vars` 和 Worker secret，不寫進程式碼和 `wrangler.jsonc`，也不要貼到任何地方或出現在截圖裡。
- 在後台設定 Worker 變數時要選 Secret，選 Text 的話下次部署就會被清掉（B14）。

## 文件分工

| 文件 | 內容 |
| --- | --- |
| `README.md` | 專案介紹、架構、本機開發、環境變數 |
| `docs/maintenance.md` | 這份：例行檢查和維護流程 |
| `docs/bug-log.md` | 踩過的錯誤和解法 |
| `docs/improvements.md` | 架構和資安檢查的結果 |
| `docs/roadmap.md` | 未來要做的功能 |
| `supabase/schema.sql` | 資料庫實際的結構，後台改過就要同步 |
