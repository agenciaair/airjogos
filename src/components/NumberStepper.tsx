import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export default function NumberStepper({ label, value, min = 1, max = 99, step = 1, onChange }: NumberStepperProps) {
  function clamp(n: number) {
    return Math.min(max, Math.max(min, n));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-sm font-semibold text-slate-300">{label}</span>
      <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800/60">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-l-2xl text-slate-200 active:scale-95 active:bg-slate-700"
          aria-label={`diminuir ${label}`}
        >
          <Minus size={20} />
        </button>
        <span className="min-w-[3ch] text-center font-display text-xl font-extrabold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-r-2xl text-slate-200 active:scale-95 active:bg-slate-700"
          aria-label={`aumentar ${label}`}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
