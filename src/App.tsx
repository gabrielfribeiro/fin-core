import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { 
  loginWithGoogle, 
  logoutUser, 
  subscribeAuth, 
  subscribeMonthlyRecords, 
  subscribeApartmentItems,
  isFirebaseConfigured,
  isUserAuthorized,
  seedFirestore
} from './services/firebase';
import type { MonthlyRecord, BudgetItem } from './types/finance';
import { calculateKPIs } from './utils/formatters';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { OverviewCards } from './components/OverviewCards';
import { FinancialCharts } from './components/FinancialCharts';
import { MonthlyTable } from './components/MonthlyTable';
import { FinancingSection } from './components/FinancingSection';
import { ApartmentSection } from './components/ApartmentSection';
import { AssistantGuide } from './components/AssistantGuide';
import { INITIAL_FINANCING_CONTRACTS, INITIAL_MRV_INSTALLMENTS } from './data/initialData';
import { ShieldAlert, LogOut, Sparkles, Loader2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'table' | 'financing' | 'apartment' | 'chat'>('overview');
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [apartmentItems, setApartmentItems] = useState<BudgetItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Auth subscription
    const unsubscribeAuth = subscribeAuth(async (currentUser) => {
      setAuthLoading(false);
      if (currentUser) {
        if (!isUserAuthorized(currentUser)) {
          await logoutUser();
          setUser(null);
          setAuthError(`Acesso negado: A conta Google (${currentUser.email}) não possui autorização para este painel.`);
          return;
        }
        setUser(currentUser);
        setAuthError(null);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Only subscribe to records & data once user is authenticated and authorized
  useEffect(() => {
    if (!user || !isUserAuthorized(user)) {
      setRecords([]);
      setApartmentItems([]);
      return;
    }

    const unsubscribeRecords = subscribeMonthlyRecords((data) => {
      setRecords(data);
    });

    const unsubscribeApartment = subscribeApartmentItems((items) => {
      setApartmentItems(items);
    });

    return () => {
      unsubscribeRecords();
      unsubscribeApartment();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setAuthError(null);
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        if (!isUserAuthorized(loggedUser)) {
          await logoutUser();
          setUser(null);
          setAuthError(`Acesso negado: A conta Google (${loggedUser.email}) não tem permissão de acesso.`);
          return;
        }
        setUser(loggedUser);
        try {
          await seedFirestore();
        } catch (e) {
          console.warn('Seed error on login:', e);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message && err.message.includes('popup-closed-by-user')) {
        return;
      }
      setAuthError(err.message || 'Erro ao realizar login com Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setAuthError(null);
  };

  // Loading state while verifying Google session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-xs text-slate-400 font-medium">Verificando credenciais seguras...</span>
      </div>
    );
  }

  // Not logged in: Show Login Screen (Zero financial data visible)
  if (!user) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        isLoading={isLoggingIn}
        error={authError}
      />
    );
  }

  // Logged in but not in authorized email whitelist
  if (user && !isUserAuthorized(user)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Acesso Não Autorizado</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            A conta Google logada (<strong>{user.email}</strong>) não está na lista de administradores deste dashboard financeiro privado.
          </p>
          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sair da conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // KPIs calculation for authenticated view
  const kpis = calculateKPIs(records);
  const currentRecord = records.find(r => r.id === '2026-09') || records[records.length - 1];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isFirebaseReady={isFirebaseConfigured}
      />

      {/* Auth Banner error if any */}
      {authError && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center justify-between">
            <span>{authError}</span>
            <button onClick={() => setAuthError(null)} className="font-bold ml-2">✕</button>
          </div>
        </div>
      )}

      {/* Main Authenticated Dashboard */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <OverviewCards kpis={kpis} currentRecord={currentRecord} />
            <FinancialCharts records={records} />
          </div>
        )}

        {activeTab === 'table' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Histórico Mensal Completo</h2>
              <p className="text-xs text-slate-400">
                Todos os registros de 2025 até 2027 com receitas, despesas fixas, cartões e patrimônio
              </p>
            </div>
            <MonthlyTable records={records} />
          </div>
        )}

        {activeTab === 'financing' && (
          <div className="animate-in fade-in duration-300">
            <FinancingSection
              contracts={INITIAL_FINANCING_CONTRACTS}
              mrvSchedule={INITIAL_MRV_INSTALLMENTS}
            />
          </div>
        )}

        {activeTab === 'apartment' && (
          <div className="animate-in fade-in duration-300">
            <ApartmentSection items={apartmentItems} />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="animate-in fade-in duration-300">
            <AssistantGuide isFirebaseReady={isFirebaseConfigured} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            FinCore • Seu Ecossistema Financeiro Pessoal
          </span>
          <span className="text-slate-600">
            Conectado com {user.email} • Atualizações automáticas via Chat
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
