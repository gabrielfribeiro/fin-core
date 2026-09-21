import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import type { MonthlyRecord } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface FinancialChartsProps {
  records: MonthlyRecord[];
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ records }) => {
  const [filterPeriod, setFilterPeriod] = useState<'2026' | 'all'>('2026');

  // Filter records with data
  const filledRecords = records.filter(r => r.totalIncome > 0 || r.totalExpenses > 0);
  const chartData = filterPeriod === '2026'
    ? filledRecords.filter(r => r.year === 2026)
    : filledRecords;

  // Latest active record for pie chart distribution
  const latestRecord = records.find(r => r.id === '2026-09') || filledRecords[filledRecords.length - 1];

  const expensesPieData = [
    { name: 'Cartão Itaú', value: latestRecord?.itau || 0, color: '#f97316' }, // orange
    { name: 'Apartamento', value: latestRecord?.apartment || 0, color: '#06b6d4' }, // cyan
    { name: 'Carro', value: latestRecord?.car || 0, color: '#3b82f6' }, // blue
    { name: 'Contas Soltas', value: latestRecord?.looseBills || 0, color: '#a855f7' }, // purple
    { name: 'Nubank', value: latestRecord?.nubank || 0, color: '#8b5cf6' }, // violet
  ].filter(item => item.value > 0);

  const totalPie = expensesPieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      {/* Header with period toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Análise Gráfica & Tendências</h3>
          <p className="text-xs text-slate-400">Fluxo de caixa, evolução da reserva e composição dos custos</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setFilterPeriod('2026')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              filterPeriod === '2026'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ano 2026
          </button>
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              filterPeriod === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todo o Histórico (2025 - 2026)
          </button>
        </div>
      </div>

      {/* Grid: Cash Flow (Bar) & Net Worth Evolution (Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Renda vs Despesas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Renda vs. Despesas Mensais</h4>
              <span className="text-[11px] text-slate-400">Comparativo do fluxo de caixa</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => val.slice(0, 3)}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(val) => val === 'totalIncome' ? 'Renda Total' : 'Despesas'}
                />
                <Bar dataKey="totalIncome" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalExpenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Evolução Patrimonial & Reserva */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Evolução da Reserva (Itaú)</h4>
              <span className="text-[11px] text-slate-400">Grana guardada ao longo dos meses</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Pico R$ 31,1k em Jun/26
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => val.slice(0, 3)}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Guardado Itaú']}
                />
                <Area 
                  type="monotone" 
                  dataKey="savingsItau" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorSavings)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Raio-X dos Gastos (Pizza + Barras de Proporção) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-white">Composição de Gastos (Mês Atual - Setembro/2026)</h4>
          <span className="text-[11px] text-slate-400">Total de {formatCurrency(totalPie)} distribuído por frente</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart */}
          <div className="md:col-span-5 h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {expensesPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown List */}
          <div className="md:col-span-7 space-y-3">
            {expensesPieData.map((item) => {
              const pct = totalPie > 0 ? (item.value / totalPie) * 100 : 0;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-200">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-semibold text-white">
                      {formatCurrency(item.value)} <span className="text-slate-400 font-normal">({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
