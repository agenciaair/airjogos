export interface CompletarCategory {
  key: string;
  label: string;
  items: string[];
}

const lugaresAmbientes: string[] = [
  'Praia', 'Floresta', 'Deserto', 'Montanha', 'Vulcão', 'Cachoeira', 'Rio', 'Lago', 'Ilha', 'Caverna',
  'Selva', 'Savana', 'Pântano', 'Iceberg', 'Polo Norte', 'Polo Sul', 'Oceano', 'Recife de Coral', 'Vinícola', 'Fazenda',
  'Sítio', 'Jardim Botânico', 'Parque Nacional', 'Reserva Florestal', 'Trilha na Mata', 'Acampamento', 'Camping à Beira-Rio', 'Estação de Esqui', 'Praia Deserta', 'Cidade Grande',
  'Vila do Interior', 'Bairro Residencial', 'Centro Histórico', 'Favela', 'Condomínio Fechado', 'Prédio de Apartamentos', 'Casa de Praia', 'Chácara', 'Castelo Medieval', 'Palácio Real',
  'Fortaleza Antiga', 'Ruínas Arqueológicas', 'Pirâmide', 'Templo Sagrado', 'Mesquita', 'Catedral', 'Mosteiro', 'Cemitério Antigo', 'Labirinto de Jardim', 'Parque de Diversões',
  'Parque Aquático', 'Zoológico', 'Aquário', 'Museu de Arte', 'Museu de História', 'Planetário', 'Observatório Astronômico', 'Biblioteca Pública', 'Universidade', 'Laboratório Científico',
  'Hospital', 'Clínica Veterinária', 'Aeroporto Internacional', 'Estação Espacial', 'Base Lunar', 'Submarino Nuclear', 'Navio Cruzeiro', 'Porto Marítimo', 'Estação de Trem', 'Metrô Lotado',
  'Rodoviária', 'Rodovia à Noite', 'Túnel Subterrâneo', 'Ponte Suspensa', 'Represa', 'Usina Hidrelétrica', 'Mina Subterrânea', 'Fábrica Abandonada', 'Depósito Industrial', 'Shopping Center',
  'Feira Livre', 'Mercado Municipal', 'Restaurante Elegante', 'Food Truck', 'Cafeteria', 'Padaria de Bairro', 'Boate Lotada', 'Casa de Show', 'Teatro Municipal', 'Estúdio de Gravação',
  'Set de Filmagem', 'Estádio de Futebol', 'Ginásio Esportivo', 'Pista de Corrida', 'Quadra de Tênis', 'Campo de Golfe', 'Academia de Ginástica', 'Spa de Luxo', 'Hotel Fazenda', 'Resort à Beira-Mar',
];

