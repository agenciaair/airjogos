export interface DesenhoCategory {
  key: string;
  label: string;
  items: string[];
}

const objetos: string[] = [
  'Guarda-chuva', 'Óculos', 'Relógio', 'Chave', 'Tesoura', 'Escova de dente', 'Lâmpada', 'Cadeira', 'Mesa', 'Cama',
  'Televisão', 'Celular', 'Computador', 'Mochila', 'Bola', 'Bicicleta', 'Carro', 'Avião', 'Barco', 'Trem',
  'Violão', 'Bateria', 'Microfone', 'Câmera fotográfica', 'Livro', 'Lápis', 'Caneca', 'Garfo', 'Panela', 'Geladeira',
  'Ventilador', 'Escada', 'Martelo', 'Vassoura', 'Balde', 'Vela', 'Presente', 'Balão', 'Pipa', 'Coroa',
  'Chapéu', 'Sapato', 'Meia', 'Camiseta', 'Anel', 'Cadeado', 'Envelope', 'Bandeira', 'Âncora', 'Foguete',
];

const animais: string[] = [
  'Gato', 'Cachorro', 'Peixe', 'Pássaro', 'Cobra', 'Elefante', 'Girafa', 'Leão', 'Macaco', 'Tartaruga',
  'Coelho', 'Porco', 'Vaca', 'Galinha', 'Pato', 'Cavalo', 'Ovelha', 'Borboleta', 'Abelha', 'Aranha',
  'Formiga', 'Caracol', 'Polvo', 'Baleia', 'Tubarão', 'Golfinho', 'Caranguejo', 'Jacaré', 'Sapo', 'Coruja',
  'Pinguim', 'Urso', 'Zebra', 'Camelo', 'Canguru', 'Morcego', 'Rato', 'Dinossauro', 'Unicórnio', 'Dragão',
];

const comidas: string[] = [
  'Pizza', 'Hambúrguer', 'Cachorro-quente', 'Sorvete', 'Bolo de aniversário', 'Pipoca', 'Banana', 'Maçã', 'Melancia', 'Abacaxi',
  'Uva', 'Morango', 'Cenoura', 'Ovo frito', 'Pão', 'Queijo', 'Brigadeiro', 'Pastel', 'Coxinha', 'Café',
  'Sanduíche', 'Espaguete', 'Sushi', 'Pirulito', 'Rosquinha', 'Batata frita', 'Milho', 'Picolé', 'Biscoito', 'Coco',
];

const lugares: string[] = [
  'Praia', 'Castelo', 'Igreja', 'Escola', 'Hospital', 'Casa', 'Prédio', 'Ponte', 'Montanha', 'Vulcão',
  'Ilha', 'Floresta', 'Deserto', 'Cachoeira', 'Fazenda', 'Circo', 'Parque', 'Piscina', 'Estádio de futebol', 'Farol',
  'Pirâmide', 'Iglu', 'Barraca de acampamento', 'Roda-gigante', 'Aeroporto', 'Supermercado', 'Cinema', 'Zoológico', 'Lua', 'Estrela',
];

const acoes: string[] = [
  'Dormir', 'Correr', 'Nadar', 'Pescar', 'Cozinhar', 'Dançar', 'Cantar', 'Chorar', 'Rir', 'Pular corda',
  'Andar de bicicleta', 'Tirar foto', 'Escovar os dentes', 'Tomar banho', 'Ler um livro', 'Jogar futebol', 'Voar', 'Pintar', 'Escalar', 'Surfar',
  'Mergulhar', 'Plantar uma árvore', 'Soprar velas', 'Fazer churrasco', 'Acampar', 'Chover', 'Nevar', 'Cair', 'Abraçar', 'Telefonar',
];

const desafio: string[] = [
  'Arco-íris', 'Fantasma', 'Sereia', 'Robô', 'Alienígena', 'Super-herói', 'Pirata', 'Bruxa', 'Palhaço', 'Astronauta',
  'Boneco de neve', 'Espantalho', 'Tempestade', 'Terremoto', 'Eclipse', 'Gravidade', 'Wi-Fi', 'Música', 'Saudade', 'Amizade',
  'Engarrafamento', 'Fila de banco', 'Selfie', 'Aniversário surpresa', 'Primeiro dia de aula', 'Segunda-feira', 'Sono', 'Fome', 'Silêncio', 'Ventania',
];

export const DESENHO_CATEGORIES: DesenhoCategory[] = [
  { key: 'objetos', label: 'Objetos', items: objetos },
  { key: 'animais', label: 'Animais', items: animais },
  { key: 'comidas', label: 'Comidas', items: comidas },
  { key: 'lugares', label: 'Lugares', items: lugares },
  { key: 'acoes', label: 'Ações', items: acoes },
  { key: 'desafio', label: 'Desafio (coisas abstratas)', items: desafio },
];
