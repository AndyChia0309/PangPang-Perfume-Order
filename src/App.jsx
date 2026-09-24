import { useState } from "react";
import OrderForm from "./components/OrderForm";
import OrderSuccessModal from "./components/OrderSuccessModal";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main>
      <OrderForm onSuccess={() => setIsModalOpen(true)} />

      {isModalOpen && (
        <OrderSuccessModal onClose={() => setIsModalOpen(false)} />
      )}
    </main>
  );
}

export default App;
