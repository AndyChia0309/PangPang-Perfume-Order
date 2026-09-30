# Bug 紀錄

開發和上線時踩到的錯誤，記下發生什麼事、為什麼、怎麼修。新的寫在最上面。

架構和資安的檢查放在 [`improvements.md`](improvements.md)，之後要做的功能放在 [`roadmap.md`](roadmap.md)。

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
| B16 | 寄信失敗，顧客和店家都沒收到信 | 串接 | ✅ 已修正 | `df32925` |

## 已修正

### B16 寄信失敗，顧客和店家都沒收到信

本機下單成功、資料庫也有訂單，但我跟店家的信箱都沒收到信。

查了之後發現有兩個問題：

1. EmailJS 預設只收瀏覽器送來的請求，Worker 呼叫會拿到 `403 API access from non-browser environments is currently disabled`。
2. EmailJS 本身也在 Cloudflare 後面，沒帶 `User-Agent` 會被當成機器人擋掉（`error code: 1010`）。

因為寄信有包 `try/catch`，訂單還是會成功，所以一開始沒發現信根本沒寄出去。

**解法：** EmailJS 後台 **Account → Security** 打開非瀏覽器存取，`worker/email.js` 補上 `User-Agent: pangpang-order-worker/1.0`。（`df32925`）

### B15 同一個 Turnstile token 可以重複通過驗證

照官方文件，token 只能驗證一次，第二次應該回 `timeout-or-duplicate`。但我拿同一個 token 打 siteverify 兩次，兩次都是 `success: true`，本機和正式網址都一樣，原因不明。

Worker 完全相信 siteverify 的結果，所以同一個 token 重送就能再建一筆訂單。

**解法：** 不靠 siteverify 擋重複，自己補一道。`orders` 加一個 `turnstile_token_hash` 欄位（text、unique），Worker 把 token 做 SHA-256 雜湊後跟訂單一起存。重送時資料庫回 409（`23505`），Worker 看到錯誤是 `turnstile_token_hash` 造成的，就回 403。（`3a0dced`）

**驗證：** 拿既有訂單的雜湊再寫一次，資料庫回 `duplicate key value violates unique constraint "orders_turnstile_token_hash_key"`。部署後在正式網站用同一個 token 送兩次：第一次 201，第二次 403。

### B14 在 Cloudflare 後台設定的 secret 沒有生效

在後台加了 `SUPABASE_URL`、`SUPABASE_SECRET_KEY`，但 `wrangler secret list` 還是 `[]`，也沒有產生新版本。

原因是後台加完變數還要按 **Deploy** 才會套用，只按新增或直接關掉都不算。位置也要注意：要放在 **Settings → Variables and Secrets**，不是 Build 底下的 Build Variables。

**解法：** 改用 `wrangler secret bulk` 從 `.dev.vars` 上傳，兩個都設成 Secret 類型（Text 類型下次 `wrangler deploy` 會被 `wrangler.jsonc` 蓋掉）。上傳完用 `wrangler secret list` 確認，push 部署後 secret 也還在。

### B13 新增 Worker 檔案後 build 失敗、本機 API 全部回 500

`npm run build` 出現 `Could not resolve './orders.js' in worker/index.js`。檔名改好之後，本機 `/api/health` 還是回 500。

原因是我把檔案建成 `worker/order.js`，跟 import 的 `./orders.js` 對不上。改好檔名後，dev server 還卡著舊的錯誤，而且 `.dev.vars` 只有啟動時會讀一次。

**解法：** 檔名改成 `orders.js`（跟 `/api/orders` 一致），重開 `npm run dev`。之後只要動到 Worker 的檔案結構、`.dev.vars` 或 `wrangler.jsonc`，都要重開。（`25cf5f7`）

### B12 Worker 用 secret key 讀寫 `orders` 被拒絕

用 secret key 打 Supabase REST API，回 `42501 permission denied for table orders`。

`orders` 用的是自訂的 Data API 權限，當初只開放 anon 新增。secret key 對應的 `service_role` 雖然可以略過 RLS，但資料表的 GRANT 權限還是要有。

**解法：** `grant select, insert, update on table public.orders to service_role;`。故意不給 `delete`，程式用不到。

### B11 Supabase 新增 `order_number` 欄位失敗

新增欄位時出現 `23502: column "order_number" of relation "orders" contains null values`。

我沒勾 Allow Nullable（等於 not null），但表裡已經有舊訂單，新欄位在這些舊資料上只能是 null，所以建不起來。

**解法：** `order_number`、`subtotal`、`shipping_fee`、`total` 先建成可以是 null，等 Worker 上線、舊的測試訂單清掉之後，再用 `alter column ... set not null` 改成必填。

### B10 加入 Cloudflare Vite 外掛後 `npm test` 無法啟動

跑測試出現 `Error: There is already a server associated with the config.`。

Vitest 預設會讀 `vite.config.js`，所以也把 `cloudflare()` 外掛載進來，又想再開一次 Worker 環境。

**解法：** 另外建一個 `vitest.config.js`。Vitest 會優先用它，就不會載入 Cloudflare 外掛；測試位置用 `include` 指定。（`590954b`）

