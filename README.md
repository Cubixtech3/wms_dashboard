# Horizon ERP — Stock & Customer Module Prototype

A responsive React (Vite) + Tailwind CSS + Lucide React prototype for two ERP modules migrated from a legacy desktop system: **Stock List** and **Customer List** (with statement/outstanding modal).

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL. To produce a production build:

```bash
npm run build
npm run preview
```

## Structure

```
src/
  data/mockData.js        Mock stock items + customers (with ledgers/invoices)
  lib/utils.js             currency/date formatting, useDebounce, usePagination
  components/
    Shared.jsx             SearchBox, Pagination, SortHeader
    Navigation.jsx          TopHeader (desktop) + BottomNav (mobile, sticky)
    StockList.jsx           Stock module: filters, sortable table, mobile cards
    CustomerList.jsx        Customer module: table/cards, actions
    CustomerModal.jsx        Statement / Outstanding tabbed modal
  App.jsx                   Wires navigation + active module together
```

## Notes

- Desktop (`md:` and up) shows a top nav bar and dense data tables.
- Mobile shows card layouts and a sticky bottom nav (`md:hidden fixed bottom-0`).
- Search inputs are debounced (300ms) with a clear (X) button.
- All monetary values use `Intl.NumberFormat` in AED — swap the locale/currency in `src/lib/utils.js` as needed.
- Overdue outstanding invoices (due date before "today", i.e. 2026-08-21 in the mock data) are highlighted in red.
- Swap `src/data/mockData.js` for a real API call when wiring up the backend.
