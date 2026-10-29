import { type RenderOptions, render as rtlRender } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { ReactElement } from "react";
import { EmployeesProvider } from "./providers/EmployeesProvider";

export * from "@testing-library/react";

export const render = (ui: ReactElement, options?: RenderOptions) => {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui, { wrapper: EmployeesProvider, ...options }),
  };
};
