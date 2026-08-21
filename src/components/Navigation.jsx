import { Package, Users } from "lucide-react";

const NAV_ITEMS = [
  { key: "stock", label: "Stock List", shortLabel: "Stock", icon: Package },
  { key: "customers", label: "Customer List", shortLabel: "Customers", icon: Users },
];

export function TopHeader({ active, setActive, dept, setDept, deptOptions }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
            E
          </div>
          <span className="text-sm font-semibold text-slate-900">WMS DASHBOARD</span>
        </div>

        <nav className="hidden gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {deptOptions.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
          <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 md:flex">
            MA
          </div>
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ active, setActive }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5"
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
              <span className={`text-[11px] font-medium ${isActive ? "text-indigo-600" : "text-slate-400"}`}>
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
