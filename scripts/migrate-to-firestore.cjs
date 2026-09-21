/**
 * Script para popular automaticamente o Firestore com os dados de initialData.ts
 * Executado via: node scripts/migrate-to-firestore.cjs
 */

const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Read .env if present
const envPath = path.join(__dirname, '..', '.env');
let envConfig = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v) {
      envConfig[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.log('Firebase não configurado em .env. Preencha as chaves no arquivo .env antes de rodar a migração para nuvem.');
  process.exit(0);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const initialDataPath = path.join(__dirname, '..', 'src', 'data', 'initialData.ts');
const fileContent = fs.readFileSync(initialDataPath, 'utf8');

const recordsMatch = fileContent.match(/export const INITIAL_MONTHLY_RECORDS: MonthlyRecord\[] = (\[[\s\S]*?\]);/);
const itemsMatch = fileContent.match(/export const INITIAL_APARTMENT_ITEMS: BudgetItem\[] = (\[[\s\S]*?\]);/);

const records = recordsMatch ? JSON.parse(recordsMatch[1]) : [];
const items = itemsMatch ? JSON.parse(itemsMatch[1]) : [];

async function migrate() {
  console.log(`Iniciando migração de ${records.length} registros mensais e ${items.length} itens do apartamento para o Firestore...`);

  for (const record of records) {
    const docRef = doc(db, 'monthly_records', record.id);
    await setDoc(docRef, record, { merge: true });
    process.stdout.write('.');
  }
  console.log('\nMeses migrados com sucesso!');

  for (const item of items) {
    const docRef = doc(db, 'apartment_items', item.id);
    await setDoc(docRef, item, { merge: true });
  }
  console.log('Itens do apartamento migrados com sucesso!');
  console.log('Migração 100% concluída no Firebase Firestore!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Erro na migração:', err);
  process.exit(1);
});
