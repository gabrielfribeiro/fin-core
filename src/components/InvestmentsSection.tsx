import React, { useState, useEffect, useRef } from 'react';
import { 
  Coins, 
  Sparkles, 
  Layers, 
  Flame,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  CalendarCheck,
  History,
  PieChart,
  PlusCircle,
  Trash2,
  Building2,
  DollarSign
} from 'lucide-react';
import type { B3Asset, InvestmentTransaction } from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { 
  updatePortfolioWithLiveQuotes, 
  shouldAutoFetchToday, 
  getLastFetchInfo 
} from '../services/marketDataService';
import { AddTransactionModal } from './AddTransactionModal';

interface InvestmentsSectionProps {
  assets: B3Asset[];
  transactions: InvestmentTransaction[];
  onAddTransaction: (tx: InvestmentTransaction) => Promise<void> | void;
  onDeleteTransaction?: (id: string) => Promise<void> | void;
}

export const InvestmentsSection: React.FC<InvestmentsSectionProps> = ({ 
  assets,
  transactions,
  onAddTransaction,
  onDeleteTransaction
}) => {
  const [subTab, setSubTab] = useState<'overview' | 'history'>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshProgress, setRefreshProgress] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fetchInfo, setFetchInfo] = useState(getLastFetchInfo());

  const autoFetchTriggeredRef = useRef(false);

  // Consolidated Assets Calculations
  const totalInvested = assets.reduce((acc, a) => acc + (a.quantity * (a.averagePrice || a.currentPrice)), 0);
  const totalMarketValue = assets.reduce((acc, a) => acc + (a.quantity * (a.currentPrice || a.averagePrice)), 0);
  const totalProfitLoss = totalMarketValue - totalInvested;
  const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  const totalMonthlyIncome = assets.reduce((acc, a) => acc + (a.quantity * a.monthlyDividendPerShare), 0);
  const avgYield = assets.length > 0
    ? assets.reduce((acc, a) => acc + a.dividendYieldYearly, 0) / assets.length
    : 10.0;

  // Historical Transactions Calculations
  const assetMap = new Map<string, B3Asset>();
  assets.forEach(a => assetMap.set(a.ticker.toUpperCase(), a));

  const totalHistoricalInvested = transactions.reduce((acc, t) => acc + t.totalValue, 0);
  const totalHistoricalMarketVal = transactions.reduce((acc, t) => {
    const asset = assetMap.get(t.ticker.toUpperCase());
    const price = asset?.currentPrice && asset.currentPrice > 0 ? asset.currentPrice : t.price;
    return acc + (t.quantity * price);
  }, 0);
  const totalHistoricalProfit = totalHistoricalMarketVal - totalHistoricalInvested;
  const totalHistoricalProfitPercent = totalHistoricalInvested > 0 
    ? (totalHistoricalProfit / totalHistoricalInvested) * 100 
    : 0;

  const handleRefreshQuotes = async (isAuto = false) => {
    try {
      setIsRefreshing(true);
      setSuccessMessage(null);
      setRefreshProgress(isAuto ? 'Sincronização diária automática (1x/dia)...' : 'Iniciando atualização manual...');

      const { updatedCount } = await updatePortfolioWithLiveQuotes(
        assets,
        (current, total, ticker) => {
          setRefreshProgress(`Buscando cotação de ${ticker} (${current}/${total})...`);
        }
      );

      const info = getLastFetchInfo();
      setFetchInfo(info);
      const timeStr = info.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setSuccessMessage(
        isAuto
          ? `Sincronização diária concluída: ${updatedCount} ativos atualizados às ${timeStr}`
          : `Atualização manual concluída: ${updatedCount} ativos atualizados com sucesso às ${timeStr}`
      );
    } catch (err) {
      console.error('Erro ao atualizar cotações:', err);
    } finally {
      setIsRefreshing(false);
      setRefreshProgress(null);
    }
  };

  // Automatic refresh executed only ONCE per day (preserving Brapi API quota)
  useEffect(() => {
    if (assets.length > 0 && shouldAutoFetchToday() && !autoFetchTriggeredRef.current) {
      autoFetchTriggeredRef.current = true;
      handleRefreshQuotes(true);
    }
  }, [assets]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    }
    return dateStr;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Coins className="w-3.5 h-3.5" />
              <span>Mercado Nacional • B3</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>API Brapi (1x/dia auto)</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Carteira de Ações & Fundos Imobiliários (FIIs)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Construção de renda passiva mensal e patrimônio com foco na meta de <strong>R$ 25.000 em 2027</strong>.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Valor a Mercado */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[150px] text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Valor a Mercado</span>
            <span className="text-xl font-bold text-white font-mono">{formatCurrency(totalMarketValue)}</span>
            <div className="flex items-center justify-end gap-1 text-[11px] mt-0.5 font-mono">
              {totalProfitLoss >= 0 ? (
                <span className="text-emerald-400 flex items-center gap-0.5 font-semibold">
                  <TrendingUp className="w-3 h-3" /> +{formatCurrency(totalProfitLoss)} ({formatPercent(totalProfitLossPercent)})
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-0.5 font-semibold">
                  <TrendingDown className="w-3 h-3" /> {formatCurrency(totalProfitLoss)} ({formatPercent(totalProfitLossPercent)})
                </span>
              )}
            </div>
          </div>

          {/* Renda Mensal Estimada */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[150px] text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Renda Mensal</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">{formatCurrency(totalMonthlyIncome)}/mês</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5 flex items-center justify-end gap-1">
              <Sparkles className="w-3 h-3" /> Dividendos Isentos
            </span>
          </div>

          {/* DY Médio */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[130px] text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">DY Médio a.a.</span>
            <span className="text-xl font-bold text-indigo-300 font-mono">{formatPercent(avgYield)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Rentabilidade Anual</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/70 border border-slate-800 p-2.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('overview')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Carteira Consolidada & Bola de Neve</span>
          </button>

          <button
            onClick={() => setSubTab('history')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
              subTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico de Aportes & Evolução</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10">
              {transactions.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Add purchase button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Novo Aporte</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* VIEW 1: CARTEIRA CONSOLIDADA */}
      {subTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* The Magic Number (Efeito Bola de Neve) Explainer Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">O Número Mágico (Efeito Bola de Neve)</h3>
                  <p className="text-xs text-slate-400">
                    Quantas cotas você precisa para que os dividendos comprem 1 cota nova todo mês sozinho:
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                Juros Compostos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* FII 1: MXRF11 */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">MXRF11</span>
                  <span className="text-[11px] text-emerald-400 font-semibold font-mono">
                    {assetMap.get('MXRF11')?.quantity || 67} cotas em carteira
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Dividendo: <strong className="text-emerald-400">R$ 0,09/mês</strong> por cota • <span className="text-slate-400">R$ {((assetMap.get('MXRF11')?.quantity || 67) * 0.09).toFixed(2)}/mês atual</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-400">Número Mágico:</span>
                  <strong className="text-amber-400 font-mono text-sm">101 cotas (~R$ 916)</strong>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Progresso da Bola de Neve:</span>
                    <span className="text-amber-400 font-bold font-mono">66,3% (Faltam 34 cotas)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: '66.3%' }} />
                  </div>
                </div>
              </div>

              {/* FII 2: GGRC11 */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">GGRC11</span>
                  <span className="text-[11px] text-emerald-400 font-semibold font-mono">
                    {assetMap.get('GGRC11')?.quantity || 50} cotas em carteira
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Dividendo: <strong className="text-emerald-400">R$ 0,09/mês</strong> por cota • <span className="text-slate-400">R$ {((assetMap.get('GGRC11')?.quantity || 50) * 0.09).toFixed(2)}/mês atual</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-400">Número Mágico:</span>
                  <strong className="text-amber-400 font-mono text-sm">99 cotas (~R$ 885)</strong>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Progresso da Bola de Neve:</span>
                    <span className="text-amber-400 font-bold font-mono">50,5% (Faltam 49 cotas)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: '50.5%' }} />
                  </div>
                </div>
              </div>

              {/* FII 3: HGLG11 */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">HGLG11</span>
                  <span className="text-[11px] text-indigo-300 font-semibold font-mono">
                    {assetMap.get('HGLG11')?.quantity || 4} cotas em carteira
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Dividendo: <strong className="text-emerald-400">R$ 1,10/mês</strong> por cota • <span className="text-slate-400">R$ {((assetMap.get('HGLG11')?.quantity || 4) * 1.10).toFixed(2)}/mês atual</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-400">Número Mágico:</span>
                  <strong className="text-amber-400 font-mono text-sm">135 cotas (~R$ 20k)</strong>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Galpões logísticos triple-A de padrão institucional gerando renda passiva perpétua.
                </span>
              </div>
            </div>
          </div>

          {/* Assets Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-lg p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Ativos da Carteira (B3)
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{assets.length} ativos monitorados</span>
                  {fetchInfo.time && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" /> Última busca: {fetchInfo.time}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {fetchInfo.isFetchedToday ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 text-xs text-emerald-300">
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Atualizado hoje {fetchInfo.time ? `às ${fetchInfo.time}` : ''}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">1x/dia</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cotação de hoje pendente</span>
                  </div>
                )}

                <button
                  onClick={() => handleRefreshQuotes(false)}
                  disabled={isRefreshing}
                  title="Forçar atualização das cotações em tempo real da B3"
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border shadow-sm ${
                    isRefreshing
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-emerald-400 hover:shadow-emerald-500/20'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? (refreshProgress || 'Atualizando...') : 'Atualizar Cotações (Manual)'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Ticker</th>
                    <th className="py-3 px-4">Nome & Segmento</th>
                    <th className="py-3 px-4 text-right">Cotas</th>
                    <th className="py-3 px-4 text-right">Preço Médio</th>
                    <th className="py-3 px-4 text-right">Cotação B3</th>
                    <th className="py-3 px-4 text-right">Total a Mercado</th>
                    <th className="py-3 px-4 text-right">Retorno (P&L)</th>
                    <th className="py-3 px-4 text-right">Div. / Cota</th>
                    <th className="py-3 px-4 text-right">Renda Mensal</th>
                    <th className="py-3 px-4 text-right">DY a.a.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {assets.map((asset) => {
                    const marketVal = asset.quantity * (asset.currentPrice || asset.averagePrice);
                    const costVal = asset.quantity * asset.averagePrice;
                    const profitVal = marketVal - costVal;
                    const profitPercent = costVal > 0 ? (profitVal / costVal) * 100 : 0;
                    const monthlyIncome = asset.quantity * asset.monthlyDividendPerShare;

                    return (
                      <tr key={asset.ticker} className="hover:bg-slate-800/40 transition">
                        {/* Ticker & Logo */}
                        <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                          <div className="flex items-center gap-2">
                            {asset.logoUrl ? (
                              <img
                                src={asset.logoUrl}
                                alt={asset.ticker}
                                className="w-5 h-5 rounded-full object-contain bg-white/10 p-0.5 border border-slate-700"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span>{asset.ticker}</span>
                          </div>
                        </td>

                        {/* Nome & Segmento */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200">{asset.name}</div>
                          <div className="text-[10px] text-slate-500">{asset.segment}</div>
                        </td>

                        {/* Cotas */}
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                          {asset.quantity}
                        </td>

                        {/* Preço Médio */}
                        <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                          {formatCurrency(asset.averagePrice)}
                        </td>

                        {/* Cotação B3 Atual & Variação do Dia */}
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-white whitespace-nowrap">
                          <div>{formatCurrency(asset.currentPrice)}</div>
                          {typeof asset.changePercent === 'number' && asset.changePercent !== 0 && (
                            <div className={`text-[10px] flex items-center justify-end gap-0.5 ${
                              asset.changePercent > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {asset.changePercent > 0 ? '▲' : '▼'} {formatPercent(Math.abs(asset.changePercent))}
                            </div>
                          )}
                        </td>

                        {/* Total a Mercado */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                          {formatCurrency(marketVal)}
                        </td>

                        {/* Retorno P&L */}
                        <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                          <div className={`font-bold ${
                            profitVal > 0 ? 'text-emerald-400' : profitVal < 0 ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            {profitVal > 0 ? '+' : ''}{formatCurrency(profitVal)}
                          </div>
                          <div className={`text-[10px] ${
                            profitPercent > 0 ? 'text-emerald-400' : profitPercent < 0 ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            {profitPercent > 0 ? '+' : ''}{formatPercent(profitPercent)}
                          </div>
                        </td>

                        {/* Div. / Cota */}
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                          {formatCurrency(asset.monthlyDividendPerShare)}
                        </td>

                        {/* Renda Mensal */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {formatCurrency(monthlyIncome)}
                        </td>

                        {/* DY a.a. */}
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-indigo-300">
                          {formatPercent(asset.dividendYieldYearly)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Chat update hint banner */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>
                💡 <strong>Comprou novas cotas?</strong> Você pode clicar no botão <strong>"Registrar Novo Aporte"</strong> acima ou me dizer no chat (ex: <i>"Comprei 50 cotas de MXRF11 a R$ 10,18"</i>) que eu atualizo tudo na hora!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: HISTÓRICO DE APORTES & EVOLUÇÃO */}
      {subTab === 'history' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Evolution Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Aportado */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-400" /> Total Aportado Original
              </span>
              <div className="text-xl font-extrabold text-white font-mono">
                {formatCurrency(totalHistoricalInvested)}
              </div>
              <span className="text-[11px] text-slate-400 block">
                Custo de aquisição de todos os lotes
              </span>
            </div>

            {/* Card 2: Valor Atual a Mercado */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-400" /> Valor Atual a Mercado
              </span>
              <div className="text-xl font-extrabold text-white font-mono">
                {formatCurrency(totalHistoricalMarketVal)}
              </div>
              <span className="text-[11px] text-slate-400 block">
                Calculado com cotações B3 em tempo real
              </span>
            </div>

            {/* Card 3: Lucro / Prejuízo Histórico */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                {totalHistoricalProfit >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                )}
                Retorno Acumulado (P&L)
              </span>
              <div className={`text-xl font-extrabold font-mono ${
                totalHistoricalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {totalHistoricalProfit >= 0 ? '+' : ''}{formatCurrency(totalHistoricalProfit)}
              </div>
              <span className={`text-[11px] font-semibold font-mono ${
                totalHistoricalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {totalHistoricalProfit >= 0 ? '+' : ''}{formatPercent(totalHistoricalProfitPercent)} sobre o custo
              </span>
            </div>

            {/* Card 4: Ordens Registradas */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-amber-400" /> Total de Ordens
              </span>
              <div className="text-xl font-extrabold text-amber-300 font-mono">
                {transactions.length} compras
              </div>
              <span className="text-[11px] text-slate-400 block">
                Registros protegidos no Cloud Firestore
              </span>
            </div>
          </div>

          {/* Historical Orders Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-lg p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  Base Histórica de Compras & Aportes
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cada ordem executada com o custo original comparado à cotação atualizada da B3
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Novo Aporte</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Ativo (Ticker)</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Corretora</th>
                    <th className="py-3 px-4 text-right">Cotas</th>
                    <th className="py-3 px-4 text-right">Preço Pago (PM)</th>
                    <th className="py-3 px-4 text-right">Total Investido</th>
                    <th className="py-3 px-4 text-right">Cotação Atual B3</th>
                    <th className="py-3 px-4 text-right">Valor Atual Lote</th>
                    <th className="py-3 px-4 text-right">Retorno (P&L)</th>
                    <th className="py-3 px-4">Observações</th>
                    {onDeleteTransaction && <th className="py-3 px-4 text-center">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.map((tx) => {
                    const asset = assetMap.get(tx.ticker.toUpperCase());
                    const currentPrice = asset?.currentPrice && asset.currentPrice > 0 ? asset.currentPrice : tx.price;
                    const currentMarketVal = tx.quantity * currentPrice;
                    const profitVal = currentMarketVal - tx.totalValue;
                    const profitPercent = tx.totalValue > 0 ? (profitVal / tx.totalValue) * 100 : 0;

                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        {/* Data */}
                        <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>

                        {/* Ticker & Logo */}
                        <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {asset?.logoUrl ? (
                              <img
                                src={asset.logoUrl}
                                alt={tx.ticker}
                                className="w-5 h-5 rounded-full object-contain bg-white/10 p-0.5 border border-slate-700"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span>{tx.ticker}</span>
                          </div>
                        </td>

                        {/* Tipo */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            tx.type === 'compra'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {tx.type}
                          </span>
                        </td>

                        {/* Corretora */}
                        <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            {tx.broker || 'Nubank'}
                          </span>
                        </td>

                        {/* Cotas */}
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                          {tx.quantity}
                        </td>

                        {/* Preço Pago (PM do lote) */}
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                          {formatCurrency(tx.price)}
                        </td>

                        {/* Total Investido Original */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                          {formatCurrency(tx.totalValue)}
                        </td>

                        {/* Cotação Atual B3 */}
                        <td className="py-3.5 px-4 text-right font-mono text-slate-200 whitespace-nowrap">
                          {formatCurrency(currentPrice)}
                        </td>

                        {/* Valor Atual do Lote */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                          {formatCurrency(currentMarketVal)}
                        </td>

                        {/* Retorno P&L */}
                        <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                          <div className={`font-bold ${
                            profitVal > 0 ? 'text-emerald-400' : profitVal < 0 ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            {profitVal > 0 ? '+' : ''}{formatCurrency(profitVal)}
                          </div>
                          <div className={`text-[10px] ${
                            profitPercent > 0 ? 'text-emerald-400' : profitPercent < 0 ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            {profitPercent > 0 ? '+' : ''}{formatPercent(profitPercent)}
                          </div>
                        </td>

                        {/* Observações */}
                        <td className="py-3.5 px-4 text-[11px] text-slate-400 max-w-[160px] truncate" title={tx.notes}>
                          {tx.notes || '-'}
                        </td>

                        {/* Ações (Excluir) */}
                        {onDeleteTransaction && (
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                if (window.confirm(`Deseja realmente remover o registro de compra de ${tx.quantity} cotas de ${tx.ticker}?`)) {
                                  onDeleteTransaction(tx.id);
                                }
                              }}
                              title="Excluir transação"
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Historical Footer */}
            <div className="pt-2 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800/80">
              <span>
                Mostrando todas as <strong>{transactions.length}</strong> ordens de compra executadas.
              </span>
              <span>
                Total Aportado: <strong className="text-white font-mono">{formatCurrency(totalHistoricalInvested)}</strong> • Valor a Mercado: <strong className="text-emerald-400 font-mono">{formatCurrency(totalHistoricalMarketVal)}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        existingAssets={assets}
        onAddTransaction={async (tx) => {
          await onAddTransaction(tx);
          setSuccessMessage(`Nova compra de ${tx.quantity} cotas de ${tx.ticker} registrada com sucesso!`);
        }}
      />
    </div>
  );
};
