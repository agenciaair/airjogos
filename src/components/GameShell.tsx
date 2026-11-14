import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import HowToPlay from './HowToPlay';
import type { GameKey } from '../data/rules';

interface GameShellProps {
  title: ReactNode;
  children: ReactNode;
  /** true quando existe uma partida em andamento — pede confirmação antes de sair */
  matchInProgress?: boolean;
  accent?: string;
  /** jogo cujas regras o botão "Regras" abre */
  game?: GameKey;
}

const SEEN_PREFIX = 'airjogos:regras-vistas:';

function rulesAlreadySeen(game: GameKey): boolean {
  try {
    return localStorage.getItem(SEEN_PREFIX + game) === '1';
  } catch {
    return true; // sem acesso ao storage: não força a abertura
  }
}

function markRulesSeen(game: GameKey) {
  try {
    localStorage.setItem(SEEN_PREFIX + game, '1');
  } catch {
    /* ignora */
  }
}

export default function GameShell({ title, children, matchInProgress = false, accent = 'text-lime-400', game }: GameShellProps) {
  const navigate = useNavigate();
  const [rulesOpen, setRulesOpen] = useState(false);

  // Na primeira vez que alguém abre um jogo, as regras já aparecem sozinhas.
  useEffect(() => {
    if (game && !rulesAlreadySeen(game)) setRulesOpen(true);
  }, [game]);

  const closeRules = useCallback(() => {
    setRulesOpen(false);
    if (game) markRulesSeen(game);
  }, [game]);

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
        {game ? (
          <button
            onClick={() => setRulesOpen(true)}
            className="no-select flex min-h-[48px] items-center gap-1 rounded-xl px-3 py-2 font-display font-bold text-lime-400 active:scale-95"
            aria-label="Ver regras do jogo"
          >
            <HelpCircle size={20} />
            Regras
          </button>
        ) : (
          <span className="w-[64px]" />
        )}
      </header>
      <main className="flex w-full max-w-xl flex-1 flex-col items-center gap-4">{children}</main>
      {game && <HowToPlay game={game} open={rulesOpen} onClose={closeRules} />}
    </div>
  );
}
