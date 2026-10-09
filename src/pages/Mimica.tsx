import { useState } from 'react';
import { AlertTriangle, SkipForward, Trophy } from 'lucide-react';
import GameShell from '../components/GameShell';
import Panel from '../components/Panel';
import Button from '../components/Button';
import HoldToReveal from '../components/HoldToReveal';
import ThemeSourcePicker from '../components/ThemeSourcePicker';
import { MIMICA_CATEGORIES } from '../data/mimicaData';
import { drawUnique } from '../utils/antiRepetition';
import { parseSimpleList, saveCustomTheme, getCustomThemes, deleteCustomTheme, type CustomTheme } from '../utils/themeParser';
import { useCountdown } from '../hooks/useCountdown';
import { useSoundEffects } from '../hooks/useSoundEffects';

type Phase = 'setup' | 'callActor' | 'acting' | 'turnEnd' | 'final';
type Modo = 'times' | 'individual';
type Time = 'A' | 'B';

const TEMPOS = [45, 60, 90];
const LIMITES_PONTOS = [5, 10, 15];

export default function Mimica() {
  const [phase, setPhase] = useState<Phase>('setup');
  const sfx = useSoundEffects();

  const [modo, setModo] = useState<Modo>('times');
  const [tempoSegundos, setTempoSegundos] = useState(60);
  const [limitePontos, setLimitePontos] = useState(10);
  const [pulosPermitidos, setPulosPermitidos] = useState<1 | 2>(1);
  const [modoTema, setModoTema] = useState<'predefinido' | 'custom'>('predefinido');
  const [categoriaKey, setCategoriaKey] = useState(MIMICA_CATEGORIES[0].key);
  const [customText, setCustomText] = useState('');
  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>(() => getCustomThemes('mimica'));
  const [resetNotice, setResetNotice] = useState('');

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [acertosTotal, setAcertosTotal] = useState(0);
  const [pulosTotal, setPulosTotal] = useState(0);
  const [currentTeam, setCurrentTeam] = useState<Time>('A');
  const [currentWord, setCurrentWord] = useState('');
  const [pulosRestantes, setPulosRestantes] = useState<number>(pulosPermitidos);
  const [acertosTurno, setAcertosTurno] = useState(0);

  const timer = useCountdown(tempoSegundos, {
    onTick: (s) => {
      if (s <= 10) sfx.playTick();
    },
    onFinish: () => {
      sfx.playAlarm();
      setPhase('turnEnd');
    },
  });

  const matchInProgress = phase !== 'setup';

  function wordPool(): string[] {
    return modoTema === 'predefinido'
      ? MIMICA_CATEGORIES.find((c) => c.key === categoriaKey)!.items
      : parseSimpleList(customText);
  }

  function drawWord() {
    const pool = wordPool();
    const key = `mimica:${modoTema === 'predefinido' ? categoriaKey : 'custom'}`;
    const draw = drawUnique(key, pool, (w) => w);
    setResetNotice(draw.didReset ? 'As palavras dessa categoria acabaram — reiniciando o ciclo!' : '');
    setCurrentWord(draw.item);
  }

  function handleSetupSubmit() {
    if (modoTema === 'custom' && parseSimpleList(customText).length === 0) return;
    drawWord();
    setPulosRestantes(pulosPermitidos);
    setAcertosTurno(0);
    setPhase('callActor');
  }

  function handleBegin() {
    timer.reset(tempoSegundos);
    timer.start();
    setPhase('acting');
  }

  function handleAcertou() {
    sfx.playCorrect();
    setAcertosTurno((n) => n + 1);
    setAcertosTotal((n) => n + 1);
    if (modo === 'times') {
      if (currentTeam === 'A') setScoreA((s) => s + 1);
      else setScoreB((s) => s + 1);
    }
    drawWord();
  }

  function handlePular() {
    if (pulosRestantes <= 0) return;
    setPulosRestantes((p) => p - 1);
    setPulosTotal((n) => n + 1);
    drawWord();
  }

  function handleEndTurnManually() {
    timer.pause();
    setPhase('turnEnd');
  }

  function proceedAfterTurn() {
    const reachedLimit = modo === 'times' ? Math.max(scoreA, scoreB) >= limitePontos : acertosTotal >= limitePontos;
    if (reachedLimit) {
      setPhase('final');
      return;
    }
    if (modo === 'times') setCurrentTeam((t) => (t === 'A' ? 'B' : 'A'));
    setPulosRestantes(pulosPermitidos);
    setAcertosTurno(0);
    drawWord();
    setPhase('callActor');
  }

  function handleRestart() {
    setPhase('setup');
    setScoreA(0);
    setScoreB(0);
    setAcertosTotal(0);
    setPulosTotal(0);
    setCurrentTeam('A');
    setResetNotice('');
  }

  const secondsRatio = tempoSegundos > 0 ? timer.secondsLeft / tempoSegundos : 0;
  const timerColor = timer.secondsLeft <= 10 ? 'text-red-500' : secondsRatio > 0.5 ? 'text-lime-400' : 'text-amber-400';

  return (
    <GameShell title="MÍMICA" matchInProgress={matchInProgress} accent="text-lime-400">
      {phase === 'setup' && (
        <Panel className="flex flex-col items-center gap-5">
          <div className="flex w-full gap-2">
            <button
              onClick={() => setModo('times')}
              className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${modo === 'times' ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
            >
              Modo Times
            </button>
            <button
              onClick={() => setModo('individual')}
              className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${modo === 'individual' ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
            >
              Individual / Livre
            </button>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <span className="font-display text-sm font-semibold text-slate-300">Tempo por rodada</span>
            <div className="flex gap-2">
              {TEMPOS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTempoSegundos(t)}
                  className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${tempoSegundos === t ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <span className="font-display text-sm font-semibold text-slate-300">Limite de pontos</span>
            <div className="flex gap-2">
              {LIMITES_PONTOS.map((p) => (
                <button
                  key={p}
                  onClick={() => setLimitePontos(p)}
                  className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${limitePontos === p ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
                >
                  {p} pts
                </button>
              ))}
            </div>
          </div>

          <label className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <span className="text-sm font-semibold">Pulos permitidos por rodada</span>
            <div className="flex gap-2">
              {[1, 2].map((n) => (
                <button
                  key={n}
                  onClick={() => setPulosPermitidos(n as 1 | 2)}
                  className={`min-h-[36px] min-w-[36px] rounded-lg border font-bold ${pulosPermitidos === n ? 'border-lime-400 text-lime-400' : 'border-slate-600 text-slate-400'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </label>

          <ThemeSourcePicker
            categories={MIMICA_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
            selectedCategory={categoriaKey}
            onSelectCategory={setCategoriaKey}
            mode={modoTema}
            onModeChange={setModoTema}
            customText={customText}
            onCustomTextChange={setCustomText}
            customPlaceholder="Cole ou digite palavras/ações separadas por vírgula ou quebra de linha"
            savedThemes={savedThemes}
            onLoadSaved={(t) => setCustomText((t.items as string[]).join(', '))}
            onDeleteSaved={(id) => {
              deleteCustomTheme(id);
              setSavedThemes(getCustomThemes('mimica'));
            }}
            onSaveCurrent={(name) => {
              const items = parseSimpleList(customText);
              if (items.length === 0) return;
              saveCustomTheme({ game: 'mimica', name, items });
              setSavedThemes(getCustomThemes('mimica'));
            }}
          />

          <Button fullWidth onClick={handleSetupSubmit}>
            Continuar
          </Button>
        </Panel>
      )}

      {phase === 'callActor' && (
        <Panel className="flex flex-col items-center gap-5 text-center">
          {resetNotice && (
            <p className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300">
              <AlertTriangle size={16} /> {resetNotice}
            </p>
          )}
          {modo === 'times' ? (
            <h2 className="font-display text-2xl font-extrabold">
              Vez do <span className="text-lime-400">Time {currentTeam}</span>
            </h2>
          ) : (
            <h2 className="font-display text-2xl font-extrabold">Próximo Ator</h2>
          )}
          <p className="text-sm text-slate-400">Escolha quem vai atuar e prepare-se!</p>

          <HoldToReveal
            label="Segure para ver a palavra secreta"
            revealed={<p className="font-display text-2xl font-extrabold text-lime-400">{currentWord}</p>}
          />

          <Button fullWidth onClick={handleBegin}>
            Começar
          </Button>
        </Panel>
      )}

      {phase === 'acting' && (
        <Panel className="flex flex-col items-center gap-6 text-center">
          <p className="font-display text-3xl font-extrabold break-words">{currentWord}</p>
          <div className={`font-display text-6xl font-extrabold tabular-nums ${timerColor}`}>{timer.label}</div>
          <p className="text-sm text-slate-400">
            Acertos na rodada: {acertosTurno} · Pulos restantes: {pulosRestantes}
          </p>
          <div className="grid w-full grid-cols-2 gap-3">
            <Button variant="primary" onClick={handleAcertou}>
              Acertou! +1
            </Button>
            <Button variant="ghost" disabled={pulosRestantes <= 0} onClick={handlePular}>
              <SkipForward size={18} className="mr-1 inline" /> Pular
            </Button>
          </div>
          <Button variant="danger" fullWidth onClick={handleEndTurnManually}>
            Encerrar Rodada
          </Button>
        </Panel>
      )}

      {phase === 'turnEnd' && (
        <Panel className="flex flex-col items-center gap-5 text-center">
          <h2 className="font-display text-xl font-extrabold">Fim da Rodada!</h2>
          <p className="text-lg">
            Acertos: <span className="font-bold text-lime-400">{acertosTurno}</span>
          </p>
          {modo === 'times' && (
            <div className="flex gap-8 font-display text-lg font-bold">
              <span>Time A: {scoreA}</span>
              <span>Time B: {scoreB}</span>
            </div>
          )}
          <Button fullWidth onClick={proceedAfterTurn}>
            Continuar
          </Button>
        </Panel>
      )}

      {phase === 'final' && (
        <Panel className="flex flex-col items-center gap-4 text-center">
          <Trophy className="text-lime-400" size={40} />
          <h2 className="font-display text-2xl font-extrabold">
            {modo === 'times' ? `Time ${scoreA >= scoreB ? 'A' : 'B'} Venceu! 🎉` : 'Fim de Jogo!'}
          </h2>
          {modo === 'times' && (
            <div className="flex gap-8 font-display text-lg font-bold">
              <span>Time A: {scoreA}</span>
              <span>Time B: {scoreB}</span>
            </div>
          )}
          <p className="text-sm text-slate-400">
            Total de acertos: {acertosTotal} · Total de pulos: {pulosTotal}
          </p>
          <Button onClick={handleRestart}>Jogar Novamente</Button>
        </Panel>
      )}
    </GameShell>
  );
}
