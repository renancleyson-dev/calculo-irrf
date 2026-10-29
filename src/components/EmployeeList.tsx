import { useState } from "react";
import { type Employee, formatCPF, onlyDigits } from "../employee";
import { IRRFDiscount, taxBase } from "../irrf";

type Props = {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
};

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const toBRL = (value: number) => currency.format(value);

export const EmployeeList = ({ employees, onEdit, onDelete }: Props) => {
  const [nameFilter, setNameFilter] = useState("");
  const [cpfFilter, setCpfFilter] = useState("");

  const filtered = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(nameFilter.trim().toLowerCase()) &&
      employee.cpf.includes(onlyDigits(cpfFilter)),
  );

  const isFiltering = nameFilter !== "" || cpfFilter !== "";
  const found = filtered.length === 1 ? "funcionário encontrado" : "funcionários encontrados";

  return (
    <section>
      <h2>Funcionários cadastrados</h2>
      <div className="filters">
        <input
          aria-label="Filtrar por nome"
          placeholder="Filtrar por nome"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <input
          aria-label="Filtrar por CPF"
          placeholder="Filtrar por CPF"
          value={cpfFilter}
          onChange={(e) => setCpfFilter(e.target.value)}
        />
      </div>
      <p role="status">{isFiltering && `${filtered.length} ${found}.`}</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Salário</th>
              <th>Desconto</th>
              <th>Dependentes</th>
              <th>Base IR</th>
              <th>Desconto IRPF</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((employee) => {
              const { cpf, name, salary, socialSecurity, dependents } = employee;
              const base = taxBase(salary, socialSecurity, dependents);

              return (
                <tr key={cpf}>
                  <td>{name}</td>
                  <td>{formatCPF(cpf)}</td>
                  <td>{toBRL(salary)}</td>
                  <td>{toBRL(socialSecurity)}</td>
                  <td>{dependents}</td>
                  <td>{toBRL(base)}</td>
                  <td>{toBRL(IRRFDiscount(base))}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn"
                      aria-label={`Editar ${name}`}
                      onClick={() => onEdit(employee)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn danger"
                      aria-label={`Excluir ${name}`}
                      onClick={() => onDelete(employee)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