### B9 缺少 Supabase 環境變數時整個網站空白

部署時少了 Supabase 變數，整個網站都出不來，連不需要資料庫的介紹頁也一樣（見 B7）。

問題在 `src/lib/supabaseClient.js` 在檔案最外層檢查變數，沒有就 `throw`。檔案一被 import 就執行，整個 React App 跟著掛掉。

**解法：** 改成 `getSupabase()` 函式，送出訂單時才檢查變數、建立 client（用 `??=` 只建一次）。少了變數的話，錯誤會被 `OrderForm` 的 `try...catch` 接住，只在表單顯示「訂單送出失敗」。（`815deab`）

**驗證：** 用空的 Supabase 變數 build，四個步驟都正常，送出時才出現錯誤訊息，填好的資料也還在。

### B8 從第四步返回再回來，已填的欄位被清空

在訂購表單填好姓名、電話後按「返回」，再回到第四步，文字欄位全部變空白，但數量選擇還在。

`OrderForm.jsx` 用 `{currentStep === 4 && <StepOrder />}` 切換步驟，離開第四步時元件就被卸載。文字欄位是非受控 `<input>`，值只存在 DOM 上，元件一卸載就沒了。數量存在 `OrderForm` 的 state，所以不受影響。

**解法：** 讓 `StepOrder` 一直掛著，不是第四步時用 `hidden` 藏起來。其他步驟維持條件渲染，因為第二步的 YouTube 影片藏起來還是會繼續播。（`8bce6a1`）

### B7 正式網站變成空白頁

重新連接 Cloudflare 的 Git 之後，正式網站打開一片空白。

這次 build 沒拿到 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`。`supabaseClient.js` 一載入就 `throw`，打包工具判斷後面的程式不會執行，就把整個 App 拿掉了（JS 從 454KB 變成 228KB）。那時還有另一個 Worker `pangpang-perfume-preorder` 也連著同一個 repo，變數很可能設到那邊去了。

**解法：** 在 `pangpang-perfume-order` 的 **Settings → Build → Build Variables and Secrets** 補上變數，重新 build，順便刪掉多的 preorder Worker。程式本身太脆弱的問題記在 B9。

### B6 push 到 GitHub 後 Cloudflare 沒有自動 build

push 完等了 7 分鐘以上，正式網站還是舊版，Cloudflare 的 build 紀錄只有我手動觸發的。

GitHub 上的 commit 完全沒有 Cloudflare 的檢查紀錄，代表 push 的通知根本沒送到 Cloudflare（GitHub App 權限或 Git 連線有問題）。

**解法：** 檢查 GitHub App「Cloudflare Workers and Pages」的 repository 存取權限，在 Cloudflare 重新連接 Git。之後 push 大約 2 分鐘就會自動部署。

### B5 分享預覽網址顯示 `%VITE_SITE_URL%`

正式網站的 `og:url`、`og:image` 還是 `%VITE_SITE_URL%`，分享到 LINE、IG 都沒有預覽圖。

`VITE_` 開頭的變數是 build 的時候才寫進網頁。Cloudflare Workers 的變數分成「build 用」和「執行時用」兩區，我沒有放在 build 那一區，或是設完沒有重新 build。

**解法：** 把 `VITE_SITE_URL` 設在 **Settings → Build → Build Variables and Secrets**，再重新 build。

### B4 選「其他」數量後輸入框被擠到下一行

視窗寬度大約 703px 時，選了「其他」之後，數量輸入框會掉到下一行。

表單變成兩欄後，右欄大約 320px。數字按鈕固定 50px 加上輸入框 88px，加起來超過欄寬。

**解法：** 5 個選項改成等寬、可以一起縮小的格子（最寬 64px），「其他」直接在原位變成輸入框。

### B3 輸入框與按鈕字級不會隨螢幕放大

大螢幕時內文會放大到 20px，但輸入框和按鈕的字還是 16px。

`index.css` 裡的 `button, input, select { font: inherit; }` 沒有放進 layer，優先權比 Tailwind 的 utility class 高，把 `text-body` 蓋掉了。

**解法：** 把這條重設移到 `@layer base`。後來又整理過一次，只留下 Tailwind preflight 沒處理到的部分。

### B2 窄螢幕時 Colleen 角色圖消失

手機寬度下，第三步的 Colleen 圖片整個不見。

圖片用 `absolute` 定位，外層容器靠 grid 的列高撐開。窄螢幕變成單欄時，容器沒有自己的高度，就變成 0 了。

**解法：** 不管多寬都維持左右兩欄，窄螢幕時縮小圖片那一欄，容器就一定有高度。

### B1 點「繼續」進入最後一步時表單被誤送出

在第三步點「繼續」，一進到第四步表單就被送出，或跳出瀏覽器的必填提示。

「繼續」和「送出訂單」其實是同一個按鈕，只是切換 `type`。React 在點擊事件處理完就重新渲染，等瀏覽器接著處理按鈕的預設行為時，它已經變成 `type="submit"`，所以就送出了。

**解法：** 給兩個按鈕不同的 `key`，讓 React 建成兩個獨立的元素。

## 待處理

目前沒有。
