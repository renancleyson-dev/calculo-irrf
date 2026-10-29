import { useEffect, useState } from "react";
import { EmployeeForm } from "./components/EmployeeForm";
import { EmployeeList } from "./components/EmployeeList";
import type { Employee } from "./employee";
import { useEmployees } from "./contexts/EmployeesContext";

const STATUS_TIMEOUT = 5000;

export const App = () => {
  const { employees, create, update, remove } = useEmployees();
  const [editing, setEditing] = useState<Employee | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!status) {
      return;
    }

    const timeout = setTimeout(() => setStatus(""), STATUS_TIMEOUT);

    return () => {
      clearTimeout(timeout);
    };
  }, [status]);

  const startEditing = (employee: Employee) => {
    setEditing(employee);
  };

  const stopEditing = () => {
    setEditing(null);
  };

  const handleSave = (employee: Employee) => {
    if (editing) {
      update(employee);
      stopEditing();
      setStatus(`Funcionário atualizado: ${employee.name}.`);
    } else {
      create(employee);
      setStatus(`Funcionário cadastrado: ${employee.name}.`);
    }
  };

  const handleDelete = (employee: Employee) => {
    remove(employee.cpf);
    setStatus(`Funcionário excluído: ${employee.name}.`);

    if (editing?.cpf === employee.cpf) {
      setEditing(null);
    }
  };

  return (
    <main>
      <h1>Funcionários e IRRF</h1>
      <EmployeeForm
        key={editing?.cpf ?? "new"}
        employee={editing}
        onSave={handleSave}
        onCancel={stopEditing}
      />
      <p role="status">{status}</p>
      <EmployeeList employees={employees} onEdit={startEditing} onDelete={handleDelete} />
    </main>
  );
};
