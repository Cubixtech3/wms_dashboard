export const TODAY = new Date("2026-08-21");

export const STOCK_ITEMS = [
  { code: "ITM-1001", name: "Wireless Mouse M185", category: "Electronics", price: 45.0, qty: 128, reorder: 30 },
  { code: "ITM-1002", name: "USB-C Docking Station", category: "Electronics", price: 320.0, qty: 12, reorder: 15 },
  { code: "ITM-1003", name: "24-inch LED Monitor", category: "Electronics", price: 640.0, qty: 0, reorder: 10 },
  { code: "ITM-1004", name: "Mechanical Keyboard", category: "Electronics", price: 210.0, qty: 54, reorder: 20 },
  { code: "ITM-1005", name: "A4 Copier Paper (Ream)", category: "Stationery", price: 18.5, qty: 340, reorder: 100 },
  { code: "ITM-1006", name: "Ballpoint Pen (Box of 12)", category: "Stationery", price: 9.75, qty: 22, reorder: 25 },
  { code: "ITM-1007", name: "Sticky Notes 3x3", category: "Stationery", price: 4.2, qty: 210, reorder: 50 },
  { code: "ITM-1008", name: "Whiteboard Marker Set", category: "Stationery", price: 12.0, qty: 0, reorder: 20 },
  { code: "ITM-1009", name: "Executive Office Chair", category: "Furniture", price: 890.0, qty: 8, reorder: 5 },
  { code: "ITM-1010", name: "L-Shape Office Desk", category: "Furniture", price: 1250.0, qty: 4, reorder: 5 },
  { code: "ITM-1011", name: "4-Drawer Filing Cabinet", category: "Furniture", price: 560.0, qty: 15, reorder: 6 },
  { code: "ITM-1012", name: "Visitor Chair (Fabric)", category: "Furniture", price: 310.0, qty: 3, reorder: 8 },
  { code: "ITM-1013", name: "Cordless Drill 18V", category: "Hardware", price: 275.0, qty: 19, reorder: 10 },
  { code: "ITM-1014", name: "Hex Key Set (22pcs)", category: "Hardware", price: 38.0, qty: 46, reorder: 15 },
  { code: "ITM-1015", name: "Cable Ties (Pack of 100)", category: "Hardware", price: 6.5, qty: 5, reorder: 20 },
  { code: "ITM-1016", name: "Safety Gloves (Pair)", category: "Hardware", price: 14.0, qty: 88, reorder: 30 },
  { code: "ITM-1017", name: "Corrugated Box - Medium", category: "Packaging", price: 3.2, qty: 620, reorder: 150 },
  { code: "ITM-1018", name: "Bubble Wrap Roll 50m", category: "Packaging", price: 22.0, qty: 9, reorder: 12 },
  { code: "ITM-1019", name: "Packing Tape (6-Pack)", category: "Packaging", price: 15.4, qty: 0, reorder: 25 },
  { code: "ITM-1020", name: "Shrink Wrap Film", category: "Packaging", price: 27.9, qty: 33, reorder: 15 },
  { code: "ITM-1021", name: "27-inch Curved Monitor", category: "Electronics", price: 980.0, qty: 6, reorder: 8 },
  { code: "ITM-1022", name: "Laser Printer Toner", category: "Electronics", price: 145.0, qty: 27, reorder: 15 },
];

export function getStockStatus(item) {
  if (item.qty === 0) return "out";
  if (item.qty <= item.reorder) return "low";
  return "in";
}

