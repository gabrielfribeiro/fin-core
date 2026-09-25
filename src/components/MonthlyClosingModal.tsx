import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  PiggyBank, 
  LineChart, 
  ArrowRight, 
  Copy,
  CalendarCheck,
  Calculator,
  Plus,
  Trash2,
  Car,
  Building,
  CreditCard,
  Wallet,
  Coins,
  Check,
  X
} from 'lucide-react';
import type { MonthlyRecord } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface MonthlyClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonthId: string;
  selectedMonthLabel: string;
  currentRecord?: MonthlyRecord;
  onConfirmClosing: (
    monthId: string,
    salary: number,
    extraIncome: number,
    car: number,
    apartment: number,
    itauCard: number,
    nubank: number,
    reserveAmount: number,
    b3Amount: number,
    liquidAccount: number,
    savingsItau: number
  ) => void;
}

type FieldKey = 'salary' | 'extraIncome' | 'car' | 'apartment' | 'itauCard' | 'nubank';

interface FieldConfig {
  key: FieldKey;
  label: string;
  category: 'income' | 'expense';
  icon: React.ElementType;
  color: string;
  placeholder: string;
  helperText: string;
}

const FIELD_CONFIGS: FieldConfig[] = [
  {
    key: 'salary',
    label: 'Salário Líquido (Dia 25)',
    category: 'income',
    icon: Wallet,
    color: 'emerald',
    placeholder: '0,00',
    helperText: 'Salário líquido creditado no dia 25'
  },
  {
    key: 'extraIncome',
    label: 'Renda Extra / PLR',
    category: 'income',
    icon: Coins,
    color: 'emerald',
    placeholder: '0,00',
    helperText: 'Adiantamento de PLR, bônus ou receitas extras'
  },
  {
    key: 'car',
    label: 'Financiamento do Carro',
    category: 'expense',
    icon: Car,
    color: 'rose',
    placeholder: '0,00',
    helperText: 'Parcela mensal do veículo'
  },
  {
    key: 'apartment',
    label: 'Apartamento (Caixa + MRV)',
    category: 'expense',
    icon: Building,
    color: 'rose',
    placeholder: '0,00',
    helperText: 'Juros de obra da Caixa + boletos da MRV'
  },
  {
    key: 'itauCard',
    label: 'Fatura Cartão Itaú',
    category: 'expense',
    icon: CreditCard,
    color: 'amber',
    placeholder: '0,00',
    helperText: 'Fatura fechada para pagamento no dia 28'
  },
  {
    key: 'nubank',
    label: 'Fatura Cartão Nubank',
    category: 'expense',
    icon: CreditCard,
    color: 'purple',
    placeholder: '0,00',
    helperText: 'Fatura do cartão Nubank'
  }
];

