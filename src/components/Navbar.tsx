import React from 'react';
import { 
  LayoutDashboard, 
  TableProperties, 
  Building2, 
  MessageSquareCode, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  WalletCards
} from 'lucide-react';
import type { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: 'overview' | 'table' | 'apartment' | 'chat';
  setActiveTab: (tab: 'overview' | 'table' | 'apartment' | 'chat') => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isFirebaseReady: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogin,
  onLogout,
  isFirebaseReady,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
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
              <p className="text-xs text-slate-400 hidden sm:block">Controle Financeiro & Patrimônio</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Visão Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'table'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TableProperties className="w-4 h-4" />
              <span>Histórico Mensal</span>
            </button>

            <button
              onClick={() => setActiveTab('apartment')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'apartment'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Novo Apartamento 2027</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquareCode className="w-4 h-4" />
              <span>Atualizar via Chat</span>
            </button>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center space-x-3">
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
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>{isFirebaseReady ? 'Entrar com Google' : 'Modo Local'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-900 text-xs scrollbar-none">
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
            Histórico Mensal
          </button>
          <button
            onClick={() => setActiveTab('apartment')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'apartment' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Apartamento 2027
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'chat' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Atualizar via Chat
          </button>
        </div>
      </div>
    </header>
  );
};
