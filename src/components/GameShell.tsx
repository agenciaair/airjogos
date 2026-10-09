import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface GameShellProps {
  title: ReactNode;
  children: ReactNode;
  /** true quando existe uma partida em andamento — pede confirmação antes de sair */
  matchInProgress?: boolean;
  accent?: string;
}

export default function GameShell({ title, children, matchInProgress = false, accent = 'text-lime-400' }: GameShellProps) {
  const navigate = useNavigate();

  function handleBack() {
    if (matchInProgress) {
      const ok = window.confirm('A partida está em andamento. Sair agora e voltar para a Home?');
      if (!ok) return;
    }
    navigate('/');
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-950 px-4 pb-10 pt-4 safe-bottom">
      <header className="mb-4 flex w-full max-w-xl items-center justify-between">
        <button
          onClick={handleBack}
          className="no-select flex min-h-[48px] items-center gap-1 rounded-xl px-3 py-2 font-display font-bold text-slate-300 active:scale-95"
        >
          <ChevronLeft size={22} />
          Home
        </button>
        <h1 className={`font-display text-lg font-extrabold tracking-wide ${accent}`}>{title}</h1>
        <span className="w-[64px]" />
      </header>
      <main className="flex w-full max-w-xl flex-1 flex-col items-center gap-4">{children}</main>
    </div>
  );
}
