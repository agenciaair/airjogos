import { useState } from 'react';
import { Check, Save, Trash2 } from 'lucide-react';
import type { CustomTheme } from '../utils/themeParser';

interface Category {
  key: string;
  label: string;
}

interface ThemeSourcePickerProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (key: string) => void;
  mode: 'predefinido' | 'custom';
  onModeChange: (mode: 'predefinido' | 'custom') => void;
  customText: string;
  onCustomTextChange: (text: string) => void;
  customPlaceholder: string;
  savedThemes: CustomTheme[];
  onLoadSaved: (theme: CustomTheme) => void;
  onDeleteSaved: (id: string) => void;
  onSaveCurrent: (name: string) => void;
}

export default function ThemeSourcePicker({
  categories,
  selectedCategory,
  onSelectCategory,
  mode,
  onModeChange,
  customText,
  onCustomTextChange,
  customPlaceholder,
  savedThemes,
  onLoadSaved,
  onDeleteSaved,
  onSaveCurrent,
}: ThemeSourcePickerProps) {
  const [themeName, setThemeName] = useState('');

  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onModeChange('predefinido')}
          className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold transition
            ${mode === 'predefinido' ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
        >
          Categoria pré-definida
        </button>
        <button
          type="button"
          onClick={() => onModeChange('custom')}
          className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold transition
            ${mode === 'custom' ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
        >
          Criar tema
        </button>
      </div>

      {mode === 'predefinido' ? (
        <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-700 bg-slate-800/30">
          {categories.map((c, i) => {
            const selected = selectedCategory === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => onSelectCategory(c.key)}
                className={`flex min-h-[48px] w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition
                  ${i !== 0 ? 'border-t border-slate-800' : ''}
                  ${selected ? 'bg-lime-400/10 text-lime-400' : 'text-slate-300 active:bg-slate-800/60'}`}
              >
                {c.label}
                {selected && <Check size={18} className="shrink-0 text-lime-400" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <textarea
            value={customText}
            onChange={(e) => onCustomTextChange(e.target.value)}
            placeholder={customPlaceholder}
            rows={4}
            className="min-h-[100px] rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-lime-400"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              placeholder="Nome do tema (para salvar)"
              className="min-h-[44px] flex-1 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-lime-400"
            />
            <button
              type="button"
              onClick={() => {
                if (!themeName.trim()) return;
                onSaveCurrent(themeName.trim());
                setThemeName('');
              }}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-700 text-slate-300 active:scale-95"
              aria-label="Salvar tema"
            >
              <Save size={18} />
            </button>
          </div>

          {savedThemes.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-400">Temas salvos:</span>
              {savedThemes.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 px-3 py-2"
                >
                  <button type="button" onClick={() => onLoadSaved(t)} className="flex-1 text-left text-sm font-semibold text-slate-200">
                    {t.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSaved(t.id)}
                    className="flex min-h-[36px] min-w-[36px] items-center justify-center text-slate-500 active:text-red-400"
                    aria-label="Excluir tema salvo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
