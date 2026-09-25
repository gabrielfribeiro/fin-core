import React from 'react';
import { 
  Coins, 
  Sparkles, 
  Layers, 
  Flame
} from 'lucide-react';
import type { B3Asset } from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface InvestmentsSectionProps {
  assets: B3Asset[];
}

export const InvestmentsSection: React.FC<InvestmentsSectionProps> = ({ assets }) => {
  const totalInvested = assets.reduce((acc, a) => acc + (a.quantity * (a.averagePrice || a.currentPrice)), 0);
  const totalMonthlyIncome = assets.reduce((acc, a) => acc + (a.quantity * a.monthlyDividendPerShare), 0);
  const avgYield = assets.length > 0
    ? assets.reduce((acc, a) => acc + a.dividendYieldYearly, 0) / assets.length
    : 10.0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>Mercado Nacional • B3</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Carteira de Ações & Fundos Imobiliários (FIIs)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Construção de renda passiva mensal e patrimônio com foco na meta de <strong>R$ 25.000 em 2027</strong>.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[150px] text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Total Investido</span>
            <span className="text-xl font-bold text-white font-mono">{formatCurrency(totalInvested)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Meta 2027: {formatCurrency(25000)}</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[150px] text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Renda Mensal</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">{formatCurrency(totalMonthlyIncome)}/mês</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5 flex items-center justify-end gap-1">
              <Sparkles className="w-3 h-3" /> Dividendos Isentos
            </span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[130px] text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">DY Médio a.a.</span>
            <span className="text-xl font-bold text-indigo-300 font-mono">{formatPercent(avgYield)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Rentabilidade Anual</span>
          </div>
        </div>
      </div>

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
              <span className="text-[11px] text-emerald-400 font-semibold font-mono">67 cotas em carteira</span>
            </div>
            <div className="text-xs text-slate-300">
              Dividendo: <strong className="text-emerald-400">R$ 0,09/mês</strong> por cota • <span className="text-slate-400">R$ 6,03/mês atual</span>
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
              <span className="text-[11px] text-emerald-400 font-semibold font-mono">50 cotas em carteira</span>
            </div>
            <div className="text-xs text-slate-300">
              Dividendo: <strong className="text-emerald-400">R$ 0,09/mês</strong> por cota • <span className="text-slate-400">R$ 4,50/mês atual</span>
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
              <span className="text-[11px] text-indigo-300 font-semibold font-mono">4 cotas em carteira</span>
            </div>
            <div className="text-xs text-slate-300">
              Dividendo: <strong className="text-emerald-400">R$ 1,10/mês</strong> por cota • <span className="text-slate-400">R$ 4,40/mês atual</span>
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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Ativos da Carteira (B3)
            </h3>
            <span className="text-xs text-slate-400">FIIs e Ações monitoradas para aportes</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
            {assets.length} ativos cadastrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Ticker</th>
                <th className="py-3 px-4">Nome & Segmento</th>
                <th className="py-3 px-4 text-center">Tipo</th>
                <th className="py-3 px-4 text-right">Cotas</th>
                <th className="py-3 px-4 text-right">Preço Cota</th>
                <th className="py-3 px-4 text-right">Total Investido</th>
                <th className="py-3 px-4 text-right">Div. / Cota</th>
                <th className="py-3 px-4 text-right">Renda Mensal</th>
                <th className="py-3 px-4 text-right">DY a.a.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assets.map((asset) => {
                const totalVal = asset.quantity * (asset.averagePrice || asset.currentPrice);
                const monthlyIncome = asset.quantity * asset.monthlyDividendPerShare;

                return (
                  <tr key={asset.ticker} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                      {asset.ticker}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{asset.name}</div>
                      <div className="text-[10px] text-slate-500">{asset.segment}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        asset.type === 'fii'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {asset.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                      {asset.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {formatCurrency(asset.currentPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatCurrency(totalVal)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                      {formatCurrency(asset.monthlyDividendPerShare)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(monthlyIncome)}
                    </td>
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
            💡 <strong>Comprou novas cotas?</strong> É só me dizer no chat (ex: <i>"Comprei 50 cotas de MXRF11 a R$ 10,18"</i>) e eu atualizo a sua carteira e o dividendo estimado na hora!
          </span>
        </div>
      </div>
    </div>
  );
};
