import { PRODUCTS, SHIPPING_FEE } from "./pricing";

export const productContent = {
  title: "白日慵懶香水訂購",
  promotion: "\\ 早鳥優惠訂購中 /",
  prices: [
    `${PRODUCTS.small.name} $${PRODUCTS.small.price} (定價 $${PRODUCTS.small.listPrice})`,
    `${PRODUCTS.large.name} $${PRODUCTS.large.price} (定價 $${PRODUCTS.large.listPrice})`,
  ],
  notes: [
    {
      name: "前調・甦醒",
      description: "清晨微涼的空氣裡，帶著一點懶散與清新",
      ingredients: "西瓜 / 薄荷 / 紅醋栗",
    },
    {
      name: "中調・綻放",
      description: "睡意漸漸褪去，優雅與從容浮現",
      ingredients: "玫瑰 / 月季 / 伯爵茶",
    },
    {
      name: "後調・沉澱",
      description: "溫潤沉穩的尾韻，留下這場夢遊最後的餘溫",
      ingredients: "雪松 / 沉香 / 岩蘭草",
    },
  ],
};

export const orderNotice = [
  { label: "付款方式", text: "匯款" },
  {
    label: "寄送方式",
    text: `超商自取（運費 $${SHIPPING_FEE}）/ 其他方式請透過 IG 聯繫`,
  },
];
