import { onlyDigits } from "../employee";

const MAX_DIGITS = 8;

const formatMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(value);

const mask = (event: React.ChangeEvent<HTMLInputElement>) => {
  const cents = onlyDigits(event.currentTarget.value).slice(0, MAX_DIGITS);
  event.currentTarget.value = cents ? formatMoney(Number(cents) / 100) : "";
};

type Props = Omit<React.ComponentProps<"input">, "defaultValue"> & {
  defaultValue?: number;
};

export const MoneyInput = ({ defaultValue, onChange, ...props }: Props) => {
  return (
    <input
      placeholder="0,00"
      {...props}
      onChange={(event) => {
        mask(event);

        if (onChange) {
          onChange(event);
        }
      }}
      defaultValue={defaultValue === undefined ? "" : formatMoney(defaultValue)}
    />
  );
};
