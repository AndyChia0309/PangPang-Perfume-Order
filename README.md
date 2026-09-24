# 白日慵懶香水訂購網站

這是畢業製作「香水夢遊 Parfum Tournée」訂購網站的重新改寫版本。原版使用純 HTML/CSS/JS 開發，資料透過 Google Sheet 串接；此版本改用 React + Vite 重構前端架構，並將資料庫遷移至 Supabase。

使用者會依序經過四個步驟認識品牌與香水，最後填寫訂購資料、選擇香水數量與領取方式，並將訂單送出到資料庫。

**線上展示：** https://pangpang-perfume-order.ykk910309.workers.dev/

> 本網站目前為作品集展示使用，沒有正式的交易。

## 功能特色

- 分步驟訂購流程，底部固定導覽列附進度條
  1. 品牌介紹
  2. 品牌影片
  3. 香味介紹（前中後調、商品圖）
  4. 訂購表單
- 訂購表單：姓名、電話、Email、IG 帳號、取貨門市地址
- 香水數量選擇（小瓶／大瓶，含自訂數量）
- 領取方式選擇，並附付款與寄送說明
- 訂單送出成功提示
- RWD：手機到大螢幕皆可瀏覽，大螢幕時內容寬度與字級會跟著放大

## 使用技術

- React 19
- Vite
- Tailwind CSS v4
- lucide-react（icon）
- Supabase
- Oxlint

## 專案結構

```text
src/
├── components/
│   ├── steps/          # 四個步驟頁與共用的 StepHeader
│   ├── OrderForm.jsx   # 步驟切換與訂單送出
│   ├── WizardFooter.jsx
│   └── ...             # 表單欄位、商品資訊等元件
├── data/               # 品牌故事、商品文案、圖片等內容資料
├── services/           # 訂單送出（Supabase）
├── utils/              # 表單欄位名稱與資料整理
├── lib/                # Supabase client
└── index.css           # 全站設計系統
```

## 修改內容與樣式

- **文字內容**：品牌故事在 `src/data/brandStory.js`，商品文案、付款與寄送說明在 `src/data/productContent.js`，圖片在 `src/data/productMedia.js`。
- **顏色、字級、字型**：統一在 `src/index.css` 的 `@theme` 設定。大螢幕的字級與內容寬度在同一個檔案的 `@variant` 區塊調整。
- **共用樣式**：輸入框用 `field`、欄位名稱用 `field-label`、按鈕用 `btn` 搭配 `btn-primary` 或 `btn-outline`，都定義在 `src/index.css`。

## 本機開發

```bash
npm install
npm run dev
```

## 環境變數設定

請建立 `.env.local`，並參考 `.env.example` 填入 Supabase 設定：

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

## 建置與預覽

```bash
npm run build
npm run preview
```

## 程式檢查

```bash
npm run lint
```

## 未來規劃

- [ ] 使用者填寫寄件地址
- [ ] 付款方式選擇

## 授權

本專案僅供作品展示，程式碼不開放重製或商業使用。
