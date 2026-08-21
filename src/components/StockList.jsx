import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  History,
  X,
} from "lucide-react";
import { currency, useDebounce, usePagination } from "../lib/utils.js";
import { SearchBox, Pagination, SortHeader } from "./Shared.jsx";

const API_BASE = "https://cubixweberp.com:313/api/Search_Items/InventoryList";
const API_PARAMS = {
  cmpcode: "COOLBIX",
  guid: "F4369B5E-8E23-4BCF-AC82-76C977991728",
  mod: "All_Top1000",
  Loc: "A",
};

const HISTORY_API = "https://cubixweberp.com:313/api/ItemTransactionHistory";
const OPMOD_OPTIONS = [
  { key: "SALES", label: "Sales" },
  { key: "ALL TRASACTIONS", label: "All Transactions" },
  { key: "SORDER", label: "Sales Order" },
];

const TYPE_MAP = {
  S: { label: "Sales", color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
  C: {
    label: "Sales Return",
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
  R: { label: "Purchase", color: "#2563EB", bg: "#EFF6FF", border: "#DBEAFE" },
  D: {
    label: "Purchase Return",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  O: {
    label: "Transfer Out",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "#DDD6FE",
  },
  I: {
    label: "Transfer In",
    color: "#06B6D4",
    bg: "#ECFEFF",
    border: "#A5F3FC",
  },
  P: {
    label: "Material Issue",
    color: "#EC4899",
    bg: "#FDF2F8",
    border: "#FBCFE8",
  },
  B: {
    label: "Physical Stock",
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
  },
  OP: {
    label: "Opening Balance",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  LT: {
    label: "Location Transfer",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "#DDD6FE",
  },
};

const STATUS_CONFIG = {
  in: {
    label: "In Stock",
    icon: CheckCircle2,
    classes:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  },
  low: {
    label: "Low Stock",
    icon: AlertTriangle,
    classes: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  },
  out: {
    label: "Out of Stock",
    icon: XCircle,
    classes: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  },
};

const STOCK_PILLS = [
  { key: "all", label: "All Items" },
  { key: "in", label: "In Stock" },
  { key: "low", label: "Low Stock" },
  { key: "out", label: "Out of Stock" },
];

function getStockStatus(item) {
  if (item.Stock === 0) return "out";
  if (item.Stock <= 5) return "low";
  return "in";
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.classes}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function trim(v) {
  if (v == null) return "";
  return String(v).trim();
}

const LOC_LABELS = { A: "A", B: "B", C: "C", D: "D", E: "E" };

function parseStoreNames(storesName) {
  const map = {};
  if (!storesName) return map;
  String(storesName).split(",").forEach((part) => {
    const [code, ...nameParts] = part.trim().split("-");
    if (code && nameParts.length) {
      map[code.trim()] = nameParts.join("-").trim();
    }
  });
  return map;
}

function LocationStock({ item, justify }) {
  const storeMap = parseStoreNames(item["stores_name"]);
  const locs = ["A", "B", "C", "D", "E"].map((l) => ({
    label: l,
    name: storeMap[l] || l,
    value: Number(item[l]) || 0,
  }));
  const hasData = locs.some((l) => l.value > 0);
  if (!hasData) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${justify === "end" ? "justify-end" : ""}`}>
      {locs.map((l) => (
        <span
          key={l.label}
          title={l.name}
          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
            l.value > 0
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-50 text-slate-400"
          }`}
        >
          <span className="font-semibold">{l.label}</span>
          <span className="opacity-70">{l.name}</span>
          <span className="font-bold">{l.value}</span>
        </span>
      ))}
    </div>
  );
}

