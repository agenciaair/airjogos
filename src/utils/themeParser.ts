/**
 * Parser universal para colagem de texto corrido em listas simples
 * (Impostor, Quem Eu Sou, Mímica, Completar). Aceita separação por
 * vírgula ou quebra de linha.
 */
export function parseSimpleList(text: string): string[] {
  return text
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface TabooCardInput {
  palavra: string;
  proibidas: string[];
}

/**
 * Parser para temas do Taboo, no formato linha a linha:
 * "Palavra | proibida1, proibida2, proibida3, proibida4, proibida5"
 */
export function parseTabooList(text: string): TabooCardInput[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [palavraRaw, proibidasRaw = ''] = line.split('|');
      const palavra = (palavraRaw ?? '').trim();
      const proibidas = proibidasRaw
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      return { palavra, proibidas };
    })
    .filter((card) => card.palavra && card.proibidas.length > 0);
}

const CUSTOM_THEMES_KEY = 'air-jogos:custom-themes';

export interface CustomTheme {
  id: string;
  game: 'impostor' | 'quemeusou' | 'mimica' | 'completar' | 'taboo';
  name: string;
  createdAt: number;
  items: string[] | TabooCardInput[];
}

function readAllThemes(): CustomTheme[] {
  try {
    const raw = localStorage.getItem(CUSTOM_THEMES_KEY);
    return raw ? (JSON.parse(raw) as CustomTheme[]) : [];
  } catch {
    return [];
  }
}

function writeAllThemes(themes: CustomTheme[]) {
  try {
    localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes));
  } catch {
    // localStorage indisponível — tema simplesmente não persiste
  }
}

export function saveCustomTheme(theme: Omit<CustomTheme, 'id' | 'createdAt'>): CustomTheme {
  const themes = readAllThemes();
  const saved: CustomTheme = {
    ...theme,
    id: `${theme.game}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: Date.now(),
  };
  writeAllThemes([...themes, saved]);
  return saved;
}

export function getCustomThemes(game: CustomTheme['game']): CustomTheme[] {
  return readAllThemes()
    .filter((t) => t.game === game)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function deleteCustomTheme(id: string) {
  writeAllThemes(readAllThemes().filter((t) => t.id !== id));
}
