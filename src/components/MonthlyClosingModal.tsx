import React, { useState } from 'react';
import { 
  Sparkles, 
  PiggyBank, 
  LineChart, 
  ArrowRight, 
  Copy,
  CalendarCheck
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface MonthlyClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClosing: (salary: number, bills: number, itauCard: number, reserveAmount: number, b3Amount: number) => void;
}

export const MonthlyClosingModal: React.FC<MonthlyClosingModalProps> = ({
  isOpen,
  onClose,
  onConfirmClosing
}) => {
  const [salary, setSalary] = useState<number>(10373.92);
  const [fixedBills, setFixedBills] = useState<number>(3633.94); // Carro + MRV
  const [itauCard, setItauCard] = useState<number>(4177.82); // Fatura fechada 21/09/2026
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalExpenses = fixedBills + itauCard;
  const surplus = Math.max(salary - totalExpenses, 0);

  // 50% to reserve, 50% to B3
  const reserveAllocation = surplus * 0.5;
  const b3Allocation = surplus * 0.5;

  const chatMessage = `Fechamento do dia 25 para Outubro/2026:
- Salário recebido: ${formatCurrency(salary)}
- Contas fixas (Carro + AP): ${formatCurrency(fixedBills)}
- Fatura Cartão Itaú: ${formatCurrency(itauCard)}
- Sobra líquida: ${formatCurrency(surplus)}
- Aporte Reserva de Emergência: ${formatCurrency(reserveAllocation)}
- Aporte Carteira B3 (Ações & FIIs): ${formatCurrency(b3Allocation)}`;

  const handleCopyChat = () => {
    navigator.clipboard.writeText(chatMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onConfirmClosing(salary, fixedBills, itauCard, reserveAllocation, b3Allocation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Fechamento Guiado do Dia 25
              </h3>
              <span className="text-xs text-slate-400">
                Pague as contas e destine 100% da sobra para Reserva e FIIs
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">1. Salário do Dia 25 (R$)</label>
            <input
              type="number"
              step="0.01"
              value={salary}
              onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">2. Fixos (Carro + AP) (R$)</label>
            <input
              type="number"
              step="0.01"
              value={fixedBills}
              onChange={(e) => setFixedBills(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">3. Fatura Itaú (R$)</label>
            <input
              type="number"
              step="0.01"
              value={itauCard}
              onChange={(e) => setItauCard(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Calculation Result */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Total de Despesas do Mês:</span>
            <strong className="text-rose-400 font-mono">{formatCurrency(totalExpenses)}</strong>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
            <span className="text-white font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Sobra Líquida para Investir:
            </span>
            <strong className="text-base font-extrabold text-emerald-400 font-mono">
              {formatCurrency(surplus)}
            </strong>
          </div>
        </div>

        {/* The 50/50 Split Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 50% Reserve */}
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-300 font-bold flex items-center gap-1">
                <PiggyBank className="w-3.5 h-3.5" /> 50% na Reserva
              </span>
              <strong className="text-white font-mono">{formatCurrency(reserveAllocation)}</strong>
            </div>
            <span className="text-[10px] text-slate-400 block">Guardar no Itaú (Liquidez Diária / CDI)</span>
          </div>

          {/* 50% Investments B3 */}
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-300 font-bold flex items-center gap-1">
                <LineChart className="w-3.5 h-3.5" /> 50% em FIIs & Ações
              </span>
              <strong className="text-white font-mono">{formatCurrency(b3Allocation)}</strong>
            </div>
            <span className="text-[10px] text-slate-400 block">Comprar cotas na B3 para dividendos mensais</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={handleCopyChat}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copiado para o Chat!' : 'Copiar Texto para Enviar no Chat'}</span>
          </button>

          <button
            onClick={handleApply}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <span>Confirmar Fechamento</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
