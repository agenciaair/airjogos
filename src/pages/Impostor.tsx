import { useMemo, useState } from 'react';
import { AlertTriangle, Pause, Play, Plus } from 'lucide-react';
import GameShell from '../components/GameShell';
import Panel from '../components/Panel';
import Button from '../components/Button';
import NumberStepper from '../components/NumberStepper';
import PlayerNamesEditor from '../components/PlayerNamesEditor';
import HoldToReveal from '../components/HoldToReveal';
import ThemeSourcePicker from '../components/ThemeSourcePicker';
import { IMPOSTOR_CATEGORIES, type ImpostorItem } from '../data/impostorData';
import { drawUnique, shuffle } from '../utils/antiRepetition';
import { parseSimpleList, saveCustomTheme, getCustomThemes, deleteCustomTheme, type CustomTheme } from '../utils/themeParser';
import { useCountdown } from '../hooks/useCountdown';
import { useSoundEffects } from '../hooks/useSoundEffects';

type Phase = 'setup' | 'players' | 'reveal' | 'round' | 'vote' | 'finalGuess' | 'result';

interface ImpostorPlayer {
  name: string;
  isSpy: boolean;
}

export default function Impostor() {
  const [phase, setPhase] = useState<Phase>('setup');
  const sfx = useSoundEffects();

  // ---- Setup ----
  const [qtdJogadores, setQtdJogadores] = useState(5);
  const [qtdEspioes, setQtdEspioes] = useState(1);
  const [usarNomes, setUsarNomes] = useState(true);
  const [modoCasual, setModoCasual] = useState(false);
  const [modoTema, setModoTema] = useState<'predefinido' | 'custom'>('predefinido');
  const [categoriaKey, setCategoriaKey] = useState(IMPOSTOR_CATEGORIES[0].key);
  const [customText, setCustomText] = useState('');
  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>(() => getCustomThemes('impostor'));
  const [setupError, setSetupError] = useState('');
  const [resetNotice, setResetNotice] = useState('');

  // ---- Players / round data ----
  const [players, setPlayers] = useState<ImpostorPlayer[]>([]);
  const [item, setItem] = useState<ImpostorItem | null>(null);
  const [categoriaLabel, setCategoriaLabel] = useState('');
  const [revealIndex, setRevealIndex] = useState(0);
  const [askOrder, setAskOrder] = useState<string[]>([]);
  const [askIndex, setAskIndex] = useState(0);
  const [accused, setAccused] = useState<ImpostorPlayer | null>(null);
  const [finalGuessText, setFinalGuessText] = useState('');
  const [finalGuessCorrect, setFinalGuessCorrect] = useState<boolean | null>(null);

  const timer = useCountdown(5 * 60, {
    onTick: (s) => {
      if (s <= 10) sfx.playTick();
    },
    onFinish: () => sfx.playAlarm(),
  });

  const matchInProgress = phase !== 'setup';

  function handleStartSetup() {
    if (qtdJogadores < 3) {
      setSetupError('É preciso de no mínimo 3 jogadores.');
      return;
    }
    if (qtdEspioes >= qtdJogadores / 2) {
      setSetupError('A quantidade de espiões deve ser menor que metade dos jogadores.');
      return;
    }
    if (modoTema === 'custom' && parseSimpleList(customText).length === 0) {
      setSetupError('Digite ao menos uma palavra no tema personalizado.');
      return;
    }
    setSetupError('');
    setPhase('players');
  }

  function handlePlayersSubmit(names: string[]) {
    const pool: ImpostorItem[] =
      modoTema === 'predefinido'
        ? IMPOSTOR_CATEGORIES.find((c) => c.key === categoriaKey)!.items
        : parseSimpleList(customText).map((w) => ({ secret: w, hint: 'Pense em algo relacionado ao tema escolhido.' }));

    const label = modoTema === 'predefinido' ? IMPOSTOR_CATEGORIES.find((c) => c.key === categoriaKey)!.label : 'Tema Personalizado';

    const draw = drawUnique(`impostor:${modoTema === 'predefinido' ? categoriaKey : 'custom'}`, pool, (i) => i.secret);
    if (draw.didReset) {
      setResetNotice('Todas as palavras dessa categoria já foram usadas — reiniciando o ciclo!');
    } else {
      setResetNotice('');
    }

    const spyIndexes = new Set(shuffle(names.map((_, i) => i)).slice(0, qtdEspioes));
    const newPlayers: ImpostorPlayer[] = names.map((name, i) => ({ name, isSpy: spyIndexes.has(i) }));

    setPlayers(newPlayers);
    setItem(draw.item);
    setCategoriaLabel(label);
    setAskOrder(shuffle(names));
    setAskIndex(0);
    setRevealIndex(0);
    setAccused(null);
    setFinalGuessText('');
    setFinalGuessCorrect(null);
    timer.reset();
    setPhase('reveal');
  }

  function handleRevealNext() {
    if (revealIndex === players.length - 1) {
      setPhase('round');
      return;
    }
    setRevealIndex((i) => i + 1);
  }

  function handleAccuse(player: ImpostorPlayer) {
    setAccused(player);
    if (!player.isSpy) {
      sfx.playError();
      setPhase('result');
    } else {
      setPhase('finalGuess');
    }
  }

  function handleFinalGuessSubmit() {
    if (!item) return;
    const correct = finalGuessText.trim().toLowerCase() === item.secret.trim().toLowerCase();
    setFinalGuessCorrect(correct);
    if (correct) sfx.playCorrect();
    else sfx.playError();
    setPhase('result');
  }

  function handleRestart() {
    setPhase('setup');
    setPlayers([]);
    setItem(null);
    setAccused(null);
    setFinalGuessCorrect(null);
    setResetNotice('');
  }

  const askerName = askOrder[askIndex];
  const askeeName = askOrder[(askIndex + 1) % askOrder.length];

  const spies = useMemo(() => players.filter((p) => p.isSpy), [players]);

  return (
    <GameShell
      title={<img src="/images/logo-espiao.png" alt="Espião" className="h-6 w-auto" />}
      matchInProgress={matchInProgress}
      accent="text-lime-400"
    >
      {phase === 'setup' && (
        <Panel className="flex flex-col items-center gap-5">
          <div className="grid w-full grid-cols-2 gap-4">
            <NumberStepper label="Jogadores" value={qtdJogadores} min={3} max={20} onChange={setQtdJogadores} />
            <NumberStepper label="Espiões" value={qtdEspioes} min={1} max={Math.max(1, Math.floor(qtdJogadores / 2) - 1)} onChange={setQtdEspioes} />
          </div>

          <label className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <input type="checkbox" checked={usarNomes} onChange={(e) => setUsarNomes(e.target.checked)} className="h-5 w-5 accent-lime-400" />
            <span className="text-sm font-semibold">Usar nomes dos jogadores</span>
          </label>

          <label className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <input type="checkbox" checked={modoCasual} onChange={(e) => setModoCasual(e.target.checked)} className="h-5 w-5 accent-lime-400" />
            <span className="text-sm font-semibold">Modo Casual (dica para o espião)</span>
          </label>

          <ThemeSourcePicker
            categories={IMPOSTOR_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
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
              setSavedThemes(getCustomThemes('impostor'));
            }}
            onSaveCurrent={(name) => {
              const items = parseSimpleList(customText);
              if (items.length === 0) return;
              saveCustomTheme({ game: 'impostor', name, items });
              setSavedThemes(getCustomThemes('impostor'));
            }}
          />

          {setupError && <p className="text-sm font-semibold text-red-400">{setupError}</p>}
          <Button fullWidth onClick={handleStartSetup}>
            Continuar
          </Button>
        </Panel>
      )}

      {phase === 'players' && (
        <Panel className="flex flex-col items-center gap-4">
          <h2 className="font-display text-xl font-extrabold">Jogadores</h2>
          {usarNomes ? (
            <PlayersStep count={qtdJogadores} onSubmit={handlePlayersSubmit} />
          ) : (
            <DefaultPlayersConfirm count={qtdJogadores} onSubmit={handlePlayersSubmit} />
          )}
        </Panel>
      )}

      {phase === 'reveal' && item && (
        <Panel className="flex flex-col items-center gap-4">
          {resetNotice && (
            <p className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300">
              <AlertTriangle size={16} /> {resetNotice}
            </p>
          )}
          <p className="text-sm text-slate-400">
            Jogador {revealIndex + 1} de {players.length}
          </p>
          <h2 className="font-display text-lg font-bold text-slate-200">
            Entregue o celular para <span className="text-lime-400">{players[revealIndex].name}</span>
          </h2>
          <HoldToReveal
            revealed={
              players[revealIndex].isSpy ? (
                <div className="flex flex-col items-center gap-2">
                  <img src="/images/espiao-icon.png" alt="Espião" className="h-20 w-20 rounded-full" />
                  <p className="text-xs uppercase tracking-wide text-slate-400">Categoria: {categoriaLabel}</p>
                  <p className="font-display text-2xl font-extrabold text-red-400">Você é o Espião!</p>
                  {modoCasual && <p className="mt-2 text-sm text-slate-300">Dica: {item.hint}</p>}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Categoria: {categoriaLabel}</p>
                  <p className="font-display text-2xl font-extrabold text-lime-400">{item.secret}</p>
                </div>
              )
            }
          />
          <Button fullWidth onClick={handleRevealNext}>
            {revealIndex === players.length - 1 ? 'Começar Rodada' : 'Próximo Jogador'}
          </Button>
        </Panel>
      )}

      {phase === 'round' && (
        <Panel className="flex flex-col items-center gap-5 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">Categoria: {categoriaLabel}</p>
          <p className="font-display text-lg font-bold">
            <span className="text-lime-400">{askerName}</span> pergunta para <span className="text-lime-400">{askeeName}</span>
          </p>
          <Button variant="ghost" onClick={() => setAskIndex((i) => (i + 1) % askOrder.length)}>
            Próxima Pergunta
          </Button>

          <div className="font-display text-5xl font-extrabold tabular-nums">{timer.label}</div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="ghost" onClick={() => timer.addSeconds(15)}>
              <Plus size={16} className="mr-1 inline" /> 15s
            </Button>
            {timer.running ? (
              <Button variant="ghost" onClick={timer.pause}>
                <Pause size={16} className="mr-1 inline" /> Pausar
              </Button>
            ) : (
              <Button onClick={timer.start}>
                <Play size={16} className="mr-1 inline" /> Iniciar
              </Button>
            )}
          </div>

          <Button variant="accent" fullWidth onClick={() => setPhase('vote')}>
            Ir para Votação
          </Button>
        </Panel>
      )}

      {phase === 'vote' && (
        <Panel className="flex flex-col items-center gap-4">
          <h2 className="font-display text-xl font-extrabold">Quem é o Espião?</h2>
          <p className="text-sm text-slate-400">O grupo decide em conjunto quem acusar.</p>
          <div className="flex w-full flex-col gap-2">
            {players.map((p) => (
              <button
                key={p.name}
                onClick={() => handleAccuse(p)}
                className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-left font-semibold text-slate-100 active:scale-95 active:border-lime-400"
              >
                {p.name}
              </button>
            ))}
          </div>
        </Panel>
      )}

      {phase === 'finalGuess' && item && (
        <Panel className="flex flex-col items-center gap-4 text-center">
          <img src="/images/espiao-icon.png" alt="Espião" className="h-20 w-20 rounded-full" />
          <h2 className="font-display text-xl font-extrabold text-red-400">Chute Final do Espião!</h2>
          <p className="text-sm text-slate-300">
            <span className="text-lime-400">{accused?.name}</span> foi acusado e era o espião. Última chance: adivinhe a palavra secreta e roube a vitória!
          </p>
          <input
            type="text"
            value={finalGuessText}
            onChange={(e) => setFinalGuessText(e.target.value)}
            placeholder="Digite o palpite..."
            className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-center text-lg font-bold text-slate-100 outline-none focus:border-lime-400"
          />
          <Button fullWidth onClick={handleFinalGuessSubmit} disabled={!finalGuessText.trim()}>
            Confirmar Chute
          </Button>
        </Panel>
      )}

      {phase === 'result' && item && (
        <Panel className="flex flex-col items-center gap-4 text-center">
          {(accused && !accused.isSpy) || (accused?.isSpy && finalGuessCorrect === true) ? (
            <img src="/images/espiao-icon.png" alt="Espião" className="h-20 w-20 rounded-full" />
          ) : null}
          <h2 className="font-display text-2xl font-extrabold">
            {accused && !accused.isSpy && 'Vitória dos Espiões! 🕵️'}
            {accused?.isSpy && finalGuessCorrect === true && 'O Espião Roubou a Vitória! 😈'}
            {accused?.isSpy && finalGuessCorrect === false && 'Vitória dos Inocentes! 🎉'}
          </h2>
          <p className="text-sm text-slate-400">Palavra secreta:</p>
          <p className="font-display text-2xl font-extrabold text-lime-400">{item.secret}</p>
          <p className="text-sm text-slate-400">{spies.length > 1 ? 'Os espiões eram:' : 'O espião era:'}</p>
          <ul className="flex w-full flex-col gap-2">
            {spies.map((p) => (
              <li key={p.name} className="rounded-xl bg-slate-800/60 px-4 py-2 font-bold">
                {p.name}
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <Button onClick={handleRestart}>Jogar Novamente</Button>
          </div>
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
        Sortear Papéis
      </Button>
    </>
  );
}

function DefaultPlayersConfirm({ count, onSubmit }: { count: number; onSubmit: (names: string[]) => void }) {
  const names = Array.from({ length: count }, (_, i) => `Jogador ${i + 1}`);
  return (
    <>
      <p className="text-sm text-slate-400">
        {count} jogadores serão nomeados automaticamente: {names.join(', ')}
      </p>
      <Button fullWidth onClick={() => onSubmit(names)}>
        Sortear Papéis
      </Button>
    </>
  );
}
