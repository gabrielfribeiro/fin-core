/**
 * Script de Fechamento do Dia 25 operado pelo assistente via chat.
 * Execução: node scripts/close-month.cjs --id 2026-10 --salary 10373.92 --bills 3633.94 --itau 3100 --reserve 1200 --b3 1200
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

const monthId = params.id || '2026-10';
const salary = parseFloat(params.salary || 10373.92);
const bills = parseFloat(params.bills || 3633.94); // Carro + MRV
const itauCard = parseFloat(params.itau || 3100.00);
const reserveAlloc = parseFloat(params.reserve || 0);
const b3Alloc = parseFloat(params.b3 || 0);

const initialDataPath = path.join(__dirname, '..', 'src', 'data', 'initialData.ts');
let fileContent = fs.readFileSync(initialDataPath, 'utf8');

const recordsMatch = fileContent.match(/export const INITIAL_MONTHLY_RECORDS: MonthlyRecord\[] = (\[[\s\S]*?\]);/);
const itemsMatch = fileContent.match(/export const INITIAL_APARTMENT_ITEMS: BudgetItem\[] = (\[[\s\S]*?\]);/);
const b3Match = fileContent.match(/export const INITIAL_B3_ASSETS: B3Asset\[] = (\[[\s\S]*?\]);/);
const cardMatch = fileContent.match(/export const INITIAL_CARD_PURCHASES: CreditCardPurchase\[] = (\[[\s\S]*?\]);/);
const contractsMatch = fileContent.match(/export const INITIAL_FINANCING_CONTRACTS: FinancingContract\[] = (\[[\s\S]*?\]);/);
const mrvMatch = fileContent.match(/export const INITIAL_MRV_INSTALLMENTS: MRVInstallment\[] = (\[[\s\S]*?\]);/);

if (!recordsMatch) {
  console.error('Erro ao ler INITIAL_MONTHLY_RECORDS');
  process.exit(1);
}

const records = JSON.parse(recordsMatch[1]);
let target = records.find(r => r.id === monthId);
if (!target) {
  console.error(`Mês ${monthId} não encontrado`);
  process.exit(1);
}

// Update target month
target.salary = salary;
target.totalIncome = salary;
target.car = 2570.52;
target.apartment = bills - 2570.52;
target.itau = itauCard;
target.totalExpenses = target.car + target.apartment + target.itau;
target.monthlyBalance = target.totalIncome - target.totalExpenses;

// Previous month savings
const prevRecord = records.find(r => r.id === '2026-09');
const prevSavings = prevRecord ? prevRecord.savingsItau : 3124.69;
target.savingsItau = prevSavings + reserveAlloc;
target.liquidAccount = target.monthlyBalance - (reserveAlloc + b3Alloc);
target.netWorth = target.savingsItau + (target.liquidAccount || 0) + b3Alloc;
target.notes = `Fechamento Dia 25: +R$ ${reserveAlloc.toFixed(2)} Reserva e +R$ ${b3Alloc.toFixed(2)} FIIs/Ações`;
target.status = 'current';

const newContent = fileContent.replace(
  recordsMatch[0],
  `export const INITIAL_MONTHLY_RECORDS: MonthlyRecord[] = ${JSON.stringify(records, null, 2)};`
);

fs.writeFileSync(initialDataPath, newContent, 'utf8');

console.log(`[Sucesso] Fechamento do mês ${monthId} executado com maestria!`);
console.log(`Renda: R$ ${salary.toFixed(2)} | Despesas: R$ ${target.totalExpenses.toFixed(2)} | Sobra: R$ ${target.monthlyBalance.toFixed(2)}`);
console.log(`Destinado à Reserva (Itaú): +R$ ${reserveAlloc.toFixed(2)} (Novo saldo: R$ ${target.savingsItau.toFixed(2)})`);
console.log(`Destinado a Ações & FIIs: +R$ ${b3Alloc.toFixed(2)}`);
