interface PlayerNamesEditorProps {
  names: string[];
  onChange: (names: string[]) => void;
}

export default function PlayerNamesEditor({ names, onChange }: PlayerNamesEditorProps) {
  function updateName(i: number, value: string) {
    const next = [...names];
    next[i] = value;
    onChange(next);
  }

  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
      {names.map((name, i) => (
        <label key={i} className="flex flex-col gap-1 text-left">
          <span className="text-xs font-semibold text-slate-400">Jogador {i + 1}</span>
          <input
            type="text"
            value={name}
            maxLength={18}
            placeholder={`Jogador ${i + 1}`}
            onChange={(e) => updateName(i, e.target.value)}
            className="min-h-[48px] rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-base text-slate-100 outline-none focus:border-lime-400"
          />
        </label>
      ))}
    </div>
  );
}
