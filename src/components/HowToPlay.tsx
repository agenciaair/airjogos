import { useEffect } from 'react';
import { Ban, Clock, Lightbulb, Settings2, Target, Trophy, Users, X } from 'lucide-react';
import { RULES, type GameKey } from '../data/rules';

interface HowToPlayProps {
  game: GameKey;
  open: boolean;
  onClose: () => void;
}

export default function HowToPlay({ game, open, onClose }: HowToPlayProps) {
  const r = RULES[game];

  // Fecha com Esc e trava a rolagem da página por trás
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="regras-titulo"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-t-3xl border border-slate-800 bg-slate-900 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-5 pb-4 pt-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-lime-400">Como jogar</p>
            <h2 id="regras-titulo" className="font-display text-2xl font-extrabold leading-tight text-white">
              {r.title}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1">
                <Users size={14} /> {r.players}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1">
                <Clock size={14} /> {r.duration}
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-1">📱 1 celular</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar regras"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 active:scale-95 active:bg-slate-800"
          >
            <X size={22} />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex flex-col gap-6 overflow-y-auto px-5 py-5">
          <section className="rounded-2xl border border-lime-400/40 bg-lime-400/10 p-4">
            <h3 className="mb-1 flex items-center gap-2 font-display text-base font-bold text-lime-400">
              <Target size={18} /> Objetivo
            </h3>
            <p className="text-[15px] leading-relaxed text-slate-100">{r.goal}</p>
          </section>

          <section>
            <h3 className="mb-3 font-display text-base font-bold text-white">Passo a passo</h3>
            <ol className="flex flex-col gap-3">
              {r.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime-400 font-display text-sm font-extrabold text-slate-950">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-[15px] leading-relaxed text-slate-200">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-white">
              <Trophy size={18} className="text-amber-400" /> Quem ganha
            </h3>
            <ul className="flex flex-col gap-2">
              {r.win.map((w, i) => (
                <li key={i} className="rounded-xl bg-slate-800/70 px-4 py-3 text-[15px] leading-relaxed text-slate-200">
                  {w}
                </li>
              ))}
            </ul>
          </section>

          {r.forbidden && r.forbidden.length > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-white">
                <Ban size={18} className="text-red-400" /> Não pode
              </h3>
              <ul className="flex flex-col gap-2">
                {r.forbidden.map((f, i) => (
                  <li key={i} className="flex gap-2 text-[15px] leading-relaxed text-slate-200">
                    <span className="text-red-400">✕</span> {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-white">
              <Settings2 size={18} className="text-slate-400" /> O que cada opção faz
            </h3>
            <dl className="flex flex-col gap-2">
              {r.options.map((o) => (
                <div key={o.name} className="rounded-xl border border-slate-800 px-4 py-3">
                  <dt className="font-display text-sm font-bold text-lime-400">{o.name}</dt>
                  <dd className="text-sm leading-relaxed text-slate-300">{o.text}</dd>
                </div>
              ))}
            </dl>
          </section>

          {r.tips.length > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-white">
                <Lightbulb size={18} className="text-amber-400" /> Dicas
              </h3>
              <ul className="flex flex-col gap-1.5">
                {r.tips.map((t, i) => (
                  <li key={i} className="text-[15px] leading-relaxed text-slate-300">
                    • {t}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="border-t border-slate-800 p-4 safe-bottom">
          <button
            onClick={onClose}
            className="no-select min-h-[52px] w-full rounded-2xl bg-lime-400 font-display text-base font-bold text-slate-950 active:scale-95"
          >
            Entendi, bora jogar!
          </button>
        </div>
      </div>
    </div>
  );
}
