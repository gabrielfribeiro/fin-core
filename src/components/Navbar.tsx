import React from 'react';
import { 
  LayoutDashboard, 
  TableProperties, 
  Landmark,
  Coins,
  CreditCard,
  CalendarCheck,
  CalendarDays,
  LogIn, 
  LogOut, 
  ShieldCheck, 
  WalletCards
} from 'lucide-react';
import type { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: 'overview' | 'table' | 'financing' | 'investments' | 'card';
  setActiveTab: (tab: 'overview' | 'table' | 'financing' | 'investments' | 'card') => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenClosing: () => void;
  isFirebaseReady: boolean;
  selectedMonthId: string;
  onSelectMonth: (monthId: string) => void;
  availableMonths: { id: string; label: string; year: number; month: string }[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogin,
  onLogout,
  onOpenClosing,
  isFirebaseReady,
  selectedMonthId,
  onSelectMonth,
  availableMonths,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <WalletCards className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                FinCore
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ao Vivo
                </span>
              </span>
              <p className="text-xs text-slate-400 hidden xl:block">Controle Financeiro & Patrimônio</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Visão Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Histórico</span>
            </button>

            <button
              onClick={() => setActiveTab('financing')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'financing'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Financiamentos</span>
            </button>

            <button
              onClick={() => setActiveTab('investments')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'investments'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Carteira B3</span>
            </button>

            <button
              onClick={() => setActiveTab('card')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'card'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Cartão Itaú</span>
            </button>
          </nav>

          {/* User Auth Section & Closing Button */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Month Selector Dropdown */}
            {user && availableMonths && availableMonths.length > 0 && (
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 transition">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <select
                  value={selectedMonthId}
                  onChange={(e) => onSelectMonth(e.target.value)}
                  aria-label="Mês de Referência"
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
                >
                  {availableMonths.map((m) => (
                    <option key={m.id} value={m.id} className="bg-slate-950 text-slate-200">
                      {m.month}/{m.year} {m.id === '2026-09' ? '• Atual' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Fechamento Dia 25 Button */}
            {user && (
              <button
                onClick={onOpenClosing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold transition shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Fechamento Dia 25</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-200">{user.displayName || 'Usuário'}</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Acesso Seguro
                  </span>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-9 h-9 rounded-full border border-emerald-500/40"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={onLogout}
                  title="Sair da conta"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>{isFirebaseReady ? 'Entrar com Google' : 'Modo Local'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-900 text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'overview' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'table' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Histórico
          </button>
          <button
            onClick={() => setActiveTab('financing')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'financing' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Financiamentos
          </button>
          <button
            onClick={() => setActiveTab('investments')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'investments' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Carteira B3
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'card' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Cartão Itaú
          </button>
        </div>
      </div>
    </header>
  );
};
