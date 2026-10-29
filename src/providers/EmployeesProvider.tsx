import { type ReactNode, useEffect, useState } from "react";
import type { Employee } from "../employee";
import { EmployeesContext } from "../contexts/EmployeesContext";

const STORAGE_KEY = "employees";

export const EmployeesProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState((): Employee[] =>
    JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  const create = (employee: Employee) => {
    setEmployees((employees) => [...employees, employee]);
  };

  const update = (employee: Employee) => {
    setEmployees((employees) => employees.map((e) => (e.cpf === employee.cpf ? employee : e)));
  };

  const remove = (cpf: string) => {
    setEmployees((employees) => employees.filter((e) => e.cpf !== cpf));
  };

  return (
    <EmployeesContext value={{ employees, create, update, remove }}>{children}</EmployeesContext>
  );
};
