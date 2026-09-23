# 白日慵懶香水預購網站

這是畢業製作預購網站的重新改寫版本。原版使用純 HTML/CSS/JS 開發，資料透過 Google Sheet 串接；此版本改用 React + Vite 重構前端架構，並將資料庫遷移至 Supabase，使用者可以填寫預購資料、選擇香水數量與領取方式，並將訂單送出到資料庫。

## 功能特色

- 預購表單填寫（姓名、電話、Email、IG）
- 香水數量選擇（小瓶/大瓶，含自訂數量）
- 商品圖片輪播
- 領取方式選擇
- 訂單送出成功提示

## 使用技術

- React
- Vite
- Supabase
- Oxlint
- CSS RWD

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

## 建置專案

```bash
npm run build
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