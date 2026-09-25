import React, { useState } from 'react';
import { 
  Car, 
  Building, 
  CalendarClock, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  TrendingDown, 
  FileText,
  BadgePercent,
  Sparkles
} from 'lucide-react';
import type { FinancingContract, MRVInstallment } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface FinancingSectionProps {
  contracts: FinancingContract[];
  mrvSchedule: MRVInstallment[];
}

export const FinancingSection: React.FC<FinancingSectionProps> = ({ contracts, mrvSchedule }) => {
  const [filterClass, setFilterClass] = useState<'all' | 'Certo' | 'Condicional'>('all');

  const carContract = contracts.find(c => c.category === 'carro') || contracts[0];
  const caixaContract = contracts.find(c => c.category === 'apartamento_caixa') || contracts[1];
  const mrvContract = contracts.find(c => c.category === 'apartamento_mrv') || contracts[2];

  const totalDebt = contracts.reduce((acc, c) => acc + c.totalBalance, 0);
  const totalMonthlyCommitment = contracts.reduce((acc, c) => acc + c.monthlyPayment, 0);

  // Certain installments that are still pending
  const pendingCertainInstallments = mrvSchedule.filter(i => i.classification === 'Certo' && i.status !== 'pago');
  const mrvCertainTotal = pendingCertainInstallments.reduce((acc, i) => acc + i.value, 0);
  const mrvConditionalTotal = mrvSchedule
    .filter(i => i.classification === 'Condicional')
    .reduce((acc, i) => acc + i.value, 0);

  // Next pending installment
  const nextPendingInstallment = pendingCertainInstallments[0];

  const filteredSchedule = mrvSchedule.filter(item => {
    if (filterClass === 'all') return true;
    return item.classification === filterClass;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-semibold border border-rose-500/20 mb-2">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Passivos & Financiamentos Ativos</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gestão de Dívidas & Cronogramas
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Acompanhamento consolidado do financiamento do veículo, financiamento habitacional CAIXA e parcelamento de entrada MRV.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-w-[170px] text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Saldo Devedor Total</span>
            <span className="text-xl font-bold text-rose-400 font-mono">{formatCurrency(totalDebt)}</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-w-[170px] text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Compromisso Mensal Atual</span>
            <span className="text-xl font-bold text-amber-300 font-mono">{formatCurrency(totalMonthlyCommitment)}/mês</span>
          </div>
        </div>
      </div>

      {/* Contract Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Carro */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
              {carContract?.remainingInstallments || 44}x Restantes
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Financiamento do Carro</h3>
            <span className="text-xs text-slate-400">{carContract?.institution || 'Banco Financiador'}</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Saldo Devedor:</span>
              <strong className="text-white font-mono">{formatCurrency(carContract?.totalBalance)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Valor da Parcela:</span>
              <strong className="text-amber-300 font-mono">{formatCurrency(carContract?.monthlyPayment)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Prazo Restante:</span>
              <span className="text-slate-200 font-medium">
                {carContract?.remainingInstallments || 44} meses (~{(Number(carContract?.remainingInstallments || 44) / 12).toFixed(1)} anos)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            💡 <strong>Status do Ciclo:</strong> Parcela do dia 25 paga com sucesso. Saldo devedor abatido.
          </div>
        </div>

        {/* Card 2: CAIXA - Juros de Obra */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Building className="w-5 h-5" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
              Em Obras
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">AP - Juros de Obra</h3>
            <span className="text-xs text-slate-400">{caixaContract?.institution || 'CAIXA Econômica Federal'}</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Saldo Financiado:</span>
              <strong className="text-white font-mono">{formatCurrency(caixaContract?.totalBalance)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Juro de Obra do Mês:</span>
              <strong className="text-amber-300 font-mono">{formatCurrency(caixaContract?.monthlyPayment || 2113.43)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Taxa Contratual:</span>
              <strong className="text-emerald-400 font-mono flex items-center gap-1">
                <BadgePercent className="w-3.5 h-3.5" /> {caixaContract?.interestRate || '0,72% a.m.'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amortização Principal:</span>
              <span className="text-cyan-300 font-medium">Inicia na entrega (2027)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            🏗️ <strong>Juros de Obra:</strong> Quitado no fechamento do dia 25. Evolui proporcionalmente à medição da construtora.
          </div>
        </div>

        {/* Card 3: MRV - Entrada */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CalendarClock className="w-5 h-5" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              {pendingCertainInstallments.length} parcelas certas
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Entrada & Taxas ITBI</h3>
            <span className="text-xs text-slate-400">{mrvContract?.institution || 'MRV Engenharia'}</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Certo Restante:</span>
              <strong className="text-emerald-400 font-mono">{formatCurrency(mrvCertainTotal)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Próximo Vencimento:</span>
              <strong className="text-amber-300 font-mono">
                {nextPendingInstallment ? `${nextPendingInstallment.dueDate} (${formatCurrency(nextPendingInstallment.value)})` : 'Quitado'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Desconto Adimplência:</span>
              <strong className="text-indigo-400 font-mono">{formatCurrency(mrvConditionalTotal)}</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            🎯 <strong>Boletos Quitados:</strong> As parcelas de Outubro (R$ 697,06 + R$ 370,94) foram quitadas! Restam {pendingCertainInstallments.length} parcelas certas até Mar/27.
          </div>
        </div>
      </div>

      {/* Strategic Insights / Callouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Callout 1: Parcela Condicional FP02 */}
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            Ponto de Atenção: Parcela FP02 de R$ 8.450,00 (08/04/2027)
          </div>
          <p className="leading-relaxed text-slate-300">
            A MRV classifica essa parcela como <strong>"Desconto sobre adimplência"</strong>. Se todas as parcelas forem pagas rigorosamente em dia, ela costuma ser abatida integralmente pela construtora. 
          </p>
          <p className="text-amber-300 font-medium">
            💡 <strong>Ação Recomendada:</strong> Manter todos os pagamentos em dia e, no início de 2027, abrir um protocolo de atendimento na MRV confirmando o abatimento completo para não ter surpresas na entrega das chaves.
          </p>
        </div>

        {/* Callout 2: Transição de Caixa em 2027 */}
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            Estratégia: Alívio de Caixa na Entrega das Chaves
          </div>
          <p className="leading-relaxed text-slate-300">
            A última parcela certa da entrada (M022) ocorre em <strong>08/03/2027</strong>. A partir de Abril/2027, os <strong>R$ 1.063/mês</strong> que você paga hoje para a MRV ficam totalmente livres!
          </p>
          <p className="text-emerald-300 font-medium">
            🎯 <strong>Destinação Inteligente:</strong> Esse valor liberado será perfeito para cobrir os eletros restantes e absorver a transição para a parcela de financiamento da CAIXA.
          </p>
        </div>
      </div>

      {/* Detailed MRV Schedule Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Cronograma Detalhado da Entrada MRV (Out/2026 a Abr/2027)
            </h3>
            <span className="text-xs text-slate-400">
              Vencimentos exatos de entrada mensal, parcelas de ITBI e bônus de pontualidade
            </span>
          </div>

          {/* Filter badges */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setFilterClass('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                filterClass === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({mrvSchedule.length})
            </button>
            <button
              onClick={() => setFilterClass('Certo')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                filterClass === 'Certo'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Certas Restantes ({formatCurrency(mrvCertainTotal)})
            </button>
            <button
              onClick={() => setFilterClass('Condicional')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                filterClass === 'Condicional'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Condicional ({formatCurrency(mrvConditionalTotal)})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4">Tipo / Descrição</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Classificação</th>
                <th className="py-3 px-4">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSchedule.map((item, idx) => {
                const isCertain = item.classification === 'Certo';
                const isPaid = item.status === 'pago';
                const isNext = !isPaid && item.code === nextPendingInstallment?.code;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-800/40 transition ${
                      isNext ? 'bg-amber-500/5' : isPaid ? 'bg-slate-950/40 opacity-75' : ''
                    }`}
                  >
                    {/* Código */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={isPaid ? 'line-through text-slate-500' : ''}>{item.code}</span>
                        {isNext && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            Próxima
                          </span>
                        )}
                        {isPaid && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            Quitado
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Vencimento */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-200">
                      <span className={isPaid ? 'text-slate-500' : ''}>{item.dueDate}</span>
                    </td>

                    {/* Descrição */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                      <span className={isPaid ? 'text-slate-500' : ''}>{item.description}</span>
                    </td>

                    {/* Valor */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                      <span className={isPaid ? 'text-emerald-400 font-semibold' : isCertain ? 'text-white' : 'text-amber-400'}>
                        {formatCurrency(item.value)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Pago {item.paidAt ? `(${item.paidAt})` : ''}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                          Pendente
                        </span>
                      )}
                    </td>

                    {/* Classificação */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {isCertain ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          Certo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          <HelpCircle className="w-3 h-3" /> Condicional
                        </span>
                      )}
                    </td>

                    {/* Observações */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                      {item.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
          <span>
            Total Certo Restante: <strong className="text-emerald-400">{formatCurrency(mrvCertainTotal)}</strong>
          </span>
          <span>
            Valor Condicional Adimplência: <strong className="text-amber-400">{formatCurrency(mrvConditionalTotal)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
