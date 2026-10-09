import { useState, type ReactNode } from 'react';
import { Eye } from 'lucide-react';

interface HoldToRevealProps {
  /** conteúdo mostrado enquanto o dedo/mouse está pressionado */
  revealed: ReactNode;
  /** rótulo do botão quando não está pressionado */
  label?: string;
}

export default function HoldToReveal({ revealed, label = 'Segure para revelar' }: HoldToRevealProps) {
  const [pressed, setPressed] = useState(false);

  function press() {
    setPressed(true);
  }
  function release() {
    setPressed(false);
  }

  return (
    <div
      onMouseDown={press}
      onMouseUp={release}
      onMouseLeave={release}
      onTouchStart={(e) => {
        e.preventDefault();
        press();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        release();
      }}
      onTouchCancel={release}
      onContextMenu={(e) => e.preventDefault()}
      className={`no-select flex min-h-[220px] w-full select-none flex-col items-center justify-center rounded-3xl border-2 px-6 py-10 text-center transition-colors
        ${pressed ? 'border-lime-400 bg-slate-900' : 'border-dashed border-slate-700 bg-slate-800/40 active:bg-slate-800'}`}
    >
      {pressed ? (
        revealed
      ) : (
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Eye size={36} />
          <span className="font-display text-lg font-bold">{label}</span>
          <span className="text-xs">Mantenha o dedo na tela e mostre só para você</span>
        </div>
      )}
    </div>
  );
}