const RAW_CUSTOMERS = [
  {
    code: "CUS-001", name: "Al Marwan Trading LLC", phone: "+971 4 221 5566", city: "Dubai", balance: 24580.0,
    statement: [
      { date: "2026-06-02", doc: "INV-8801", type: "Invoice", debit: 12500, credit: 0 },
      { date: "2026-06-18", doc: "REC-4410", type: "Receipt", debit: 0, credit: 8000 },
      { date: "2026-07-05", doc: "INV-8850", type: "Invoice", debit: 9600, credit: 0 },
      { date: "2026-07-22", doc: "REC-4477", type: "Receipt", debit: 0, credit: 4000 },
      { date: "2026-08-10", doc: "INV-8902", type: "Invoice", debit: 14480, credit: 0 },
    ],
    outstanding: [
      { inv: "INV-8850", date: "2026-07-05", due: "2026-08-04", total: 9600, paid: 4000, balance: 5600 },
      { inv: "INV-8902", date: "2026-08-10", due: "2026-09-09", total: 14480, paid: 0, balance: 14480 },
      { inv: "INV-8801", date: "2026-06-02", due: "2026-07-02", total: 12500, paid: 8000, balance: 4500 },
    ],
  },
  {
    code: "CUS-002", name: "Falcon Hardware Est.", phone: "+971 6 574 1120", city: "Sharjah", balance: 0,
    statement: [
      { date: "2026-07-11", doc: "INV-8862", type: "Invoice", debit: 3200, credit: 0 },
      { date: "2026-07-30", doc: "REC-4450", type: "Receipt", debit: 0, credit: 3200 },
    ],
    outstanding: [],
  },
  {
    code: "CUS-003", name: "Gulf Horizon Interiors", phone: "+971 2 344 8890", city: "Abu Dhabi", balance: 58200.0,
    statement: [
      { date: "2026-05-14", doc: "INV-8710", type: "Invoice", debit: 32000, credit: 0 },
      { date: "2026-06-01", doc: "REC-4390", type: "Receipt", debit: 0, credit: 12000 },
      { date: "2026-06-25", doc: "INV-8790", type: "Invoice", debit: 21600, credit: 0 },
      { date: "2026-07-19", doc: "INV-8845", type: "Invoice", debit: 16600, credit: 0 },
    ],
    outstanding: [
      { inv: "INV-8710", date: "2026-05-14", due: "2026-06-13", total: 32000, paid: 12000, balance: 20000 },
      { inv: "INV-8790", date: "2026-06-25", due: "2026-07-25", total: 21600, paid: 0, balance: 21600 },
      { inv: "INV-8845", date: "2026-07-19", due: "2026-08-18", total: 16600, paid: 0, balance: 16600 },
    ],
  },
  {
    code: "CUS-004", name: "Zenith Office Supplies", phone: "+971 4 887 2231", city: "Dubai", balance: 3120.0,
    statement: [{ date: "2026-08-01", doc: "INV-8895", type: "Invoice", debit: 3120, credit: 0 }],
    outstanding: [{ inv: "INV-8895", date: "2026-08-01", due: "2026-08-31", total: 3120, paid: 0, balance: 3120 }],
  },
  {
    code: "CUS-005", name: "Noor Al Sahra Contracting", phone: "+971 7 244 9981", city: "Ras Al Khaimah", balance: 91340.0,
    statement: [
      { date: "2026-04-20", doc: "INV-8560", type: "Invoice", debit: 45000, credit: 0 },
      { date: "2026-05-02", doc: "REC-4310", type: "Receipt", debit: 0, credit: 20000 },
      { date: "2026-06-14", doc: "INV-8680", type: "Invoice", debit: 38200, credit: 0 },
      { date: "2026-07-08", doc: "INV-8820", type: "Invoice", debit: 28140, credit: 0 },
    ],
    outstanding: [
      { inv: "INV-8560", date: "2026-04-20", due: "2026-05-20", total: 45000, paid: 20000, balance: 25000 },
      { inv: "INV-8680", date: "2026-06-14", due: "2026-07-14", total: 38200, paid: 0, balance: 38200 },
      { inv: "INV-8820", date: "2026-07-08", due: "2026-08-07", total: 28140, paid: 0, balance: 28140 },
    ],
  },
  {
    code: "CUS-006", name: "Palm Retail Group", phone: "+971 4 552 6674", city: "Dubai", balance: 6400.0,
    statement: [{ date: "2026-07-15", doc: "INV-8870", type: "Invoice", debit: 6400, credit: 0 }],
    outstanding: [{ inv: "INV-8870", date: "2026-07-15", due: "2026-08-14", total: 6400, paid: 0, balance: 6400 }],
  },
  {
    code: "CUS-007", name: "Blue Ocean Logistics", phone: "+971 6 761 3345", city: "Sharjah", balance: 0,
    statement: [
      { date: "2026-06-10", doc: "INV-8760", type: "Invoice", debit: 5400, credit: 0 },
      { date: "2026-06-28", doc: "REC-4420", type: "Receipt", debit: 0, credit: 5400 },
    ],
    outstanding: [],
  },
  {
    code: "CUS-008", name: "Desert Rose Cafeteria", phone: "+971 4 998 2210", city: "Dubai", balance: 1850.0,
    statement: [{ date: "2026-08-05", doc: "INV-8898", type: "Invoice", debit: 1850, credit: 0 }],
    outstanding: [{ inv: "INV-8898", date: "2026-08-05", due: "2026-09-04", total: 1850, paid: 0, balance: 1850 }],
  },
  {
    code: "CUS-009", name: "Metropolitan Builders", phone: "+971 2 611 7789", city: "Abu Dhabi", balance: 132400.0,
    statement: [
      { date: "2026-03-18", doc: "INV-8410", type: "Invoice", debit: 62000, credit: 0 },
      { date: "2026-04-02", doc: "REC-4260", type: "Receipt", debit: 0, credit: 30000 },
      { date: "2026-05-22", doc: "INV-8600", type: "Invoice", debit: 54400, credit: 0 },
      { date: "2026-07-01", doc: "INV-8800", type: "Invoice", debit: 46000, credit: 0 },
    ],
    outstanding: [
      { inv: "INV-8410", date: "2026-03-18", due: "2026-04-17", total: 62000, paid: 30000, balance: 32000 },
      { inv: "INV-8600", date: "2026-05-22", due: "2026-06-21", total: 54400, paid: 0, balance: 54400 },
      { inv: "INV-8800", date: "2026-07-01", due: "2026-07-31", total: 46000, paid: 0, balance: 46000 },
    ],
  },
  {
    code: "CUS-010", name: "Silver Star Trading", phone: "+971 4 330 4471", city: "Dubai", balance: 4260.0,
    statement: [{ date: "2026-08-12", doc: "INV-8905", type: "Invoice", debit: 4260, credit: 0 }],
    outstanding: [{ inv: "INV-8905", date: "2026-08-12", due: "2026-09-11", total: 4260, paid: 0, balance: 4260 }],
  },
];

// Precompute running balance for each customer's statement.
export const CUSTOMERS = RAW_CUSTOMERS.map((c) => {
  let bal = 0;
  const statement = c.statement.map((s) => {
    bal += s.debit - s.credit;
    return { ...s, running: bal };
  });
  return { ...c, statement };
});
