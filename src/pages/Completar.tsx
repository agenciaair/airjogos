import { useMemo, useState } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import GameShell from '../components/GameShell';
import Panel from '../components/Panel';
import Button from '../components/Button';
import NumberStepper from '../components/NumberStepper';
import PlayerNamesEditor from '../components/PlayerNamesEditor';
import HoldToReveal from '../components/HoldToReveal';
import ThemeSourcePicker from '../components/ThemeSourcePicker';
import { COMPLETAR_CATEGORIES } from '../data/completarData';
import { drawUnique } from '../utils/antiRepetition';
import { parseSimpleList, saveCustomTheme, getCustomThemes, deleteCustomTheme, type CustomTheme } from '../utils/themeParser';
import { useCountdown } from '../hooks/useCountdown';
import { useSoundEffects } from '../hooks/useSoundEffects';

type Phase = 'setup' | 'players' | 'reveal' | 'round' | 'roundResult';

export default function Completar() {
  const [phase, setPhase] = useState<Phase>('setup');
  const sfx = useSoundEffects();

  const [qtdJogadores, setQtdJogadores] = useState(4);
  const [limitePalavras, setLimitePalavras] = useState(10);
  const [usarTimer, setUsarTimer] = useState(false);
  const [minutosTimer, setMinutosTimer] = useState(2);
  const [modoTema, setModoTema] = useState<'predefinido' | 'custom'>('predefinido');
  const [categoriaKey, setCategoriaKey] = useState(COMPLETAR_CATEGORIES[0].key);
  const [customText, setCustomText] = useState('');
  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>(() => getCustomThemes('completar'));
  const [resetNotice, setResetNotice] = useState('');

  const [players, setPlayers] = useState<string[]>([]);
  const [guesserIndex, setGuesserIndex] = useState(0);
  const [word, setWord] = useState('');
  const [categoriaLabel, setCategoriaLabel] = useState('');
  const [wordsSaid, setWordsSaid] = useState(0);
  const [rodadas, setRodadas] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [lastResult, setLastResult] = useState<'acertou' | 'errou' | null>(null);

  const timer = useCountdown(minutosTimer * 60, {
    onTick: (s) => {
      if (s <= 10) sfx.playTick();
    },
    onFinish: () => sfx.playAlarm(),
  });

  const matchInProgress = phase !== 'setup';

  function drawWord() {
    const pool = modoTema === 'predefinido' ? COMPLETAR_CATEGORIES.find((c) => c.key === categoriaKey)!.items : parseSimpleList(customText);
    const label = modoTema === 'predefinido' ? COMPLETAR_CATEGORIES.find((c) => c.key === categoriaKey)!.label : 'Tema Personalizado';
    const key = `completar:${modoTema === 'predefinido' ? categoriaKey : 'custom'}`;
    const draw = drawUnique(key, pool, (w) => w);
    setResetNotice(draw.didReset ? 'As palavras dessa categoria acabaram — reiniciando o ciclo!' : '');
    setWord(draw.item);
    setCategoriaLabel(label);
  }

  function handleSetupSubmit() {
    if (qtdJogadores < 3) return;
    if (modoTema === 'custom' && parseSimpleList(customText).length === 0) return;
    setPhase('players');
  }

  function handlePlayersSubmit(names: string[]) {
    setPlayers(names);
    setGuesserIndex(0);
    drawWord();
    setNarradorRevealIdx(0);
    setPhase('reveal');
  }

  const narradores = useMemo(() => {
    if (players.length === 0) return [];
    const order: string[] = [];
    for (let i = 1; i < players.length; i++) {
      order.push(players[(guesserIndex + i) % players.length]);
    }
    return order;
  }, [players, guesserIndex]);

  const [narradorRevealIdx, setNarradorRevealIdx] = useState(0);

  function startReveal() {
    setNarradorRevealIdx(0);
    setPhase('reveal');
  }

  function handleRevealNext() {
    if (narradorRevealIdx === narradores.length - 1) {
      setWordsSaid(0);
      if (usarTimer) timer.reset(minutosTimer * 60);
      setPhase('round');
      return;
    }
    setNarradorRevealIdx((i) => i + 1);
  }

  function handleResult(result: 'acertou' | 'errou') {
    if (result === 'acertou') {
      sfx.playCorrect();
      setAcertos((a) => a + 1);
    } else {
      sfx.playError();
    }
    setRodadas((r) => r + 1);
    setLastResult(result);
    timer.pause();
    setPhase('roundResult');
  }

  function handleNextRound() {
    const nextGuesser = (guesserIndex + 1) % players.length;
    setGuesserIndex(nextGuesser);
    drawWord();
    startReveal();
  }

  function handleRestart() {
    setPhase('setup');
    setPlayers([]);
    setRodadas(0);
    setAcertos(0);
    setResetNotice('');
  }

  return (
    <GameShell title="COMPLETAR" matchInProgress={matchInProgress} accent="text-lime-400">
      {phase === 'setup' && (
        <Panel className="flex flex-col items-center gap-5">
          <NumberStepper label="Jogadores" value={qtdJogadores} min={3} max={20} onChange={setQtdJogadores} />

          <div className="flex flex-col gap-2 w-full">
            <span className="font-display text-sm font-semibold text-slate-300">Limite de palavras na roda</span>
            <div className="flex gap-2">
              {[10, 15].map((n) => (
                <button
                  key={n}
                  onClick={() => setLimitePalavras(n)}
                  className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${limitePalavras === n ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
                >
                  {n} palavras
                </button>
              ))}
            </div>
          </div>

          <label className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <input type="checkbox" checked={usarTimer} onChange={(e) => setUsarTimer(e.target.checked)} className="h-5 w-5 accent-lime-400" />
            <span className="text-sm font-semibold">Usar cronômetro (opcional)</span>
          </label>
          {usarTimer && <NumberStepper label="Minutos por rodada" value={minutosTimer} min={1} max={5} onChange={setMinutosTimer} />}

          <ThemeSourcePicker
            categories={COMPLETAR_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
            selectedCategory={categoriaKey}
            onSelectCategory={setCategoriaKey}
            mode={modoTema}
            onModeChange={setModoTema}
            customText={customText}
            onCustomTextChange={setCustomText}
            customPlaceholder="Cole ou digite palavras separadas por vírgula ou quebra de linha"
            savedThemes={savedThemes}
            onLoadSaved={(t) => setCustomText((t.items as string[]).join(', '))}
            onDeleteSaved={(id) => {
              deleteCustomTheme(id);
              setSavedThemes(getCustomThemes('completar'));
            }}
            onSaveCurrent={(name) => {
              const items = parseSimpleList(customText);
              if (items.length === 0) return;
              saveCustomTheme({ game: 'completar', name, items });
              setSavedThemes(getCustomThemes('completar'));
            }}
          />

          <Button fullWidth onClick={handleSetupSubmit}>
            Continuar
          </Button>
        </Panel>
      )}

      {phase === 'players' && (
        <Panel className="flex flex-col items-center gap-4">
          <h2 className="font-display text-xl font-extrabold">Jogadores</h2>
          <PlayersStep count={qtdJogadores} onSubmit={handlePlayersSubmit} />
        </Panel>
      )}

      {phase === 'reveal' && narradores.length > 0 && (
        <Panel className="flex flex-col items-center gap-4">
          {resetNotice && (
            <p className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300">
              <AlertTriangle size={16} /> {resetNotice}
            </p>
          )}
          <p className="text-sm text-slate-400">
            Narrador {narradorRevealIdx + 1} de {narradores.length}
          </p>
          <h2 className="font-display text-lg font-bold text-center">
            Entregue para <span className="text-lime-400">{narradores[narradorRevealIdx]}</span>
            <br />
            <span className="text-xs text-slate-400">
              (Adivinhador desta rodada: {players[guesserIndex]} — ele não pode ver!)
            </span>
          </h2>
          <HoldToReveal
            revealed={
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs uppercase tracking-wide text-slate-400">Categoria: {categoriaLabel}</p>
                <p className="font-display text-2xl font-extrabold text-lime-400">{word}</p>
              </div>
            }
          />
          <Button fullWidth onClick={handleRevealNext}>
            {narradorRevealIdx === narradores.length - 1 ? 'Começar Rodada' : 'Próximo Narrador'}
          </Button>
        </Panel>
      )}

      {phase === 'round' && (
        <Panel className="flex flex-col items-center gap-5 text-center">
          <h2 className="font-display text-lg font-bold">
            Adivinhador: <span className="text-lime-400">{players[guesserIndex]}</span>
          </h2>
          <p className="text-xs uppercase tracking-wide text-slate-400">Categoria: {categoriaLabel}</p>

          <div className="w-full rounded-xl border border-slate-700 bg-slate-800/40 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-400">Ordem da roda:</p>
            <p className="font-display text-sm font-bold text-lime-400">{narradores.join(' → ')}</p>
          </div>

          {usarTimer && <div className="font-display text-4xl font-extrabold tabular-nums">{timer.label}</div>}
          {usarTimer && !timer.running && (
            <Button variant="ghost" onClick={timer.start}>
              Iniciar Cronômetro
            </Button>
          )}

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-slate-400">Palavras ditas na roda</p>
            <button
              onClick={() => setWordsSaid((w) => Math.min(limitePalavras, w + 1))}
              className="flex min-h-[80px] min-w-[80px] items-center justify-center rounded-full border-2 border-lime-400 font-display text-3xl font-extrabold text-lime-400 active:scale-95"
            >
              {wordsSaid}/{limitePalavras}
            </button>
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            <Button variant="primary" onClick={() => handleResult('acertou')}>
              Acertou!
            </Button>
            <Button variant="danger" onClick={() => handleResult('errou')}>
              Errou / Revelar
            </Button>
          </div>
        </Panel>
      )}

      {phase === 'roundResult' && (
        <Panel className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-xl font-extrabold">
            {lastResult === 'acertou' ? `${players[guesserIndex]} Acertou! 🎉` : 'Não foi dessa vez!'}
          </h2>
          <p className="text-sm text-slate-400">A palavra era:</p>
          <p className="font-display text-2xl font-extrabold text-lime-400">{word}</p>
          <p className="text-xs text-slate-500">
            Rodadas jogadas: {rodadas} · Acertos: {acertos}
          </p>
          <Button fullWidth onClick={handleNextRound}>
            <RotateCw size={16} className="mr-1 inline" /> Próxima Rodada ({players[(guesserIndex + 1) % players.length]} adivinha)
          </Button>
          <Button variant="ghost" onClick={handleRestart}>
            Encerrar Jogo
          </Button>
        </Panel>
      )}
    </GameShell>
  );
}

function PlayersStep({ count, onSubmit }: { count: number; onSubmit: (names: string[]) => void }) {
  const [names, setNames] = useState<string[]>(Array.from({ length: count }, (_, i) => `Jogador ${i + 1}`));
  return (
    <>
      <PlayerNamesEditor names={names} onChange={setNames} />
      <Button fullWidth onClick={() => onSubmit(names.map((n) => n.trim() || n))}>
        Iniciar Jogo
      </Button>
    </>
  );
}
