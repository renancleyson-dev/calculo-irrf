// @vitest-environment jsdom
import type { UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test } from "vite-plus/test";
import { App } from "./App";
import { cleanup, render, screen, within } from "./test-utils";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

const addEmployee = async (
  user: UserEvent,
  {
    name = "Liz Pereira",
    cpf = "07572237371",
    salary = "1483776",
    socialSecurity = "187241",
    dependents = "4",
  } = {},
) => {
  const values = {
    Nome: name,
    CPF: cpf,
    "Salário bruto (R$)": salary,
    "Desconto da previdência (R$)": socialSecurity,
    Dependentes: dependents,
  };

  for (const [label, value] of Object.entries(values)) {
    const input = screen.getByRole("textbox", { name: label });
    await user.clear(input);
    if (value) {
      await user.type(input, value);
    }
  }

  await user.click(screen.getByRole("button", { name: "Cadastrar" }));
};

test("creates an employee and shows in the list", async () => {
  const { user } = render(<App />);

  await user.type(screen.getByRole("textbox", { name: "Nome" }), "Liz Pereira");
  await user.type(screen.getByRole("textbox", { name: "CPF" }), "07572237371");
  await user.type(screen.getByRole("textbox", { name: "Salário bruto (R$)" }), "1483776");
  await user.type(screen.getByRole("textbox", { name: "Desconto da previdência (R$)" }), "187241");
  await user.clear(screen.getByRole("textbox", { name: "Dependentes" }));
  await user.type(screen.getByRole("textbox", { name: "Dependentes" }), "4");
  await user.click(screen.getByRole("button", { name: "Cadastrar" }));

  const row = screen.getByRole("row", { name: /Liz Pereira/ });
  const [name, cpf, salary, socialSecurity, dependents, base, irrf] =
    within(row).getAllByRole("cell");

  expect(name).toHaveTextContent("Liz Pereira");
  expect(cpf).toHaveTextContent("075.722.373-71");
  expect(salary).toHaveTextContent("R$ 14.837,76");
  expect(socialSecurity).toHaveTextContent("R$ 1.872,41");
  expect(dependents).toHaveTextContent("4");
  expect(base).toHaveTextContent("R$ 12.206,99");
  expect(irrf).toHaveTextContent("R$ 2.460,92");
  expect(screen.getByRole("textbox", { name: "Nome" })).toHaveProperty("value", "");
  expect(screen.getByText("Funcionário cadastrado: Liz Pereira.")).toHaveRole("status");
});

test("masks the CPF", async () => {
  const { user } = render(<App />);

  const cpf = screen.getByRole("textbox", { name: "CPF" });
  await user.type(cpf, "668w54128285476");
  expect(cpf).toHaveProperty("value", "668.541.282-85");
});

test("masks money value", async () => {
  const { user } = render(<App />);

  const salary = screen.getByRole("textbox", { name: "Salário bruto (R$)" });
  await user.type(salary, "1w8148060");
  expect(salary).toHaveProperty("value", "181.480,60");
});

test("limits money values to 999.999,99", async () => {
  const { user } = render(<App />);

  const socialSecurity = screen.getByRole("textbox", { name: "Desconto da previdência (R$)" });
  await user.type(socialSecurity, "8688723415");
  expect(socialSecurity).toHaveProperty("value", "868.872,34");
});

test("masks dependents to natural numbers", async () => {
  const { user } = render(<App />);

  const dependents = screen.getByRole("textbox", { name: "Dependentes" });
  await user.clear(dependents);
  await user.type(dependents, "-0.2e4x");
  expect(dependents).toHaveProperty("value", "24");
});

test("shows errors and focuses the first invalid field", async () => {
  const { user } = render(<App />);
  await user.click(screen.getByRole("button", { name: "Cadastrar" }));

  const name = screen.getByRole("textbox", { name: "Nome", description: "Informe o nome." });
  expect(name.getAttribute("aria-invalid")).toBe("true");
  expect(document.activeElement).toBe(name);
  screen.getByRole("textbox", { name: "CPF", description: "Informe o CPF." });
  screen.getByRole("textbox", {
    name: "Salário bruto (R$)",
    description: "Informe o salário bruto.",
  });
  screen.getByRole("textbox", {
    name: "Desconto da previdência (R$)",
    description: "Informe o desconto da previdência.",
  });

  await user.type(name, "I");
  expect(name.getAttribute("aria-invalid")).toBeNull();
  expect(screen.queryByText("Informe o nome.")).toBeNull();
});

