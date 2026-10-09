const STORAGE_PREFIX = 'air-jogos:used:';

function readUsed(key: string): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeUsed(key: string, ids: string[]) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(ids));
  } catch {
    // sessionStorage indisponível (modo privado etc.) — segue sem persistir
  }
}

export interface DrawResult<T> {
  item: T;
  /** true quando o histórico da categoria esgotou e precisou reiniciar o ciclo */
  didReset: boolean;
}

/**
 * Sorteia um item de `pool` que ainda não foi usado nesta sessão para a `categoryKey`
 * informada. Quando todos os itens já saíram, reinicia o histórico daquela categoria
 * (mantendo o jogo fluindo) e sinaliza `didReset: true` para a UI avisar o usuário.
 */
export function drawUnique<T>(
  categoryKey: string,
  pool: T[],
  getId: (item: T) => string
): DrawResult<T> {
  if (pool.length === 0) {
    throw new Error(`antiRepetition: pool vazio para a categoria "${categoryKey}"`);
  }

  let used = readUsed(categoryKey);
  let available = pool.filter((item) => !used.includes(getId(item)));
  let didReset = false;

  if (available.length === 0) {
    used = [];
    available = pool;
    didReset = true;
  }

  const chosen = available[Math.floor(Math.random() * available.length)];
  used = [...used, getId(chosen)];
  writeUsed(categoryKey, used);

  return { item: chosen, didReset };
}

/**
 * Sorteia `count` itens únicos de `pool` (sem repetir entre si) que também respeitam
 * o anti-repetição de sessão. Útil para jogos que precisam de vários itens por rodada
 * (ex: Quem Eu Sou distribuindo uma identidade por jogador).
 */
export function drawUniqueMany<T>(
  categoryKey: string,
  pool: T[],
  count: number,
  getId: (item: T) => string
): DrawResult<T[]> {
  let used = readUsed(categoryKey);
  let available = pool.filter((item) => !used.includes(getId(item)));
  let didReset = false;

  if (available.length < count) {
    used = [];
    available = pool;
    didReset = true;
  }

  const shuffled = shuffle(available);
  const chosen = shuffled.slice(0, Math.min(count, shuffled.length));
  used = [...used, ...chosen.map(getId)];
  writeUsed(categoryKey, used);

  return { item: chosen, didReset };
}

export function resetCategory(categoryKey: string) {
  writeUsed(categoryKey, []);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
