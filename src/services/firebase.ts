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
import type { MonthlyRecord, BudgetItem } from '../types/finance';
import { INITIAL_MONTHLY_RECORDS, INITIAL_APARTMENT_ITEMS } from '../data/initialData';

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
  if (!authorized) return true; // Se ainda não definido, permite para configuração inicial
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

// Firestore listeners with fallback to local storage
const LOCAL_STORAGE_RECORDS_KEY = 'finance_records_local';
const LOCAL_STORAGE_ITEMS_KEY = 'finance_apartment_items_local';

export const seedFirestore = async () => {
  if (!db || !isFirebaseConfigured) return;
  console.log('Semeando Firestore com dados históricos...');
  for (const record of INITIAL_MONTHLY_RECORDS) {
    const docRef = doc(db, 'monthly_records', record.id);
    await setDoc(docRef, record, { merge: true });
  }
  for (const item of INITIAL_APARTMENT_ITEMS) {
    const docRef = doc(db, 'apartment_items', item.id);
    await setDoc(docRef, item, { merge: true });
  }
  console.log('Firestore semeado com sucesso!');
};

export const subscribeMonthlyRecords = (
  callback: (records: MonthlyRecord[]) => void
) => {
  if (!db || !isFirebaseConfigured) {
    // Fallback: Read from LocalStorage or InitialData
    const local = localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY);
    if (local) {
      try {
        callback(JSON.parse(local));
      } catch {
        callback(INITIAL_MONTHLY_RECORDS);
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(INITIAL_MONTHLY_RECORDS));
      callback(INITIAL_MONTHLY_RECORDS);
    }
    return () => {};
  }

  const q = query(collection(db, 'monthly_records'), orderBy('id', 'asc'));
  return onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      // If Firestore is empty, callback with initial data and attempt seed if authenticated
      callback(INITIAL_MONTHLY_RECORDS);
      if (auth?.currentUser) {
        try {
          await seedFirestore();
        } catch (e) {
          console.warn('Auto-seed waiting for permissions:', e);
        }
      }
    } else {
      const records: MonthlyRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data() as MonthlyRecord);
      });
      callback(records);
    }
  }, (err) => {
    console.warn('Firestore subscription error, fallback to initial data:', err);
    callback(INITIAL_MONTHLY_RECORDS);
  });
};

export const subscribeApartmentItems = (
  callback: (items: BudgetItem[]) => void
) => {
  if (!db || !isFirebaseConfigured) {
    const local = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
    if (local) {
      try {
        callback(JSON.parse(local));
      } catch {
        callback(INITIAL_APARTMENT_ITEMS);
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(INITIAL_APARTMENT_ITEMS));
      callback(INITIAL_APARTMENT_ITEMS);
    }
    return () => {};
  }

  const q = query(collection(db, 'apartment_items'));
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(INITIAL_APARTMENT_ITEMS);
    } else {
      const items: BudgetItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as BudgetItem);
      });
      callback(items);
    }
  }, (err) => {
    console.warn('Firestore apartment items error:', err);
    callback(INITIAL_APARTMENT_ITEMS);
  });
};

// Update helpers (can be called locally or by scripts)
export const updateMonthlyRecord = async (record: MonthlyRecord) => {
  if (db && isFirebaseConfigured) {
    const docRef = doc(db, 'monthly_records', record.id);
    await setDoc(docRef, record, { merge: true });
  } else {
    // Local storage fallback
    const local = localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY);
    let list: MonthlyRecord[] = local ? JSON.parse(local) : [...INITIAL_MONTHLY_RECORDS];
    const idx = list.findIndex(r => r.id === record.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...record };
    } else {
      list.push(record);
    }
    localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(list));
  }
};
