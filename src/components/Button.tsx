import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'accent' | 'ghost' | 'danger' | 'warning';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-lime-400 text-slate-950 hover:bg-lime-300 active:bg-lime-500',
  accent: 'bg-transparent border-2 border-lime-400 text-lime-400 hover:bg-lime-400/10',
  ghost: 'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700',
  danger: 'bg-red-500 text-white hover:bg-red-400 active:bg-red-600',
  warning: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`no-select min-h-[48px] min-w-[48px] rounded-2xl px-6 py-3 text-base font-bold
        font-display transition active:scale-95 disabled:opacity-40 disabled:active:scale-100
        ${VARIANT_CLASSES[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
