import { useEffect, useMemo, useRef, useState } from 'react';
import { Hand, Trophy } from 'lucide-react';
import GameShell from '../components/GameShell';
import Panel from '../components/Panel';
import Button from '../components/Button';
import NumberStepper from '../components/NumberStepper';
import PlayerNamesEditor from '../components/PlayerNamesEditor';
import { ADEDONHA_COLUMNS, ALFABETO, LETRAS_DIFICEIS } from '../data/adedonhaData';
import { useCountdown } from '../hooks/useCountdown';
import { useSoundEffects } from '../hooks/useSoundEffects';

type Phase = 'setup' | 'players' | 'sorteio' | 'escrevendo' | 'pontuacao' | 'final';

/** 0 = sem limite de tempo (a rodada só acaba no STOP!) */
const TEMPOS = [60, 90, 120, 0];

interface AdedonhaPlayer {
  name: string;
  total: number;
}

export default function Adedonha() {
  const [phase, setPhase] = useState<Phase>('setup');
  const sfx = useSoundEffects();

  // ---- Setup ----
  const [qtdJogadores, setQtdJogadores] = useState(4);
  const [qtdRodadas, setQtdRodadas] = useState(5);
  const [tempo, setTempo] = useState(90);
  const [semDificeis, setSemDificeis] = useState(true);
  const [colunas, setColunas] = useState<string[]>(() => ADEDONHA_COLUMNS.filter((c) => c.padrao).map((c) => c.key));
  const [setupError, setSetupError] = useState('');

  // ---- Partida ----
  const [players, setPlayers] = useState<AdedonhaPlayer[]>([]);
  const [rodada, setRodada] = useState(1);
  const [letra, setLetra] = useState('');
  const [letrasUsadas, setLetrasUsadas] = useState<string[]>([]);
  const [girando, setGirando] = useState(false);
  const [pontosRodada, setPontosRodada] = useState<number[]>([]);
  const [motivoFim, setMotivoFim] = useState<'stop' | 'tempo'>('stop');
  const spinRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timer = useCountdown(tempo || 1, {
    onTick: (s) => {
      if (s <= 10) sfx.playTick();
    },
    onFinish: () => {
      sfx.playAlarm();
      setMotivoFim('tempo');
      setPhase('pontuacao');
    },
  });

  const matchInProgress = phase !== 'setup';
  const colunasAtivas = ADEDONHA_COLUMNS.filter((c) => colunas.includes(c.key));
  const maxPontos = colunasAtivas.length * 10;

  useEffect(() => () => {
    if (spinRef.current) clearInterval(spinRef.current);
  }, []);

  function toggleColuna(key: string) {
    setColunas((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function handleSetupSubmit() {
    if (colunas.length < 3) {
      setSetupError('Escolha pelo menos 3 colunas.');
      return;
    }
    setSetupError('');
    setPhase('players');
  }

  function letrasDisponiveis(usadas: string[]) {
    const base = semDificeis ? ALFABETO.filter((l) => !LETRAS_DIFICEIS.includes(l)) : ALFABETO;
    const livres = base.filter((l) => !usadas.includes(l));
    return livres.length > 0 ? livres : base;
  }

  /** Animação de roleta: passa por várias letras e para numa sorteada. */
  function sortearLetra(usadas: string[]) {
    const opcoes = letrasDisponiveis(usadas);
    const final = opcoes[Math.floor(Math.random() * opcoes.length)];
    setGirando(true);
    let voltas = 0;
    if (spinRef.current) clearInterval(spinRef.current);
    spinRef.current = setInterval(() => {
      voltas += 1;
      setLetra(ALFABETO[Math.floor(Math.random() * ALFABETO.length)]);
      sfx.playTick();
      if (voltas >= 14) {
        if (spinRef.current) clearInterval(spinRef.current);
        setLetra(final);
        setLetrasUsadas([...usadas, final]);
        setGirando(false);
        sfx.playCorrect();
      }
    }, 90);
  }

  function handlePlayersSubmit(names: string[]) {
    setPlayers(names.map((name) => ({ name, total: 0 })));
    setRodada(1);
    setLetrasUsadas([]);
    setPhase('sorteio');
    sortearLetra([]);
  }

  function handleValendo() {
    setPontosRodada(players.map(() => 0));
    if (tempo > 0) {
      timer.reset(tempo);
      timer.start();
    }
    setPhase('escrevendo');
  }

  function handleStop() {
    timer.pause();
    sfx.playAlarm();
    setMotivoFim('stop');
    setPhase('pontuacao');
  }

  function handleSomarPontos() {
    const atualizados = players.map((p, i) => ({ ...p, total: p.total + (pontosRodada[i] ?? 0) }));
    setPlayers(atualizados);
    if (rodada >= qtdRodadas) {
      setPhase('final');
      return;
    }
    setRodada((r) => r + 1);
    setPhase('sorteio');
    sortearLetra(letrasUsadas);
  }

  function handleRestart() {
    timer.reset(tempo || 1);
    setPhase('setup');
    setPlayers([]);
    setLetra('');
  }

  const ranking = useMemo(() => [...players].sort((a, b) => b.total - a.total), [players]);

  return (
    <GameShell title="ADEDONHA" matchInProgress={matchInProgress} game="adedonha" accent="text-lime-400">
      {phase === 'setup' && (
        <Panel className="flex flex-col items-center gap-5">
          <div className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            📝 Cada jogador precisa de <b>papel e caneta</b>. O celular sorteia a letra, marca o tempo e soma os pontos.
          </div>

          <div className="grid w-full grid-cols-2 gap-4">
            <NumberStepper label="Jogadores" value={qtdJogadores} min={2} max={12} onChange={setQtdJogadores} />
            <NumberStepper label="Rodadas" value={qtdRodadas} min={1} max={10} onChange={setQtdRodadas} />
          </div>

          <div className="flex w-full flex-col gap-2">
            <span className="font-display text-sm font-semibold text-slate-300">Tempo por rodada</span>
            <div className="flex gap-2">
              {TEMPOS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTempo(t)}
                  className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${tempo === t ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
                >
                  {t === 0 ? 'Livre' : `${t}s`}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {tempo === 0 ? 'Sem cronômetro: a rodada só acaba quando alguém gritar STOP!' : 'A rodada acaba quando alguém gritar STOP! ou quando o tempo zerar.'}
            </p>
          </div>

          <label className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <input type="checkbox" checked={semDificeis} onChange={(e) => setSemDificeis(e.target.checked)} className="h-5 w-5 accent-lime-400" />
            <span className="text-sm font-semibold">
              Tirar letras difíceis
              <span className="mt-0.5 block text-xs font-normal text-slate-400">Não sorteia {LETRAS_DIFICEIS.join(', ')}.</span>
            </span>
          </label>

          <div className="flex w-full flex-col gap-2">
            <span className="font-display text-sm font-semibold text-slate-300">Colunas do papel ({colunas.length})</span>
            <div className="flex flex-wrap gap-2">
              {ADEDONHA_COLUMNS.map((c) => {
                const on = colunas.includes(c.key);
                return (
                  <button
                    key={c.key}
                    onClick={() => toggleColuna(c.key)}
                    className={`min-h-[40px] rounded-full border px-3 text-sm font-semibold ${on ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
                  >
                    {on ? '✓ ' : ''}
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {setupError && <p className="text-sm font-semibold text-red-400">{setupError}</p>}
          <Button fullWidth onClick={handleSetupSubmit}>
            Continuar
          </Button>
        </Panel>
      )}

      {phase === 'players' && (
        <Panel className="flex flex-col items-center gap-4">
          <h2 className="font-display text-xl font-extrabold">Jogadores</h2>
          <div className="w-full rounded-xl border border-slate-700 bg-slate-800/40 p-3 text-sm text-slate-300">
            <p className="mb-1 font-semibold text-slate-100">Antes de começar, cada um desenha no papel uma tabela com estas colunas:</p>
            <p className="text-lime-400">{colunasAtivas.map((c) => c.label).join(' · ')}</p>
          </div>
          <PlayersStep count={qtdJogadores} onSubmit={handlePlayersSubmit} />
        </Panel>
      )}

      {phase === 'sorteio' && (
        <Panel className="flex flex-col items-center gap-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Rodada {rodada} de {qtdRodadas}
          </p>
          <div
            className={`flex h-40 w-40 items-center justify-center rounded-3xl border-4 font-display text-8xl font-extrabold ${girando ? 'border-slate-600 text-slate-500' : 'border-lime-400 text-lime-400'}`}
          >
            {letra}
          </div>
          <p className="text-sm text-slate-300">
            {girando ? 'Sorteando a letra…' : (
              <>
                Todas as respostas desta rodada começam com <b className="text-lime-400">{letra}</b>.
              </>
            )}
          </p>
          <Button fullWidth disabled={girando} onClick={handleValendo}>
            Valendo! ✍️
          </Button>
        </Panel>
      )}

      {phase === 'escrevendo' && (
        <Panel className="flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-lime-400 font-display text-6xl font-extrabold text-lime-400">
              {letra}
            </div>
            {tempo > 0 && (
              <div className={`font-display text-5xl font-extrabold tabular-nums ${timer.secondsLeft <= 10 ? 'text-red-400' : 'text-slate-100'}`}>
                {timer.label}
              </div>
            )}
          </div>
          <p className="text-sm text-slate-300">Preencham no papel uma resposta para cada coluna, começando com {letra}:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {colunasAtivas.map((c) => (
              <span key={c.key} className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200">
                {c.label}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500">Terminou tudo? Grite STOP! e toque no botão. Todo mundo larga a caneta na hora.</p>
          <button
            onClick={handleStop}
            className="no-select flex min-h-[96px] w-full items-center justify-center gap-3 rounded-3xl bg-red-500 font-display text-4xl font-extrabold text-white shadow-lg shadow-red-900/40 active:scale-95"
          >
            <Hand size={36} /> STOP!
          </button>
        </Panel>
      )}

      {phase === 'pontuacao' && (
        <Panel className="flex flex-col items-center gap-4">
          <h2 className="font-display text-xl font-extrabold">{motivoFim === 'stop' ? 'STOP! Canetas no chão ✋' : 'Acabou o tempo! ⏰'}</h2>
          <div className="w-full rounded-xl border border-slate-700 bg-slate-800/40 p-3 text-sm text-slate-300">
            <p className="mb-1 font-semibold text-slate-100">Leiam as respostas coluna por coluna e contem os pontos:</p>
            <p>
              <b className="text-lime-400">10</b> → só você escreveu essa resposta
            </p>
            <p>
              <b className="text-amber-400">5</b> → outra pessoa escreveu a mesma coisa
            </p>
            <p>
              <b className="text-red-400">0</b> → deixou em branco ou o grupo não aceitou
            </p>
          </div>
          <p className="text-xs text-slate-400">Coloque quantos pontos cada um fez nesta rodada (letra {letra}):</p>
          <div className="flex w-full flex-col gap-3">
            {players.map((p, i) => (
              <div key={p.name + i} className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/50 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate font-display font-bold">{p.name}</p>
                  <p className="text-xs text-slate-500">Total: {p.total}</p>
                </div>
                <div className="w-40 shrink-0">
                  <NumberStepper
                    label=""
                    value={pontosRodada[i] ?? 0}
                    min={0}
                    max={maxPontos}
                    step={5}
                    onChange={(v) => setPontosRodada((prev) => prev.map((x, j) => (j === i ? v : x)))}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button fullWidth onClick={handleSomarPontos}>
            {rodada >= qtdRodadas ? 'Ver resultado final' : 'Somar e sortear próxima letra'}
          </Button>
        </Panel>
      )}

      {phase === 'final' && (
        <Panel className="flex flex-col items-center gap-4 text-center">
          <Trophy className="text-lime-400" size={40} />
          <h2 className="font-display text-2xl font-extrabold">
            {ranking.length > 1 && ranking[0].total === ranking[1].total ? 'Empate no topo!' : `${ranking[0]?.name} venceu! 🎉`}
          </h2>
          <p className="text-xs text-slate-400">Letras jogadas: {letrasUsadas.join(', ')}</p>
          <div className="flex w-full flex-col gap-2">
            {ranking.map((p, i) => (
              <div
                key={p.name + i}
                className={`flex items-center justify-between rounded-xl px-4 py-3 ${i === 0 ? 'border border-lime-400 bg-lime-400/10' : 'bg-slate-800/60'}`}
              >
                <span className="font-display font-bold">
                  {i + 1}º {p.name}
                </span>
                <span className="font-display font-extrabold text-lime-400">{p.total} pts</span>
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
      <Button fullWidth onClick={() => onSubmit(names.map((n, i) => n.trim() || `Jogador ${i + 1}`))}>
        Sortear a primeira letra
      </Button>
    </>
  );
}