const coisasInusitadas: string[] = [
  'Chapéu de palhaço', 'Nariz de palhaço', 'Peruca colorida', 'Óculos gigantes de festa', 'Fantasia de dinossauro', 'Máscara de super-herói', 'Capa de super-herói', 'Espada de brinquedo', 'Escudo medieval', 'Coroa de rei',
  'Varinha de mágico', 'Bola de cristal', 'Tapete voador', 'Vassoura de bruxa', 'Poção mágica', 'Máquina do tempo', 'Portal dimensional', 'Robô gigante', 'Nave alienígena', 'Disco voador',
  'Extraterrestre verde', 'Monstro do lago', 'Pé-grande', 'Fantasma assombrado', 'Casa mal-assombrada', 'Boneco de ventríloquo', 'Palhaço assustador', 'Espantalho animado', 'Estátua que ganha vida', 'Quadro que fala',
  'Retrato amaldiçoado', 'Espelho mágico', 'Anel de invisibilidade', 'Capa da invisibilidade', 'Bota de sete léguas', 'Tapete mágico', 'Lâmpada com gênio', 'Baú de tesouro', 'Mapa do tesouro', 'Ilha escondida',
  'Sereia cantando', 'Unicórnio mágico', 'Dragão cuspindo fogo', 'Fênix renascendo das cinzas', 'Grifo alado', 'Centauro guerreiro', 'Ciclope de um olho só', 'Minotauro no labirinto', 'Medusa com cabelos de cobra', 'Golem de pedra',
  'Fada com asas brilhantes', 'Duende travesso', 'Elfo arqueiro', 'Anão minerador', 'Troll debaixo da ponte', 'Gigante adormecido', 'Bruxa numa vassoura', 'Feitiço de transformação', 'Poção do amor', 'Bola de neve gigante',
  'Boneco de neve animado', 'Vulcão em erupção', 'Tornado gigante', 'Terremoto forte', 'Tsunami enorme', 'Meteoro caindo do céu', 'Buraco negro', 'Estrela cadente', 'Eclipse total', 'Aurora boreal',
  'Arco-íris duplo', 'Relâmpago instantâneo', 'Trovão ensurdecedor', 'Nuvem em formato estranho', 'Chuva de sapos', 'Chuva de granizo', 'Neblina misteriosa', 'Labirinto sem saída', 'Escada infinita', 'Porta secreta',
  'Passagem escondida', 'Alçapão no chão', 'Cofre indestrutível', 'Chave mestra', 'Enigma indecifrável', 'Charada complicada', 'Pergunta capciosa', 'Adivinha impossível', 'Código secreto', 'Mensagem cifrada',
  'Bilhete misterioso', 'Carta anônima', 'Diário secreto', 'Pergaminho antigo', 'Livro amaldiçoado', 'Feitiço proibido', 'Ritual antigo', 'Lenda urbana', 'Mito antigo', 'Profecia misteriosa',
];

const fatosCotidianos: string[] = [
  'Acordar atrasado', 'Perder o ônibus', 'Ficar preso no trânsito', 'Esquecer a senha do celular', 'Ficar sem bateria no celular', 'Perder a carteira', 'Perder as chaves de casa', 'Esquecer o guarda-chuva em casa', 'Molhar-se na chuva', 'Pisar em uma poça d’água',
  'Quebrar um copo', 'Derramar café na roupa', 'Queimar a comida', 'Esquecer o forno ligado', 'Ficar sem internet', 'Cair a energia elétrica', 'Ficar sem água em casa', 'Vizinho barulhento à noite', 'Cachorro latindo sem parar', 'Bebê chorando no avião',
  'Fila enorme no banco', 'Fila enorme no supermercado', 'Cartão recusado no caixa', 'Esquecer a senha do banco', 'Boleto vencido', 'Conta de luz alta', 'Aluguel atrasado', 'Chefe irritado no trabalho', 'Reunião que não acaba nunca', 'E-mail enviado para a pessoa errada',
  'Reunião marcada e esquecida', 'Trabalho extra no fim de semana', 'Prazo apertado para entregar', 'Computador travando na hora errada', 'Impressora sem tinta', 'Wi-Fi caindo durante uma videochamada', 'Câmera ligada sem querer', 'Microfone mudo sem perceber', 'Soneca sem querer no trabalho', 'Fome no meio da tarde',
  'Geladeira vazia', 'Dieta que não dá certo', 'Academia lotada', 'Preguiça de malhar', 'Dor nas costas depois do treino', 'Dor de cabeça no fim do dia', 'Insônia à noite', 'Despertador que não toca', 'Roupa que encolheu na lavagem', 'Meia perdida na lavanderia',
  'Mancha difícil de tirar', 'Roupa amassada de última hora', 'Sapato apertado', 'Blusa do avesso sem perceber', 'Cabelo bagunçado pela manhã', 'Espinha na hora errada', 'Unha quebrada', 'Dedo beliscado na porta', 'Pé dormente depois de sentar', 'Cãibra no meio da noite',
  'Espirro que não para', 'Soluço difícil de parar', 'Coceira no meio das costas', 'Mosquito zunindo à noite', 'Barata correndo pela casa', 'Aranha no canto do quarto', 'Formigas na cozinha', 'Vazamento de água no banheiro', 'Torneira pingando à noite', 'Lâmpada queimada',
  'Chuveiro sem água quente', 'Fogão sem gás', 'Carro que não liga', 'Pneu furado', 'Combustível acabando na estrada', 'Multa de trânsito inesperada', 'Estacionamento lotado', 'Vaga de estacionamento difícil', 'Buzina no trânsito', 'Semáforo quebrado',
  'Obra atrasando o trânsito', 'Motorista de aplicativo atrasado', 'Corrida cancelada de última hora', 'Voo atrasado', 'Bagagem extraviada', 'Fila de check-in enorme', 'Assento apertado no avião', 'Overbooking no hotel', 'Quarto de hotel barulhento', 'Wi-Fi fraco no hotel',
  'Cardápio sem opção vegetariana', 'Prato que demora para chegar', 'Conta dividida errada no restaurante', 'Gorjeta esquecida', 'Aniversário esquecido', 'Presente de última hora', 'Festa surpresa que vaza', 'Bolo que não cresce', 'Velas que não apagam', 'Parabéns cantado fora do tom',
];

