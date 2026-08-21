import { Search, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

export function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function Pagination({ page, totalPages, setPage, count }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-500">
        Page <span className="font-medium text-slate-700">{page}</span> of{" "}
        <span className="font-medium text-slate-700">{totalPages}</span>
        <span className="hidden sm:inline"> &middot; {count} results</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 disabled:hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 disabled:hover:bg-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function SortHeader({ label, sortKey, sortConfig, onSort, align = "left" }) {
  const active = sortConfig.key === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`cursor-pointer select-none whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <span className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""}`}>
        {label}
        {active ? (
          sortConfig.dir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpDown className="h-3 w-3 text-slate-300" />
        )}
      </span>
    </th>
  );
}
