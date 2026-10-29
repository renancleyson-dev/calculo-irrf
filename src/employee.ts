export type Employee = {
  name: string;
  cpf: string;
  salary: number;
  socialSecurity: number;
  dependents: number;
};

export const onlyDigits = (s: string) => s.replace(/\D/g, "");

export const formatCPF = (cpf: string) =>
  onlyDigits(cpf)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

export const isValidCPF = (cpf: string) => {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) {
    return false;
  }

  const checkDigit = (digit: number) => {
    let sum = 0;
    for (let idx = 0; idx < digit; idx++) {
      sum += Number(digits[idx]) * (digit + 1 - idx);
    }

    return ((sum * 10) % 11) % 10;
  };

  return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10]);
};