test("rejects an invalid CPF", async () => {
  const { user } = render(<App />);
  await addEmployee(user, { cpf: "74428627301" });

  screen.getByRole("textbox", { name: "CPF", description: "CPF inválido. Confira os 11 dígitos." });
  screen.getByText("Nenhum funcionário encontrado.");
});

test("rejects a CPF that is already registered", async () => {
  const { user } = render(<App />);
  await addEmployee(user);
  await addEmployee(user, { name: "Margarida Saraiva" });

  screen.getByRole("textbox", {
    name: "CPF",
    description: "Já existe um funcionário com esse CPF.",
  });
  expect(screen.queryByRole("row", { name: /Margarida Saraiva/ })).toBeNull();
});

test("rejects a social security deduction greater than the salary", async () => {
  const { user } = render(<App />);
  await addEmployee(user, { salary: "124491", socialSecurity: "182731" });

  screen.getByRole("textbox", {
    name: "Desconto da previdência (R$)",
    description: "O desconto da previdência não pode ser maior que o salário bruto.",
  });
  screen.getByText("Nenhum funcionário encontrado.");
});

test("edits an employee", async () => {
  const { user } = render(<App />);
  await addEmployee(user);

  const editButton = screen.getByRole("button", { name: "Editar Liz Pereira" });
  await user.click(editButton);
  expect(screen.getByRole("textbox", { name: "CPF" })).toHaveProperty("readOnly", true);

  const salaryInput = screen.getByRole("textbox", { name: "Salário bruto (R$)" });
  expect(salaryInput).toHaveProperty("value", "14.837,76");
  await user.clear(salaryInput);
  await user.type(salaryInput, "1305991");
  await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

  const row = screen.getByRole("row", { name: /Liz Pereira/ });
  const [name, cpf, salary, socialSecurity, dependents, base, irrf] =
    within(row).getAllByRole("cell");

  expect(name).toHaveTextContent("Liz Pereira");
  expect(cpf).toHaveTextContent("075.722.373-71");
  expect(salary).toHaveTextContent("R$ 13.059,91");
  expect(socialSecurity).toHaveTextContent("R$ 1.872,41");
  expect(dependents).toHaveTextContent("4");
  expect(base).toHaveTextContent("R$ 10.429,14");
  expect(irrf).toHaveTextContent("R$ 1.972,01");
  expect(screen.getByText("Funcionário atualizado: Liz Pereira.")).toHaveRole("status");
});

test("deletes an employee on click", async () => {
  const { user } = render(<App />);
  await addEmployee(user);

  await user.click(screen.getByRole("button", { name: "Excluir Liz Pereira" }));

  expect(screen.queryByRole("row", { name: /Liz Pereira/ })).toBeNull();
  screen.getByText("Nenhum funcionário encontrado.");
  expect(screen.getByText("Funcionário excluído: Liz Pereira.")).toHaveRole("status");
});

test("filters by name", async () => {
  const { user } = render(<App />);
  await addEmployee(user);
  await addEmployee(user, { name: "Vitória Oliveira", cpf: "95074938406" });

  await user.type(screen.getByRole("textbox", { name: "Filtrar por nome" }), "vitória");

  expect(screen.queryByRole("row", { name: /Liz Pereira/ })).toBeNull();
  screen.getByRole("row", { name: /Vitória Oliveira/ });
  expect(screen.getByText("1 funcionário encontrado.")).toHaveRole("status");
});

test("filters by CPF", async () => {
  const { user } = render(<App />);
  await addEmployee(user);
  await addEmployee(user, { name: "Vitória Oliveira", cpf: "95074938406" });

  await user.type(screen.getByRole("textbox", { name: "Filtrar por CPF" }), "0757");

  expect(screen.queryByRole("row", { name: /Vitória Oliveira/ })).toBeNull();
  screen.getByRole("row", { name: /Liz Pereira/ });
  expect(screen.getByText("1 funcionário encontrado.")).toHaveRole("status");
});
