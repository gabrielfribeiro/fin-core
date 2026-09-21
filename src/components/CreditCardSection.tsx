import React, { useState } from 'react';
import { 
  CreditCard, 
  ShoppingCart, 
  Tv, 
  CalendarClock, 
  CheckCircle2, 
  Sparkles,
  ArrowDownRight,
  Fuel
} from 'lucide-react';
import type { CreditCardPurchase } from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { INITIAL_CARD_PURCHASES } from '../data/initialData';

interface CreditCardSectionProps {
  purchases: CreditCardPurchase[];
}

export const CreditCardSection: React.FC<CreditCardSectionProps> = ({ purchases }) => {
  const [filter, setFilter] = useState<'all' | 'parcelado' | 'spot'>('all');

  const activePurchases = (purchases && purchases.length > 0) ? purchases : INITIAL_CARD_PURCHASES;

  const totalInvoice = activePurchases.reduce((acc, p) => acc + p.installmentValue, 0);

  const marketTotal = activePurchases.filter(p => p.category === 'mercado').reduce((acc, p) => acc + p.installmentValue, 0);
  const leisureTotal = activePurchases.filter(p => p.category === 'lazer').reduce((acc, p) => acc + p.installmentValue, 0);
  const subscriptionsTotal = activePurchases.filter(p => p.category === 'recorrente').reduce((acc, p) => acc + p.installmentValue, 0);
  const installmentTotal = activePurchases.filter(p => p.category === 'parcelado').reduce((acc, p) => acc + p.installmentValue, 0);

  const installmentPurchases = activePurchases.filter(p => p.category === 'parcelado');
  const spotPurchases = activePurchases.filter(p => p.category !== 'parcelado');

  const displayedPurchases = filter === 'parcelado' 
    ? installmentPurchases 
    : filter === 'spot' 
    ? spotPurchases 
    : activePurchases;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Invoice Card Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold border border-orange-500/20">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Itaú Uniclass • Mastercard Black (Final 8545)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Fatura Fechada: Setembro/2026
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-3">
              <span>Vencimento: <strong className="text-slate-200">28/09/2026</strong></span>
              <span>•</span>
              <span>Emissão: <strong className="text-slate-200">21/09/2026</strong></span>
              <span>•</span>
              <span>Titular: <strong className="text-slate-200">Gabriel Felipe Prado Ribeiro</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 min-w-[190px] text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Total Desta Fatura</span>
              <span className="text-2xl font-extrabold text-amber-300 font-mono">{formatCurrency(totalInvoice)}</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5 font-medium">À vista + Parceladas</span>
            </div>
          </div>
        </div>

        {/* Credit Limit & Future Invoices Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[11px] block">Limite Total</span>
            <strong className="text-white font-mono font-bold text-sm">R$ 95.615,00</strong>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[11px] block">Limite Disponível</span>
            <strong className="text-emerald-400 font-mono font-bold text-sm">R$ 81.080,68</strong>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[11px] block">Próxima Fatura (Out/26)</span>
            <strong className="text-amber-400 font-mono font-bold text-sm">R$ 2.369,72</strong>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[11px] block">Total Futuro Parcelado</span>
            <strong className="text-indigo-300 font-mono font-bold text-sm">R$ 10.330,05</strong>
          </div>
        </div>
      </div>

      {/* 4 Category Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category 1: Compras Parceladas */}
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
          <span className="text-[10px] text-slate-500 block">15 compras ativas (vão aliviar com o tempo)</span>
        </div>

        {/* Category 2: Supermercado & Farmácia */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              Mercado & Farmácia
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
          <span className="text-[10px] text-slate-500 block">Bom Dia, 102 Comercial, Nissei, RCS</span>
        </div>

        {/* Category 3: Combustível, Lavagem & Serviços */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Fuel className="w-4 h-4 text-amber-400" />
              Transporte & Serviços
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
          <span className="text-[10px] text-slate-500 block">ShellBox, Scamaro Wash, Delivery e Lazer</span>
        </div>

        {/* Category 4: Assinaturas Fixas */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Tv className="w-4 h-4 text-indigo-400" />
              Assinaturas Recorrentes
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
          <span className="text-[10px] text-slate-500 block">Wellhub, Netflix, Google One, Spotify, YouTube</span>
        </div>
      </div>

      {/* Installment Relief Timeline */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Cronograma de Alívio da Fatura (15 Parcelamentos Ativos)
            </h3>
            <p className="text-xs text-slate-400">
              Veja exatamente quando cada parcela vai sair da fatura, liberando caixa para a meta dos R$ 50 mil
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/20">
            Total Parcelado: {formatCurrency(installmentTotal)}
          </span>
        </div>

        {/* Big Relief Highlight Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Super Alívio em Novembro/2026 (+R$ 1.031,36/mês liberados):
            </span>
            <p className="text-xs text-slate-300 max-w-2xl">
              Em Outubro/2026 encerram <strong>5 parcelamentos de uma vez</strong> (Ihan Oliveira R$ 466,66 + KaBuM 2 R$ 181,67 + Nike R$ 150,58 + PlayStation R$ 137,47 + Decathlon R$ 94,98). A partir de Novembro, sua fatura parcelada cai para apenas <strong>~R$ 1.338/mês</strong>!
            </p>
          </div>
          <div className="text-left md:text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase block">Fôlego Imediato</span>
            <strong className="text-lg font-mono font-extrabold text-emerald-400">+R$ 1.031,36/mês</strong>
          </div>
        </div>

        {/* Installments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {installmentPurchases.map((p) => {
            const pct = p.installmentTotal ? (p.installmentCurrent! / p.installmentTotal) * 100 : 0;
            const isEndingSoon = p.endMonth?.includes('Out/2026') || p.endMonth?.includes('Set/2026');
            return (
              <div 
                key={p.id} 
                className={`p-4 rounded-2xl bg-slate-950/80 border transition hover:border-slate-700 space-y-2.5 ${
                  isEndingSoon ? 'border-emerald-500/30' : 'border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="pr-2">
                    <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">{p.description}</h4>
                    <span className="text-[11px] text-slate-400">
                      Parcela {p.installmentCurrent} de {p.installmentTotal}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap border ${
                    isEndingSoon 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {p.endMonth}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-slate-400">Valor da Parcela:</span>
                  <strong className="text-xs sm:text-sm font-bold text-white font-mono">
                    {formatCurrency(p.installmentValue)}/mês
                  </strong>
                </div>

                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full rounded-full ${isEndingSoon ? 'bg-emerald-400' : 'bg-rose-400'}`} 
                    style={{ width: `${pct}%` }} 
                  />
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                  <span>Progresso: {formatPercent(pct)}</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                    <ArrowDownRight className="w-3 h-3" />
                    +{formatCurrency(p.installmentValue)} livre
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs for All Invoice Items */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Extrato Consolidado da Fatura</h3>
            <p className="text-xs text-slate-400">Lista completa dos lançamentos debitados no vencimento 28/09/2026</p>
          </div>
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition ${
                filter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({purchases.length})
            </button>
            <button
              onClick={() => setFilter('parcelado')}
              className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition ${
                filter === 'parcelado' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Parceladas ({installmentPurchases.length})
            </button>
            <button
              onClick={() => setFilter('spot')}
              className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition ${
                filter === 'spot' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              À Vista / Assinaturas ({spotPurchases.length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {displayedPurchases.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-800/30 px-3 rounded-xl transition">
              <div className="space-y-0.5">
                <span className="font-semibold text-white block">{item.description}</span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {item.category === 'parcelado' ? `Parcela ${item.installmentCurrent}/${item.installmentTotal} • Termina em ${item.endMonth}` : item.category}
                </span>
              </div>
              <strong className="font-mono text-sm text-slate-200">
                {formatCurrency(item.installmentValue)}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
