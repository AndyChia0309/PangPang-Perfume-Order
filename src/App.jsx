import { useState } from "react";
import OrderSuccessModal from "./components/OrderSuccessModal";
import PreorderForm from "./components/PreorderForm";
import { productMedia } from "./data/productMedia";
import "./App.css";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main>
      <div className="hero-image">
        <img src={productMedia.hero.src} alt={productMedia.hero.alt} />
      </div>

      <section className="preorder-section">
        <div className="preorder-container">
          <div className="preorder-content">
            <PreorderForm
              characterImage={productMedia.character.src}
              characterImageAlt={productMedia.character.alt}
              galleryImages={productMedia.galleryImages}
              onSuccess={() => setIsModalOpen(true)}
            />
          </div>
        </div>
      </section>

      {isModalOpen && (
        <OrderSuccessModal onClose={() => setIsModalOpen(false)} />
      )}
    </main>
  );
}

export default App;
