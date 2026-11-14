import { BATATA_EXTRAS } from './temasAcao';

export interface BatataCategory {
  key: string;
  label: string;
  /** cada item é um tema: na sua vez, fale algo que se encaixa nele */
  items: string[];
}

const facil: string[] = [
  'Frutas', 'Animais', 'Cores', 'Nomes de menina', 'Nomes de menino', 'Coisas que tem na cozinha',
  'Partes do corpo', 'Comidas', 'Bebidas', 'Times de futebol', 'Países', 'Cidades do Brasil',
  'Profissões', 'Brinquedos', 'Coisas que tem na escola', 'Meios de transporte', 'Esportes',
  'Instrumentos musicais', 'Roupas', 'Doces', 'Legumes e verduras', 'Animais do mar',
  'Coisas que tem no banheiro', 'Móveis da casa', 'Sabores de pizza', 'Sabores de sorvete',
  'Estados do Brasil', 'Desenhos animados', 'Personagens da Disney', 'Aves', 'Insetos',
  'Coisas redondas', 'Coisas amarelas', 'Coisas verdes', 'Coisas que voam', 'Coisas geladas',
];

const medio: string[] = [
  'Marcas de carro', 'Marcas de celular', 'Marcas de refrigerante', 'Redes sociais', 'Aplicativos de celular',
  'Novelas brasileiras', 'Filmes de super-herói', 'Cantores brasileiros', 'Bandas', 'Séries',
  'Capitais do mundo', 'Capitais do Brasil', 'Comidas típicas brasileiras', 'Ingredientes de bolo',
  'Coisas que se leva para a praia', 'Coisas que se leva numa viagem', 'Coisas que tem num hospital',
  'Coisas que tem num supermercado', 'Coisas que fazem barulho', 'Coisas que têm rodas',
  'Coisas que cabem no bolso', 'Coisas que têm botão', 'Coisas que se usa na chuva', 'Raças de cachorro',
  'Jogos de tabuleiro', 'Palavras em inglês', 'Personagens bíblicos', 'Livros da Bíblia',
  'Datas comemorativas', 'Planetas e coisas do espaço', 'Ferramentas',
  'Coisas que tem numa festa de aniversário', 'Lojas de shopping', 'Jogadores de futebol', 'Pokémons',
];

const desafio: string[] = [
  'Palavras que começam com A', 'Palavras que começam com B', 'Palavras que começam com C',
  'Palavras que começam com M', 'Palavras que começam com P', 'Palavras que terminam com "ão"',
  'Palavras que rimam com "coração"', 'Palavras que rimam com "janela"', 'Palavras com 3 letras',
  'Verbos (ações)', 'Adjetivos para uma pessoa', 'Coisas que você faz de manhã', 'Desculpas para chegar atrasado',
  'Coisas que te deixam feliz', 'Coisas que custam mais de mil reais',
  'Coisas que não podem molhar', 'Coisas que você encontra debaixo da cama', 'Coisas que têm cheiro forte',
  'Coisas que se dá de presente', 'Músicas de louvor', 'Comidas de festa junina',
  'Coisas pegajosas', 'Coisas que vêm em pares', 'Coisas que se faz no fim de semana',
  'Coisas que têm tela', 'Nomes com 4 letras', 'Coisas pontudas',
];

export const BATATA_CATEGORIES: BatataCategory[] = [
  { key: 'facil', label: 'Fácil (crianças e família)', items: facil },
  { key: 'medio', label: 'Médio', items: medio },
  { key: 'desafio', label: 'Desafio (letras, rimas e situações)', items: desafio },
  ...BATATA_EXTRAS,
];
