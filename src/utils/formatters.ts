import type { MonthlyRecord, KPIStats } from '../types/finance';

export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
};

export const calculateKPIs = (records: MonthlyRecord[]): KPIStats => {
  // Find current active month (2026-09 or the latest month with salary > 0)
  const activeRecords = records.filter(r => r.totalIncome > 0 || r.totalExpenses > 0);
  const current = records.find(r => r.id === '2026-09') || activeRecords[activeRecords.length - 1] || records[0];

  // 2026 stats
  const records2026 = records.filter(r => r.year === 2026 && (r.totalIncome > 0 || r.totalExpenses > 0));
  const avgExpenses2026 = records2026.length > 0
    ? records2026.reduce((acc, r) => acc + r.totalExpenses, 0) / records2026.length
    : 8730;

  const avgIncome2026 = records2026.length > 0
    ? records2026.reduce((acc, r) => acc + r.totalIncome, 0) / records2026.length
    : 10305;

  const savingsItau = current?.savingsItau || 0;
  const liquidAccount = current?.liquidAccount || 0;
  const investmentsB3 = 0; // Início da carteira de Ações e FIIs

  const totalNetWorth = current?.netWorth > 0
    ? current.netWorth
    : (savingsItau + liquidAccount + investmentsB3);

  const currentIncome = current?.totalIncome || 0;
  const currentExpenses = current?.totalExpenses || 0;
  const currentBalance = currentIncome - currentExpenses;

  const savingsRate = currentIncome > 0 ? (currentBalance / currentIncome) * 100 : 0;
  const emergencyMonths = avgExpenses2026 > 0 ? savingsItau / avgExpenses2026 : 0;

  const goal2027Total = 50000;
  const goal2027Current = savingsItau + investmentsB3;
  const goal2027Percent = (goal2027Current / goal2027Total) * 100;

  return {
    currentIncome,
    currentExpenses,
    currentBalance,
    savingsItau,
    liquidAccount,
    investmentsB3,
    totalNetWorth,
    savingsRate,
    emergencyMonths,
    avgExpenses2026,
    avgIncome2026,
    goal2027Total,
    goal2027Current,
    goal2027Percent,
  };
};

export const getNextMonthInfo = (monthId: string = '2026-09') => {
  const [yearStr, monthStr] = (monthId || '2026-09').split('-');
  let year = parseInt(yearStr, 10) || 2026;
  let month = parseInt(monthStr, 10) || 9;
  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  const nextMonthId = `${year}-${String(month).padStart(2, '0')}`;
  const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const nextMonthLabel = `${MONTH_NAMES[month - 1]}/${year}`;
  return { nextMonthId, nextMonthLabel, year, monthName: MONTH_NAMES[month - 1], monthIndex: month };
};
