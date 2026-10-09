import { useMemo, useState } from 'react';
import { AlertTriangle, Lightbulb, ThumbsDown, ThumbsUp, Trophy } from 'lucide-react';
import GameShell from '../components/GameShell';
import Panel from '../components/Panel';
import Button from '../components/Button';
import NumberStepper from '../components/NumberStepper';
import PlayerNamesEditor from '../components/PlayerNamesEditor';
import HoldToReveal from '../components/HoldToReveal';
import ThemeSourcePicker from '../components/ThemeSourcePicker';
import { QUEMEUSOU_CATEGORIES, type QuemEuSouItem } from '../data/quemEuSouData';
import { drawUniqueMany } from '../utils/antiRepetition';
import { parseSimpleList, saveCustomTheme, getCustomThemes, deleteCustomTheme, type CustomTheme } from '../utils/themeParser';
import { useCountdown, useStopwatch } from '../hooks/useCountdown';
import { useSoundEffects } from '../hooks/useSoundEffects';

type Phase = 'setup' | 'players' | 'turnDisplay' | 'turnCountdown' | 'turnCounting' | 'turnActive' | 'ranking';
type DisplayMode = 'passar' | 'testa';
type LimitMode = 'perguntas' | 'tempo';

interface QesPlayer {
  name: string;
  item: QuemEuSouItem;
  perguntas: number;
  tempoSegundos: number;
  dicaUsada: boolean;
  acertou: boolean | null;
}

