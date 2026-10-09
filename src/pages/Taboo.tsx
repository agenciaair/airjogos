import { useState } from 'react';
import { AlertTriangle, Ban, Check, SkipForward, Trophy } from 'lucide-react';
import GameShell from '../components/GameShell';
import Panel from '../components/Panel';
import Button from '../components/Button';
import ThemeSourcePicker from '../components/ThemeSourcePicker';
import { TABOO_CATEGORIES, type TabooCard } from '../data/tabooData';
import { drawUnique } from '../utils/antiRepetition';
import { parseTabooList, saveCustomTheme, getCustomThemes, deleteCustomTheme, type CustomTheme, type TabooCardInput } from '../utils/themeParser';
import { useCountdown } from '../hooks/useCountdown';
import { useSoundEffects } from '../hooks/useSoundEffects';

type Phase = 'setup' | 'callActor' | 'acting' | 'turnEnd' | 'final';
type Modo = 'equipes' | 'livre';
type Time = 'A' | 'B';

const TEMPOS = [60, 90, 120];

interface TeamStats {
  acertos: number;
  pulos: number;
  infracoes: number;
}

const emptyStats: TeamStats = { acertos: 0, pulos: 0, infracoes: 0 };

export default function Taboo() {
  const [phase, setPhase] = useState<Phase>('setup');
  const sfx = useSoundEffects();

  const [modo, setModo] = useState<Modo>('equipes');
  const [tempoSegundos, setTempoSegundos] = useState(90);
  const [pulosPermitidos, setPulosPermitidos] = useState<1 | 2 | 3>(2);
  const [penalidades, setPenalidades] = useState(true);
  const [modoTema, setModoTema] = useState<'predefinido' | 'custom'>('predefinido');
  const [categoriaKey, setCategoriaKey] = useState(TABOO_CATEGORIES[0].key);
  const [customText, setCustomText] = useState('');
  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>(() => getCustomThemes('taboo'));
  const [resetNotice, setResetNotice] = useState('');

  const [statsA, setStatsA] = useState<TeamStats>(emptyStats);
  const [statsB, setStatsB] = useState<TeamStats>(emptyStats);
  const [currentTeam, setCurrentTeam] = useState<Time>('A');
  const [card, setCard] = useState<TabooCard | null>(null);
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

  function pool(): TabooCard[] {
    if (modoTema === 'predefinido') return TABOO_CATEGORIES.find((c) => c.key === categoriaKey)!.items;
    const parsed = parseTabooList(customText);
    return parsed.map((c) => ({ palavra: c.palavra, proibidas: c.proibidas.slice(0, 5) as TabooCard['proibidas'] }));
  }

  function drawCard() {
    const key = `taboo:${modoTema === 'predefinido' ? categoriaKey : 'custom'}`;
    const draw = drawUnique(key, pool(), (c) => c.palavra);
    setResetNotice(draw.didReset ? 'As cartas dessa categoria acabaram — reiniciando o ciclo!' : '');
    setCard(draw.item);
  }

  function handleSetupSubmit() {
    if (modoTema === 'custom' && parseTabooList(customText).length === 0) return;
    drawCard();
    setPulosRestantes(pulosPermitidos);
    setAcertosTurno(0);
    setPhase('callActor');
  }

  function handleBegin() {
    timer.reset(tempoSegundos);
    timer.start();
    setPhase('acting');
  }

  function updateStats(team: Time, patch: Partial<TeamStats>) {
    const apply = (s: TeamStats): TeamStats => ({
      acertos: s.acertos + (patch.acertos ?? 0),
      pulos: s.pulos + (patch.pulos ?? 0),
      infracoes: s.infracoes + (patch.infracoes ?? 0),
    });
    if (team === 'A') setStatsA(apply);
    else setStatsB(apply);
  }

  function handleAcertou() {
    sfx.playCorrect();
    setAcertosTurno((n) => n + 1);
    updateStats(currentTeam, { acertos: 1 });
    drawCard();
  }

  function handlePular() {
    if (pulosRestantes <= 0) return;
    setPulosRestantes((p) => p - 1);
    updateStats(currentTeam, { pulos: 1 });
    drawCard();
  }

  function handleTabu() {
    sfx.playError();
    updateStats(currentTeam, { infracoes: 1, acertos: penalidades ? -1 : 0 });
    drawCard();
  }

  function handleEndTurnManually() {
    timer.pause();
    setPhase('turnEnd');
  }

  function proceedAfterTurn() {
    if (modo === 'equipes') setCurrentTeam((t) => (t === 'A' ? 'B' : 'A'));
    setPulosRestantes(pulosPermitidos);
    setAcertosTurno(0);
    drawCard();
    setPhase('callActor');
  }

  function finishGame() {
    setPhase('final');
  }

  function handleRestart() {
    setPhase('setup');
    setStatsA(emptyStats);
    setStatsB(emptyStats);
    setCurrentTeam('A');
    setResetNotice('');
  }

  function net(s: TeamStats) {
    return s.acertos;
  }

  return (
    <GameShell title="TABOO" matchInProgress={matchInProgress} accent="text-lime-400">
      {phase === 'setup' && (
        <Panel className="flex flex-col items-center gap-5">
          <div className="flex w-full gap-2">
            <button
              onClick={() => setModo('equipes')}
              className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${modo === 'equipes' ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
            >
              Modo Equipes
            </button>
            <button
              onClick={() => setModo('livre')}
              className={`min-h-[44px] flex-1 rounded-xl border font-display text-sm font-bold ${modo === 'livre' ? 'border-lime-400 bg-lime-400/10 text-lime-400' : 'border-slate-700 text-slate-400'}`}
            >
              Roda Livre
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

          <label className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <span className="text-sm font-semibold">Pulos permitidos por rodada</span>
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setPulosPermitidos(n as 1 | 2 | 3)}
                  className={`min-h-[36px] min-w-[36px] rounded-lg border font-bold ${pulosPermitidos === n ? 'border-lime-400 text-lime-400' : 'border-slate-600 text-slate-400'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </label>

          <label className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <input type="checkbox" checked={penalidades} onChange={(e) => setPenalidades(e.target.checked)} className="h-5 w-5 accent-lime-400" />
            <span className="text-sm font-semibold">Penalidade de -1 ponto por infração de Tabu</span>
          </label>

          <ThemeSourcePicker
            categories={TABOO_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
            selectedCategory={categoriaKey}
            onSelectCategory={setCategoriaKey}
            mode={modoTema}
            onModeChange={setModoTema}
            customText={customText}
            onCustomTextChange={setCustomText}
            customPlaceholder={'Formato: Palavra | proibida1, proibida2, proibida3, proibida4, proibida5 (uma carta por linha)'}
            savedThemes={savedThemes}
            onLoadSaved={(t) =>
              setCustomText(
                (t.items as TabooCardInput[]).map((c) => `${c.palavra} | ${c.proibidas.join(', ')}`).join('\n')
              )
            }
            onDeleteSaved={(id) => {
              deleteCustomTheme(id);
              setSavedThemes(getCustomThemes('taboo'));
            }}
            onSaveCurrent={(name) => {
              const items = parseTabooList(customText);
              if (items.length === 0) return;
              saveCustomTheme({ game: 'taboo', name, items });
              setSavedThemes(getCustomThemes('taboo'));
            }}
          />

          <Button fullWidth onClick={handleSetupSubmit}>
            Continuar
          </Button>
        </Panel>
      )}

      {phase === 'callActor' && card && (
        <Panel className="flex flex-col items-center gap-5 text-center">
          {resetNotice && (
            <p className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300">
              <AlertTriangle size={16} /> {resetNotice}
            </p>
          )}
          {modo === 'equipes' ? (
            <h2 className="font-display text-2xl font-extrabold">
              Vez do <span className="text-lime-400">Time {currentTeam}</span>
            </h2>
          ) : (
            <h2 className="font-display text-2xl font-extrabold">Próximo Orador</h2>
          )}
          <p className="text-sm text-slate-400">Escolha o orador e o fiscal para esta rodada.</p>
          <Button fullWidth onClick={handleBegin}>
            Começar
          </Button>
        </Panel>
      )}

      {phase === 'acting' && card && (
        <Panel className="flex flex-col items-center gap-4 text-center">
          <div className="flex w-full items-center justify-between font-display text-sm font-bold">
            {modo === 'equipes' ? (
              <>
                <span className={currentTeam === 'A' ? 'text-lime-400' : ''}>Time A: {statsA.acertos}</span>
                <span className={currentTeam === 'B' ? 'text-lime-400' : ''}>Time B: {statsB.acertos}</span>
              </>
            ) : (
              <span className="text-lime-400">Acertos: {statsA.acertos}</span>
            )}
            <span className="tabular-nums text-slate-300">{timer.label}</span>
          </div>

          <div className="w-full rounded-2xl border-2 border-lime-400 bg-slate-950 px-4 py-6">
            <p className="font-display text-3xl font-extrabold text-lime-400">{card.palavra}</p>
          </div>

          <div className="w-full rounded-2xl border-2 border-red-500 bg-red-500/10 p-4">
            <p className="mb-2 flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wide text-red-400">
              <Ban size={14} /> Palavras Proibidas
            </p>
            <ul className="flex flex-col gap-1">
              {card.proibidas.map((p) => (
                <li key={p} className="font-display text-lg font-bold text-red-300">
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-500">Pulos restantes: {pulosRestantes}</p>

          <div className="grid w-full grid-cols-3 gap-2">
            <Button variant="primary" onClick={handleAcertou}>
              <Check size={18} className="mr-1 inline" /> Acertou
            </Button>
            <Button variant="warning" disabled={pulosRestantes <= 0} onClick={handlePular}>
              <SkipForward size={18} className="mr-1 inline" /> Pular
            </Button>
            <Button variant="danger" onClick={handleTabu}>
              <Ban size={18} className="mr-1 inline" /> Tabu
            </Button>
          </div>

          <Button variant="ghost" fullWidth onClick={handleEndTurnManually}>
            Encerrar Rodada
          </Button>
        </Panel>
      )}

      {phase === 'turnEnd' && (
        <Panel className="flex flex-col items-center gap-5 text-center">
          <h2 className="font-display text-xl font-extrabold">Fim da Rodada!</h2>
          <p className="text-lg">
            Acertos na rodada: <span className="font-bold text-lime-400">{acertosTurno}</span>
          </p>
          <div className="flex gap-3">
            <Button fullWidth onClick={proceedAfterTurn}>
              Próxima Rodada
            </Button>
            <Button variant="ghost" onClick={finishGame}>
              Encerrar Jogo
            </Button>
          </div>
        </Panel>
      )}

      {phase === 'final' && (
        <Panel className="flex flex-col items-center gap-4 text-center">
          <Trophy className="text-lime-400" size={40} />
          <h2 className="font-display text-2xl font-extrabold">
            {modo === 'equipes' ? (net(statsA) === net(statsB) ? 'Empate!' : `Time ${net(statsA) > net(statsB) ? 'A' : 'B'} Venceu! 🎉`) : 'Relatório Final'}
          </h2>

          <div className="flex w-full flex-col gap-3">
            <StatsCard label={modo === 'equipes' ? 'Time A' : 'Resultado'} stats={statsA} />
            {modo === 'equipes' && <StatsCard label="Time B" stats={statsB} />}
          </div>

          <Button onClick={handleRestart}>Jogar Novamente</Button>
        </Panel>
      )}
    </GameShell>
  );
}

function StatsCard({ label, stats }: { label: string; stats: TeamStats }) {
  return (
    <div className="w-full rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-left">
      <p className="mb-2 font-display font-bold text-lime-400">{label}</p>
      <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
        <span>Acertos: {stats.acertos + stats.infracoes}</span>
        <span>Pulos: {stats.pulos}</span>
        <span>Infrações: {stats.infracoes}</span>
        <span className="font-bold text-slate-100">Pontuação líquida: {stats.acertos}</span>
      </div>
    </div>
  );
}
