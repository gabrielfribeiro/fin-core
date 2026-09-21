import React from 'react';
import { 
  CreditCard, 
  ShoppingCart, 
  Coffee, 
  Tv, 
  CalendarClock, 
  CheckCircle2, 
  Sparkles,
  ArrowDownRight
} from 'lucide-react';
import type { CreditCardPurchase } from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface CreditCardSectionProps {
  purchases: CreditCardPurchase[];
}

export const CreditCardSection: React.FC<CreditCardSectionProps> = ({ purchases }) => {
  const totalInvoice = purchases.reduce((acc, p) => acc + p.installmentValue, 0);

  const marketTotal = purchases.filter(p => p.category === 'mercado').reduce((acc, p) => acc + p.installmentValue, 0);
  const leisureTotal = purchases.filter(p => p.category === 'lazer').reduce((acc, p) => acc + p.installmentValue, 0);
  const subscriptionsTotal = purchases.filter(p => p.category === 'recorrente').reduce((acc, p) => acc + p.installmentValue, 0);
  const installmentTotal = purchases.filter(p => p.category === 'parcelado').reduce((acc, p) => acc + p.installmentValue, 0);

  const installmentPurchases = purchases.filter(p => p.category === 'parcelado');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/20 mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Fatura Variável • Cartão Itaú</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Raio-X das Despesas & Parcelamentos
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Entenda a composição exata da sua fatura e descubra quando as compras parceladas acabam para aliviar seu caixa.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[200px] text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Total da Fatura</span>
          <span className="text-2xl font-extrabold text-amber-300 font-mono">{formatCurrency(totalInvoice)}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Média 2026: ~R$ 3.099/mês</span>
        </div>
      </div>

      {/* 4 Category Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category 1: Supermercado */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              Supermercado & Feira
            </span>
            <span className="font-semibold text-emerald-400">
              {formatPercent((marketTotal / totalInvoice) * 100)}
            </span>
          </div>
          <div className="text-xl font-bold text-white font-mono">{formatCurrency(marketTotal)}</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${(marketTotal / totalInvoice) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">Consumo essencial recorrente do mês</span>
        </div>

        {/* Category 2: Lazer & Restaurantes */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Coffee className="w-4 h-4 text-amber-400" />
              Lazer & Restaurantes
            </span>
            <span className="font-semibold text-amber-400">
              {formatPercent((leisureTotal / totalInvoice) * 100)}
            </span>
          </div>
          <div className="text-xl font-bold text-white font-mono">{formatCurrency(leisureTotal)}</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${(leisureTotal / totalInvoice) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">Delivery, saídas e entretenimento</span>
        </div>

        {/* Category 3: Assinaturas Fixas */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Tv className="w-4 h-4 text-indigo-400" />
              Assinaturas Fixas
            </span>
            <span className="font-semibold text-indigo-400">
              {formatPercent((subscriptionsTotal / totalInvoice) * 100)}
            </span>
          </div>
          <div className="text-xl font-bold text-white font-mono">{formatCurrency(subscriptionsTotal)}</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full"
              style={{ width: `${(subscriptionsTotal / totalInvoice) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">Streaming, academia e planos digitais</span>
        </div>

        {/* Category 4: Compras Parceladas */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <CalendarClock className="w-4 h-4 text-rose-400" />
              Compras Parceladas
            </span>
            <span className="font-semibold text-rose-400">
              {formatPercent((installmentTotal / totalInvoice) * 100)}
            </span>
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">{formatCurrency(installmentTotal)}</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full"
              style={{ width: `${(installmentTotal / totalInvoice) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">Compromissos antigos com data de término</span>
        </div>
      </div>

      {/* Installment Relief Timeline */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Cronograma de Alívio da Fatura (Parcelas a Vencer)
            </h3>
            <span className="text-xs text-slate-400">
              Veja exatamente quando cada parcela vai sair da sua fatura, liberando caixa para investir
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
            {installmentPurchases.length} parcelamentos ativos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {installmentPurchases.map((p) => {
            const pct = p.installmentTotal ? (p.installmentCurrent! / p.installmentTotal) * 100 : 0;
            return (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{p.description}</h4>
                    <span className="text-[11px] text-slate-400">
                      Parcela {p.installmentCurrent} de {p.installmentTotal}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    Termina em {p.endMonth}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Valor da Parcela:</span>
                  <strong className="text-sm font-bold text-white font-mono">
                    {formatCurrency(p.installmentValue)}/mês
                  </strong>
                </div>

                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>

                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Alívio de +{formatCurrency(p.installmentValue)}/mês após término
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Relief Callout */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-emerald-300 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Projeção de Fôlego Financeiro até Início de 2027:
            </span>
            <p className="text-slate-300">
              Com o término dessas 3 compras parceladas, sua fatura cairá em <strong>+{formatCurrency(installmentTotal)}/mês</strong>!
            </p>
          </div>
          <div className="text-right whitespace-nowrap">
            <span className="text-[10px] text-slate-400 block uppercase">Alívio Mensal na Fatura</span>
            <strong className="text-base font-extrabold text-emerald-400 font-mono">
              +{formatCurrency(installmentTotal)}/mês
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
