import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Wallet, 
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Target,
  LineChart,
  ShieldCheck
} from 'lucide-react';
import type { KPIStats } from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface OverviewCardsProps {
  kpis: KPIStats;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ kpis }) => {
  const remainingToGoal = Math.max(kpis.goal2027Total - kpis.goal2027Current, 0);

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
              Visão Geral Consolidada
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Em Tempo Real
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Posição consolidada de caixa, reserva de emergência e metas financeiras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Patrimônio Líquido Total</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">{formatCurrency(kpis.totalNetWorth)}</span>
          </div>
        </div>
      </div>

      {/* Hero Card: Meta 2027 - R$ 50.000,00 (Reserva + Ações & FIIs) */}
      <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Target className="w-3.5 h-3.5" />
              <span>Objetivo Principal para 2027</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              Meta Patrimonial: {formatCurrency(kpis.goal2027Total)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Pagar todas as contas do mês e destinar 100% da sobra para <strong>Reserva de Emergência</strong> e <strong>Ações & FIIs</strong>.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[200px] text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Acumulado / Faltam</span>
            <div className="text-xl font-extrabold text-emerald-400 font-mono">
              {formatCurrency(kpis.goal2027Current)}
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Faltam <strong className="text-indigo-300">{formatCurrency(remainingToGoal)}</strong>
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium">Progresso da Meta de R$ 50k:</span>
            <span className="text-emerald-400 font-bold font-mono">{formatPercent(kpis.goal2027Percent)}</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 h-full rounded-full transition-all duration-700 shadow-lg shadow-emerald-500/20"
              style={{ width: `${Math.max(kpis.goal2027Percent, 2)}%` }}
            />
          </div>
        </div>

        {/* The Two Buckets (Reserva vs Ações & FIIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Bucket 1: Reserva de Emergência */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold text-white">1. Reserva de Emergência</span>
              </div>
              <span className="text-[11px] text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                Meta: R$ 25.000
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Saldo Atual (Itaú):</span>
              <strong className="text-sm font-bold text-white font-mono">{formatCurrency(kpis.savingsItau)}</strong>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((kpis.savingsItau / 25000) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 block">
              💡 Liquidez diária (100% CDI) para segurança total e imprevistos.
            </span>
          </div>

          {/* Bucket 2: Ações & Fundos Imobiliários (FIIs) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <LineChart className="w-4 h-4" />
                <span className="text-xs font-bold text-white">2. Ações & FIIs (B3)</span>
              </div>
              <span className="text-[11px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Meta: R$ 25.000
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Investido Atual:</span>
              <strong className="text-sm font-bold text-indigo-300 font-mono">{formatCurrency(kpis.investmentsB3)}</strong>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((kpis.investmentsB3 / 25000) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 block">
              🏢 Renda passiva e dividendos mensais isentos de imposto de renda.
            </span>
          </div>
        </div>
      </div>

      {/* Grid of 4 Main KPI Cards */}
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

      {/* Progress & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metric 1: Taxa de Poupança */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
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
            Quanto mais você poupar após pagar as contas, mais rápido atinge os R$ 50k.
          </span>
        </div>

        {/* Metric 2: Foco em FIIs & Renda Passiva */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <LineChart className="w-4 h-4 text-emerald-400" />
              Estratégia de Dividendos (FIIs + Ações)
            </span>
            <span className="font-semibold text-emerald-400">B3 Nacional</span>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Fundos Imobiliários pagam dividendos mensais livres de IR ("aluguéis automáticos"). Cada cota que você comprar passa a pagar renda todo mês!
          </p>
        </div>
      </div>
    </div>
  );
};
