import characterImage from "../assets/images/colleen.webp";
import headerImage from "../assets/images/header.webp";
import galleryImage1 from "../assets/images/product-1.webp";
import galleryImage2 from "../assets/images/product-2.webp";

export const productMedia = {
  hero: {
    src: headerImage,
    alt: "白日慵懶香水訂購主視覺",
    width: 2000,
    height: 620,
  },
  character: {
    src: characterImage,
    alt: "白日慵懶香水商品照",
  },
  galleryImages: [
    { src: galleryImage1, alt: "香水商品展示 1", width: 1200, height: 900 },
    { src: galleryImage2, alt: "香水商品展示 2", width: 1200, height: 900 },
  ],
};
