import { createContext, use } from "react";
import type { Employee } from "../employee";

type EmployeesContextValue = {
  employees: Employee[];
  create: (employee: Employee) => void;
  update: (employee: Employee) => void;
  remove: (cpf: string) => void;
};

export const EmployeesContext = createContext<EmployeesContextValue | null>(null);

export const useEmployees = () => {
  const context = use(EmployeesContext);

  if (!context) {
    throw new Error("useEmployees must be used inside <EmployeesProvider>");
  }

  return context;
};
