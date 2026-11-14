import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Heart, RefreshCw, Trophy } from 'lucide-react';
import GameShell from '../components/GameShell';
import Panel from '../components/Panel';
import Button from '../components/Button';
import NumberStepper from '../components/NumberStepper';
import PlayerNamesEditor from '../components/PlayerNamesEditor';
import ThemeSourcePicker from '../components/ThemeSourcePicker';
import { BATATA_CATEGORIES } from '../data/batataData';
import { drawUnique } from '../utils/antiRepetition';
import { parseSimpleList, saveCustomTheme, getCustomThemes, deleteCustomTheme, type CustomTheme } from '../utils/themeParser';
import { useSoundEffects } from '../hooks/useSoundEffects';

type Phase = 'setup' | 'players' | 'ready' | 'playing' | 'boom' | 'final';
type Duracao = 'curta' | 'media' | 'longa';

/** faixa (em segundos) em que a batata pode explodir — o tempo exato é secreto */
const DURACOES: Record<Duracao, { label: string; min: number; max: number }> = {
  curta: { label: 'Curta', min: 10, max: 20 },
  media: { label: 'Média', min: 20, max: 40 },
  longa: { label: 'Longa', min: 35, max: 60 },
};

interface BatataPlayer {
  name: string;
  vidas: number;
}

