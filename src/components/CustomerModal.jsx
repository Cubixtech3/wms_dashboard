import { useEffect, useMemo, useState } from "react";
import { X, Wallet, FileText, Receipt, Printer, Download, Loader2, Search } from "lucide-react";
import { currency, dateFmt } from "../lib/utils.js";

const CMP = "COOLBIX";
const GUID = "F4369B5E-8E23-4BCF-AC82-76C977991728";
const STMT_API = "https://cubixweberp.com:313/api/Statement";
const OUT_API = "https://cubixweberp.com:313/api/OutstandingStmt";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultFromDate() {
  return "2024-01-01";
}

function trim(v) {
  if (v == null) return "";
  return String(v).trim();
}

export default function CustomerModal({ data, onClose }) {
  const { customer } = data;
  const [tab, setTab] = useState(data.tab);
  const [visible, setVisible] = useState(false);
  const [dateFrom, setDateFrom] = useState(defaultFromDate());
  const [dateTo, setDateTo] = useState(todayISO());
  const [statement, setStatement] = useState([]);
  const [outstanding, setOutstanding] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableSearch, setTableSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!customer?.code) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (tab === "statement") {
      setOutstanding([]);
      setTableSearch("");
      const url = `${STMT_API}/${CMP}/STMT_ACC1/${customer.code}/-/${dateFrom}/${dateTo}`;
      fetch(url)
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then((raw) => {
          if (cancelled) return;
          let running = 0;
          setStatement(
            (Array.isArray(raw) ? raw : []).map((r) => {
              running += (Number(r.DEBIT) || 0) - (Number(r.CREDIT) || 0);
              return {
                date: r.DATE,
                type: trim(r.TYPE),
                ref: trim(r.REF),
                description: trim(r.DESCRIPTION),
                debit: Number(r.DEBIT) || 0,
                credit: Number(r.CREDIT) || 0,
                running,
                chqno: trim(r.CHQNO),
                jobcode: trim(r.JOBCODE),
                vrno: trim(r.VRNO),
                lpo: trim(r.LPO),
              };
            })
          );
        })
        .catch((err) => { if (!cancelled) setError(err.message); })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else {
      setStatement([]);
      setTableSearch("");
      const url = `${OUT_API}/${CMP}/OUT_ACC1/${customer.code}/-/${dateFrom}/${dateTo}/-`;
      fetch(url)
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then((raw) => {
          if (cancelled) return;
          setOutstanding(
            (Array.isArray(raw) ? raw : []).map((r) => ({
              date: r.INVDATE,
              inv: trim(r.INV),
              lpo: trim(r.LPO),
              description: trim(r.DESCRIPTION),
              total: Number(r.DEBIT) || 0,
              paid: Number(r.CREDIT) || 0,
              balance: Number(r.BALANCE) || 0,
              salesperson: trim(r.SALESPERSON),
            }))
          );
        })
        .catch((err) => { if (!cancelled) setError(err.message); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }

    return () => { cancelled = true; };
  }, [customer?.code, tab, dateFrom, dateTo]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const totalOutstanding = outstanding.reduce((s, o) => s + (o.balance || 0), 0);
  const displayBalance = totalOutstanding || customer.balance || 0;

  const filteredStatement = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return statement;
    return statement.filter((s) =>
      (s.ref && s.ref.toLowerCase().includes(q)) ||
      (s.vrno && s.vrno.toLowerCase().includes(q)) ||
      (s.type && s.type.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      String(s.debit).includes(q) ||
      String(s.credit).includes(q) ||
      String(s.running).includes(q)
    );
  }, [statement, tableSearch]);

  const filteredOutstanding = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return outstanding;
    return outstanding.filter((o) =>
      (o.inv && o.inv.toLowerCase().includes(q)) ||
      (o.lpo && o.lpo.toLowerCase().includes(q)) ||
      String(o.total).includes(q) ||
      String(o.paid).includes(q) ||
      String(o.balance).includes(q)
    );
  }, [outstanding, tableSearch]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm md:items-center">
      <div
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl transition-all duration-300 md:max-w-2xl md:rounded-2xl ${
          visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 md:translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
          <div>
            <p className="text-base font-semibold text-slate-900">{customer.name}</p>
            <p className="text-xs text-slate-500">
              {customer.code} &middot; {customer.city}
            </p>
            {customer.phone && (
              <p className="mt-0.5 text-xs text-slate-500">{customer.phone}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-900 px-4 py-3 text-white">
            <p className="text-xs text-slate-300">Balance</p>
            <p className="text-xl font-semibold tabular-nums">{currency(displayBalance)}</p>
          </div>
          <div className="rounded-xl bg-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">Credit Limit</p>
            <p className="text-xl font-semibold tabular-nums text-slate-900">{currency(customer.Credit_Limit || 0)}</p>
          </div>
        </div>

        {/* Date range picker */}
        <div className="mx-4 mt-4 flex items-center gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mx-4 mt-3 flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setTab("statement")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition ${
              tab === "statement" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> Account Statement
          </button>
          <button
            onClick={() => setTab("outstanding")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition ${
              tab === "outstanding" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            <Receipt className="h-3.5 w-3.5" /> Outstanding Invoices
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          {!loading && !error && tab === "statement" && (
            statement.length > 0 ? (
              <>
                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search by ref, type, description, or amount"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <StatementTable rows={filteredStatement} />
              </>
            ) : (
              <EmptyState message="No statement data found for this date range." />
            )
          )}
          {!loading && !error && tab === "outstanding" && (
            outstanding.length > 0 ? (
              <>
                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search by invoice, LPO, or amount"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <OutstandingTable rows={filteredOutstanding} />
              </>
            ) : (
              <EmptyState message="No outstanding invoices found for this date range." />
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-3">
          <button className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button onClick={handleClose} className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Wallet className="mb-3 h-8 w-8 text-slate-300" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

function StatementTable({ rows }) {
  return (
    <div className="overflow-hidden overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[500px] border-collapse text-sm">
        <thead className="bg-slate-50">
          <tr>
            <Th align="left">Date</Th>
            <Th align="left">Ref</Th>
            <Th align="left">Type</Th>
            <Th align="left">Description</Th>
            <Th align="right">Debit</Th>
            <Th align="right">Credit</Th>
            <Th align="right">Balance</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((s, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-3 py-2 text-slate-600">{dateFmt(s.date)}</td>
              <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-700">{s.ref || s.vrno || "-"}</td>
              <td className="whitespace-nowrap px-3 py-2">
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700">
                  {s.type}
                </span>
              </td>
              <td className="max-w-[160px] truncate px-3 py-2 text-slate-600" title={s.description}>
                {s.description || "-"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-700">
                {s.debit ? currency(s.debit) : "-"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-700">
                {s.credit ? currency(s.credit) : "-"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums text-slate-900">
                {currency(s.running)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OutstandingTable({ rows }) {
  return (
    <div className="overflow-hidden overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[460px] border-collapse text-sm">
        <thead className="bg-slate-50">
          <tr>
            <Th align="left">Invoice</Th>
            <Th align="left">Date</Th>
            <Th align="left">LPO</Th>
            <Th align="right">Total</Th>
            <Th align="right">Paid</Th>
            <Th align="right">Balance</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((o, i) => {
            const overdue = o.date && new Date(o.date) < new Date() && o.balance > 0;
            return (
              <tr key={i} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-700">{o.inv}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-600">{dateFmt(o.date)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-500">{o.lpo || "-"}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-700">{currency(o.total)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-700">{currency(o.paid)}</td>
                <td
                  className={`whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums ${
                    overdue ? "text-rose-600" : "text-slate-900"
                  }`}
                >
                  {currency(o.balance)}
                  {overdue && <span className="ml-1 text-[10px] font-normal text-rose-500">overdue</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align }) {
  return (
    <th
      className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
