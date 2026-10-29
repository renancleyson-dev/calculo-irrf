import { useState } from "react";
import { type Employee, formatCPF, isValidCPF, onlyDigits } from "../employee";
import { useEmployees } from "../contexts/EmployeesContext";
import { MoneyInput } from "./MoneyInput";

type FormFields = {
  name: string;
  cpf: string;
  salary: string;
  socialSecurity: string;
  dependents: string;
};

type Field = keyof FormFields;
type Errors = Partial<Record<Field, string>>;

type Props = {
  employee: Employee | null;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
};

const parseMoney = (value: string) => Number(value.replaceAll(".", "").replace(",", "."));

export const EmployeeForm = ({ employee, onSave, onCancel }: Props) => {
  const { employees } = useEmployees();
  const [errors, setErrors] = useState<Errors>({});

  const validate = (values: FormFields): Errors => {
    const fieldErrors: Errors = {};

    if (!values.name) {
      fieldErrors.name = "Informe o nome.";
    }

    if (!values.cpf) {
      fieldErrors.cpf = "Informe o CPF.";
    } else if (!isValidCPF(values.cpf)) {
      fieldErrors.cpf = "CPF inválido. Confira os 11 dígitos.";
    } else if (!employee && employees.some((e) => e.cpf === values.cpf)) {
      fieldErrors.cpf = "Já existe um funcionário com esse CPF.";
    }

    if (!values.salary) {
      fieldErrors.salary = "Informe o salário bruto.";
    }

    if (!values.socialSecurity) {
      fieldErrors.socialSecurity = "Informe o desconto da previdência.";
    } else if (parseMoney(values.socialSecurity) > parseMoney(values.salary)) {
      fieldErrors.socialSecurity =
        "O desconto da previdência não pode ser maior que o salário bruto.";
    }

    return fieldErrors;
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const values: FormFields = {
      name: (data.get("name") as string).trim(),
      cpf: employee?.cpf ?? onlyDigits(data.get("cpf") as string),
      salary: data.get("salary") as string,
      socialSecurity: data.get("socialSecurity") as string,
      dependents: data.get("dependents") as string,
    };

    const newErrors = validate(values);
    setErrors(newErrors);

    const firstInvalid = Object.keys(newErrors)[0];
    if (firstInvalid) {
      form.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    onSave({
      name: values.name,
      cpf: values.cpf,
      salary: parseMoney(values.salary),
      socialSecurity: parseMoney(values.socialSecurity),
      dependents: Number(values.dependents),
    });
    form.reset();
  };

  const maskCPF = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.value = formatCPF(event.target.value);
  };

  const maskDependents = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = onlyDigits(event.target.value);
    event.target.value = digits && String(Number(digits));
  };
  const clearError = (event: React.SyntheticEvent<HTMLFormElement>) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    const field = event.target.name as Field;
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const getErrorProps = (field: Field) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `employee-${field}-error` : undefined,
  });

  const renderErrorMessage = (field: Field) =>
    errors[field] && (
      <p id={`employee-${field}-error`} className="error">
        {errors[field]}
      </p>
    );

  return (
    <form onSubmit={handleSubmit} onChange={clearError} noValidate>
      <h2>{employee ? `Editando ${employee.name}` : "Novo funcionário"}</h2>
      <div className="field">
        <label htmlFor="employee-name">
          Nome <span aria-hidden="true">*</span>
        </label>
        <input
          id="employee-name"
          name="name"
          required
          defaultValue={employee?.name}
          {...getErrorProps("name")}
        />
        {renderErrorMessage("name")}
      </div>
      <div className="field">
        <label htmlFor="employee-cpf">
          CPF <span aria-hidden="true">*</span>
        </label>
        <input
          id="employee-cpf"
          name="cpf"
          required
          readOnly={!!employee}
          maxLength={14}
          placeholder="000.000.000-00"
          onChange={maskCPF}
          defaultValue={formatCPF(employee?.cpf ?? "")}
          {...getErrorProps("cpf")}
        />
        {renderErrorMessage("cpf")}
      </div>
      <div className="field">
        <label htmlFor="employee-salary">
          Salário bruto (R$) <span aria-hidden="true">*</span>
        </label>
        <MoneyInput
          id="employee-salary"
          name="salary"
          required
          defaultValue={employee?.salary}
          {...getErrorProps("salary")}
        />
        {renderErrorMessage("salary")}
      </div>
      <div className="field">
        <label htmlFor="employee-socialSecurity">
          Desconto da previdência (R$) <span aria-hidden="true">*</span>
        </label>
        <MoneyInput
          id="employee-socialSecurity"
          name="socialSecurity"
          required
          defaultValue={employee?.socialSecurity}
          {...getErrorProps("socialSecurity")}
        />
        {renderErrorMessage("socialSecurity")}
      </div>
      <div className="field">
        <label htmlFor="employee-dependents">Dependentes</label>
        <input
          id="employee-dependents"
          name="dependents"
          maxLength={2}
          onChange={maskDependents}
          defaultValue={employee?.dependents ?? 0}
        />
      </div>
      <div className="actions">
        <button type="submit" className="btn">
          {employee ? "Salvar alterações" : "Cadastrar"}
        </button>
        {employee && (
          <button type="button" className="btn neutral" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};