export default function BatataQuente() {
  const [phase, setPhase] = useState<Phase>('setup');
  const sfx = useSoundEffects();

  // ---- Setup ----
  const [qtdJogadores, setQtdJogadores] = useState(4);
  const [vidas, setVidas] = useState(3);
  const [duracao, setDuracao] = useState<Duracao>('media');
  const [modoTema, setModoTema] = useState<'predefinido' | 'custom'>('predefinido');
  const [categoriaKey, setCategoriaKey] = useState(BATATA_CATEGORIES[0].key);
  const [customText, setCustomText] = useState('');
  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>(() => getCustomThemes('batata'));
  const [setupError, setSetupError] = useState('');

  // ---- Partida ----
  const [players, setPlayers] = useState<BatataPlayer[]>([]);
  const [tema, setTema] = useState('');
  const [resetNotice, setResetNotice] = useState('');
  const [starter, setStarter] = useState(0);
  const [rodada, setRodada] = useState(1);
  const [ultimoPerdedor, setUltimoPerdedor] = useState<string | null>(null);
  /** 0 → 1: quanto do pavio já queimou (só para a animação) */
  const [calor, setCalor] = useState(0);

  const tickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matchInProgress = phase !== 'setup';
  const vivos = players.filter((p) => p.vidas > 0);

  function sortearTema() {
    const pool = modoTema === 'predefinido' ? BATATA_CATEGORIES.find((c) => c.key === categoriaKey)!.items : parseSimpleList(customText);
    const draw = drawUnique(`batata:${modoTema === 'predefinido' ? categoriaKey : 'custom'}`, pool, (t) => t);
    setResetNotice(draw.didReset ? 'Todos os temas já saíram — reiniciando a lista!' : '');
    setTema(draw.item);
  }

  function handleSetupSubmit() {
    if (modoTema === 'custom' && parseSimpleList(customText).length === 0) {
      setSetupError('Digite ao menos um tema personalizado.');
      return;
    }
    setSetupError('');
    setPhase('players');
  }

  function handlePlayersSubmit(names: string[]) {
    setPlayers(names.map((name) => ({ name, vidas })));
    setStarter(Math.floor(Math.random() * names.length));
    setRodada(1);
    setUltimoPerdedor(null);
    sortearTema();
    setPhase('ready');
  }

  // Pavio secreto: bipes cada vez mais rápidos até explodir.
  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const { min, max } = DURACOES[duracao];
    const total = (min + Math.random() * (max - min)) * 1000;
    const inicio = Date.now();

    const loop = () => {
      const passado = Date.now() - inicio;
      const progresso = Math.min(1, passado / total);
      setCalor(progresso);
      if (passado >= total) {
        sfx.playAlarm();
        try {
          navigator.vibrate?.([300, 100, 300]);
        } catch {
          /* sem vibração */
        }
        setPhase('boom');
        return;
      }
      sfx.playTick();
      // começa com 1 bipe por segundo e termina com ~6 por segundo
      const intervalo = 1000 - progresso * 830;
      tickTimeout.current = setTimeout(loop, intervalo);
    };
    loop();

    return () => {
      if (tickTimeout.current) clearTimeout(tickTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function handleQuemPerdeu(index: number) {
    const perdedor = players[index];
    const atualizados = players.map((p, i) => (i === index ? { ...p, vidas: p.vidas - 1 } : p));
    setPlayers(atualizados);
    setUltimoPerdedor(perdedor.name);
    sfx.playError();

    const restantes = atualizados.filter((p) => p.vidas > 0);
    if (restantes.length <= 1) {
      setPhase('final');
      return;
    }
    // quem perdeu começa a próxima rodada (se ainda estiver no jogo)
    const proximo = atualizados[index].vidas > 0 ? index : atualizados.findIndex((p) => p.vidas > 0);
    setStarter(proximo);
    setRodada((r) => r + 1);
    sortearTema();
    setCalor(0);
    setPhase('ready');
  }

  function handleRestart() {
    setPhase('setup');
    setPlayers([]);
    setCalor(0);
    setResetNotice('');
  }

  const vencedor = vivos[0];
  const escala = 1 + calor * 0.35;

  return (
    <GameShell title="BATATA QUENTE" matchInProgress={matchInProgress} game="batata" accent="text-lime-400">
      {phase === 'setup' && (
        <Panel className="flex flex-col items-center gap-5">
          <div className="grid w-full grid-cols-2 gap-4">
            <NumberStepper label="Jogadores" value={qtdJogadores} min={2} max={20} onChange={setQtdJogadores} />
            <NumberStepper label="Vidas" value={vidas} min={1} max={5} onChange={setVidas} />
          </div>

          <div className="flex w-full flex-col gap-2">
            <span className="font-display text-sm font-semibold text-slate-300">Tempo do pavio</span>
            <div className="flex gap-2">
              {(Object.keys(DURACOES) as Duracao[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuracao(d)}
                  className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${duracao === d ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
                >
                  {DURACOES[d].label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              A batata explode em algum momento entre {DURACOES[duracao].min} e {DURACOES[duracao].max} segundos. Ninguém sabe quando!
            </p>
          </div>

          <ThemeSourcePicker
            categories={BATATA_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
            selectedCategory={categoriaKey}
            onSelectCategory={setCategoriaKey}
            mode={modoTema}
            onModeChange={setModoTema}
            customText={customText}
            onCustomTextChange={setCustomText}
            customPlaceholder="Digite temas separados por vírgula ou um por linha. Ex.: Frutas, Nomes da família, Músicas da igreja"
            savedThemes={savedThemes}
            onLoadSaved={(t) => setCustomText((t.items as string[]).join(', '))}
            onDeleteSaved={(id) => {
              deleteCustomTheme(id);
              setSavedThemes(getCustomThemes('batata'));
            }}
            onSaveCurrent={(name) => {
              const items = parseSimpleList(customText);
              if (items.length === 0) return;
              saveCustomTheme({ game: 'batata', name, items });
              setSavedThemes(getCustomThemes('batata'));
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
          <p className="text-center text-sm text-slate-400">Escreva os nomes na ordem em que vocês estão sentados na roda.</p>
          <PlayersStep count={qtdJogadores} onSubmit={handlePlayersSubmit} />
        </Panel>
      )}

      {phase === 'ready' && (
        <Panel className="flex flex-col items-center gap-5 text-center">
          {resetNotice && (
            <p className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300">
              <AlertTriangle size={16} /> {resetNotice}
            </p>
          )}
          {ultimoPerdedor && (
            <p className="text-sm text-slate-400">
              <span className="font-bold text-red-400">{ultimoPerdedor}</span> perdeu uma vida na rodada passada.
            </p>
          )}
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Rodada {rodada} · Tema</p>
          <p className="font-display text-3xl font-extrabold text-lime-400">{tema}</p>
          <Button variant="ghost" onClick={sortearTema}>
            <RefreshCw size={16} className="mr-1 inline" /> Sortear outro tema
          </Button>

          <div className="w-full rounded-xl border border-slate-700 bg-slate-800/40 p-3 text-sm text-slate-300">
            Quem começa: <b className="text-lime-400">{players[starter]?.name}</b>. Fale algo do tema e passe o celular para a pessoa ao lado.
            Não pode repetir o que já foi dito!
          </div>

          <PlacarVidas players={players} />

          <Button fullWidth onClick={() => setPhase('playing')}>
            Acender o pavio 🔥
          </Button>
        </Panel>
      )}

      {phase === 'playing' && (
        <Panel className="flex flex-col items-center gap-6 py-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Tema</p>
          <p className="-mt-4 font-display text-3xl font-extrabold text-lime-400">{tema}</p>
          <div
            className="select-none text-[110px] leading-none transition-transform"
            style={{ transform: `scale(${escala}) rotate(${calor > 0.6 ? (Math.random() * 10 - 5).toFixed(1) : 0}deg)` }}
            aria-hidden
          >
            🥔
          </div>
          <p className="font-display text-xl font-bold text-slate-100">Fale e passe! Rápido!</p>
          <p className="text-sm text-slate-400">Os bipes vão acelerando… quando explodir, quem estiver com o celular perde uma vida.</p>
        </Panel>
      )}

      {phase === 'boom' && (
        <Panel className="flex flex-col items-center gap-4 text-center">
          <div className="text-[90px] leading-none" aria-hidden>
            💥
          </div>
          <h2 className="font-display text-3xl font-extrabold text-red-400">BOOM!</h2>
          <p className="text-sm text-slate-300">Quem estava com o celular na mão? Toque no nome dessa pessoa:</p>
          <div className="flex w-full flex-col gap-2">
            {players.map((p, i) =>
              p.vidas > 0 ? (
                <button
                  key={p.name + i}
                  onClick={() => handleQuemPerdeu(i)}
                  className="flex min-h-[48px] w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-left font-semibold text-slate-100 active:scale-95 active:border-red-400"
                >
                  {p.name}
                  <Vidas n={p.vidas} />
                </button>
              ) : null
            )}
          </div>
        </Panel>
      )}

      {phase === 'final' && (
        <Panel className="flex flex-col items-center gap-4 text-center">
          <Trophy className="text-lime-400" size={40} />
          <h2 className="font-display text-2xl font-extrabold">{vencedor ? `${vencedor.name} venceu! 🎉` : 'Fim de jogo!'}</h2>
          <p className="text-sm text-slate-400">Foi a última pessoa a sobreviver à batata quente.</p>
          <PlacarVidas players={players} />
          <Button onClick={handleRestart}>Jogar Novamente</Button>
        </Panel>
      )}
    </GameShell>
  );
}

function Vidas({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} vidas`}>
      {Array.from({ length: n }, (_, i) => (
        <Heart key={i} size={16} className="fill-red-500 text-red-500" />
      ))}
    </span>
  );
}

function PlacarVidas({ players }: { players: BatataPlayer[] }) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {players.map((p, i) => (
        <div
          key={p.name + i}
          className={`flex items-center justify-between rounded-xl px-4 py-2 text-sm ${p.vidas > 0 ? 'bg-slate-800/60' : 'bg-slate-900 text-slate-600 line-through'}`}
        >
          <span className="font-semibold">{p.name}</span>
          {p.vidas > 0 ? <Vidas n={p.vidas} /> : <span className="text-xs no-underline">eliminado</span>}
        </div>
      ))}
    </div>
  );
}

function PlayersStep({ count, onSubmit }: { count: number; onSubmit: (names: string[]) => void }) {
  const [names, setNames] = useState<string[]>(Array.from({ length: count }, (_, i) => `Jogador ${i + 1}`));
  return (
    <>
      <PlayerNamesEditor names={names} onChange={setNames} />
      <Button fullWidth onClick={() => onSubmit(names.map((n, i) => n.trim() || `Jogador ${i + 1}`))}>
        Começar
      </Button>
    </>
  );
}
