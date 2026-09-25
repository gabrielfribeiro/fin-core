import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Coins, 
  Calendar, 
  Building2, 
  Hash, 
  DollarSign, 
  FileText,
  Sparkles
} from 'lucide-react';
import type { B3Asset, InvestmentTransaction } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingAssets: B3Asset[];
  onAddTransaction: (tx: InvestmentTransaction) => Promise<void> | void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  existingAssets,
  onAddTransaction
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [ticker, setTicker] = useState<string>('MXRF11');
  const [customTicker, setCustomTicker] = useState<string>('');
  const [isCustomTicker, setIsCustomTicker] = useState<boolean>(false);
  const [date, setDate] = useState<string>(todayStr);
  const [quantity, setQuantity] = useState<string>('10');
  const [unitPrice, setUnitPrice] = useState<string>('10.00');
  const [broker, setBroker] = useState<string>('Nubank');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolvedTicker = isCustomTicker ? customTicker.trim().toUpperCase() : ticker;
  const numQuantity = parseFloat(quantity) || 0;
  const numPrice = parseFloat(unitPrice.replace(',', '.')) || 0;
  const totalValue = numQuantity * numPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resolvedTicker) {
      setError('Por favor, informe o código do ativo (Ticker).');
      return;
    }

    if (numQuantity <= 0) {
      setError('A quantidade de cotas deve ser maior que zero.');
      return;
    }

    if (numPrice <= 0) {
      setError('O preço unitário por cota deve ser maior que zero.');
      return;
    }

    try {
      setIsSubmitting(true);

      const newTx: InvestmentTransaction = {
        id: `tx_${Date.now()}_${resolvedTicker.toLowerCase()}`,
        ticker: resolvedTicker,
        date: date || todayStr,
        type: 'compra',
        quantity: numQuantity,
        price: numPrice,
        totalValue: totalValue,
        broker: broker.trim() || 'Nubank',
        notes: notes.trim() || `Aporte de ${numQuantity} cotas a ${formatCurrency(numPrice)}`,
        createdAt: new Date().toISOString()
      };

      await onAddTransaction(newTx);
      onClose();
    } catch (err: any) {
      console.error('Erro ao adicionar transação:', err);
      setError(err?.message || 'Falha ao salvar ordem de compra no Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Registrar Novo Aporte / Compra</h3>
              <p className="text-xs text-slate-400">Adicione uma ordem de compra para a base histórica e consolidação</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ticker Selection */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-400" /> Ativo / Ticker
              </label>
              <button
                type="button"
                onClick={() => setIsCustomTicker(!isCustomTicker)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
              >
                {isCustomTicker ? 'Escolher da carteira' : '+ Outro ticker B3'}
              </button>
            </div>

            {isCustomTicker ? (
              <input
                type="text"
                value={customTicker}
                onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
                placeholder="Ex: HGLG11, PETR4, ITUB4..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:border-emerald-500 transition"
                required
              />
            ) : (
              <select
                value={ticker}
                onChange={(e) => {
                  setTicker(e.target.value);
                  const found = existingAssets.find(a => a.ticker === e.target.value);
                  if (found) {
                    setUnitPrice(found.currentPrice > 0 ? found.currentPrice.toFixed(2) : found.averagePrice.toFixed(2));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition"
              >
                {existingAssets.map((asset) => (
                  <option key={asset.ticker} value={asset.ticker}>
                    {asset.ticker} - {asset.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Data da Compra */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Data da Compra
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>

            {/* Corretora */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Corretora / Conta
              </label>
              <select
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="Nubank">Nubank (NuInvest)</option>
                <option value="Itaú">Itaú (Íon)</option>
                <option value="XP Investimentos">XP Investimentos</option>
                <option value="BTG Pactual">BTG Pactual</option>
                <option value="Outra">Outra Corretora</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantidade de Cotas */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Quantidade de Cotas
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition"
                placeholder="Ex: 5"
                required
              />
            </div>

            {/* Preço Unitário */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Preço Unitário Pago (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition"
                placeholder="Ex: 9.07"
                required
              />
            </div>
          </div>

          {/* Resumo do Aporte */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Total do Aporte:
            </span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {formatCurrency(totalValue)}
            </span>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Observações (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Aporte mensal com sobra do salário"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Compra no Firestore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
