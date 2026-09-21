import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  KeyRound, 
  Sparkles, 
  ShoppingBag, 
  Home 
} from 'lucide-react';
import type { BudgetItem } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface ApartmentSectionProps {
  items: BudgetItem[];
}

export const ApartmentSection: React.FC<ApartmentSectionProps> = ({ items }) => {
  const totalEstimated = items.reduce((acc, item) => acc + item.estimatedCost, 0);
  const totalBought = items
    .filter(item => item.status === 'comprado')
    .reduce((acc, item) => acc + (item.actualCost || item.estimatedCost), 0);

  return (
    <div className="space-y-6">
      {/* Apartment Delivery Hero Card */}
      <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Entrega Prevista: 2027</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <Home className="w-6 h-6 text-indigo-400" />
              Projeto: Meu Apartamento Novo
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Área dedicada para você planejar cada detalhe da entrega das chaves: lista de compras, eletrodomésticos, mobília e os balões/taxas contratuais.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 min-w-[220px] text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Orçamento Eletros</span>
            <span className="text-xl font-bold text-indigo-400">{formatCurrency(totalEstimated)}</span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Comprado: <strong className="text-emerald-400">{formatCurrency(totalBought)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Highlights / Delivery Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Milestone 1: Balão AP */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center space-x-3 text-amber-400 mb-3">
            <DollarSign className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Balões Contratuais</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Identificado no seu controle valores de balão (~R$ 45.689,00 anotados para Out/Dez).
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-400">Status:</span>
            <span className="text-amber-400 font-semibold">Planejado no Fluxo</span>
          </div>
        </div>

        {/* Milestone 2: Custos de Entrega / Chaves */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center space-x-3 text-cyan-400 mb-3">
            <KeyRound className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Chaves, ITBI & Cartório</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Custos finais de escritura, ITBI da prefeitura e registro de imóveis no ato da vistoria.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-400">Estimativa:</span>
            <span className="text-cyan-400 font-semibold">3% a 5% do imóvel</span>
          </div>
        </div>

        {/* Milestone 3: Mobília & Decoração */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center space-x-3 text-emerald-400 mb-3">
            <ShoppingBag className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Eletros & Planejados</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            5 eletros essenciais já cotados na planilha original totalizando R$ 14.200,00.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-400">Progresso:</span>
            <span className="text-emerald-400 font-semibold">{items.length} itens cadastrados</span>
          </div>
        </div>
      </div>

      {/* Eletros Shopping List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Lista de Eletrodomésticos & Compras
            </h3>
            <span className="text-xs text-slate-400">Dados importados da sua aba original "Eletro"</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            {items.length} itens
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => {
            const isBought = item.status === 'comprado';
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition ${
                  isBought
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-sm text-white">{item.name}</span>
                  {isBought ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Comprado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                      <Clock className="w-3 h-3" /> Planejado
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Valor Estimado:</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {formatCurrency(item.estimatedCost)}
                  </span>
                </div>

                {item.actualCost && (
                  <div className="mt-1 flex items-baseline justify-between text-xs text-emerald-400">
                    <span>Valor Pago:</span>
                    <span className="font-bold font-mono">{formatCurrency(item.actualCost)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Chat update hint banner */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>
            💡 <strong>Quer adicionar ou atualizar itens?</strong> Basta me avisar no chat (ex: <i>"anote que comprei o micro-ondas por R$ 750"</i> ou <i>"adicione TV 65 polegadas estimada em R$ 3.800"</i>) e eu atualizo o banco na hora!
          </span>
        </div>
      </div>
    </div>
  );
};
