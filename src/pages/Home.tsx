import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type UIEvent as ReactUIEvent } from 'react';
import { Link } from 'react-router-dom';

interface GameDef {
  path: string;
  title: string;
  description: string;
  image: string;
}

const GAMES: GameDef[] = [
  {
    path: '/impostor',
    title: 'Impostor',
    description: 'Descubra quem não sabe a palavra secreta antes que ele descubra o grupo.',
    image: '/images/impostor.jpg',
  },
  {
    path: '/quem-eu-sou',
    title: 'Quem Eu Sou?',
    description: 'Todo mundo sabe sua identidade secreta, menos você. Pergunte e descubra!',
    image: '/images/quemeusou.jpg',
  },
  {
    path: '/mimica',
    title: 'Mímica',
    description: 'Atue sem falar nada e faça seu time adivinhar o máximo de palavras possível.',
    image: '/images/mimica.png',
  },
  {
    path: '/completar',
    title: 'Completar',
    description: 'A roda de narradores dá pistas, uma palavra de cada vez, para o adivinhador acertar.',
    image: '/images/completar.png',
  },
  {
    path: '/taboo',
    title: 'Tabu',
    description: 'Faça o time adivinhar a palavra principal sem usar nenhuma das 5 palavras proibidas.',
    image: '/images/taboo.png',
  },
];

/** Repetições da lista para simular um loop infinito no carrossel. */
const LOOPS = 3;
const LOOPED_GAMES = Array.from({ length: LOOPS }, (_, setIndex) =>
  GAMES.map((game) => ({ ...game, key: `${game.path}-${setIndex}` }))
).flat();

export default function Home() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const drag = useRef({ startX: 0, scrollLeft: 0, moved: false });

  // Posiciona o carrossel no conjunto do meio ao montar, para que dê pra
  // "voltar" arrastando pra qualquer lado desde o primeiro card.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const setWidth = track.scrollWidth / LOOPS;
    track.scrollLeft = setWidth;
  }, []);

  // Ao cruzar a metade de um conjunto clonado, reposiciona silenciosamente
  // para o conjunto do meio — como os conjuntos são idênticos, o salto é
  // imperceptível e o carrossel parece rolar infinitamente.
  function handleScroll(e: ReactUIEvent<HTMLDivElement>) {
    const track = e.currentTarget;
    const setWidth = track.scrollWidth / LOOPS;
    if (setWidth === 0) return;
    if (track.scrollLeft < setWidth * 0.5) {
      track.scrollLeft += setWidth;
    } else if (track.scrollLeft > setWidth * 1.5) {
      track.scrollLeft -= setWidth;
    }
  }

  function handleMouseDown(e: ReactMouseEvent) {
    const track = trackRef.current;
    if (!track) return;
    setIsDragging(true);
    drag.current.startX = e.pageX - track.offsetLeft;
    drag.current.scrollLeft = track.scrollLeft;
    drag.current.moved = false;
  }

  function stopDragging() {
    setIsDragging(false);
  }

  function handleMouseMove(e: ReactMouseEvent) {
    const track = trackRef.current;
    if (!isDragging || !track) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - drag.current.startX) * 1.2;
    if (Math.abs(walk) > 5) drag.current.moved = true;
    track.scrollLeft = drag.current.scrollLeft - walk;
  }

  function handleCardClick(e: ReactMouseEvent) {
    if (drag.current.moved) {
      e.preventDefault();
      drag.current.moved = false;
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-12 pt-10 safe-bottom">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 px-4 text-center">
        <img src="/images/logo-airdesign.png" alt="Air Jogos" className="h-14 w-auto sm:h-20" />
        <p className="max-w-md text-sm text-slate-400">
          Escolha um jogo, reúna a galera e comece a diversão — tudo em um único celular.
        </p>
      </div>

      <div className="relative mx-auto mt-10 max-w-xs sm:max-w-md">
        {/* Degradês nas bordas: dissolvem os cards em vez de cortá-los bruscamente */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-slate-950 to-transparent sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-slate-950 to-transparent sm:w-16" />

        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={stopDragging}
          onMouseUp={stopDragging}
          onMouseMove={handleMouseMove}
          onScroll={handleScroll}
          className={`hide-scrollbar flex gap-4 overflow-x-auto px-4 pb-4 ${
            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
        >
          {LOOPED_GAMES.map((game) => (
              <Link
                key={game.key}
                to={game.path}
                onClick={handleCardClick}
                onDragStart={(e) => e.preventDefault()}
                className="group relative h-80 w-[220px] shrink-0 overflow-hidden rounded-3xl shadow-lg shadow-black/40 ring-2 ring-slate-700 ring-offset-4 ring-offset-slate-950 transition-all duration-300 hover:ring-[#A3E635] sm:h-96 sm:w-[260px]"
              >
                {/* Camada 1: imagem de fundo */}
                <img
                  src={game.image}
                  alt={game.title}
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                />

                {/* Camada 2: degradê base escuro (legibilidade) */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

                {/* Camada 3: degradê verde no hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#A3E635]/90 via-[#A3E635]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Camada 4: conteúdo */}
                <div className="relative z-10 flex h-full flex-col justify-end p-5">
                  <h2 className="font-display text-2xl font-bold text-white">{game.title}</h2>
                  <p className="mt-1 text-sm text-slate-200/90">{game.description}</p>
                  <span className="mt-4 inline-block rounded-xl bg-[#A3E635] px-4 py-2.5 text-center font-display text-sm font-bold text-slate-950">
                    Jogar
                  </span>
                </div>
              </Link>
            ))}
          </div>
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-slate-600">Criado por @Arthur Ramos</p>
    </div>
  );
}
