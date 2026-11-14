import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AlertTriangle, Eraser, Eye, Trash2, Trophy, Undo2 } from 'lucide-react';
import GameShell from '../components/GameShell';
import Panel from '../components/Panel';
import Button from '../components/Button';
import HoldToReveal from '../components/HoldToReveal';
import ThemeSourcePicker from '../components/ThemeSourcePicker';
import { DESENHO_CATEGORIES } from '../data/desenhoData';
import { drawUnique } from '../utils/antiRepetition';
import { parseSimpleList, saveCustomTheme, getCustomThemes, deleteCustomTheme, type CustomTheme } from '../utils/themeParser';
import { useCountdown } from '../hooks/useCountdown';
import { useSoundEffects } from '../hooks/useSoundEffects';

type Phase = 'setup' | 'callArtist' | 'drawing' | 'turnEnd' | 'final';
type Modo = 'times' | 'livre';
type Time = 'A' | 'B';

const TEMPOS = [60, 90, 120];
const LIMITES = [3, 5, 10];
const CORES = ['#0f172a', '#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#a855f7'];
const BORRACHA = '#ffffff';

interface Traco {
  cor: string;
  largura: number;
  pontos: { x: number; y: number }[];
}

export default function Desenho() {
  const [phase, setPhase] = useState<Phase>('setup');
  const sfx = useSoundEffects();

  // ---- Setup ----
  const [modo, setModo] = useState<Modo>('times');
  const [tempoSegundos, setTempoSegundos] = useState(90);
  const [limitePontos, setLimitePontos] = useState(5);
  const [modoTema, setModoTema] = useState<'predefinido' | 'custom'>('predefinido');
  const [categoriaKey, setCategoriaKey] = useState(DESENHO_CATEGORIES[0].key);
  const [customText, setCustomText] = useState('');
  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>(() => getCustomThemes('desenho'));
  const [setupError, setSetupError] = useState('');

  // ---- Partida ----
  const [palavra, setPalavra] = useState('');
  const [resetNotice, setResetNotice] = useState('');
  const [currentTeam, setCurrentTeam] = useState<Time>('A');
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [acertosLivre, setAcertosLivre] = useState(0);
  const [rodadas, setRodadas] = useState(0);
  const [resultado, setResultado] = useState<'acertou' | 'tempo' | 'desistiu'>('acertou');

  const timer = useCountdown(tempoSegundos, {
    onTick: (s) => {
      if (s <= 10) sfx.playTick();
    },
    onFinish: () => {
      sfx.playAlarm();
      setResultado('tempo');
      setRodadas((r) => r + 1);
      setPhase('turnEnd');
    },
  });

  const matchInProgress = phase !== 'setup';

  function sortearPalavra() {
    const pool = modoTema === 'predefinido' ? DESENHO_CATEGORIES.find((c) => c.key === categoriaKey)!.items : parseSimpleList(customText);
    const draw = drawUnique(`desenho:${modoTema === 'predefinido' ? categoriaKey : 'custom'}`, pool, (w) => w);
    setResetNotice(draw.didReset ? 'As palavras dessa categoria acabaram — reiniciando a lista!' : '');
    setPalavra(draw.item);
  }

  function handleSetupSubmit() {
    if (modoTema === 'custom' && parseSimpleList(customText).length === 0) {
      setSetupError('Digite ao menos uma palavra no tema personalizado.');
      return;
    }
    setSetupError('');
    sortearPalavra();
    setPhase('callArtist');
  }

  function handleComecar() {
    timer.reset(tempoSegundos);
    timer.start();
    setPhase('drawing');
  }

  function encerrar(r: 'acertou' | 'desistiu') {
    timer.pause();
    if (r === 'acertou') {
      sfx.playCorrect();
      if (modo === 'times') {
        if (currentTeam === 'A') setScoreA((s) => s + 1);
        else setScoreB((s) => s + 1);
      } else {
        setAcertosLivre((n) => n + 1);
      }
    } else {
      sfx.playError();
    }
    setResultado(r);
    setRodadas((n) => n + 1);
    setPhase('turnEnd');
  }

  function proximaRodada() {
    const chegou = modo === 'times' ? Math.max(scoreA, scoreB) >= limitePontos : acertosLivre >= limitePontos;
    if (chegou) {
      setPhase('final');
      return;
    }
    if (modo === 'times') setCurrentTeam((t) => (t === 'A' ? 'B' : 'A'));
    sortearPalavra();
    setPhase('callArtist');
  }

  function handleRestart() {
    timer.reset(tempoSegundos);
    setPhase('setup');
    setScoreA(0);
    setScoreB(0);
    setAcertosLivre(0);
    setRodadas(0);
    setCurrentTeam('A');
    setResetNotice('');
  }

  const timerColor = timer.secondsLeft <= 10 ? 'text-red-400' : 'text-slate-100';

  return (
    <GameShell title="DESENHA" matchInProgress={matchInProgress} game="desenho" accent="text-lime-400">
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
              onClick={() => setModo('livre')}
              className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${modo === 'livre' ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
            >
              Todos Juntos
            </button>
          </div>
          <p className="-mt-3 w-full text-xs text-slate-400">
            {modo === 'times' ? 'Time A contra Time B, revezando a vez. Quem chegar primeiro no limite de pontos vence.' : 'Todo mundo adivinha junto, revezando quem desenha.'}
          </p>

          <div className="flex w-full flex-col gap-2">
            <span className="font-display text-sm font-semibold text-slate-300">Tempo para desenhar</span>
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

          <div className="flex w-full flex-col gap-2">
            <span className="font-display text-sm font-semibold text-slate-300">Limite de pontos</span>
            <div className="flex gap-2">
              {LIMITES.map((p) => (
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

          <ThemeSourcePicker
            categories={DESENHO_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
            selectedCategory={categoriaKey}
            onSelectCategory={setCategoriaKey}
            mode={modoTema}
            onModeChange={setModoTema}
            customText={customText}
            onCustomTextChange={setCustomText}
            customPlaceholder="Digite palavras separadas por vírgula ou uma por linha"
            savedThemes={savedThemes}
            onLoadSaved={(t) => setCustomText((t.items as string[]).join(', '))}
            onDeleteSaved={(id) => {
              deleteCustomTheme(id);
              setSavedThemes(getCustomThemes('desenho'));
            }}
            onSaveCurrent={(name) => {
              const items = parseSimpleList(customText);
              if (items.length === 0) return;
              saveCustomTheme({ game: 'desenho', name, items });
              setSavedThemes(getCustomThemes('desenho'));
            }}
          />

          {setupError && <p className="text-sm font-semibold text-red-400">{setupError}</p>}
          <Button fullWidth onClick={handleSetupSubmit}>
            Continuar
          </Button>
        </Panel>
      )}

      {phase === 'callArtist' && (
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
            <h2 className="font-display text-2xl font-extrabold">Próximo desenhista</h2>
          )}
          <Placar modo={modo} scoreA={scoreA} scoreB={scoreB} acertos={acertosLivre} limite={limitePontos} />
          <p className="text-sm text-slate-400">Escolham quem vai desenhar. Só o desenhista olha a tela: segure para ver a palavra.</p>
          <HoldToReveal
            label="Segure para ver a palavra"
            revealed={<p className="font-display text-3xl font-extrabold text-lime-400">{palavra}</p>}
          />
          <Button fullWidth onClick={handleComecar}>
            Começar a desenhar ✏️
          </Button>
        </Panel>
      )}

      {phase === 'drawing' && (
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex w-full items-center justify-between gap-3">
            <PeekPalavra palavra={palavra} />
            <span className={`font-display text-3xl font-extrabold tabular-nums ${timerColor}`}>{timer.label}</span>
          </div>
          <p className="w-full text-center text-xs text-slate-500">Sem letras, números ou falar! Só desenho.</p>
          <Lousa />
          <div className="grid w-full grid-cols-2 gap-3">
            <Button variant="primary" onClick={() => encerrar('acertou')}>
              Acertaram! +1
            </Button>
            <Button variant="ghost" onClick={() => encerrar('desistiu')}>
              Desistir
            </Button>
          </div>
        </div>
      )}

      {phase === 'turnEnd' && (
        <Panel className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-xl font-extrabold">
            {resultado === 'acertou' && 'Acertaram! 🎉'}
            {resultado === 'tempo' && 'Acabou o tempo! ⏰'}
            {resultado === 'desistiu' && 'Passou a vez!'}
          </h2>
          <p className="text-sm text-slate-400">A palavra era:</p>
          <p className="font-display text-3xl font-extrabold text-lime-400">{palavra}</p>
          <Placar modo={modo} scoreA={scoreA} scoreB={scoreB} acertos={acertosLivre} limite={limitePontos} />
          <Button fullWidth onClick={proximaRodada}>
            Continuar
          </Button>
          <Button variant="ghost" onClick={() => setPhase('final')}>
            Encerrar Jogo
          </Button>
        </Panel>
      )}

      {phase === 'final' && (
        <Panel className="flex flex-col items-center gap-4 text-center">
          <Trophy className="text-lime-400" size={40} />
          <h2 className="font-display text-2xl font-extrabold">
            {modo === 'times' ? (scoreA === scoreB ? 'Empate!' : `Time ${scoreA > scoreB ? 'A' : 'B'} venceu! 🎉`) : 'Fim de jogo!'}
          </h2>
          <Placar modo={modo} scoreA={scoreA} scoreB={scoreB} acertos={acertosLivre} limite={limitePontos} />
          <p className="text-sm text-slate-400">Rodadas jogadas: {rodadas}</p>
          <Button onClick={handleRestart}>Jogar Novamente</Button>
        </Panel>
      )}
    </GameShell>
  );
}

function Placar({ modo, scoreA, scoreB, acertos, limite }: { modo: Modo; scoreA: number; scoreB: number; acertos: number; limite: number }) {
  return modo === 'times' ? (
    <div className="flex gap-8 font-display text-lg font-bold">
      <span>Time A: {scoreA}</span>
      <span>Time B: {scoreB}</span>
    </div>
  ) : (
    <p className="font-display text-lg font-bold">
      Acertos do grupo: {acertos} / {limite}
    </p>
  );
}

/** Botão pequeno que mostra a palavra só enquanto o desenhista segura. */
function PeekPalavra({ palavra }: { palavra: string }) {
  const [ver, setVer] = useState(false);
  return (
    <button
      onPointerDown={() => setVer(true)}
      onPointerUp={() => setVer(false)}
      onPointerLeave={() => setVer(false)}
      onPointerCancel={() => setVer(false)}
      onContextMenu={(e) => e.preventDefault()}
      className="no-select flex min-h-[44px] min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-3 font-display text-sm font-bold text-slate-300"
    >
      <Eye size={18} className="shrink-0" />
      <span className="truncate">{ver ? <span className="text-lime-400">{palavra}</span> : 'Segure para ver a palavra'}</span>
    </button>
  );
}

/** Quadro de desenho com dedo/mouse, cores, borracha, desfazer e limpar. */
function Lousa() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tracos = useRef<Traco[]>([]);
  const atual = useRef<Traco | null>(null);
  const [cor, setCor] = useState(CORES[0]);
  const [largura, setLargura] = useState(5);
  const [, forceUpdate] = useState(0);

  const redesenhar = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const ratio = canvas.width / canvas.clientWidth;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const t of tracos.current) {
      ctx.strokeStyle = t.cor;
      ctx.fillStyle = t.cor;
      ctx.lineWidth = t.largura;
      if (t.pontos.length === 1) {
        ctx.beginPath();
        ctx.arc(t.pontos[0].x, t.pontos[0].y, t.largura / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      t.pontos.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
    }
  }, []);

  // Ajusta a resolução do canvas à tela (nitidez em celulares)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ajustar = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      redesenhar();
    };
    ajustar();
    window.addEventListener('resize', ajustar);
    return () => window.removeEventListener('resize', ajustar);
  }, [redesenhar]);

  function ponto(e: ReactPointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const larg = cor === BORRACHA ? largura * 4 : largura;
    atual.current = { cor, largura: larg, pontos: [ponto(e)] };
    tracos.current.push(atual.current);
    redesenhar();
  }

  function onMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!atual.current) return;
    atual.current.pontos.push(ponto(e));
    redesenhar();
  }

  function onUp() {
    atual.current = null;
    forceUpdate((n) => n + 1);
  }

  function desfazer() {
    tracos.current.pop();
    redesenhar();
    forceUpdate((n) => n + 1);
  }

  function limpar() {
    tracos.current = [];
    redesenhar();
    forceUpdate((n) => n + 1);
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="aspect-[4/5] w-full touch-none rounded-2xl border-2 border-slate-700 bg-white sm:aspect-[4/3]"
        style={{ touchAction: 'none' }}
      />
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {CORES.map((c) => (
            <button
              key={c}
              onClick={() => setCor(c)}
              aria-label="Escolher cor"
              className={`h-9 w-9 rounded-full border-2 ${cor === c ? 'border-lime-400 ring-2 ring-lime-400/40' : 'border-slate-600'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setLargura((l) => (l === 5 ? 12 : 5))}
            className="flex h-9 min-w-[44px] items-center justify-center rounded-xl border border-slate-700 px-2 text-xs font-bold text-slate-300"
            aria-label="Espessura do traço"
          >
            {largura === 5 ? 'Fino' : 'Grosso'}
          </button>
          <button
            onClick={() => setCor(BORRACHA)}
            aria-label="Borracha"
            className={`flex h-9 w-9 items-center justify-center rounded-xl border ${cor === BORRACHA ? 'border-lime-400 text-lime-400' : 'border-slate-700 text-slate-300'}`}
          >
            <Eraser size={18} />
          </button>
          <button onClick={desfazer} aria-label="Desfazer" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-slate-300">
            <Undo2 size={18} />
          </button>
          <button onClick={limpar} aria-label="Limpar tudo" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-slate-300">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
