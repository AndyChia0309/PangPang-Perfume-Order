import characterImage from "../assets/images/colleen.png";
import headerImage from "../assets/images/header.png";
import galleryImage1 from "../assets/images/product-1.jpg";
import galleryImage2 from "../assets/images/product-2.jpg";

export const productMedia = {
  hero: {
    src: headerImage,
    alt: "白日慵懶香水預購主視覺",
  },
  character: {
    src: characterImage,
    alt: "白日慵懶香水商品照",
  },
  galleryImages: [
    { src: galleryImage1, alt: "香水商品展示 1", width: 4032, height: 3024 },
    { src: galleryImage2, alt: "香水商品展示 2", width: 3145, height: 2359 },
  ],
};
