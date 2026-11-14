/** Colunas clássicas do Stop / Adedonha. `padrao: true` já vem marcada. */
export interface AdedonhaColumn {
  key: string;
  label: string;
  padrao: boolean;
}

export const ADEDONHA_COLUMNS: AdedonhaColumn[] = [
  { key: 'nome', label: 'Nome', padrao: true },
  { key: 'cep', label: 'CEP (cidade, estado ou país)', padrao: true },
  { key: 'animal', label: 'Animal', padrao: true },
  { key: 'fruta', label: 'Fruta, verdura ou legume', padrao: true },
  { key: 'cor', label: 'Cor', padrao: true },
  { key: 'objeto', label: 'Objeto', padrao: true },
  { key: 'comida', label: 'Comida', padrao: false },
  { key: 'profissao', label: 'Profissão', padrao: false },
  { key: 'marca', label: 'Marca', padrao: false },
  { key: 'filme', label: 'Filme, série ou desenho', padrao: false },
  { key: 'artista', label: 'Artista ou cantor', padrao: false },
  { key: 'corpo', label: 'Parte do corpo', padrao: false },
  { key: 'esporte', label: 'Esporte', padrao: false },
  { key: 'biblia', label: 'Personagem bíblico', padrao: false },
  { key: 'msc', label: 'MSÉ (Minha sogra é…)', padrao: false },
  { key: 'famoso', label: 'Famoso', padrao: false },
  { key: 'jogador', label: 'Jogador de futebol', padrao: false },
  { key: 'time', label: 'Time de futebol', padrao: false },
  { key: 'jogo', label: 'Jogo (videogame ou tabuleiro)', padrao: false },
  { key: 'minecraft', label: 'Coisa do Minecraft', padrao: false },
  { key: 'pais', label: 'País', padrao: false },
  { key: 'carro', label: 'Carro ou marca de carro', padrao: false },
];

/** Letras difíceis que podem ficar de fora do sorteio. */
export const LETRAS_DIFICEIS = ['K', 'W', 'X', 'Y', 'Q', 'Z', 'H'];
export const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