export const MonthlyClosingModal: React.FC<MonthlyClosingModalProps> = ({
  isOpen,
  onClose,
  selectedMonthId,
  selectedMonthLabel,
  currentRecord,
  onConfirmClosing
}) => {
  // Store items array for each field - dynamically loaded from Firestore record or empty
  const [fieldItems, setFieldItems] = useState<Record<FieldKey, number[]>>({
    salary: [],
    extraIncome: [],
    car: [],
    apartment: [],
    itauCard: [],
    nubank: []
  });

  const [liquidAccount, setLiquidAccount] = useState<number>(0);
  const [savingsItau, setSavingsItau] = useState<number>(0);

  // Sync state whenever modal opens or currentRecord updates
  useEffect(() => {
    if (isOpen) {
      if (currentRecord) {
        setFieldItems({
          salary: currentRecord.salary > 0 ? [currentRecord.salary] : [],
          extraIncome: currentRecord.extraIncome > 0 ? [currentRecord.extraIncome] : [],
          car: currentRecord.car > 0 ? [currentRecord.car] : [],
          apartment: currentRecord.apartment > 0 ? [currentRecord.apartment] : [],
          itauCard: currentRecord.itau > 0 ? [currentRecord.itau] : [],
          nubank: currentRecord.nubank > 0 ? [currentRecord.nubank] : []
        });
        setLiquidAccount(currentRecord.liquidAccount || 0);
        setSavingsItau(currentRecord.savingsItau || 0);
      } else {
        setFieldItems({
          salary: [],
          extraIncome: [],
          car: [],
          apartment: [],
          itauCard: [],
          nubank: []
        });
        setLiquidAccount(0);
        setSavingsItau(0);
      }
    }
  }, [isOpen, currentRecord]);

  // State for the active multi-sum calculator popover/modal
  const [activeCalcField, setActiveCalcField] = useState<FieldKey | null>(null);
  const [newSubValue, setNewSubValue] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Compute total for each field
  const getFieldTotal = (key: FieldKey): number => {
    const items = fieldItems[key] || [];
    return items.reduce((acc, val) => acc + val, 0);
  };

  const salary = getFieldTotal('salary');
  const extraIncome = getFieldTotal('extraIncome');
  const car = getFieldTotal('car');
  const apartment = getFieldTotal('apartment');
  const itauCard = getFieldTotal('itauCard');
  const nubank = getFieldTotal('nubank');

  const totalIncome = salary + extraIncome;
  const totalExpenses = car + apartment + itauCard + nubank;
  const surplus = Math.max(totalIncome - totalExpenses, 0);

  // 50% to emergency reserve, 50% to B3
  const reserveAllocation = surplus * 0.5;
  const b3Allocation = surplus * 0.5;

  // Handle adding a sub-value in calculator
  const handleAddSubValue = () => {
    if (!activeCalcField) return;
    const parsed = parseFloat(newSubValue.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      setFieldItems(prev => ({
        ...prev,
        [activeCalcField]: [...prev[activeCalcField], parsed]
      }));
      setNewSubValue('');
    }
  };

  // Handle removing a sub-value
  const handleRemoveSubValue = (field: FieldKey, index: number) => {
    setFieldItems(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Handle clearing all values of a field
  const handleClearField = (field: FieldKey) => {
    setFieldItems(prev => ({
      ...prev,
      [field]: []
    }));
  };

  // Handle direct manual input or expression evaluation (e.g. "100 + 50 + 20")
  const handleDirectInput = (field: FieldKey, rawText: string) => {
    // If it contains '+', evaluate expression
    if (rawText.includes('+')) {
      const parts = rawText.split('+').map(p => parseFloat(p.trim().replace(',', '.'))).filter(p => !isNaN(p));
      if (parts.length > 0) {
        setFieldItems(prev => ({
          ...prev,
          [field]: parts
        }));
        return;
      }
    }
    const val = parseFloat(rawText.replace(',', '.'));
    if (!isNaN(val)) {
      setFieldItems(prev => ({
        ...prev,
        [field]: [val]
      }));
    } else if (rawText.trim() === '') {
      setFieldItems(prev => ({
        ...prev,
        [field]: []
      }));
    }
  };

  const chatMessage = `Fechamento do Dia 25 (${selectedMonthLabel}):
- Salário Líquido: ${formatCurrency(salary)}
- Renda Extra / PLR: ${formatCurrency(extraIncome)}
- Total de Receitas: ${formatCurrency(totalIncome)}
- Financiamento Carro: ${formatCurrency(car)}
- Apartamento (Caixa + MRV): ${formatCurrency(apartment)}
- Fatura Cartão Itaú: ${formatCurrency(itauCard)}
- Fatura Nubank: ${formatCurrency(nubank)}
- Total de Despesas: ${formatCurrency(totalExpenses)}
- Sobra Líquida: ${formatCurrency(surplus)}
- Saldo em Conta Corrente: ${formatCurrency(liquidAccount)}
- Guardado no Itaú (Reserva): ${formatCurrency(savingsItau)}
- Patrimônio Imediato: ${formatCurrency(liquidAccount + savingsItau)}
- Sugestão Reserva de Emergência (50%): ${formatCurrency(reserveAllocation)}
- Sugestão Carteira B3 (50%): ${formatCurrency(b3Allocation)}`;

  const handleCopyChat = () => {
    navigator.clipboard.writeText(chatMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onConfirmClosing(
      selectedMonthId,
      salary,
      extraIncome,
      car,
      apartment,
      itauCard,
      nubank,
      reserveAllocation,
      b3Allocation,
      liquidAccount,
      savingsItau
    );
    onClose();
  };

  const activeConfig = FIELD_CONFIGS.find(f => f.key === activeCalcField);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-6 my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Fechamento do Mês: <span className="text-emerald-400 font-bold">{selectedMonthLabel}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Consolidação das contas pagas e destinação da sobra (50% Reserva / 50% B3) no Cloud Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Inputs with Multi-Sum Calculators */}
        <div className="space-y-4">
          
          {/* Section 1: Receitas (Salário + Renda Extra) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Receitas do Mês
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Subtotal: {formatCurrency(totalIncome)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FIELD_CONFIGS.filter(f => f.category === 'income').map((config) => {
                const total = getFieldTotal(config.key);
                const count = fieldItems[config.key]?.length || 0;
                const Icon = config.icon;

                return (
                  <div key={config.key} className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 space-y-2 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-emerald-400" />
                        {config.label}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCalcField(config.key);
                          setNewSubValue('');
                        }}
                        className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium transition cursor-pointer"
                        title="Abrir calculadora para somar múltiplos valores"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>{count > 1 ? `${count} valores` : '+ Somar'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={total || ''}
                        onChange={(e) => handleDirectInput(config.key, e.target.value)}
                        placeholder={config.placeholder}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Chips preview of sub-values if more than 1 */}
                    {count > 1 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {fieldItems[config.key].map((val, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {formatCurrency(val)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Despesas (Carro + AP + Fatura) */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Despesas Fixas & Fatura
              </span>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                Subtotal: {formatCurrency(totalExpenses)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FIELD_CONFIGS.filter(f => f.category === 'expense').map((config) => {
                const total = getFieldTotal(config.key);
                const count = fieldItems[config.key]?.length || 0;
                const Icon = config.icon;

                return (
                  <div key={config.key} className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 space-y-2 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 line-clamp-1">
                        <Icon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{config.label}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCalcField(config.key);
                          setNewSubValue('');
                        }}
                        className="text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium transition cursor-pointer shrink-0 ml-1"
                        title="Abrir calculadora para somar múltiplos valores"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>{count > 1 ? `${count} itens` : '+ Somar'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={total || ''}
                        onChange={(e) => handleDirectInput(config.key, e.target.value)}
                        placeholder={config.placeholder}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    {/* Chips preview of sub-values if more than 1 */}
                    {count > 1 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {fieldItems[config.key].map((val, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {formatCurrency(val)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Saldos Reais em Caixa e Reserva */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" /> Saldos e Reserva Atual
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Saldo em Conta Corrente:</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={liquidAccount || ''}
                    onChange={(e) => setLiquidAccount(parseFloat(e.target.value) || 0)}
                    placeholder="9200.30"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Guardado no Itaú (Reserva):</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={savingsItau || ''}
                    onChange={(e) => setSavingsItau(parseFloat(e.target.value) || 0)}
                    placeholder="3144.72"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Result / Net Surplus */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Total de Despesas:</span>
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
          <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-300 font-bold flex items-center gap-1.5">
                <PiggyBank className="w-3.5 h-3.5" /> 50% na Reserva
              </span>
              <strong className="text-white font-mono">{formatCurrency(reserveAllocation)}</strong>
            </div>
            <span className="text-[10px] text-slate-400 block">Guardar no Itaú (Liquidez Diária / CDI)</span>
          </div>

          {/* 50% Investments B3 */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                <LineChart className="w-3.5 h-3.5" /> 50% em FIIs & Ações
              </span>
              <strong className="text-white font-mono">{formatCurrency(b3Allocation)}</strong>
            </div>
            <span className="text-[10px] text-slate-400 block">Comprar cotas na B3 para renda passiva mensal</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <button
            onClick={handleCopyChat}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copiado para o Chat!' : 'Copiar Resumo para o Chat'}</span>
          </button>

          <button
            onClick={handleApply}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <span>Confirmar Fechamento ({selectedMonthLabel})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Multi-Sum Calculator Popover Modal */}
      {activeCalcField && activeConfig && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{activeConfig.label}</h4>
                  <span className="text-[11px] text-slate-400">Somar múltiplos valores</span>
                </div>
              </div>
              <button
                onClick={() => setActiveCalcField(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Input to add a new value */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400">
                Digite um valor e aperte Enter ou clique em (+):
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    autoFocus
                    value={newSubValue}
                    onChange={(e) => setNewSubValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubValue();
                      }
                    }}
                    placeholder="0,00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSubValue}
                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            {/* List of currently added values */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Valores somados ({fieldItems[activeCalcField]?.length || 0}):</span>
                {fieldItems[activeCalcField]?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleClearField(activeCalcField)}
                    className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Limpar tudo
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/40">
                {fieldItems[activeCalcField]?.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    Nenhum valor adicionado ainda. Digite acima para começar a somar!
                  </div>
                ) : (
                  fieldItems[activeCalcField].map((val, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                      <span className="text-slate-400 font-mono">Item {idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <strong className="text-white font-mono font-bold">
                          {formatCurrency(val)}
                        </strong>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubValue(activeCalcField, idx)}
                          className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition cursor-pointer"
                          title="Remover valor"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Total Sum & Apply Button */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Soma Total do Campo:</span>
              <strong className="text-base font-extrabold text-emerald-400 font-mono">
                {formatCurrency(getFieldTotal(activeCalcField))}
              </strong>
            </div>

            <button
              type="button"
              onClick={() => setActiveCalcField(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Concluir e Aplicar Soma
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
