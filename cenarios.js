// Cenários das casas de risco (para criar outro, copie um bloco)
// "vulnerabilidade" é o que o jogador ganha se errar
const CENARIOS = [
  {
    tema: "Phishing de e-mail",
    situacao: "Chegou um e-mail dizendo: \"Sua conta será bloqueada em 24h. Clique aqui para confirmar seus dados\". O remetente é suporte@ibipora-seguranca.info.",
    certa: "Não clicar, reportar ao TI e apagar o e-mail.",
    errada: "Clicar no link só para ver do que se trata.",
    explicacao: "Pressa e ameaça são as marcas do phishing. O domínio não é o oficial. Reportar ao TI protege também os colegas que receberam o mesmo e-mail.",
    vulnerabilidade: { nome: "Credenciais expostas", ataque: "usou a senha que você digitou na página falsa para entrar na sua conta" }
  },
  {
    tema: "Senha nova",
    situacao: "O sistema pediu para você criar uma senha nova.",
    certa: "Usar uma frase longa e única, como \"Capivara-come-3-bolos-no-lago!\".",
    errada: "Usar \"ibipora123\", que é fácil de lembrar.",
    explicacao: "Senhas curtas ou com palavras óbvias são descobertas em segundos. Frases longas são fáceis de lembrar e muito difíceis de adivinhar.",
    vulnerabilidade: { nome: "Senha fraca", ataque: "adivinhou sua senha em poucos segundos" }
  },
  {
    tema: "Mesma senha em tudo",
    situacao: "Você tem contas no e-mail, no banco, no jogo e na rede social.",
    certa: "Usar uma senha diferente para cada conta, guardadas num gerenciador de senhas.",
    errada: "Usar a mesma senha em todas, para não esquecer.",
    explicacao: "Se um site vaza sua senha, os criminosos testam a mesma senha em todos os outros. Senhas diferentes limitam o estrago.",
    vulnerabilidade: { nome: "Senha reutilizada", ataque: "pegou sua senha num site vazado e abriu todas as suas contas" }
  },
  {
    tema: "Pendrive perdido",
    situacao: "Você achou um pendrive no estacionamento com a etiqueta \"Salários 2026\".",
    certa: "Entregar ao TI sem conectar em nenhum computador.",
    errada: "Conectar no seu computador para descobrir de quem é.",
    explicacao: "Pendrives \"esquecidos\" são uma isca clássica. Basta conectar para um programa malicioso se instalar sozinho.",
    vulnerabilidade: { nome: "Malware instalado", ataque: "ativou o programa espião que veio no pendrive" }
  },
  {
    tema: "Wi-Fi público",
    situacao: "Você está na lanchonete e precisa acessar o aplicativo do banco. O Wi-Fi aberto se chama \"WIFI_GRATIS\".",
    certa: "Usar os dados móveis do celular ou esperar chegar em casa.",
    errada: "Conectar no Wi-Fi aberto, porque é rapidinho.",
    explicacao: "Em redes abertas, qualquer pessoa pode criar um ponto falso e espiar o que passa por ele.",
    vulnerabilidade: { nome: "Conexão espionada", ataque: "estava do outro lado do Wi-Fi falso copiando tudo" }
  },
  {
    tema: "Atualização pendente",
    situacao: "Apareceu o aviso: \"Atualização de segurança disponível. Reiniciar agora?\"",
    certa: "Salvar o trabalho e instalar a atualização.",
    errada: "Clicar em \"lembrar depois\" pela décima vez.",
    explicacao: "Atualizações de segurança fecham portas que os criminosos já conhecem. Adiar deixa a porta aberta.",
    vulnerabilidade: { nome: "Sistema desatualizado", ataque: "entrou por uma falha que a atualização teria corrigido" }
  },
  {
    tema: "Ligação do \"suporte\"",
    situacao: "Alguém liga dizendo ser do suporte técnico e pede o código que acabou de chegar por SMS no seu celular.",
    certa: "Não informar, desligar e ligar para o canal oficial do suporte.",
    errada: "Informar o código, afinal é do suporte.",
    explicacao: "Nenhum suporte legítimo pede códigos de verificação. Isso é engenharia social: enganar a pessoa em vez do sistema.",
    vulnerabilidade: { nome: "Código de verificação entregue", ataque: "usou o código para sequestrar sua conta" }
  },
  {
    tema: "A foto do colega",
    situacao: "O Edu tropeçou e derrubou suco na camiseta. Alguém tirou uma foto engraçada e pediu para você postar no grupo da turma.",
    certa: "Não postar e perguntar ao Edu se ele se importa. Se ele disser não, o não é respeitado.",
    errada: "Postar, porque vai render muitas curtidas.",
    explicacao: "A imagem de uma pessoa é um dado pessoal. Postar sem permissão pode machucar e expor alguém. O Ladrão de Pixels vive disso.",
    vulnerabilidade: { nome: "Imagem exposta sem permissão", ataque: "espalhou a foto por outros grupos e ninguém mais confia em você" }
  },
  {
    tema: "App de lanterna",
    situacao: "Um aplicativo de lanterna pede acesso aos seus contatos, localização e microfone.",
    certa: "Negar as permissões e desinstalar o app.",
    errada: "Permitir tudo para o app funcionar.",
    explicacao: "Uma lanterna não precisa dos seus contatos. Permissões demais são um sinal de que o app coleta dados para vender.",
    vulnerabilidade: { nome: "Permissões excessivas", ataque: "vendeu sua lista de contatos e sua localização" }
  },
  {
    tema: "Quiz da rede social",
    situacao: "Um quiz divertido pergunta: \"Qual o nome do seu primeiro animal de estimação e da rua onde você cresceu?\"",
    certa: "Não responder. Essas são perguntas comuns de recuperação de senha.",
    errada: "Responder, é só uma brincadeira.",
    explicacao: "Muitos sites usam essas perguntas para recuperar senhas. Quizzes assim são uma forma disfarçada de coletá-las.",
    vulnerabilidade: { nome: "Respostas de segurança públicas", ataque: "usou suas respostas do quiz para recuperar sua senha" }
  },
  {
    tema: "Pausa para o café",
    situacao: "Você vai sair da mesa por 10 minutos e o computador está com o sistema da prefeitura aberto.",
    certa: "Bloquear a tela (Windows + L) antes de sair.",
    errada: "Deixar aberto, volto logo.",
    explicacao: "Qualquer pessoa que passar pode ver ou alterar dados em seu nome. Bloquear leva um segundo.",
    vulnerabilidade: { nome: "Tela desbloqueada", ataque: "sentou no seu computador e copiou dados de cidadãos" }
  },
  {
    tema: "Planilha de cidadãos",
    situacao: "Um e-mail de \"um colega de outro setor\" pede a planilha completa com CPF, endereço e telefone de todos os moradores atendidos.",
    certa: "Confirmar o pedido pelo canal oficial e enviar só os dados necessários.",
    errada: "Enviar a planilha inteira para ajudar rápido.",
    explicacao: "A LGPD exige que dados pessoais sejam usados só para a finalidade necessária e compartilhados com cuidado. Confirmar quem pede evita golpes.",
    vulnerabilidade: { nome: "Dados pessoais vazados", ataque: "publicou a planilha de moradores na internet" }
  },
  {
    tema: "Verificação em duas etapas",
    situacao: "Seu e-mail oferece ativar a verificação em duas etapas (senha + código no celular).",
    certa: "Ativar agora.",
    errada: "Ignorar, dá trabalho digitar código.",
    explicacao: "Com duas etapas, mesmo que alguém descubra sua senha, ainda precisa do seu celular para entrar.",
    vulnerabilidade: { nome: "Sem verificação em duas etapas", ataque: "entrou só com a senha, sem nenhuma barreira extra" }
  },
  {
    tema: "Promoção no WhatsApp",
    situacao: "Chegou no grupo: \"Celular de R$ 99! Só hoje! bit.ly/promo-imperdivel\"",
    certa: "Desconfiar e procurar a promoção no site oficial da loja.",
    errada: "Clicar e preencher os dados para garantir a vaga.",
    explicacao: "Preço bom demais + urgência + link encurtado são sinais de golpe. Sempre confira pelo canal oficial.",
    vulnerabilidade: { nome: "Dados entregues a golpistas", ataque: "usou seus dados do formulário falso para fazer compras" }
  },
  {
    tema: "Post-it no monitor",
    situacao: "Sua colega sugere anotar a senha num post-it colado no monitor para não esquecer.",
    certa: "Usar um gerenciador de senhas.",
    errada: "Colar o post-it, só quem trabalha aqui vê.",
    explicacao: "Visitantes, faxina, fotos do escritório: muita gente vê o monitor. Senha anotada à vista não é segredo.",
    vulnerabilidade: { nome: "Senha anotada à vista", ataque: "leu a senha no post-it quando passou pela sala" }
  },
  {
    tema: "Doces em troca de endereço",
    situacao: "Um joguinho promete doces grátis se você digitar o endereço de casa e o nome da sua escola.",
    certa: "Não digitar nada e chamar um adulto.",
    errada: "Digitar, doce grátis é muito bom.",
    explicacao: "Ninguém pode pedir seus dados sem o \"sim\" dos seus pais. Seus dados são tesouros, e esse é um truque do Senhor Vaza-Tudo.",
    vulnerabilidade: { nome: "Endereço entregue a estranhos", ataque: "descobriu onde você mora e estuda" }
  },
  {
    tema: "Backup",
    situacao: "Os arquivos do seu trabalho de conclusão estão só no notebook.",
    certa: "Fazer cópias regulares em outro lugar (nuvem ou HD externo).",
    errada: "Deixar assim, o notebook nunca deu problema.",
    explicacao: "Um vírus de sequestro (ransomware), um defeito ou um roubo e tudo some. Backup é o seu plano B.",
    vulnerabilidade: { nome: "Sem backup", ataque: "trancou seus arquivos com ransomware e pediu resgate" }
  },
  {
    tema: "Anexo suspeito",
    situacao: "Chegou um e-mail com o anexo \"fatura_atrasada.pdf.exe\".",
    certa: "Não abrir e reportar ao TI.",
    errada: "Abrir para conferir a fatura.",
    explicacao: "O final \".exe\" mostra que é um programa, não um PDF. Extensão dupla é um disfarce comum.",
    vulnerabilidade: { nome: "Programa malicioso executado", ataque: "controlou seu computador pelo programa disfarçado" }
  },
  {
    tema: "Empresta a senha?",
    situacao: "Um colega pede sua senha do sistema \"só por hoje\", porque a dele ainda não foi liberada.",
    certa: "Não emprestar e orientar a pedir o acesso ao TI.",
    errada: "Emprestar, ele é de confiança.",
    explicacao: "Tudo o que for feito com sua senha fica registrado em seu nome. Cada pessoa deve ter o próprio acesso.",
    vulnerabilidade: { nome: "Senha compartilhada", ataque: "usou sua senha, que já estava rodando por aí, e as ações ficaram no seu nome" }
  },
  {
    tema: "Papéis com CPF",
    situacao: "Você precisa jogar fora formulários antigos com nome, CPF e endereço de pessoas.",
    certa: "Fragmentar (picotar) os papéis antes de descartar.",
    errada: "Jogar inteiros no lixo comum.",
    explicacao: "Dado pessoal em papel também é protegido pela LGPD. Lixo é uma fonte clássica de vazamento.",
    vulnerabilidade: { nome: "Documentos no lixo", ataque: "revirou o lixo e montou um cadastro falso com os dados" }
  },
  {
    tema: "QR Code no estacionamento",
    situacao: "No parquímetro há um adesivo com um QR Code para \"pagar pelo celular\", colado por cima de outro.",
    certa: "Não usar e pagar pelo aplicativo ou canal oficial.",
    errada: "Ler o QR Code e pagar, é mais prático.",
    explicacao: "Golpistas colam QR Codes falsos por cima dos verdadeiros. Adesivo sobreposto é sinal de alerta.",
    vulnerabilidade: { nome: "Pagamento para golpista", ataque: "usou os dados do seu cartão da página falsa" }
  },
  {
    tema: "Site de compras",
    situacao: "Um site desconhecido, com o endereço cheio de números e letras aleatórias, pede os dados do seu cartão.",
    certa: "Fechar o site e comprar em uma loja conhecida.",
    errada: "Colocar os dados, o preço está ótimo.",
    explicacao: "Endereço estranho, loja desconhecida e preço baixo demais são sinais de loja falsa. O cadeado sozinho não garante que o site é honesto.",
    vulnerabilidade: { nome: "Cartão exposto", ataque: "fez compras com o seu cartão" }
  }
];