const celebridades: string[] = [
  'Ronaldo Fenômeno', 'Romário', 'Zico', 'Garrincha', 'Sócrates', 'Kaká', 'Rivaldo', 'Cafu', 'Roberto Carlos (jogador)', 'Marta',
  'Formiga', 'Rebeca Andrade', 'Daiane dos Santos', 'Gustavo Kuerten', 'Robert Scheidt', 'César Cielo', 'Thiago Braz', 'Isabel Clark', 'Rayssa Leal', 'Arthur Zanetti',
  'Adriane Galisteu', 'Luciano Huck', 'Eliana', 'Fátima Bernardes', 'William Bonner', 'Ana Maria Braga', 'Serginho Groisman', 'Marcos Mion', 'Tiago Leifert', 'Rodrigo Faro',
  'Regina Casé', 'Patrícia Poeta', 'Sabrina Sato', 'Fernanda Lima', 'Otaviano Costa', 'Bruno Mars', 'Justin Bieber', 'Ariana Grande', 'Katy Perry', 'Lady Gaga',
  'Dua Lipa', 'Billie Eilish', 'Shakira', 'Jennifer Lopez', 'Selena Gomez', 'Miley Cyrus', 'Demi Lovato', 'Britney Spears', 'Christina Aguilera', 'Celine Dion',
  'Whitney Houston', 'Mariah Carey', 'Stevie Wonder', 'Ray Charles', 'Prince', 'David Bowie', 'Elton John', 'Mick Jagger', 'Bono (U2)', 'Kurt Cobain',
  'Amy Winehouse', 'John Lennon', 'Paul McCartney', 'Frank Sinatra', 'Luiz Gonzaga', 'Elis Regina', 'Tim Maia', 'Cazuza', 'Renato Russo', 'Raul Seixas',
  'Legião Urbana', 'Skank', 'Jota Quest', 'Charlie Brown Jr.', 'Marisa Monte', 'Djavan', 'Alcione', 'Maria Bethânia', 'Simone e Simaria', 'Jorge e Mateus',
  'Henrique e Juliano', 'Fernando e Sorocaba', 'Wesley Safadão', 'Zé Neto e Cristiano', 'Pabllo Vittar', 'Ludmilla', 'IZA', 'Preta Gil', 'MC Kevinho', 'MC Livinho',
  'Luísa Sonza', 'Xamã', 'Djonga', 'Emicida', 'Criolo', 'Racionais MC’s', 'Pitty', 'Detonautas', 'NX Zero', 'Fresno',
];

export const COMPLETAR_CATEGORIES: CompletarCategory[] = [
  { key: 'lugares-ambientes', label: 'Lugares & Ambientes', items: lugaresAmbientes },
  { key: 'coisas-inusitadas', label: 'Coisas Inusitadas', items: coisasInusitadas },
  { key: 'fatos-cotidianos', label: 'Fatos Cotidianos', items: fatosCotidianos },
  { key: 'celebridades', label: 'Celebridades', items: celebridades },
];
