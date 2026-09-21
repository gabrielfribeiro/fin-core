const fs = require('fs');
const path = require('path');

const dataJsonPath = path.join(__dirname, '..', '..', 'data.json');
let rawData = [];
if (fs.existsSync(dataJsonPath)) {
  const content = fs.readFileSync(dataJsonPath, 'utf8').replace(/^\uFEFF/, '');
  rawData = JSON.parse(content);
} else {
  // Try brain scratch
  const altPath = 'C:\\Users\\gabri\\.gemini\\antigravity\\brain\\f56f0885-c7ea-48bf-801b-c8fd740c6a9e\\scratch\\data.json';
  if (fs.existsSync(altPath)) {
    const content = fs.readFileSync(altPath, 'utf8').replace(/^\uFEFF/, '');
    rawData = JSON.parse(content);
  }
}

const monthsMap = {
  'janeiro': 1, 'fevereiro': 2, 'março': 3, 'marco': 3, 'abril': 4,
  'maio': 5, 'junho': 6, 'julho': 7, 'agosto': 8, 'setembro': 9,
  'outubro': 10, 'novembro': 11, 'dezembro': 12
};

const monthNames = [
  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const processed = [];

for (const item of rawData) {
  const year = Math.round(parseFloat(item.Ano || 0));
  if (!year) continue;

  const rawMonth = (item.Mês || item.Mes || '').trim().toLowerCase();
  if (!rawMonth) continue;

  // clean accent/encoding glitch
  let norm = rawMonth.replace(/[^a-z]/g, '');
  if (norm.startsWith('mar')) norm = 'março';

  const mIdx = monthsMap[norm] || 1;
  const monthName = monthNames[mIdx];
  const id = `${year}-${String(mIdx).padStart(2, '0')}`;

  const salary = parseFloat(item.Salario || 0);
  const extraIncome = parseFloat(item['Entrada Extra'] || 0);
  let totalIncome = parseFloat(item['Grana Mês'] || item.GranaMes || 0);
  if (totalIncome === 0 && (salary > 0 || extraIncome > 0)) {
    totalIncome = salary + extraIncome;
  }

  const car = parseFloat(item.Carro || 0);
  const apartment = parseFloat(item.Apartamento || 0);
  const itau = parseFloat(item.Itau || 0);
  const nubank = parseFloat(item.Nubank || 0);
  const fuel = parseFloat(item.Combustivel || 0);
  const looseBills = parseFloat(item['Contas Soltas'] || item.ContasSoltas || 0);

  let totalExpenses = parseFloat(item.Saida || 0);
  if (totalExpenses === 0 && (car > 0 || apartment > 0 || itau > 0)) {
    totalExpenses = car + apartment + itau + nubank + fuel + looseBills;
  }

  const monthlyBalance = parseFloat(item['Saldo do mês'] || item.SaldoDoMes || 0);
  const savingsItau = parseFloat(item['Grana guardada Itau'] || 0);
  const avenue = parseFloat(item.Avenue || 0);
  const liquidAccount = parseFloat(item['Saldo na conta'] || 0);
  const dollarAmount = parseFloat(item['Grana em Dolar'] || 0);
  const exchangeRate = parseFloat(item.Cambio || 0);
  let netWorth = parseFloat(item['Situação'] || 0);

  if (netWorth === 0 && (savingsItau > 0 || liquidAccount > 0)) {
    netWorth = savingsItau + liquidAccount + (avenue * (exchangeRate || 5.5));
  }

  const notesArr = [];
  if (item.Col_T) notesArr.push(item.Col_T);
  if (item.Col_U) notesArr.push(item.Col_U);
  if (item.Col_V) notesArr.push(item.Col_V);
  const notes = notesArr.filter(Boolean).join(' • ');

  let status = 'completed';
  if (id === '2026-09') {
    status = 'current';
  } else if (year > 2026 || (year === 2026 && mIdx > 9)) {
    status = 'projected';
  }

  processed.push({
    id,
    year,
    month: monthName,
    monthIndex: mIdx,
    salary,
    extraIncome,
    totalIncome,
    car,
    apartment,
    itau,
    nubank,
    fuel,
    looseBills,
    totalExpenses,
    monthlyBalance,
    savingsItau,
    avenue,
    liquidAccount,
    dollarAmount,
    exchangeRate,
    netWorth,
    notes,
    status
  });
}

// Ensure data folder exists
const targetDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

// Also define Eletros
const initialEletros = [
  { id: '1', name: 'Geladeira', category: 'eletro', estimatedCost: 4800, status: 'planejado' },
  { id: '2', name: 'Máquina de Lavar', category: 'eletro', estimatedCost: 4600, status: 'planejado' },
  { id: '3', name: 'Lava-Louças', category: 'eletro', estimatedCost: 3000, status: 'planejado' },
  { id: '4', name: 'Depurador', category: 'eletro', estimatedCost: 1000, status: 'planejado' },
  { id: '5', name: 'Micro-ondas', category: 'eletro', estimatedCost: 800, status: 'planejado' }
];

const tsContent = `import type { MonthlyRecord, BudgetItem } from '../types/finance';

export const INITIAL_MONTHLY_RECORDS: MonthlyRecord[] = ${JSON.stringify(processed, null, 2)};

export const INITIAL_APARTMENT_ITEMS: BudgetItem[] = ${JSON.stringify(initialEletros, null, 2)};
`;

fs.writeFileSync(path.join(targetDir, 'initialData.ts'), tsContent, 'utf8');
console.log(`Successfully generated initialData.ts with ${processed.length} months and ${initialEletros.length} apartment items.`);
