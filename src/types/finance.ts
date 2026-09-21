export interface MonthlyRecord {
  id: string; // e.g. "2026-09"
  year: number;
  month: string;
  monthIndex: number; // 1 to 12
  salary: number;
  extraIncome: number;
  totalIncome: number;
  car: number;
  apartment: number;
  itau: number;
  nubank: number;
  fuel: number;
  looseBills: number;
  totalExpenses: number;
  monthlyBalance: number;
  savingsItau: number;
  avenue: number;
  liquidAccount: number;
  dollarAmount: number;
  exchangeRate: number;
  netWorth: number;
  notes?: string;
  isCurrent?: boolean;
  status: 'completed' | 'current' | 'projected';
}

export interface BudgetItem {
  id: string;
  name: string;
  category: 'eletro' | 'movel' | 'reforma' | 'documentacao';
  estimatedCost: number;
  actualCost?: number;
  status: 'planejado' | 'comprado' | 'prioridade';
  notes?: string;
}

export interface FinancingContract {
  id: string;
  name: string;
  institution: string;
  totalBalance: number;
  monthlyPayment: number;
  remainingInstallments: number;
  interestRate?: string;
  notes?: string;
  category: 'carro' | 'apartamento_caixa' | 'apartamento_mrv';
}

export interface MRVInstallment {
  code: string;
  dueDate: string;
  value: number;
  classification: 'Certo' | 'Condicional';
  description: string;
  notes: string;
}

export interface KPIStats {
  currentIncome: number;
  currentExpenses: number;
  currentBalance: number;
  savingsItau: number;
  liquidAccount: number;
  investmentsB3: number;
  totalNetWorth: number;
  savingsRate: number;
  emergencyMonths: number;
  avgExpenses2026: number;
  avgIncome2026: number;
  goal2027Total: number; // 50000
  goal2027Current: number;
  goal2027Percent: number;
}
