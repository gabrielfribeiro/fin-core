import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { 
  loginWithGoogle, 
  logoutUser, 
  subscribeAuth, 
  subscribeMonthlyRecords, 
  subscribeFinancingContracts,
  subscribeMRVInstallments,
  subscribeCardPurchases,
  subscribeB3Assets,
  subscribeB3Transactions,
  addB3Transaction,
  deleteB3Transaction,
  updateB3Asset,
  isFirebaseConfigured,
  isUserAuthorized,
  updateMonthlyRecord,
  syncB3AssetsToFirestore,
  cleanObsoleteB3Assets,
  updateFinancingContract,
  updateMRVInstallment,
  syncFinancingContractsToFirestore,
  syncMRVInstallmentsToFirestore,
  syncB3TransactionsToFirestore
} from './services/firebase';
import type { 
  MonthlyRecord, 
  FinancingContract, 
  MRVInstallment, 
  CreditCardPurchase, 
  B3Asset,
  InvestmentTransaction
} from './types/finance';
import { calculateKPIs } from './utils/formatters';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { OverviewCards } from './components/OverviewCards';
import { FinancialCharts } from './components/FinancialCharts';
import { MonthlyTable } from './components/MonthlyTable';
import { FinancingSection } from './components/FinancingSection';
import { InvestmentsSection } from './components/InvestmentsSection';
import { CreditCardSection } from './components/CreditCardSection';
import { MonthlyClosingModal } from './components/MonthlyClosingModal';
import { 
  INITIAL_MONTHLY_RECORDS, 
  INITIAL_FINANCING_CONTRACTS, 
  INITIAL_MRV_INSTALLMENTS, 
  INITIAL_CARD_PURCHASES, 
  INITIAL_B3_ASSETS,
  INITIAL_B3_TRANSACTIONS
} from './data/initialData';
import { ShieldAlert, LogOut, Sparkles, Loader2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'table' | 'financing' | 'investments' | 'card'>('overview');
  const [isClosingModalOpen, setIsClosingModalOpen] = useState<boolean>(false);
  const [selectedMonthId, setSelectedMonthId] = useState<string>('2026-10');
  
  // States initialized with real data, synced continuously with Cloud Firestore
  const [records, setRecords] = useState<MonthlyRecord[]>(INITIAL_MONTHLY_RECORDS);
  const [contracts, setContracts] = useState<FinancingContract[]>(INITIAL_FINANCING_CONTRACTS);
  const [mrvSchedule, setMrvSchedule] = useState<MRVInstallment[]>(INITIAL_MRV_INSTALLMENTS);
  const [cardPurchases, setCardPurchases] = useState<CreditCardPurchase[]>(INITIAL_CARD_PURCHASES);
  const [b3Assets, setB3Assets] = useState<B3Asset[]>(INITIAL_B3_ASSETS);
  const [b3Transactions, setB3Transactions] = useState<InvestmentTransaction[]>(INITIAL_B3_TRANSACTIONS);

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

  // Only subscribe to Cloud Firestore once user is authenticated and authorized
  useEffect(() => {
    if (!user || !isUserAuthorized(user)) {
      setRecords([]);
      setContracts([]);
      setMrvSchedule([]);
      setCardPurchases([]);
      setB3Assets([]);
      setB3Transactions([]);
      return;
    }

    const unsubRecords = subscribeMonthlyRecords((data) => {
      setRecords(data);
    });

    const unsubContracts = subscribeFinancingContracts((data) => {
      setContracts(data);
    });

    const unsubMRV = subscribeMRVInstallments((data) => {
      setMrvSchedule(data);
    });

    const unsubCard = subscribeCardPurchases((data) => {
      setCardPurchases(data);
    });

    const unsubB3 = subscribeB3Assets((data) => {
      setB3Assets(data);
    });

    const unsubTransactions = subscribeB3Transactions((data) => {
      setB3Transactions(data);
    });

    return () => {
      unsubRecords();
      unsubContracts();
      unsubMRV();
      unsubCard();
      unsubB3();
      unsubTransactions();
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
    setRecords([]);
    setContracts([]);
    setMrvSchedule([]);
    setCardPurchases([]);
    setB3Assets([]);
    setB3Transactions([]);
  };

  // Ensure September is preserved with original spreadsheet values and marked completed
  useEffect(() => {
    const sep = records.find(r => r.id === '2026-09');
    if (sep && (sep.totalIncome === 19288.92 || sep.status === 'current')) {
      const originalSeptember: MonthlyRecord = {
        id: "2026-09",
        year: 2026,
        month: "Setembro",
        monthIndex: 9,
        salary: 10373.92,
        extraIncome: 0,
        totalIncome: 10373.92,
        car: 2561.44,
        apartment: 3124.58,
        itau: 4177.82,
        nubank: 0,
        fuel: 0,
        looseBills: 177.89,
        totalExpenses: 10041.73,
        monthlyBalance: 332.19,
        savingsItau: 3124.69,
        avenue: 0,
        liquidAccount: 411.54,
        dollarAmount: 0,
        exchangeRate: 0,
        netWorth: 3536.23,
        notes: "Fatura Itaú Black fechada em R$ 4.177,82 (Venc. 28/09/2026)",
        status: "completed"
      };
      updateMonthlyRecord(originalSeptember);
    }
  }, [records]);

  // Sync October 2026 with real closing numbers and balances
  useEffect(() => {
    if (user && isUserAuthorized(user)) {
      const oct = records.find(r => r.id === '2026-10');
      if (oct && (oct.salary === 0 || oct.status !== 'current' || oct.savingsItau !== 7144.72)) {
        const octoberUpdated: MonthlyRecord = {
          id: "2026-10",
          year: 2026,
          month: "Outubro",
          monthIndex: 10,
          salary: 9744.19,
          extraIncome: 9544.73,
          totalIncome: 19288.92,
          car: 2562.95,
          apartment: 3181.43,
          itau: 4177.82,
          nubank: 392.16,
          fuel: 0,
          looseBills: 0,
          totalExpenses: 10314.36,
          monthlyBalance: 8974.56,
          savingsItau: 7144.72,
          avenue: 4596.45,
          liquidAccount: 602.16,
          dollarAmount: 0,
          exchangeRate: 1,
          netWorth: 12343.33,
          notes: "Fechamento do ciclo 25/09 (Out/2026). Reserva de Emergência Itaú: R$ 7.144,72 | 9 FIIs Nubank: R$ 4.596,45 | Saldo em Conta: R$ 602,16.",
          status: "current"
        };
        updateMonthlyRecord(octoberUpdated);
      }

      // Sync B3 Assets if missing or quantity 0
      const hasRealB3 = b3Assets.some(a => a.ticker === 'MXRF11' && a.quantity === 67);
      if (!hasRealB3) {
        syncB3AssetsToFirestore(INITIAL_B3_ASSETS);
        cleanObsoleteB3Assets(INITIAL_B3_ASSETS.map(a => a.ticker));
      }

      // Sync Financing Contracts if carro still has 45 installments or old balance
      const carContract = contracts.find(c => c.category === 'carro');
      if (carContract && (carContract.remainingInstallments > 44 || carContract.totalBalance > 113110.45)) {
        syncFinancingContractsToFirestore(INITIAL_FINANCING_CONTRACTS);
      }

      // Sync MRV Installments if M017 is not marked as pago
      const m17 = mrvSchedule.find(i => i.code === 'M017');
      if (m17 && m17.status !== 'pago') {
        syncMRVInstallmentsToFirestore(INITIAL_MRV_INSTALLMENTS);
      }

      // Sync B3 Transactions if empty
      const hasRealTransactions = b3Transactions.some(t => t.ticker === 'MXRF11' && t.quantity === 67);
      if (!hasRealTransactions) {
        syncB3TransactionsToFirestore(INITIAL_B3_TRANSACTIONS);
      }
    }
  }, [user, records, b3Assets, b3Transactions, contracts, mrvSchedule]);

  const handleConfirmClosing = async (
    monthId: string,
    salary: number,
    extraIncome: number,
    car: number,
    apartment: number,
    itauCard: number,
    nubank: number,
    reserveAmount: number,
    b3Amount: number,
    liquidAccount: number,
    savingsItau: number
  ) => {
    const existingRecord = records.find(r => r.id === monthId);
    const [yearStr, monthStr] = monthId.split('-');
    const year = parseInt(yearStr, 10) || 2026;
    const monthIndex = parseInt(monthStr, 10) || 9;
    const MONTH_NAMES = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const monthName = existingRecord?.month || MONTH_NAMES[monthIndex - 1] || 'Mês';

    const previousB3 = existingRecord?.avenue || 0;
    const finalSavingsItau = (savingsItau > 0 ? savingsItau : (existingRecord?.savingsItau || 0)) + reserveAmount;
    const finalB3 = previousB3 + b3Amount;
    const totalIncome = salary + extraIncome;
    const totalExpenses = car + apartment + itauCard + nubank;
    const monthlyBalance = totalIncome - totalExpenses - reserveAmount - b3Amount;
    const finalLiquid = Math.max(0, liquidAccount - reserveAmount - b3Amount);

    const updatedRecord: MonthlyRecord = {
      id: monthId,
      year,
      month: monthName,
      monthIndex,
      salary,
      extraIncome,
      totalIncome,
      car,
      apartment,
      itau: itauCard,
      nubank,
      fuel: 0,
      looseBills: 0,
      totalExpenses,
      monthlyBalance,
      savingsItau: finalSavingsItau,
      avenue: finalB3,
      liquidAccount: finalLiquid,
      dollarAmount: 0,
      exchangeRate: 1,
      netWorth: finalSavingsItau + finalB3 + finalLiquid,
      status: 'completed',
      notes: `Fechamento do dia 25 (${monthName}/${year}) consolidado com sucesso no Firestore.`
    };

    try {
      await updateMonthlyRecord(updatedRecord);
      setSelectedMonthId(monthId);

      // Interconnect with Financing: Update Car contract if car payment is present
      if (car > 0) {
        const carContract = contracts.find(c => c.category === 'carro');
        if (carContract) {
          const updatedCar: FinancingContract = {
            ...carContract,
            totalBalance: Math.max(0, carContract.totalBalance - car),
            remainingInstallments: Math.max(0, carContract.remainingInstallments - 1),
            monthlyPayment: car,
            notes: `Parcelas fixas mensais. Parcela de ${monthName}/${year} quitada (R$ ${car.toFixed(2)}).`
          };
          await updateFinancingContract(updatedCar);
        }
      }

      // Interconnect with MRV Schedule: Mark matching installments as paid
      if (apartment > 0) {
        const targetDueMonth = String(monthIndex).padStart(2, '0');
        for (const inst of mrvSchedule) {
          if (inst.dueDate.includes(`/${targetDueMonth}/`) && inst.status !== 'pago') {
            await updateMRVInstallment({
              ...inst,
              status: 'pago',
              paidAt: `25/${targetDueMonth}/${year}`
            });
          }
        }
      }
    } catch (e) {
      console.error('Erro ao atualizar fechamento no Firestore:', e);
    }
  };

  const handleAddTransaction = async (tx: InvestmentTransaction) => {
    try {
      await addB3Transaction(tx);

      // Recalculate consolidated asset position
      const tickerUpper = tx.ticker.toUpperCase();
      const allTxForTicker = [...b3Transactions.filter(t => t.id !== tx.id), tx].filter(
        t => t.ticker.toUpperCase() === tickerUpper
      );

      const totalBoughtQty = allTxForTicker
        .filter(t => t.type === 'compra')
        .reduce((acc, t) => acc + t.quantity, 0);

      const totalSoldQty = allTxForTicker
        .filter(t => t.type === 'venda')
        .reduce((acc, t) => acc + t.quantity, 0);

      const netQuantity = Math.max(0, totalBoughtQty - totalSoldQty);

      const totalInvestedInBuys = allTxForTicker
        .filter(t => t.type === 'compra')
        .reduce((acc, t) => acc + t.totalValue, 0);

      const newAveragePrice = totalBoughtQty > 0 ? totalInvestedInBuys / totalBoughtQty : tx.price;

      const existingAsset = b3Assets.find(a => a.ticker.toUpperCase() === tickerUpper);

      const updatedAsset: B3Asset = existingAsset
        ? {
            ...existingAsset,
            quantity: netQuantity,
            averagePrice: Number(newAveragePrice.toFixed(3)),
            updatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }
        : {
            ticker: tickerUpper,
            name: tickerUpper,
            type: tickerUpper.endsWith('11') ? 'fii' : 'acao',
            segment: 'Mercado Nacional',
            quantity: netQuantity,
            averagePrice: Number(newAveragePrice.toFixed(3)),
            currentPrice: tx.price,
            monthlyDividendPerShare: 0,
            dividendYieldYearly: 0,
            updatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };

      await updateB3Asset(updatedAsset);
    } catch (err) {
      console.error('Erro ao adicionar transação e recalcular ativo:', err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const txToDelete = b3Transactions.find(t => t.id === id);
      await deleteB3Transaction(id);

      if (txToDelete) {
        const tickerUpper = txToDelete.ticker.toUpperCase();
        const remainingTx = b3Transactions.filter(t => t.id !== id && t.ticker.toUpperCase() === tickerUpper);

        const totalBoughtQty = remainingTx
          .filter(t => t.type === 'compra')
          .reduce((acc, t) => acc + t.quantity, 0);

        const totalSoldQty = remainingTx
          .filter(t => t.type === 'venda')
          .reduce((acc, t) => acc + t.quantity, 0);

        const netQuantity = Math.max(0, totalBoughtQty - totalSoldQty);

        const totalInvestedInBuys = remainingTx
          .filter(t => t.type === 'compra')
          .reduce((acc, t) => acc + t.totalValue, 0);

        const newAveragePrice = totalBoughtQty > 0 ? totalInvestedInBuys / totalBoughtQty : 0;

        const existingAsset = b3Assets.find(a => a.ticker.toUpperCase() === tickerUpper);
        if (existingAsset) {
          await updateB3Asset({
            ...existingAsset,
            quantity: netQuantity,
            averagePrice: Number(newAveragePrice.toFixed(3)),
            updatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
    } catch (err) {
      console.error('Erro ao remover transação e recalcular ativo:', err);
    }
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
  const kpis = calculateKPIs(records, b3Assets);
  const currentRecord = records.find(r => r.id === selectedMonthId) || 
                        records.find(r => r.status === 'current') || 
                        records[records.length - 1];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenClosing={() => setIsClosingModalOpen(true)}
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
            <OverviewCards kpis={kpis} />
            <FinancialCharts records={records} />
          </div>
        )}

        {activeTab === 'table' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Histórico Mensal Completo</h2>
              <p className="text-xs text-slate-400">
                Registros sincronizados em tempo real do Cloud Firestore
              </p>
            </div>
            <MonthlyTable records={records} />
          </div>
        )}

        {activeTab === 'financing' && (
          <div className="animate-in fade-in duration-300">
            <FinancingSection
              contracts={contracts}
              mrvSchedule={mrvSchedule}
            />
          </div>
        )}

        {activeTab === 'investments' && (
          <div className="animate-in fade-in duration-300">
            <InvestmentsSection 
              assets={b3Assets} 
              transactions={b3Transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        )}

        {activeTab === 'card' && (
          <div className="animate-in fade-in duration-300">
            <CreditCardSection purchases={cardPurchases} />
          </div>
        )}
      </main>

      {/* Monthly Closing Guided Modal (Dia 25) */}
      <MonthlyClosingModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        selectedMonthId={selectedMonthId}
        selectedMonthLabel={currentRecord ? `${currentRecord.month}/${currentRecord.year}` : selectedMonthId}
        currentRecord={currentRecord}
        onConfirmClosing={handleConfirmClosing}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            FinCore • Conectado ao Firebase Cloud Firestore
          </span>
          <span className="text-slate-600">
            Usuário: {user.email} • Banco de Dados na Nuvem 100% Ativo
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