export default function QuemEuSou() {
  const [phase, setPhase] = useState<Phase>('setup');
  const sfx = useSoundEffects();

  // Setup
  const [qtdJogadores, setQtdJogadores] = useState(4);
  const [modoTema, setModoTema] = useState<'predefinido' | 'custom'>('predefinido');
  const [categoriaKey, setCategoriaKey] = useState(QUEMEUSOU_CATEGORIES[0].key);
  const [customText, setCustomText] = useState('');
  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>(() => getCustomThemes('quemeusou'));
  const [limitMode, setLimitMode] = useState<LimitMode>('perguntas');
  const [limitePerguntas, setLimitePerguntas] = useState(15);
  const [limiteMinutos, setLimiteMinutos] = useState(2);
  const [modoDica, setModoDica] = useState(true);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('passar');
  const [setupError, setSetupError] = useState('');
  const [resetNotice, setResetNotice] = useState('');

  const [players, setPlayers] = useState<QesPlayer[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [countdownNum, setCountdownNum] = useState(3);

  const [simCount, setSimCount] = useState(0);
  const [naoCount, setNaoCount] = useState(0);
  const [dicaUsada, setDicaUsada] = useState(false);

  const timer = useCountdown(limiteMinutos * 60, {
    onTick: (s) => {
      if (s <= 10) sfx.playTick();
    },
    onFinish: () => {
      sfx.playAlarm();
      finalizarTurno(false);
    },
  });
  const stopwatch = useStopwatch();

  const matchInProgress = phase !== 'setup';
  const current = players[turnIndex];

  function handleSetupSubmit() {
    if (qtdJogadores < 2) {
      setSetupError('É preciso de no mínimo 2 jogadores.');
      return;
    }
    if (modoTema === 'custom' && parseSimpleList(customText).length < qtdJogadores) {
      setSetupError(`Digite ao menos ${qtdJogadores} identidades no tema personalizado.`);
      return;
    }
    setSetupError('');
    setPhase('players');
  }

  function handlePlayersSubmit(names: string[]) {
    const pool: QuemEuSouItem[] =
      modoTema === 'predefinido'
        ? QUEMEUSOU_CATEGORIES.find((c) => c.key === categoriaKey)!.items
        : parseSimpleList(customText).map((w) => ({ name: w, hint: 'Pense em algo relacionado ao tema escolhido.' }));

    const draw = drawUniqueMany(`quemeusou:${modoTema === 'predefinido' ? categoriaKey : 'custom'}`, pool, names.length, (i) => i.name);
    setResetNotice(draw.didReset ? 'Todas as identidades dessa categoria já foram usadas — reiniciando o ciclo!' : '');

    const newPlayers: QesPlayer[] = names.map((name, i) => ({
      name,
      item: draw.item[i],
      perguntas: 0,
      tempoSegundos: 0,
      dicaUsada: false,
      acertou: null,
    }));

    setPlayers(newPlayers);
    setTurnIndex(0);
    setPhase(displayMode === 'testa' ? 'turnCountdown' : 'turnDisplay');
    setCountdownNum(3);
  }

  function startActiveTurn() {
    setSimCount(0);
    setNaoCount(0);
    setDicaUsada(false);
    timer.reset(limiteMinutos * 60);
    stopwatch.reset();
    if (limitMode === 'tempo') timer.start();
    stopwatch.start();
    setPhase('turnActive');
  }

  function finalizarTurno(acertou: boolean) {
    timer.pause();
    stopwatch.pause();
    if (acertou) sfx.playCorrect();
    else sfx.playError();

    setPlayers((prev) =>
      prev.map((p, i) =>
        i === turnIndex
          ? { ...p, perguntas: simCount + naoCount, tempoSegundos: stopwatch.secondsElapsed, dicaUsada, acertou }
          : p
      )
    );

    if (turnIndex === players.length - 1) {
      setPhase('ranking');
    } else {
      setTurnIndex((i) => i + 1);
      setPhase(displayMode === 'testa' ? 'turnCountdown' : 'turnDisplay');
      setCountdownNum(3);
    }
  }

  function handlePergunta(resposta: 'sim' | 'nao') {
    if (resposta === 'sim') setSimCount((c) => c + 1);
    else setNaoCount((c) => c + 1);

    const total = simCount + naoCount + 1;
    if (limitMode === 'perguntas' && total >= limitePerguntas) {
      setTimeout(() => finalizarTurno(false), 150);
    }
  }

  function runCountdown() {
    setPhase('turnCounting');
    setCountdownNum(3);
    const tick = (n: number) => {
      if (n === 0) {
        startActiveTurn();
        return;
      }
      setTimeout(() => {
        setCountdownNum(n - 1);
        tick(n - 1);
      }, 700);
    };
    tick(3);
  }

  function handleRestart() {
    setPhase('setup');
    setPlayers([]);
    setResetNotice('');
  }

  const ranking = useMemo(() => {
    return [...players].sort((a, b) => {
      if (a.acertou !== b.acertou) return a.acertou ? -1 : 1;
      if (a.perguntas !== b.perguntas) return a.perguntas - b.perguntas;
      return a.tempoSegundos - b.tempoSegundos;
    });
  }, [players]);

  return (
    <GameShell title="QUEM EU SOU?" matchInProgress={matchInProgress} accent="text-lime-400">
      {phase === 'setup' && (
        <Panel className="flex flex-col items-center gap-5">
          <NumberStepper label="Jogadores" value={qtdJogadores} min={2} max={20} onChange={setQtdJogadores} />

          <div className="flex w-full gap-2">
            <button
              onClick={() => setLimitMode('perguntas')}
              className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${limitMode === 'perguntas' ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
            >
              Limite de Perguntas
            </button>
            <button
              onClick={() => setLimitMode('tempo')}
              className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${limitMode === 'tempo' ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
            >
              Limite de Tempo
            </button>
          </div>

          {limitMode === 'perguntas' ? (
            <NumberStepper label="Perguntas permitidas" value={limitePerguntas} min={10} max={20} onChange={setLimitePerguntas} />
          ) : (
            <NumberStepper label="Minutos por jogador" value={limiteMinutos} min={1} max={5} onChange={setLimiteMinutos} />
          )}

          <div className="flex w-full gap-2">
            <button
              onClick={() => setDisplayMode('passar')}
              className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${displayMode === 'passar' ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
            >
              Passa o Celular
            </button>
            <button
              onClick={() => setDisplayMode('testa')}
              className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${displayMode === 'testa' ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
            >
              Na Testa
            </button>
          </div>

          <label className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <input type="checkbox" checked={modoDica} onChange={(e) => setModoDica(e.target.checked)} className="h-5 w-5 accent-lime-400" />
            <span className="text-sm font-semibold">Modo Dica</span>
          </label>

          <ThemeSourcePicker
            categories={QUEMEUSOU_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
            selectedCategory={categoriaKey}
            onSelectCategory={setCategoriaKey}
            mode={modoTema}
            onModeChange={setModoTema}
            customText={customText}
            onCustomTextChange={setCustomText}
            customPlaceholder="Cole ou digite identidades separadas por vírgula ou quebra de linha"
            savedThemes={savedThemes}
            onLoadSaved={(t) => setCustomText((t.items as string[]).join(', '))}
            onDeleteSaved={(id) => {
              deleteCustomTheme(id);
              setSavedThemes(getCustomThemes('quemeusou'));
            }}
            onSaveCurrent={(name) => {
              const items = parseSimpleList(customText);
              if (items.length === 0) return;
              saveCustomTheme({ game: 'quemeusou', name, items });
              setSavedThemes(getCustomThemes('quemeusou'));
            }}
          />

          {setupError && <p className="text-sm font-semibold text-red-400">{setupError}</p>}
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

      {phase === 'turnDisplay' && current && (
        <Panel className="flex flex-col items-center gap-4">
          {resetNotice && (
            <p className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300">
              <AlertTriangle size={16} /> {resetNotice}
            </p>
          )}
          <img src="/images/quemeusou-icon.png" alt="Quem Eu Sou?" className="h-16 w-16" />
          <p className="text-sm text-slate-400">
            Turno {turnIndex + 1} de {players.length}
          </p>
          <h2 className="font-display text-lg font-bold text-center">
            Todos memorizam, menos <span className="text-lime-400">{current.name}</span> — {current.name} NÃO PODE OLHAR!
          </h2>
          <HoldToReveal
            revealed={
              <p className="font-display text-2xl font-extrabold text-lime-400 text-center">
                O personagem de {current.name} é: <br /> {current.item.name}
              </p>
            }
          />
          <Button fullWidth onClick={startActiveTurn}>
            Começar Turno de {current.name}
          </Button>
        </Panel>
      )}

      {phase === 'turnCountdown' && current && (
        <Panel className="flex flex-col items-center gap-6 py-10">
          <h2 className="font-display text-lg font-bold text-center">
            {current.name}, apoie o celular na testa virado para os amigos!
          </h2>
          <Button fullWidth onClick={runCountdown}>
            Iniciar Contagem
          </Button>
        </Panel>
      )}

      {phase === 'turnCounting' && (
        <Panel className="flex flex-col items-center justify-center gap-6 py-16" style={{ transform: 'scaleX(-1)' }}>
          <p className="font-display text-8xl font-extrabold text-lime-400">{countdownNum}</p>
        </Panel>
      )}

      {phase === 'turnActive' && current && (
        <Panel className="flex flex-col items-center gap-5 text-center">
          {displayMode === 'testa' && (
            <div className="w-full rounded-2xl border-2 border-lime-400 bg-slate-950 py-8" style={{ transform: 'scaleX(-1)' }}>
              <p className="font-display text-3xl font-extrabold text-lime-400">{current.item.name}</p>
            </div>
          )}
          <p className="text-sm text-slate-400">Turno de {current.name}</p>

          <div className="flex gap-6 font-display text-lg font-bold">
            <span className="text-lime-400">Sim: {simCount}</span>
            <span className="text-red-400">Não: {naoCount}</span>
          </div>

          <div className="font-display text-4xl font-extrabold tabular-nums">
            {limitMode === 'tempo' ? timer.label : stopwatch.label}
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            <Button variant="ghost" onClick={() => handlePergunta('sim')}>
              <ThumbsUp size={18} className="mr-1 inline" /> Sim
            </Button>
            <Button variant="ghost" onClick={() => handlePergunta('nao')}>
              <ThumbsDown size={18} className="mr-1 inline" /> Não
            </Button>
          </div>

          {modoDica && (
            <Button
              variant="warning"
              fullWidth
              disabled={dicaUsada}
              onClick={() => setDicaUsada(true)}
            >
              <Lightbulb size={18} className="mr-1 inline" /> {dicaUsada ? current.item.hint : 'Pedir Dica'}
            </Button>
          )}

          <div className="grid w-full grid-cols-2 gap-3">
            <Button variant="primary" onClick={() => finalizarTurno(true)}>
              Acertou!
            </Button>
            <Button variant="danger" onClick={() => finalizarTurno(false)}>
              Errou!
            </Button>
          </div>
        </Panel>
      )}

      {phase === 'ranking' && (
        <Panel className="flex flex-col items-center gap-4">
          <Trophy className="text-lime-400" size={36} />
          <h2 className="font-display text-xl font-extrabold">Placar Final</h2>
          <div className="flex w-full flex-col gap-2">
            {ranking.map((p, i) => (
              <div
                key={p.name}
                className={`flex items-center justify-between rounded-xl px-4 py-3 ${i === 0 && p.acertou ? 'border border-lime-400 bg-lime-400/10' : 'bg-slate-800/60'}`}
              >
                <div className="text-left">
                  <p className="font-display font-bold">
                    {i + 1}º {p.name} {p.acertou ? '✅' : '❌'}
                  </p>
                  <p className="text-xs text-slate-400">Era: {p.item.name}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>{p.perguntas} perguntas</p>
                  <p>{p.tempoSegundos}s</p>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleRestart}>Jogar Novamente</Button>
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
        Sortear Identidades
      </Button>
    </>
  );
}
