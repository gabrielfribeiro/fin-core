import React from 'react';
import { 
  MessageSquareCode, 
  CheckCircle, 
  Sparkles, 
  Flame, 
  Copy, 
  ShieldCheck
} from 'lucide-react';

interface AssistantGuideProps {
  isFirebaseReady: boolean;
}

export const AssistantGuide: React.FC<AssistantGuideProps> = ({ isFirebaseReady }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const sampleCommands = [
    {
      title: 'Lançar Salário do dia 25',
      command: 'Recebi meu salário hoje no dia 25: R$ 10.500,00. Anote para o mês de Outubro/2026.',
      category: 'Receitas'
    },
    {
      title: 'Atualizar Fatura do Cartão',
      command: 'A fatura do Itaú fechou em R$ 3.250,00 e o Nubank em R$ 120,00.',
      category: 'Despesas'
    },
    {
      title: 'Lançar Custos Fixos',
      command: 'Paguei o Apartamento R$ 3.100,00 e a parcela do Carro R$ 2.560,00.',
      category: 'Despesas'
    },
    {
      title: 'Aporte na Reserva de Emergência',
      command: 'Guardei R$ 1.500,00 no Itaú. Atualize o saldo total guardado para R$ 4.624,00.',
      category: 'Patrimônio'
    },
    {
      title: 'Compra de Eletrodoméstico do AP',
      command: 'Comprei o Micro-ondas da lista do apartamento por R$ 780,00 à vista.',
      category: 'Apartamento'
    },
    {
      title: 'Adicionar Novo Item na Lista do AP',
      command: 'Adicione na lista de compras do apartamento: Ar-condicionado Split estimado em R$ 2.800,00.',
      category: 'Apartamento'
    }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Como Funciona a Atualização via Chat</h2>
            <p className="text-xs text-slate-400">Você só precisa me mandar uma mensagem e eu cuido do resto</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
          <p className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Zero formulários chatos:</strong> Você não perde tempo preenchendo campos na tela do celular.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Sincronização em tempo real:</strong> Ao me enviar o comando no chat, executo o script de atualização e a sua tela atualiza na hora sem precisar recarregar a página!
            </span>
          </p>
          <p className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Conexão Segura:</strong> Com o Firebase ativo e autenticado pelo Google, apenas você tem acesso visual aos dados.
            </span>
          </p>
        </div>
      </div>

      {/* Examples Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Exemplos de Comandos que Você Pode me Mandar
        </h3>
        <p className="text-xs text-slate-400">
          Você pode copiar qualquer um dos modelos abaixo ou falar com suas próprias palavras no chat:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sampleCommands.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{item.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                "{item.command}"
              </p>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleCopy(item.command, idx)}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-emerald-400 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedIndex === idx ? 'Copiado!' : 'Copiar texto'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Firebase Status & Deployment Info */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            Status do Firebase
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
              isFirebaseReady
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {isFirebaseReady ? '● Conectado ao Firebase' : '○ Modo Local Ativo'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {isFirebaseReady
            ? 'Seu projeto está conectado ao Firestore em tempo real. Qualquer alteração feita aqui no chat é refletida instantaneamente na nuvem.'
            : 'O dashboard está rodando com todos os dados históricos reais da sua planilha original. Para conectar ao seu banco de dados Firebase e ativar o login com Google na Vercel, basta preencher as variáveis no arquivo .env (eu posso te guiar em menos de 2 minutos!).'}
        </p>
      </div>
    </div>
  );
};
