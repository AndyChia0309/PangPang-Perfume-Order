import { useState } from "react";
import OrderForm from "./components/OrderForm";
import OrderSuccessModal from "./components/order/OrderSuccessModal";

function App() {
  const [completedOrder, setCompletedOrder] = useState(null);

  return (
    <main>
      <OrderForm onSuccess={setCompletedOrder} />

      {completedOrder && (
        <OrderSuccessModal
          onClose={() => setCompletedOrder(null)}
          order={completedOrder}
        />
      )}
    </main>
  );
}

export default App;
