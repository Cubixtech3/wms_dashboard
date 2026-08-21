import { useState } from "react";

const DEPT_KEY = "erp_department";
const DEPT_OPTIONS = [
  { key: "CLZ", label: "CLZ" },
  { key: "HO", label: "HO" },
  { key: "POP", label: "POP" },
];

export function useDepartment() {
  const [dept, setDept] = useState(() => {
    try {
      return localStorage.getItem(DEPT_KEY) || "HO";
    } catch {
      return "HO";
    }
  });

  const update = (value) => {
    setDept(value);
    try {
      localStorage.setItem(DEPT_KEY, value);
    } catch {
      // ignore
    }
  };

  return { dept, setDept: update, options: DEPT_OPTIONS };
}
