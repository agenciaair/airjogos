/**
 * Regras de todos os jogos — fonte única usada na Home (resumo do card)
 * e no botão "Regras" dentro de cada jogo (explicação completa).
 */

export type GameKey = 'impostor' | 'quemeusou' | 'mimica' | 'completar' | 'taboo' | 'batata' | 'adedonha' | 'desenho';

export interface GameRules {
  title: string;
  /** frase curta do card da Home */
  tagline: string;
  players: string;
  duration: string;
  /** o objetivo em uma frase */
  goal: string;
  /** passo a passo da partida, na ordem em que acontece */
  steps: string[];
  /** como se ganha */
  win: string[];
  /** o que é proibido / o que não pode */
  forbidden?: string[];
  /** explicação de cada opção da tela de configuração */
  options: { name: string; text: string }[];
  tips: string[];
}

export const RULES: Record<GameKey, GameRules> = {
  impostor: {
    title: 'Impostor',
    tagline: 'Todo mundo sabe a palavra secreta, menos o espião. Descubra quem é ele!',
    players: '3 a 20 jogadores',
    duration: '5 a 10 min',
    goal: 'Os inocentes precisam descobrir quem é o espião. O espião precisa se disfarçar e descobrir a palavra secreta.',
    steps: [
      'Escolha quantos jogadores e quantos espiões vão jogar, e a categoria das palavras.',
      'Passe o celular de mão em mão. Cada um segura o dedo na tela para ver, escondido, o seu papel.',
      'Os inocentes veem a palavra secreta. O espião só vê a mensagem "Você é o Espião!" e a categoria.',
      'Com o celular na mesa, o app mostra quem pergunta para quem. Faça uma pergunta sobre a palavra, sem falar a palavra. Ex.: "Você iria lá de chinelo?"',
      'Quem responde também não pode entregar a palavra. Responda de um jeito que só quem sabe vai entender.',
      'Fique de olho: quem dá respostas vagas ou estranhas pode ser o espião. Toque em "Próxima Pergunta" para passar a vez.',
      'Quando o grupo estiver desconfiado (ou o tempo acabar), toque em "Ir para Votação" e escolham juntos um nome para acusar.',
    ],
    win: [
      'Acusaram um inocente → os espiões vencem.',
      'Acusaram o espião → ele ainda tem um chute final: digita a palavra secreta. Se acertar, rouba a vitória. Se errar, os inocentes vencem.',
    ],
    forbidden: ['Falar a palavra secreta.', 'Mostrar a tela do celular para outra pessoa.'],
    options: [
      { name: 'Espiões', text: 'Quantos jogadores serão espiões. Precisa ser menos da metade do grupo.' },
      { name: 'Usar nomes dos jogadores', text: 'Digite os nomes para o app dizer "entregue o celular para Fulano". Desligado, vira Jogador 1, 2, 3…' },
      { name: 'Modo Casual', text: 'O espião recebe uma pista sobre a palavra. Bom para iniciantes ou crianças.' },
      { name: 'Tema personalizado', text: 'Use as suas próprias palavras (separadas por vírgula ou uma por linha).' },
    ],
    tips: [
      'Inocente: não seja específico demais, senão o espião descobre a palavra.',
      'Espião: preste atenção nas perguntas dos outros para adivinhar a palavra e responda com confiança.',
    ],
  },

  quemeusou: {
    title: 'Quem Eu Sou?',
    tagline: 'Você recebe uma identidade secreta e só os amigos sabem quem é. Pergunte até descobrir!',
    players: '2 a 20 jogadores',
    duration: '2 a 5 min por jogador',
    goal: 'Descobrir quem (ou o que) você é fazendo perguntas de SIM ou NÃO, usando o mínimo de perguntas possível.',
    steps: [
      'Escolha a categoria, o limite (de perguntas ou de tempo) e o jeito de mostrar a identidade.',
      'Cada jogador joga um turno. Na sua vez, você não pode ver a sua identidade.',
      'Passa o Celular: a pessoa da vez vira de costas, e os outros seguram o dedo na tela para ver e memorizar a identidade dela.',
      'Na Testa: a pessoa da vez coloca o celular na testa com a tela virada para os amigos, e todo mundo lê a identidade.',
      'A pessoa da vez faz perguntas que se respondem com SIM ou NÃO. Ex.: "Eu sou um animal?", "Eu apareço na TV?"',
      'O grupo responde e alguém toca em "Sim" ou "Não" no app para contar as perguntas.',
      'Quando achar que sabe, dê o seu palpite. Acertou → toque "Acertou!". Errou ou desistiu → toque "Errou!".',
    ],
    win: [
      'No fim, o placar mostra quem acertou. Ganha quem acertou usando menos perguntas. Se empatar, ganha quem foi mais rápido.',
      'O turno também acaba sozinho quando o limite de perguntas ou de tempo termina.',
    ],
    forbidden: ['Perguntas que não sejam de SIM ou NÃO ("Qual é a minha cor?" não vale).', 'Os amigos falarem a identidade ou darem dicas.'],
    options: [
      { name: 'Limite de Perguntas', text: 'O turno termina quando a pessoa faz esse número de perguntas.' },
      { name: 'Limite de Tempo', text: 'O turno termina quando o cronômetro zerar.' },
      { name: 'Passa o Celular / Na Testa', text: 'Escolhe como os amigos veem a identidade (veja o passo a passo acima).' },
      { name: 'Modo Dica', text: 'Libera um botão "Pedir Dica" que pode ser usado uma vez por turno.' },
    ],
    tips: ['Comece com perguntas amplas ("Eu sou uma pessoa?") e vá afunilando.'],
  },

  mimica: {
    title: 'Mímica',
    tagline: 'Sem falar nada, faça gestos para o seu time adivinhar o máximo de palavras.',
    players: '4+ jogadores (2 times)',
    duration: '10 a 20 min',
    goal: 'Fazer o seu time adivinhar o máximo de palavras dentro do tempo, usando só gestos.',
    steps: [
      'Divida o grupo em Time A e Time B (ou use o modo Individual para todo mundo jogar junto).',
      'Na vez do seu time, escolham quem vai atuar. Só o ator segura o dedo na tela para ver a primeira palavra.',
      'O ator toca em "Começar": o cronômetro dispara e a palavra aparece na tela. Esconda o celular do seu time!',
      'Faça a mímica. Quando o time acertar, toque em "Acertou! +1" e já aparece a próxima palavra.',
      'Travou? Toque em "Pular" para trocar de palavra (tem limite de pulos por rodada).',
      'Quando o tempo acaba, a vez passa para o outro time, com um novo ator.',
    ],
    win: [
      'Modo Times: vence o primeiro time que chegar no limite de pontos (conferido no fim de cada rodada).',
      'Modo Individual: todos jogam juntos e o jogo termina quando o grupo soma o limite de acertos.',
    ],
    forbidden: ['Falar, cochichar ou fazer sons.', 'Escrever ou soletrar com os dedos.', 'Apontar para um objeto que é a própria resposta.'],
    options: [
      { name: 'Modo Times / Individual', text: 'Times disputam pontos entre si. Individual é uma roda livre, sem disputa.' },
      { name: 'Tempo por rodada', text: 'Quanto tempo cada ator tem para fazer o time acertar.' },
      { name: 'Limite de pontos', text: 'Quantos acertos são necessários para terminar o jogo.' },
      { name: 'Pulos permitidos', text: 'Quantas palavras o ator pode trocar em cada rodada.' },
    ],
    tips: ['Mostre com os dedos quantas palavras tem a resposta antes de começar.', 'Revezem o ator a cada rodada.'],
  },

  completar: {
    title: 'Completar',
    tagline: 'Os amigos montam uma frase, uma palavra por vez, até você adivinhar a palavra secreta.',
    players: '3 a 20 jogadores',
    duration: '2 a 3 min por rodada',
    goal: 'Em cada rodada, um jogador é o Adivinhador. Os outros (narradores) constroem juntos uma frase-pista para ele descobrir a palavra secreta.',
    steps: [
      'O app escolhe quem é o Adivinhador da rodada. Ele não pode ver a palavra.',
      'Passe o celular só entre os narradores. Cada um segura o dedo na tela para ver a palavra secreta.',
      'Os narradores seguem a "Ordem da roda" mostrada no app. Cada um fala UMA palavra por vez, continuando a frase do anterior.',
      'Ex. (palavra: Praia): "Lugar" → "com" → "areia" → "e" → "mar"…',
      'A cada palavra dita, toque no círculo do contador. A roda tem um limite de palavras (10 ou 15).',
      'O Adivinhador pode chutar a qualquer momento. Acertou → toque "Acertou!". Chegou no limite ou desistiu → "Errou / Revelar".',
      'Na próxima rodada, o próximo jogador vira o Adivinhador.',
    ],
    win: [
      'É um jogo cooperativo: o grupo inteiro torce junto. O app mostra quantas rodadas foram jogadas e quantas o grupo acertou.',
    ],
    forbidden: ['Falar a palavra secreta (ou partes dela).', 'Falar mais de uma palavra na sua vez.'],
    options: [
      { name: 'Limite de palavras na roda', text: 'Quantas palavras os narradores podem falar no total antes da rodada acabar.' },
      { name: 'Usar cronômetro', text: 'Coloca um tempo máximo por rodada (opcional).' },
    ],
    tips: ['Comece pelo mais geral e deixe os detalhes para o fim da frase.'],
  },

  taboo: {
    title: 'Tabu',
    tagline: 'Explique a palavra para o seu time sem usar nenhuma das 5 palavras proibidas.',
    players: '4+ jogadores (2 times)',
    duration: '10 a 20 min',
    goal: 'Fazer o seu time adivinhar o máximo de palavras explicando com as suas palavras, sem dizer as palavras proibidas.',
    steps: [
      'Divida o grupo em Time A e Time B (ou use a Roda Livre, sem times).',
      'Na vez do seu time, escolham o Orador (quem explica). Alguém do outro time é o Fiscal e fica olhando a tela junto com ele.',
      'O Orador toca em "Começar": aparecem a palavra principal (em verde) e as 5 palavras proibidas (em vermelho).',
      'Explique a palavra verde para o seu time, sem dizer ela e sem dizer nenhuma vermelha.',
      'O time acertou → "Acertou" (+1 ponto). Quer trocar de carta → "Pular" (tem limite por rodada).',
      'Se o Orador falar uma palavra proibida, o Fiscal toca em "Tabu": a carta é perdida (e pode custar -1 ponto).',
      'Quando o tempo acaba, a vez passa para o outro time. Joguem quantas rodadas quiserem e toquem "Encerrar Jogo" para ver o resultado.',
    ],
    win: ['Vence o time com mais pontos quando vocês encerrarem o jogo.'],
    forbidden: [
      'Dizer a palavra principal ou qualquer palavra proibida (nem pela metade, nem em outra língua).',
      'Fazer gestos, mímica ou sons para ajudar.',
      'Dizer "rima com…" ou "começa com a letra…".',
    ],
    options: [
      { name: 'Modo Equipes / Roda Livre', text: 'Equipes disputam pontos. Roda Livre é para todo mundo jogar junto, sem times.' },
      { name: 'Tempo por rodada', text: 'Quanto tempo cada Orador tem para explicar.' },
      { name: 'Pulos permitidos', text: 'Quantas cartas o Orador pode trocar em cada rodada.' },
      { name: 'Penalidade de -1 ponto', text: 'Ligada: cada Tabu tira 1 ponto do time. Desligada: só perde a carta.' },
      { name: 'Tema personalizado', text: 'Uma carta por linha, assim: Palavra | proibida1, proibida2, proibida3, proibida4, proibida5' },
    ],
    tips: ['Use sinônimos e exemplos do dia a dia.', 'Se a carta estiver difícil, pule logo para não perder tempo.'],
  },

  batata: {
    title: 'Batata Quente',
    tagline: 'Fale algo do tema e passe o celular rápido, antes que a batata exploda na sua mão!',
    players: '2 a 20 jogadores',
    duration: '5 a 15 min',
    goal: 'Não ser a pessoa que está com o celular quando a batata explodir. Quem sobreviver por último vence.',
    steps: [
      'Sentem em roda e digitem os nomes na ordem em que estão sentados.',
      'O app sorteia um tema (ex.: "Frutas") e diz quem começa.',
      'Toque em "Acender o pavio". A partir daí, o celular começa a bipar.',
      'Quem está com o celular fala uma coisa do tema (ex.: "Banana!") e passa o celular para a pessoa ao lado.',
      'Não pode repetir o que alguém já falou. Travou? Continua com a batata na mão até lembrar de algo.',
      'Os bipes vão ficando cada vez mais rápidos. Em algum momento secreto, a batata explode: BOOM!',
      'Toque no nome de quem estava com o celular: essa pessoa perde uma vida. Uma nova rodada começa com outro tema.',
    ],
    win: ['Quem perde todas as vidas sai do jogo. A última pessoa que sobrar vence.'],
    forbidden: ['Repetir uma resposta que já foi dita na rodada.', 'Passar o celular sem falar nada.', 'Segurar o celular de propósito ou jogar ele (passe na mão!).'],
    options: [
      { name: 'Vidas', text: 'Quantas explosões cada pessoa aguenta antes de sair do jogo.' },
      { name: 'Tempo do pavio', text: 'Curta, Média ou Longa: muda quanto tempo, no máximo, a batata demora para explodir. O momento exato é sempre surpresa.' },
      { name: 'Categoria', text: 'Fácil é ótimo para crianças. Desafio tem letras, rimas e situações.' },
      { name: 'Tema personalizado', text: 'Escreva os seus próprios temas (ex.: "Nomes da família", "Músicas da igreja").' },
    ],
    tips: ['Respostas curtas são mais rápidas!', 'Se o tema estiver difícil, use "Sortear outro tema" antes de acender o pavio.'],
  },

  adedonha: {
    title: 'Adedonha (Stop)',
    tagline: 'O app sorteia uma letra e todo mundo preenche nome, cidade, animal… Quem gritar STOP primeiro?',
    players: '2 a 12 jogadores',
    duration: '10 a 25 min',
    goal: 'Preencher no papel uma palavra para cada coluna, todas começando com a letra sorteada, e fazer mais pontos que os outros.',
    steps: [
      'Cada jogador pega papel e caneta e desenha uma tabela com as colunas escolhidas (ex.: Nome, CEP, Animal, Fruta, Cor, Objeto).',
      'O app sorteia uma letra. Ex.: letra M.',
      'Toque em "Valendo!" e todo mundo escreve uma palavra com M em cada coluna. Ex.: Maria, Manaus, Macaco, Melancia, Marrom, Mesa.',
      'Quem terminar todas as colunas primeiro grita STOP! e toca no botão vermelho. Todos param de escrever na hora.',
      'Se tiver tempo marcado e ele acabar, a rodada também termina.',
      'Leiam as respostas, coluna por coluna, e cada um soma os seus pontos da rodada (veja abaixo). Coloquem os pontos no app.',
      'O app sorteia uma nova letra (sem repetir) e começa a próxima rodada.',
    ],
    win: [
      'Pontos por resposta: 10 se só você escreveu aquela palavra, 5 se outra pessoa escreveu a mesma, 0 se ficou em branco ou o grupo não aceitou.',
      'Depois da última rodada, vence quem tiver mais pontos somados.',
    ],
    forbidden: ['Continuar escrevendo depois do STOP.', 'Inventar palavras: se o grupo não aceitar, vale 0.'],
    options: [
      { name: 'Rodadas', text: 'Quantas letras serão sorteadas na partida.' },
      { name: 'Tempo por rodada', text: 'Tempo máximo para escrever. "Livre" deixa sem cronômetro: só acaba no STOP!' },
      { name: 'Tirar letras difíceis', text: 'Evita letras como K, W, X, Y, Q, Z e H.' },
      { name: 'Colunas do papel', text: 'Escolha quais categorias vão no papel (mínimo 3).' },
    ],
    tips: ['Comece pelas colunas mais fáceis e deixe as difíceis por último.', 'Respostas diferentes valem mais: fuja do óbvio!'],
  },

  desenho: {
    title: 'Desenha e Adivinha',
    tagline: 'Desenhe a palavra secreta na tela do celular para o seu time adivinhar, sem falar nada.',
    players: '4+ jogadores (2 times)',
    duration: '10 a 20 min',
    goal: 'Fazer o seu time adivinhar a palavra secreta só olhando o seu desenho, antes do tempo acabar.',
    steps: [
      'Divida o grupo em Time A e Time B (ou escolha "Todos Juntos").',
      'Na vez do seu time, escolham o desenhista. Só ele segura o dedo na tela para ver a palavra.',
      'Toque em "Começar a desenhar": o cronômetro dispara e aparece um quadro branco.',
      'Desenhe com o dedo. Dá para trocar a cor, usar a borracha, desfazer o último traço ou limpar tudo.',
      'Esqueceu a palavra? Segure o botão "Segure para ver a palavra" no topo.',
      'O time fala os palpites em voz alta. Acertaram → toque "Acertaram! +1".',
      'Se o tempo acabar ou vocês desistirem, ninguém pontua. A vez passa para o outro time, com uma palavra nova.',
    ],
    win: [
      'Modo Times: vence o primeiro time que chegar no limite de pontos.',
      'Todos Juntos: o grupo tenta chegar no limite de acertos.',
    ],
    forbidden: ['Escrever letras ou números no desenho.', 'Falar, fazer gestos ou sons.', 'Desenhar setas apontando para objetos da sala.'],
    options: [
      { name: 'Modo Times / Todos Juntos', text: 'Times disputam pontos. Todos Juntos é cooperativo: todo mundo adivinha.' },
      { name: 'Tempo para desenhar', text: 'Quanto tempo o desenhista tem em cada rodada.' },
      { name: 'Limite de pontos', text: 'Quantos acertos são necessários para terminar o jogo.' },
      { name: 'Tema personalizado', text: 'Use as suas próprias palavras (separadas por vírgula ou uma por linha).' },
    ],
    tips: ['Comece pelo formato geral e depois coloque os detalhes.', 'Para ações (ex.: "Nadar"), desenhe um bonequinho fazendo a ação.'],
  },
};
