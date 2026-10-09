import type { HTMLAttributes, ReactNode } from 'react';

export default function Panel({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`w-full rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/30 backdrop-blur-sm sm:p-7 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
