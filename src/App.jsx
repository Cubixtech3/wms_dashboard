import { useState } from "react";
import { TopHeader, BottomNav } from "./components/Navigation.jsx";
import StockList from "./components/StockList.jsx";
import CustomerList from "./components/CustomerList.jsx";

export default function App() {
  const [active, setActive] = useState("stock");

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <TopHeader active={active} setActive={setActive} />
      {active === "stock" ? <StockList /> : <CustomerList />}
      <BottomNav active={active} setActive={setActive} />
    </div>
  );
}
