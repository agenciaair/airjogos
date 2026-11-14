/**
 * Categorias novas para jogos de "fazer": Mímica (atuar) e Desenha (desenhar),
 * e temas novos para a Batata Quente.
 */

interface ListaSimples {
  key: string;
  label: string;
  items: string[];
}

// ---------------------------------------------------------------- Mímica

export const MIMICA_EXTRAS: ListaSimples[] = [
  {
    key: 'biblia-cenas',
    label: 'Histórias Bíblicas',
    items: [
      'Noé construindo a arca', 'Davi derrubando Golias com a funda', 'Moisés abrindo o mar',
      'Jonas sendo engolido pelo grande peixe', 'Sansão derrubando as colunas', 'Pedro andando sobre as águas',
      'Zaqueu subindo na árvore', 'Daniel na cova dos leões', 'Jesus multiplicando pães e peixes',
      'Jesus acalmando a tempestade', 'Adão e Eva comendo o fruto proibido', 'Josué derrubando as muralhas de Jericó',
      'O filho pródigo voltando para casa', 'O bom samaritano ajudando o ferido', 'Os reis magos seguindo a estrela',
      'Pastores vendo os anjos', 'Lázaro saindo do túmulo', 'Jesus lavando os pés dos discípulos',
      'Pedro pescando e a rede enchendo de peixes', 'A torre de Babel sendo construída', 'Elias subindo no carro de fogo',
      'Moisés recebendo as tábuas da lei', 'Gideão tocando a trombeta', 'Jacó lutando com o anjo',
      'Rute colhendo espigas no campo', 'O cego Bartimeu voltando a enxergar', 'Davi tocando harpa para o rei Saul',
      'Abraão contando as estrelas', 'José sendo jogado no poço pelos irmãos', 'A mulher colocando duas moedinhas na oferta',
    ],
  },
  {
    key: 'animais-mimica',
    label: 'Animais',
    items: [
      'Macaco', 'Elefante', 'Girafa', 'Leão', 'Cachorro', 'Gato', 'Galinha', 'Pinguim', 'Sapo', 'Canguru',
      'Cobra', 'Tartaruga', 'Coelho', 'Cavalo', 'Pato', 'Peixe', 'Borboleta', 'Abelha', 'Caranguejo', 'Polvo',
      'Urso', 'Gorila', 'Flamingo', 'Bicho-preguiça', 'Jacaré', 'Tubarão', 'Coruja', 'Vaca', 'Porco', 'Galo',
      'Foca', 'Aranha', 'Minhoca', 'Camelo', 'Lobo uivando',
    ],
  },
  {
    key: 'minecraft-mimica',
    label: 'Minecraft',
    items: [
      'Minerando com a picareta', 'Creeper chegando e explodindo', 'Fugindo de um zumbi à noite',
      'Esqueleto atirando flechas', 'Enderman se teleportando', 'Construindo uma casa de blocos',
      'Cortando árvore com socos', 'Pescando no lago', 'Dormindo na cama para pular a noite',
      'Cozinhando na fornalha', 'Plantando trigo', 'Domando um lobo com osso', 'Andando de porco com sela',
      'Caindo na lava', 'Voando com a elytra', 'Acendendo o portal do Nether', 'Trocando esmeraldas com o aldeão',
      'Abrindo um baú de tesouro', 'Lutando contra o Dragão do Fim', 'Comendo bolo', 'Explodindo TNT',
      'Montando a bancada de trabalho', 'Golem de ferro protegendo a vila', 'Tosquiando uma ovelha', 'Fugindo do Warden',
    ],
  },
  {
    key: 'jogos-mimica',
    label: 'Jogos e Brincadeiras',
    items: [
      'Jogando videogame', 'Dancinha do Fortnite', 'Jogando Just Dance', 'Jogando xadrez', 'Jogando Uno e gritando',
      'Pulando amarelinha', 'Pulando corda', 'Brincando de pique-esconde', 'Brincando de estátua', 'Soltando pipa',
      'Jogando bolinha de gude', 'Rodando pião', 'Jogando dominó e batendo na mesa', 'Jogando Jenga com cuidado',
      'Jogando Twister', 'Jogando boliche', 'Jogando pingue-pongue', 'Brincando de cabo de guerra', 'Corrida de saco',
      'Jogando Pac-Man', 'Mario pulando e pegando moedas', 'Jogando Angry Birds no celular', 'Brincando de cabra-cega',
      'Jogando queimada', 'Jogando videogame e perdendo',
    ],
  },
  {
    key: 'futebol-mimica',
    label: 'Futebol',
    items: [
      'Cobrando pênalti', 'Goleiro defendendo pênalti', 'Comemorando gol', 'Fazendo embaixadinhas', 'Juiz dando cartão vermelho',
      'Jogador fingindo falta (cai-cai)', 'Cabeceando a bola', 'Bicicleta (gol de bicicleta)', 'Bandeirinha marcando impedimento',
      'Torcedor gritando na arquibancada', 'Técnico nervoso na beira do campo', 'Cobrança de escanteio', 'Batendo falta por cima da barreira',
      'Barreira se protegendo', 'Levantando a taça', 'Narrador gritando gol', 'Fazendo o "Siuuu" do Cristiano Ronaldo',
      'Goleiro tomando frango', 'Trocando de camisa no fim do jogo', 'Jogador de máscara de proteção',
    ],
  },
];