function StockDetailPanel({ item, onClose }) {
  if (!item) return null;
  const storeMap = parseStoreNames(item["stores_name"]);
  const locs = ["A", "B", "C", "D", "E"].map((l) => ({
    label: l,
    name: storeMap[l] || l,
    value: Number(item[l]) || 0,
  }));
  const hasLocData = locs.some((l) => l.value > 0);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-md rounded-t-2xl md:rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {trim(item.Description)}
            </h3>
            <p className="text-[11px] text-slate-500">{trim(item.Code)}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-3 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] text-slate-400 uppercase">Total Stock</p>
              <p className="text-lg font-bold tabular-nums text-slate-900">{item.Stock}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] text-slate-400 uppercase">Cost</p>
              <p className="text-lg font-bold tabular-nums text-slate-900">{currency(item.Cost)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] text-slate-400 uppercase">Unit</p>
              <p className="text-lg font-bold text-slate-900">{trim(item.Unit) || "-"}</p>
            </div>
          </div>

          {hasLocData && (
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Location Stock</p>
              <div className="grid grid-cols-2 gap-2">
                {locs.map((l) => (
                  <div
                    key={l.label}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                      l.value > 0
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        {l.label} - {l.name}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        l.value > 0 ? "text-emerald-700" : "text-slate-400"
                      }`}
                    >
                      {l.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(trim(item.OEM) || trim(item.Modelno) || trim(item.Group)) && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3">
              {trim(item.OEM) && (
                <span className="text-xs text-slate-500">
                  OEM: <span className="font-medium text-slate-700">{trim(item.OEM)}</span>
                </span>
              )}
              {trim(item.Modelno) && (
                <span className="text-xs text-slate-500">
                  Model: <span className="font-medium text-slate-700">{trim(item.Modelno)}</span>
                </span>
              )}
              {trim(item.Group) && (
                <span className="text-xs text-slate-500">
                  Group: <span className="font-medium text-slate-700">{trim(item.Group)}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }) {
  const t = TYPE_MAP[type] || {
    label: type || "N/A",
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
  };
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{
        color: t.color,
        backgroundColor: t.bg,
        border: `1px solid ${t.border}`,
      }}
    >
      {t.label}
    </span>
  );
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function HistoryModal({ item, onClose, dept }) {
  const [opmod, setOpmod] = useState("ALL TRASACTIONS");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!item) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setHistory([]);
    const params = new URLSearchParams({
      cmpcode: API_PARAMS.cmpcode,
      guid: API_PARAMS.guid,
      Opmod: opmod,
      Code: trim(item.Code),
      Deptno: dept,
      Tr_Yr: "mobile",
    });
    fetch(`${HISTORY_API}?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setHistory(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [item, opmod]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-2xl max-h-[85vh] md:max-h-[80vh] overflow-hidden rounded-t-2xl md:rounded-2xl bg-white shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">
              Item History
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500 truncate">
              {trim(item.Code)} &middot; {trim(item.Description)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Type selector */}
        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-4 py-2.5">
          {OPMOD_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setOpmod(opt.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                opmod === opt.key
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading history...
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Failed to load history: {error}
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">
              No transactions found.
            </p>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="space-y-2.5">
              {history.map((tx, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <TypeBadge type={tx.Type} />
                        {tx.Inv && (
                          <span className="text-[11px] font-medium text-slate-600">
                            #{tx.Inv}
                          </span>
                        )}
                      </div>
                      {tx.Customer && (
                        <p className="mt-1 text-xs text-slate-700 truncate">
                          {trim(tx.Customer)}
                        </p>
                      )}
                      {tx["Itm Description"] && trim(tx["Itm Description"]) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                          {trim(tx["Itm Description"])}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-slate-400">
                        {formatDate(tx.DATE)}
                      </p>
                      <p className="text-xs font-semibold tabular-nums text-slate-800 mt-0.5">
                        {currency(tx.Price)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 border-t border-slate-100 pt-2">
                    <span className="text-[10px] text-slate-500">
                      Qty:{" "}
                      <span className="font-medium text-slate-700">
                        {tx.Qty}
                      </span>
                    </span>
                    {tx.Actqty !== 0 && (
                      <span className="text-[10px] text-slate-500">
                        Act:{" "}
                        <span
                          className={`font-medium ${tx.Actqty < 0 ? "text-rose-600" : "text-emerald-600"}`}
                        >
                          {tx.Actqty}
                        </span>
                      </span>
                    )}
                    {trim(tx.Salesman) && (
                      <span className="text-[10px] text-slate-500">
                        Sman:{" "}
                        <span className="font-medium text-slate-700">
                          {trim(tx.Salesman)}
                        </span>
                      </span>
                    )}
                    {trim(tx.Dept) && (
                      <span className="text-[10px] text-slate-500">
                        Dept:{" "}
                        <span className="font-medium text-slate-700">
                          {trim(tx.Dept)}
                        </span>
                      </span>
                    )}
                    {trim(tx.Locn) && (
                      <span className="text-[10px] text-slate-500">
                        Loc:{" "}
                        <span className="font-medium text-slate-700">
                          {trim(tx.Locn)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StockList({ dept }) {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query);
  const [pill, setPill] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "Code", dir: "asc" });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      ...API_PARAMS,
      searchKey: debounced.trim() || "-",
    });
    fetch(`${API_BASE}?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const onSort = (key) =>
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  const filtered = useMemo(() => {
    let rows = items.filter(
      (i) => pill === "all" || getStockStatus(i) === pill,
    );
    rows.sort((a, b) => {
      let av, bv;
      if (sortConfig.key === "status") {
        const order = { out: 0, low: 1, in: 2 };
        av = order[getStockStatus(a)];
        bv = order[getStockStatus(b)];
      } else if (sortConfig.key === "Stock" || sortConfig.key === "Cost") {
        av = Number(a[sortConfig.key]) || 0;
        bv = Number(b[sortConfig.key]) || 0;
      } else {
        av = trim(a[sortConfig.key]).toLowerCase();
        bv = trim(b[sortConfig.key]).toLowerCase();
      }
      if (typeof av === "string")
        return sortConfig.dir === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      return sortConfig.dir === "asc" ? av - bv : bv - av;
    });
    return rows;
  }, [items, pill, sortConfig]);

  const { page, setPage, totalPages, slice } = usePagination(filtered, 8);

  const totalItems = items.length;
  const totalValue = items.reduce(
    (sum, i) => sum + (Number(i.Cost) || 0) * (Number(i.Stock) || 0),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-5 md:pb-8">
      {/* Summary cards */}
      {/* <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Boxes className="h-3.5 w-3.5" /> Total Items
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{totalItems}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Wallet className="h-3.5 w-3.5" /> Total Stock Value
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{currency(totalValue)}</p>
        </div>
      </div> */}

      {/* Header bar: search + filter pills */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search by item code, name, or category"
        />
        <div className="flex flex-wrap gap-2">
          {STOCK_PILLS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPill(p.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                pill === p.key
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading items...
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load items: {error}
        </div>
      )}

      {/* Desktop table */}
      {!loading && !error && (
        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <SortHeader
                    label="Code"
                    sortKey="Code"
                    sortConfig={sortConfig}
                    onSort={onSort}
                  />
                  <SortHeader
                    label="Description"
                    sortKey="Description"
                    sortConfig={sortConfig}
                    onSort={onSort}
                  />
                  <SortHeader
                    label="Category"
                    sortKey="Category"
                    sortConfig={sortConfig}
                    onSort={onSort}
                  />
                  <SortHeader
                    label="Cost"
                    sortKey="Cost"
                    sortConfig={sortConfig}
                    onSort={onSort}
                    align="right"
                  />
                  <SortHeader
                    label="Stock"
                    sortKey="Stock"
                    sortConfig={sortConfig}
                    onSort={onSort}
                    align="right"
                  />
                  <SortHeader
                    label="Status"
                    sortKey="status"
                    sortConfig={sortConfig}
                    onSort={onSort}
                  />
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slice.map((item) => (
                  <tr key={item.Code} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-700">
                      {trim(item.Code)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {trim(item.Description)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                      {trim(item.Category)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm tabular-nums text-slate-700">
                      {currency(item.Cost)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm tabular-nums text-slate-700">
                      <button
                        onClick={() => setDetailItem(item)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-right font-semibold transition hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        {item.Stock}
                        <Boxes className="h-3 w-3 opacity-40" />
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={getStockStatus(item)} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        onClick={() => setHistoryItem(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                      >
                        <History className="h-3.5 w-3.5" />
                        History
                      </button>
                    </td>
                  </tr>
                ))}
                {slice.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-slate-400"
                    >
                      No items match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            count={filtered.length}
          />
        </div>
      )}

      {/* Mobile cards */}
      {!loading && !error && (
        <div className="space-y-3 md:hidden">
          {slice.map((item) => (
            <div
              key={item.Code}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {trim(item.Description)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {trim(item.Code)}
                  </p>
                </div>
                <StatusBadge status={getStockStatus(item)} />
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                    Stock
                  </p>
                  <p className="text-xs font-semibold tabular-nums text-slate-800">
                    {item.Stock}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                    Cost
                  </p>
                  <p className="text-xs font-semibold tabular-nums text-slate-800">
                    {currency(item.Cost)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                    Unit
                  </p>
                  <p className="text-xs font-semibold text-slate-800">
                    {trim(item.Unit) || "-"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDetailItem(item)}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Boxes className="h-3.5 w-3.5" />
                Stock Details
              </button>

              {(trim(item.OEM) || trim(item.Modelno) || trim(item.Group)) && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 border-t border-slate-100 pt-2">
                  {trim(item.OEM) && (
                    <span className="text-[10px] text-slate-500">
                      OEM:{" "}
                      <span className="font-medium text-slate-700">
                        {trim(item.OEM)}
                      </span>
                    </span>
                  )}
                  {trim(item.Modelno) && (
                    <span className="text-[10px] text-slate-500">
                      Model:{" "}
                      <span className="font-medium text-slate-700">
                        {trim(item.Modelno)}
                      </span>
                    </span>
                  )}
                  {trim(item.Group) && (
                    <span className="text-[10px] text-slate-500">
                      Group:{" "}
                      <span className="font-medium text-slate-700">
                        {trim(item.Group)}
                      </span>
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => setHistoryItem(item)}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
              >
                <History className="h-3.5 w-3.5" />
                Item History
              </button>
            </div>
          ))}
          {slice.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
              No items match your search.
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-white">
            <Pagination
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              count={filtered.length}
            />
          </div>
        </div>
      )}

      {/* History modal */}
      <HistoryModal item={historyItem} onClose={() => setHistoryItem(null)} dept={dept} />
      {/* Stock detail panel */}
      <StockDetailPanel item={detailItem} onClose={() => setDetailItem(null)} />
    </div>
  );
}
