import React from 'react';
import { 
  WalletCards, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Building2, 
  LockKeyhole,
  ArrowRight
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoading, error }) => {
  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <WalletCards className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            FinCore
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Privado
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Proteção Firebase & Google</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 relative z-10 py-12">
        <div className="max-w-md w-full space-y-8 bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          
          {/* Header & Icon */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center mx-auto shadow-inner">
              <LockKeyhole className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Controle Financeiro
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Painel pessoal restrito. Conecte-se com sua conta Google para visualizar métricas, despesas e patrimônio.
            </p>
          </div>

          {/* Features Highlights */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Fluxo de caixa mensal e histórico 2025–2027</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300">
              <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Planejamento e compras do Novo Apartamento 2027</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Atualização e manutenção direta via Assistente</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 text-center">
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <div className="pt-2">
            <button
              onClick={onLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-semibold text-sm shadow-xl shadow-white/5 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Conectando...' : 'Entrar com Conta Google'}</span>
              <ArrowRight className="w-4 h-4 text-slate-500 ml-auto" />
            </button>
          </div>

          {/* Security Note */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Autenticação criptografada de ponta a ponta
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-600 relative z-10">
        FinCore • Gestão Patrimonial e Financeira Privada
      </footer>
    </div>
  );
};