// ---------------------------------------------------------------- Desenha

export const DESENHO_EXTRAS: ListaSimples[] = [
  {
    key: 'biblia-desenho',
    label: 'Bíblia',
    items: [
      'Arca de Noé', 'Torre de Babel', 'Davi e Golias', 'Sarça ardente', 'Jonas e o grande peixe', 'Manjedoura',
      'Cruz', 'Pomba com raminho', 'Muralhas de Jericó', 'Tábuas da Lei', 'Arco-íris da aliança', 'Estrela de Belém',
      'Cinco pães e dois peixes', 'Coroa de espinhos', 'Túmulo vazio', 'Mar se abrindo', 'Escada de Jacó',
      'Ovelha perdida', 'Leão de Judá', 'Harpa de Davi', 'Fruto proibido', 'Serpente no jardim', 'Barco de pescador',
      'Funda e pedra', 'Cálice', 'Pedra rolando do túmulo', 'Anjo', 'Bíblia', 'Igreja', 'Coração',
    ],
  },
  {
    key: 'minecraft-desenho',
    label: 'Minecraft',
    items: [
      'Creeper', 'Picareta de diamante', 'Espada', 'Bloco de terra', 'Porco', 'Portal do Nether', 'Enderman', 'Baú',
      'Tocha', 'TNT', 'Bolo do Minecraft', 'Cama', 'Steve', 'Zumbi', 'Esqueleto com arco', 'Aldeão', 'Golem de ferro',
      'Diamante', 'Fornalha', 'Árvore quadrada', 'Casa de blocos', 'Ovelha', 'Dragão do Fim', 'Galinha', 'Lava',
    ],
  },
  {
    key: 'jogos-desenho',
    label: 'Jogos',
    items: [
      'Controle de videogame', 'Tabuleiro de xadrez', 'Dado', 'Pac-Man', 'Peças de Tetris', 'Cartas de baralho', 'Dominó',
      'Pipa', 'Pião', 'Bolinha de gude', 'Amarelinha', 'Cogumelo do Mario', 'Pokébola', 'Pikachu', 'Sonic',
      'Fliperama', 'Torre de Jenga', 'Roleta', 'Joystick', 'Óculos de realidade virtual',
    ],
  },
  {
    key: 'futebol-desenho',
    label: 'Futebol',
    items: [
      'Bola de futebol', 'Gol com rede', 'Chuteira', 'Troféu', 'Cartão vermelho', 'Apito', 'Estádio', 'Bandeirinha',
      'Luva de goleiro', 'Camisa número 10', 'Pênalti', 'Torcida', 'Placar', 'Medalha', 'Escanteio', 'Bicicleta (gol)',
      'Taça da Copa do Mundo', 'Juiz', 'Vuvuzela', 'Gramado',
    ],
  },
  {
    key: 'filmes-desenho',
    label: 'Filmes (desafio)',
    items: [
      'Titanic', 'O Rei Leão', 'Toy Story', 'Procurando Nemo', 'Frozen', 'Shrek', 'Harry Potter', 'Star Wars',
      'Homem-Aranha', 'Jurassic Park', 'Carros', 'Up – Altas Aventuras', 'Os Incríveis', 'Meu Malvado Favorito',
      'A Era do Gelo', 'Kung Fu Panda', 'E.T.', 'Piratas do Caribe', 'Moana', 'Aladdin', 'A Bela e a Fera', 'Avatar',
    ],
  },
];

// ---------------------------------------------------------------- Batata Quente

export const BATATA_EXTRAS: ListaSimples[] = [
  {
    key: 'biblia-batata',
    label: 'Bíblia',
    items: [
      'Personagens bíblicos', 'Discípulos de Jesus', 'Livros do Antigo Testamento', 'Livros do Novo Testamento',
      'Profetas', 'Reis de Israel e Judá', 'Mulheres da Bíblia', 'Milagres de Jesus', 'Parábolas de Jesus',
      'Animais que aparecem na Bíblia', 'Cidades e lugares da Bíblia', 'Frutos do Espírito', 'Pragas do Egito',
      'Filhos de Jacó (tribos de Israel)', 'Músicas de louvor', 'Coisas que tem numa igreja', 'Histórias do Antigo Testamento',
    ],
  },
  {
    key: 'cultura-pop-batata',
    label: 'Futebol, Jogos e Cultura Pop',
    items: [
      'Famosos brasileiros', 'Famosos internacionais', 'Filmes', 'Filmes de animação', 'Séries',
      'Jogadores de futebol brasileiros', 'Jogadores de futebol internacionais', 'Times de futebol brasileiros',
      'Times de futebol internacionais', 'Seleções de futebol', 'Coisas do Minecraft', 'Mobs (monstros) do Minecraft',
      'Jogos de videogame', 'Jogos de tabuleiro', 'Personagens de videogame', 'Cores', 'Animais', 'Youtubers',
      'Cantores e cantoras', 'Personagens de desenho animado',
    ],
  },
];
