# Cálculo IRRF

Cadastro de funcionários com cálculo do Imposto de Renda Retido na Fonte.
Implementado testes, interface acessivel, estado persistente com `localStorage` e estado injetado com Context API

```bash
vp install
vp dev
vp test
```

- Regras de cálculo e tabela progressiva: `src/irrf.ts`
- Tipo `Employee` e utilitários de CPF: `src/employee.ts`
- Os dados ficam no `localStorage` do navegador.
