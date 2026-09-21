import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Landmark, 
  Wallet, 
  ShieldAlert,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import type { KPIStats, MonthlyRecord } from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface OverviewCardsProps {
  kpis: KPIStats;
  currentRecord: MonthlyRecord | undefined;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ kpis, currentRecord }) => {
  const monthTitle = currentRecord ? `${currentRecord.month} / ${currentRecord.year}` : 'Mês Atual';

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              Status Atual: <span className="text-emerald-400 font-bold">{monthTitle}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Regra Salário Dia 25
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Próxima entrada: Salário de 25/09 abastecerá o ciclo de Outubro/2026.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Patrimônio Líquido</span>
            <span className="text-lg font-bold text-emerald-400">{formatCurrency(kpis.totalNetWorth)}</span>
          </div>
        </div>
      </div>

      {/* Grid of Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Salário / Receita */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Renda do Mês</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {formatCurrency(kpis.currentIncome)}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-400 gap-1.5">
              <span className="text-emerald-400 font-medium">Média 2026:</span>
              <span>{formatCurrency(kpis.avgIncome2026)}/mês</span>
            </div>
          </div>
        </div>

        {/* Card 2: Despesas */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Despesas do Mês</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {formatCurrency(kpis.currentExpenses)}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-400 gap-1.5">
              <span className="text-slate-300 font-medium">Média 2026:</span>
              <span>{formatCurrency(kpis.avgExpenses2026)}/mês</span>
            </div>
          </div>
        </div>

        {/* Card 3: Reserva Itaú */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Guardado no Itaú</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {formatCurrency(kpis.savingsItau)}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-400 gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Cobre <strong className="text-amber-300">{kpis.emergencyMonths.toFixed(1)} mês</strong> de custo</span>
            </div>
          </div>
        </div>

        {/* Card 4: Saldo Livre / Conta */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Saldo Livre / Conta</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-cyan-300 tracking-tight">
              {formatCurrency(kpis.liquidAccount)}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-400 gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sobra no mês: <strong className="text-emerald-400">{formatCurrency(kpis.currentBalance)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Target Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Taxa de Poupança */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Taxa de Poupança do Mês</span>
            <span className="font-semibold text-emerald-400">{formatPercent(kpis.savingsRate)}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(Math.max(kpis.savingsRate, 0), 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Meta recomendada: 20% a 30% da renda líquida
          </span>
        </div>

        {/* Metric 2: Reconstrução da Reserva */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Reconstrução da Reserva (Meta: 3 Meses = R$ 26,1k)</span>
            <span className="font-semibold text-blue-400">
              {formatPercent((kpis.savingsItau / (kpis.avgExpenses2026 * 3)) * 100)}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((kpis.savingsItau / (kpis.avgExpenses2026 * 3)) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Pico histórico alcançado: R$ 31.125 em Jun/2026
          </span>
        </div>

        {/* Metric 3: Balanço Avenue / Investimentos */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-indigo-400" />
              Dólar / Investimentos no Exterior
            </span>
            <span className="font-semibold text-indigo-400">
              {currentRecord?.avenue ? `$ ${currentRecord.avenue.toFixed(2)}` : '$ 0.00'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-300 flex justify-between items-center">
            <span>Valor convertido:</span>
            <strong className="text-white font-mono">{formatCurrency(kpis.dollarTotalBrl)}</strong>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Câmbio base: {currentRecord?.exchangeRate ? `R$ ${currentRecord.exchangeRate.toFixed(2)}` : 'R$ 5,50'}
          </span>
        </div>
      </div>
    </div>
  );
};
