import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import type { 
  MonthlyRecord, 
  FinancingContract, 
  MRVInstallment, 
  CreditCardPurchase, 
  B3Asset 
} from '../types/finance';
import { 
  INITIAL_MONTHLY_RECORDS, 
  INITIAL_FINANCING_CONTRACTS,
  INITIAL_MRV_INSTALLMENTS,
  INITIAL_CARD_PURCHASES,
  INITIAL_B3_ASSETS
} from '../data/initialData';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('SUA_')
);

// Authorized email strict verification
export const getAuthorizedEmail = (): string => {
  return (import.meta.env.VITE_AUTHORIZED_EMAIL || '').trim().toLowerCase();
};

export const isUserAuthorized = (user: User | null): boolean => {
  if (!user || !user.email) return false;
  const authorized = getAuthorizedEmail();
  if (!authorized) return true;
  return user.email.trim().toLowerCase() === authorized;
};

// Initialize Firebase only if config is present
const app = isFirebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Auth helpers
export const loginWithGoogle = async (): Promise<User | null> => {
  if (!auth) {
    throw new Error('Firebase não está configurado ainda. Insira as chaves no arquivo .env.');
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const logoutUser = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
  }
};

export const subscribeAuth = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Seed utility: pushes data to Cloud Firestore once authenticated
export const seedFirestore = async () => {
  if (!db || !isFirebaseConfigured) return;
  console.log('Sincronizando todas as coleções no Cloud Firestore...');
  for (const record of INITIAL_MONTHLY_RECORDS) {
    const docRef = doc(db, 'monthly_records', record.id);
    await setDoc(docRef, record, { merge: true });
  }
  for (const contract of INITIAL_FINANCING_CONTRACTS) {
    const docRef = doc(db, 'financing_contracts', contract.id);
    await setDoc(docRef, contract, { merge: true });
  }
  for (const installment of INITIAL_MRV_INSTALLMENTS) {
    const docRef = doc(db, 'mrv_installments', installment.code);
    await setDoc(docRef, installment, { merge: true });
  }
  for (const purchase of INITIAL_CARD_PURCHASES) {
    const docRef = doc(db, 'card_purchases', purchase.id);
    await setDoc(docRef, purchase, { merge: true });
  }
  for (const asset of INITIAL_B3_ASSETS) {
    const docRef = doc(db, 'b3_assets', asset.ticker);
    await setDoc(docRef, asset, { merge: true });
  }
  console.log('Todas as coleções gravadas com sucesso no Cloud Firestore!');
};

// 1. Monthly Records (History & Balance)
export const subscribeMonthlyRecords = (
  callback: (records: MonthlyRecord[]) => void
) => {
  if (!db || !isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, 'monthly_records'), orderBy('id', 'asc'));
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
    } else {
      const records: MonthlyRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data() as MonthlyRecord);
      });
      callback(records);
    }
  }, (err) => {
    console.warn('Firestore monthly_records error:', err);
    callback([]);
  });
};

// 2. Financing Contracts (Carro, Caixa)
export const subscribeFinancingContracts = (
  callback: (contracts: FinancingContract[]) => void
) => {
  if (!db || !isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, 'financing_contracts'));
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
    } else {
      const list: FinancingContract[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as FinancingContract);
      });
      callback(list);
    }
  }, (err) => {
    console.warn('Firestore financing_contracts error:', err);
    callback([]);
  });
};

// 3. MRV Installments Schedule
export const subscribeMRVInstallments = (
  callback: (installments: MRVInstallment[]) => void
) => {
  if (!db || !isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, 'mrv_installments'));
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
    } else {
      const list: MRVInstallment[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as MRVInstallment);
      });
      callback(list);
    }
  }, (err) => {
    console.warn('Firestore mrv_installments error:', err);
    callback([]);
  });
};

// 4. Credit Card Purchases & Relief Schedule
export const subscribeCardPurchases = (
  callback: (items: CreditCardPurchase[]) => void
) => {
  if (!db || !isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, 'card_purchases'));
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
    } else {
      const items: CreditCardPurchase[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as CreditCardPurchase);
      });
      callback(items);
    }
  }, (err) => {
    console.warn('Firestore card_purchases error:', err);
    callback([]);
  });
};

// 5. B3 Assets (FIIs & Ações)
export const subscribeB3Assets = (
  callback: (items: B3Asset[]) => void
) => {
  if (!db || !isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, 'b3_assets'));
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback([]);
    } else {
      const items: B3Asset[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as B3Asset);
      });
      callback(items);
    }
  }, (err) => {
    console.warn('Firestore b3_assets error:', err);
    callback([]);
  });
};

// Update helpers (directly to Cloud Firestore)
export const updateMonthlyRecord = async (record: MonthlyRecord) => {
  if (db && isFirebaseConfigured) {
    const docRef = doc(db, 'monthly_records', record.id);
    await setDoc(docRef, record, { merge: true });
  }
};

export const updateCardPurchase = async (purchase: CreditCardPurchase) => {
  if (db && isFirebaseConfigured) {
    const docRef = doc(db, 'card_purchases', purchase.id);
    await setDoc(docRef, purchase, { merge: true });
  }
};

export const updateB3Asset = async (asset: B3Asset) => {
  if (db && isFirebaseConfigured) {
    const docRef = doc(db, 'b3_assets', asset.ticker);
    await setDoc(docRef, asset, { merge: true });
  }
};
