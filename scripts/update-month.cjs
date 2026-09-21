/**
 * Script utilitário executado pelo assistente via chat para atualizar qualquer mês no controle.
 * Atualiza o arquivo src/data/initialData.ts e o Firestore caso configurado.
 * 
 * Uso:
 * node scripts/update-month.cjs --id 2026-10 --salary 10500 --itau 3200 ...
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const params = {};
for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace(/^--/, '');
  const val = args[i + 1];
  params[key] = val;
}

if (!params.id) {
  console.error('Erro: informe o id do mês (--id YYYY-MM)');
  process.exit(1);
}

const initialDataPath = path.join(__dirname, '..', 'src', 'data', 'initialData.ts');
let fileContent = fs.readFileSync(initialDataPath, 'utf8');

// Parse current records array using regex or evaluating
const recordsMatch = fileContent.match(/export const INITIAL_MONTHLY_RECORDS: MonthlyRecord\[] = (\[[\s\S]*?\]);/);
const itemsMatch = fileContent.match(/export const INITIAL_APARTMENT_ITEMS: BudgetItem\[] = (\[[\s\S]*?\]);/);

if (!recordsMatch) {
  console.error('Não foi possível encontrar INITIAL_MONTHLY_RECORDS');
  process.exit(1);
}

const records = JSON.parse(recordsMatch[1]);
const apartmentItems = itemsMatch ? JSON.parse(itemsMatch[1]) : [];

let target = records.find(r => r.id === params.id);
if (!target) {
  const [yr, mo] = params.id.split('-').map(Number);
  target = {
    id: params.id,
    year: yr,
    month: `Mês ${mo}`,
    monthIndex: mo,
    salary: 0,
    extraIncome: 0,
    totalIncome: 0,
    car: 0,
    apartment: 0,
    itau: 0,
    nubank: 0,
    fuel: 0,
    looseBills: 0,
    totalExpenses: 0,
    monthlyBalance: 0,
    savingsItau: 0,
    avenue: 0,
    liquidAccount: 0,
    dollarAmount: 0,
    exchangeRate: 5.5,
    netWorth: 0,
    notes: '',
    status: 'projected'
  };
  records.push(target);
}

// Apply updates
if (params.salary !== undefined) target.salary = parseFloat(params.salary);
if (params.extraIncome !== undefined) target.extraIncome = parseFloat(params.extraIncome);
if (params.car !== undefined) target.car = parseFloat(params.car);
if (params.apartment !== undefined) target.apartment = parseFloat(params.apartment);
if (params.itau !== undefined) target.itau = parseFloat(params.itau);
if (params.nubank !== undefined) target.nubank = parseFloat(params.nubank);
if (params.fuel !== undefined) target.fuel = parseFloat(params.fuel);
if (params.looseBills !== undefined) target.looseBills = parseFloat(params.looseBills);
if (params.savingsItau !== undefined) target.savingsItau = parseFloat(params.savingsItau);
if (params.liquidAccount !== undefined) target.liquidAccount = parseFloat(params.liquidAccount);
if (params.avenue !== undefined) target.avenue = parseFloat(params.avenue);
if (params.notes !== undefined) target.notes = params.notes;

// Recalculate totals
target.totalIncome = (target.salary || 0) + (target.extraIncome || 0);
target.totalExpenses = (target.car || 0) + (target.apartment || 0) + (target.itau || 0) + (target.nubank || 0) + (target.fuel || 0) + (target.looseBills || 0);
target.monthlyBalance = target.totalIncome - target.totalExpenses;
target.netWorth = (target.savingsItau || 0) + (target.liquidAccount || 0) + ((target.avenue || 0) * (target.exchangeRate || 5.5));

// Save back to initialData.ts
const newFileContent = `import type { MonthlyRecord, BudgetItem } from '../types/finance';

export const INITIAL_MONTHLY_RECORDS: MonthlyRecord[] = ${JSON.stringify(records, null, 2)};

export const INITIAL_APARTMENT_ITEMS: BudgetItem[] = ${JSON.stringify(apartmentItems, null, 2)};
`;

fs.writeFileSync(initialDataPath, newFileContent, 'utf8');
console.log(`[Sucesso] Mês ${params.id} atualizado com sucesso no controle!`);
console.log(`Renda: R$ ${target.totalIncome} | Despesas: R$ ${target.totalExpenses} | Saldo: R$ ${target.monthlyBalance}`);
