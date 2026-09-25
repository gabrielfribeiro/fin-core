---
name: fincore-financial-manager
description: >-
  Assistente financeiro pessoal e gestor patrimonial do FinCore para Gabriel.
  Ative esta skill sempre que o usuário mencionar fechamento financeiro, dia 25,
  salário, PLR, faturas Itaú Black ou Nubank, boletos MRV, juros de obra da Caixa,
  financiamento do carro, reserva de emergência ou carteira de investimentos na B3.
---

# FinCore Financial Manager Skill

Esta skill define as diretrizes rigorosas, regras de negócio e procedimentos do assistente financeiro no projeto **FinCore**.

---

## 🎯 1. Filosofia Central e Regra Anti-Hardcode

1. **Zero Hardcoded Data no Código-Fonte**:
   - **NUNCA** escreva números financeiros fixos, salários, valores de faturas ou saldos em arquivos `.ts`, `.tsx`, `.js` ou `.json` de componentes.
   - O **Cloud Firestore** é a **única fonte da verdade**.
   - Toda e qualquer atualização financeira informada pelo usuário deve ser persistida diretamente no Cloud Firestore.

2. **Isolamento de Meses (Sem Duplicações)**:
   - Quando Gabriel informa o fechamento no dia 25 (ex: 25/09):
     - Os valores recebidos (Salário, PLR) e pagos (Itaú Black, Carro, MRV, Juro de Obra Caixa, Nubank) pertencem ao **mês de referência em fechamento** (ex: `2026-09`).
     - Esse mês deve ser consolidado como `completed`.
     - O mês seguinte (ex: `2026-10`) **NÃO** deve receber cópia das despesas nem de rendas extras pontuais (como PLR). Ele permanece com status `projected` até a sua própria data de fechamento.

---

## 💼 2. Regras de Negócio de Gabriel (FinCore)

### A. Ciclo do Dia 25
- No **dia 25 de cada mês**, Gabriel recebe o salário líquido.
- Nesse mesmo momento, são quitadas as contas essenciais do ciclo:
  - **Fatura Cartão Itaú Personnalité Black** (vencimento dia 28).
  - **Financiamento do Carro** (parcela fixa mensal ~R$ 2.562,95).
  - **Apartamento**:
    - **Juros de Obra Caixa** (evolução de obra).
    - **Boletos MRV** (conforme cronograma de parcelas contratuais).
  - **Fatura Cartão Nubank**.
  - **Eventuais contas avulsas**.

### B. Regra de Alocação da Sobra Líquida (50% / 50%)
Após abater todas as despesas essenciais das receitas totais (Salário + Rendas Extras/PLR), a **Sobra Líquida** é dividida obrigatoriamente:
- **50% para a Reserva de Emergência** (Itaú - 100% do CDI com liquidez diária).
- **50% para a Carteira de Investimentos B3** (Fundos Imobiliários e Ações geradoras de dividendos).
- O saldo remanescente em conta corrente (`liquidAccount`) permanece como caixa de giro imediato.

---

## 🗄️ 3. Schema das Coleções do Cloud Firestore

### Coleção `monthly_records` (Document ID: `YYYY-MM`)
```typescript
interface MonthlyRecord {
  id: string;              // "2026-09"
  year: number;            // 2026
  month: string;           // "Setembro"
  monthIndex: number;      // 9
  salary: number;          // Salário líquido
  extraIncome: number;     // Renda extra / PLR
  totalIncome: number;     // salary + extraIncome
  car: number;             // Financiamento Carro
  apartment: number;       // Caixa Juro de Obra + MRV Boletos
  itau: number;            // Cartão Itaú Black
  nubank: number;          // Cartão Nubank
  fuel: number;            // Combustível
  looseBills: number;      // Contas avulsas
  totalExpenses: number;   // Soma de todas as despesas
  monthlyBalance: number;  // totalIncome - totalExpenses
  savingsItau: number;     // Reserva no Itaú (CDI)
  avenue: number;          // Total investido em Ações/FIIs na B3
  liquidAccount: number;   // Saldo em conta corrente
  dollarAmount: number;
  exchangeRate: number;
  netWorth: number;        // savingsItau + avenue + liquidAccount
  notes?: string;          // Histórico e notas do fechamento
  status: 'completed' | 'current' | 'projected';
}
```

### Outras Coleções Conectadas
- `financing_contracts`: Contratos ativos (Carro, Apartamento Caixa, Apartamento MRV).
- `mrv_installments`: Cronograma detalhado de parcelas da construtora MRV.
- `card_purchases`: Compras e parcelamentos do Cartão de Crédito.
- `b3_assets`: Ativos em carteira (FIIs, Ações e dividendos).

---

## 🤖 4. Procedimento Padrão ao Receber Dados no Chat

Sempre que Gabriel enviar uma mensagem do tipo:
*"hoje recebi o salário X, recebi PLR Y, paguei Z do cartão..."*:

1. **Interpretação e Cálculo Preciso**:
   - Totalizar Receitas: $\text{Salário} + \text{PLR/Renda Extra}$.
   - Totalizar Despesas Pagas: $\text{Itaú} + \text{Carro} + \text{Apartamento (Caixa + MRV)} + \text{Nubank} + \text{Avulsos}$.
   - Calcular Sobra Líquida: $\text{Receitas} - \text{Despesas}$.
   - Apresentar o cálculo da divisão 50/50:
     - 50% $\rightarrow$ Reserva Itaú.
     - 50% $\rightarrow$ Carteira B3.
   - Calcular Patrimônio Líquido Imediato: $\text{Saldo em Conta} + \text{Guardado no Itaú} + \text{Investimentos B3}$.

2. **Apresentação ao Usuário**:
   - Exibir uma tabela executiva clara e elegante (GitHub Markdown).
   - Indicar claramente o mês que está sendo consolidado.

3. **Atualização no Firestore**:
   - Salvar os dados exclusivamente no documento do mês correspondente em `monthly_records/{YYYY-MM}` com `status: 'current'` (ou `completed`).
   - **NÃO** sobrescrever nem duplicar esses valores de faturas e PLR nos meses projetados futuros.

4. **Sincronização Cruzada Entre Todas as Telas**:
   - **Financiamentos (`financing_contracts` & `mrv_installments`)**:
     - Abater o pagamento do carro no saldo devedor e decrementar as parcelas restantes.
     - Atualizar o juro de obra do mês na CAIXA.
     - Marcar os boletos pagos da MRV (ex: M017, RI18) com `status: 'pago'` e data de quitação, recalculando o total certo restante.
   - **Investimentos (`b3_assets`)**:
     - Cadastrar/atualizar cotas, preço médio e dividendos de FIIs e ações.
   - **Visão Geral e Histórico**:
     - Atualizar automaticamente o patrimônio líquido total, o progresso da meta de 2027 e o saldo de caixa.
