import React, { useState } from 'react';
import { 
  Filter, 
  Search, 
  Calendar, 
  ArrowDownRight, 
  ArrowUpRight,
  Info,
  Layers
} from 'lucide-react';
import type { MonthlyRecord } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface MonthlyTableProps {
  records: MonthlyRecord[];
}

export const MonthlyTable: React.FC<MonthlyTableProps> = ({ records }) => {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<MonthlyRecord | null>(null);

  const filteredRecords = records.filter(r => {
    const matchesYear = selectedYear === 'all' || r.year.toString() === selectedYear;
    const matchesSearch = searchQuery === '' || 
      r.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesYear && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Ano:</span>
          <div className="flex items-center space-x-1">
            {['2025', '2026', '2027', 'all'].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  selectedYear === yr
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {yr === 'all' ? 'Todos' : yr}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por mês ou nota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Período</th>
                <th className="py-3.5 px-4 text-right">Renda Total</th>
                <th className="py-3.5 px-4 text-right">Carro</th>
                <th className="py-3.5 px-4 text-right">Apartamento</th>
                <th className="py-3.5 px-4 text-right">Cartão Itaú</th>
                <th className="py-3.5 px-4 text-right">Total Saídas</th>
                <th className="py-3.5 px-4 text-right">Saldo Mês</th>
                <th className="py-3.5 px-4 text-right">Guardado Itaú</th>
                <th className="py-3.5 px-4">Anotações</th>
                <th className="py-3.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-500">
                    Nenhum registro encontrado para este filtro.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isCurrent = rec.id === '2026-09';
                  const isPositive = rec.monthlyBalance >= 0;
                  const hasData = rec.totalIncome > 0 || rec.totalExpenses > 0;

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isCurrent ? 'bg-emerald-500/5 border-l-4 border-l-emerald-500' : ''
                      }`}
                    >
                      {/* Período */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-white">
                            {rec.month} {rec.year}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                              Atual
                            </span>
                          )}
                          {!hasData && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                              Projetado
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Renda Total */}
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-400 whitespace-nowrap">
                        {formatCurrency(rec.totalIncome)}
                        {rec.extraIncome > 0 && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            (+{formatCurrency(rec.extraIncome)} extra)
                          </div>
                        )}
                      </td>

                      {/* Carro */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {rec.car > 0 ? (
                          <span className="text-slate-200">{formatCurrency(rec.car)}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Apartamento */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {rec.apartment > 0 ? (
                          <span className="text-slate-200">{formatCurrency(rec.apartment)}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Cartão Itaú */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {rec.itau > 0 ? (
                          <span className="text-amber-300 font-mono">{formatCurrency(rec.itau)}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Total Saídas */}
                      <td className="py-3.5 px-4 text-right font-medium text-rose-400 whitespace-nowrap">
                        {formatCurrency(rec.totalExpenses)}
                      </td>

                      {/* Saldo Mês */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold">
                        {hasData ? (
                          <span className={`inline-flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {formatCurrency(rec.monthlyBalance)}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Guardado Itaú */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-semibold text-blue-400">
                        {rec.savingsItau > 0 ? formatCurrency(rec.savingsItau) : <span className="text-slate-600">-</span>}
                      </td>

                      {/* Anotações */}
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-400 text-[11px]">
                        {rec.notes ? (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {rec.notes}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          title="Ver detalhes completos"
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes do Mês */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedRecord.month} de {selectedRecord.year}
                  </h3>
                  <span className="text-xs text-slate-400">Detalhamento completo do mês</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Salário Base</span>
                <strong className="text-sm text-white">{formatCurrency(selectedRecord.salary)}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Entrada Extra</span>
                <strong className="text-sm text-emerald-400">{formatCurrency(selectedRecord.extraIncome)}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Apartamento</span>
                <strong className="text-sm text-slate-200">{formatCurrency(selectedRecord.apartment)}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Carro</span>
                <strong className="text-sm text-slate-200">{formatCurrency(selectedRecord.car)}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Cartão Itaú</span>
                <strong className="text-sm text-amber-300">{formatCurrency(selectedRecord.itau)}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Cartão Nubank</span>
                <strong className="text-sm text-purple-300">{formatCurrency(selectedRecord.nubank)}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Contas Soltas / Outros</span>
                <strong className="text-sm text-slate-200">{formatCurrency(selectedRecord.looseBills)}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Total de Despesas</span>
                <strong className="text-sm text-rose-400">{formatCurrency(selectedRecord.totalExpenses)}</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Saldo Guardado Itaú:</span>
                <strong className="text-blue-400">{formatCurrency(selectedRecord.savingsItau)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Saldo na Conta Corrente:</span>
                <strong className="text-cyan-300">{formatCurrency(selectedRecord.liquidAccount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patrimônio Líquido:</span>
                <strong className="text-emerald-400 font-mono">{formatCurrency(selectedRecord.netWorth)}</strong>
              </div>
              {selectedRecord.notes && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block mb-1">Anotações do Mês:</span>
                  <p className="text-emerald-300 bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/20">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
