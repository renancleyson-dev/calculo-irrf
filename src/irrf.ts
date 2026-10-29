const DEPENDENT_DEDUCTION = 189.59;

const TABLE = [
  { upTo: 2_259.2, rate: 0, deduction: 0 },
  { upTo: 2_826.65, rate: 0.075, deduction: 169.44 },
  { upTo: 3_751.05, rate: 0.15, deduction: 381.44 },
  { upTo: 4_664.68, rate: 0.225, deduction: 662.77 },
  { upTo: Infinity, rate: 0.275, deduction: 896 },
];

// fixed to 2 decimal places
const roundToCents = (value: number) => Math.round(value * 100) / 100;

export const taxBase = (salary: number, socialSecurity: number, dependents: number) => {
  return roundToCents(salary - socialSecurity - DEPENDENT_DEDUCTION * dependents);
};

export const IRRFDiscount = (base: number) => {
  const { rate, deduction } = TABLE.find(({ upTo }) => base <= upTo)!;
  return Math.max(0, roundToCents(base * rate - deduction));
};
