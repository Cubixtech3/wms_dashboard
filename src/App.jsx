import { useState } from "react";
import { TopHeader, BottomNav } from "./components/Navigation.jsx";
import StockList from "./components/StockList.jsx";
import CustomerList from "./components/CustomerList.jsx";
import { useDepartment } from "./lib/useDepartment.js";

export default function App() {
  const [active, setActive] = useState("stock");
  const { dept, setDept, options } = useDepartment();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <TopHeader active={active} setActive={setActive} dept={dept} setDept={setDept} deptOptions={options} />
      {active === "stock" ? <StockList dept={dept} /> : <CustomerList dept={dept} />}
      <BottomNav active={active} setActive={setActive} />
    </div>
  );
}
