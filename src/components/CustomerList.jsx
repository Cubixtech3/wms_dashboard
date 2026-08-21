import { useEffect, useMemo, useState } from "react";
import { Users, Wallet, Loader2 } from "lucide-react";
import { currency, useDebounce, usePagination } from "../lib/utils.js";
import { SearchBox, Pagination } from "./Shared.jsx";
import CustomerModal from "./CustomerModal.jsx";

const API_BASE = "https://cubixweberp.com:313/api/Search_Customer/COOLBIX";

function trim(v) {
  if (v == null) return "";
  return String(v).trim();
}

function extractCity(address2) {
  const raw = trim(address2);
  if (!raw) return "";
  const parts = raw.split(",");
  return parts[0].trim() || raw;
}

function mapCustomer(c) {
  return {
    code: trim(c.account),
    name: trim(c.Custname),
    phone: trim(c.phone),
    city: extractCity(c.address2),
    balance: Number(c.Avai_Bal) || 0,
    openbal: Number(c.openbal) || 0,
    debit: Number(c.debit) || 0,
    credit: Number(c.credit) || 0,
    address1: trim(c.address1),
    address2: trim(c.address2),
    address3: trim(c.address3),
    sale_man: trim(c.sale_man),
    Credit_Limit: Number(c.Credit_Limit) || 0,
    duedays: Number(c.duedays) || 0,
    curduedays: Number(c.curduedays) || 0,
    pdc: Number(c.pdc) || 0,
    trn: trim(c.trn),
    statement: [],
    outstanding: [],
  };
}

export default function CustomerList() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query);
  const [modal, setModal] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const q = debounced.trim();
    const url = q
      ? `${API_BASE}/Cust/${encodeURIComponent(q)}/HO`
      : `${API_BASE}/Cust50/-/HO`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setCustomers(Array.isArray(data) ? data.map(mapCustomer) : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [debounced]);

  const { page, setPage, totalPages, slice } = usePagination(customers, 8);

  const totalCustomers = customers.length;
  const totalOutstanding = customers.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-5 md:pb-8">
      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Users className="h-3.5 w-3.5" /> Total Customers
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{totalCustomers}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Wallet className="h-3.5 w-3.5" /> Total Outstanding (AR)
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-rose-600">{currency(totalOutstanding)}</p>
        </div>
      </div>

      {/* Header bar */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3">
        <SearchBox value={query} onChange={setQuery} placeholder="Search by name, code, or phone number" />
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading customers...
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load customers: {error}
        </div>
      )}

      {/* Desktop table */}
      {!loading && !error && (
        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Code
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Name
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    City
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Balance
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slice.map((c) => (
                  <tr key={c.code} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-700">{c.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{c.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{c.phone}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{c.city}</td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right text-sm font-semibold tabular-nums ${
                        c.balance > 0 ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {currency(c.balance)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setModal({ customer: c, tab: "statement" })}
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Statement
                        </button>
                        <button
                          onClick={() => setModal({ customer: c, tab: "outstanding" })}
                          className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                          Outstanding
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {slice.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                      No customers match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} count={customers.length} />
        </div>
      )}

      {/* Mobile cards */}
      {!loading && !error && (
        <div className="space-y-3 md:hidden">
          {slice.map((c) => (
            <div key={c.code} className="rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {c.code} &middot; {c.city}
                </p>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-400">Current Balance</p>
                <p className={`text-lg font-semibold tabular-nums ${c.balance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {currency(c.balance)}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setModal({ customer: c, tab: "statement" })}
                  className="rounded-md border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Statement
                </button>
                <button
                  onClick={() => setModal({ customer: c, tab: "outstanding" })}
                  className="rounded-md bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  Outstanding
                </button>
              </div>
            </div>
          ))}
          {slice.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
              No customers match your search.
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-white">
            <Pagination page={page} totalPages={totalPages} setPage={setPage} count={customers.length} />
          </div>
        </div>
      )}

      {modal && <CustomerModal data={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
