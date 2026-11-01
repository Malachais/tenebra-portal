CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS records (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 120),
  content TEXT NOT NULL,
  summary TEXT NOT NULL CHECK (length(summary) BETWEEN 1 AND 240),
  category TEXT NOT NULL CHECK (category IN ('registros','regioes','monstros','outros')),
  author TEXT,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_records_category_published_date ON records(category, published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_records_published_date ON records(published, created_at DESC);

INSERT INTO records (slug,title,content,summary,category,author) VALUES
('o-inventario-das-vozes','O inventário das vozes','Na noite de 17 de agosto, o posto de vigia recebeu onze chamadas pelo rádio. Todas usavam a voz do antigo cartógrafo, morto havia três invernos. O operador respondeu à décima segunda. Desde então, o livro de turnos registra uma cadeira ocupada diante do aparelho, embora a sala permaneça vazia.','Chamadas de um cartógrafo morto continuam chegando ao posto de vigia.','registros','M. Avelar'),
('caderno-de-sal','Caderno de sal','As páginas foram encontradas seladas por cristais de sal dentro de uma caixa seca. O autor descreve uma chuva que sobe do chão e enumera nomes que ninguém da aldeia reconhece. Na última folha, escrita por outra mão, há apenas: “não pronunciem o décimo terceiro”.','Um diário impossível enumera nomes sob uma chuva que cai para cima.','registros','Iria Voss'),
('sino-sem-badal','O sino sem badal','O sino da capela de Arven toca sem peça móvel e sem vento. Cada toque antecede, por exatamente um dia, o desaparecimento de alguém cujo nome foi riscado dos registros civis. O bronze permanece frio mesmo junto à forja.','Um sino imóvel anuncia desaparecimentos com um dia de antecedência.','registros','Arquivo de campo'),
('carta-da-margem','Carta da margem','A carta chegou sem envelope, dobrada em quatro e ainda úmida. A caligrafia pertence à expedição de Lume, desaparecida há vinte anos. O texto pede que a equipe não atravesse o rio na volta; o mapa atual mostra que o rio secou antes da partida deles.','Uma expedição desaparecida envia instruções por uma rota que já não existe.','registros','N. Ferraz'),
('vigilia-das-janelas','A vigília das janelas','Durante sete noites, todas as janelas da rua norte refletiram uma floresta sob céu diurno. Na oitava, as cortinas foram encontradas fechadas por dentro e cobertas de terra fresca. Os moradores juram que não saíram de casa.','Reflexos de uma mata distante tomaram as janelas de uma rua inteira.','registros','Escrivão 04'),
('vale-da-nevoa-baixa','Vale da Névoa Baixa','A névoa deste vale permanece abaixo dos joelhos e desenha círculos em torno de quem caminha. Pegadas que entram são comuns; pegadas que saem pertencem sempre a uma pessoa a mais. Não acampem onde os círculos se fecham.','Um vale onde a neblina conta os viajantes e nunca devolve a mesma quantidade.','regioes','Cartografia Tenebra'),
('bosque-das-estacas','Bosque das Estacas','Estacas de madeira negra surgem alinhadas entre as árvores depois de cada lua nova. Não há marcas de ferramenta em nenhuma delas. O bosque muda de posição quando observado do alto, mas os troncos mantêm a mesma distância entre si.','Um bosque móvel marcado por estacas que ninguém recorda ter fincado.','regioes','Iria Voss'),
('lago-de-cinza','Lago de Cinza','A água é opaca e não molha a pele: deixa uma camada de pó que sussurra durante o sono. Sondas não encontraram fundo. Pescadores relatam redes pesadas, recolhidas vazias e quentes como se tivessem atravessado um forno.','Um lago seco ao toque, sem fundo conhecido e com algo nas redes.','regioes','M. Avelar'),
('escadaria-submersa','A Escadaria Submersa','Na encosta oeste, degraus descem para dentro da rocha, sempre cobertos por uma lâmina d’água. O último degrau visível fica mais baixo a cada visita. As bolhas que sobem de lá cheiram a incenso de funeral.','Uma escada afogada continua descendo para dentro da montanha.','regioes','Expedição Orla'),
('campo-das-lanternas','Campo das Lanternas','Luzes fixas aparecem sobre o campo antes das tempestades. Aproximar-se alonga a distância; dormir ali faz a pessoa acordar junto à luz mais distante. A grama cresce em espirais ao redor de cada ponto luminoso.','Luzes que recuam quando perseguidas e reorganizam o campo ao redor.','regioes','Cartografia Tenebra'),
('o-cervo-de-vidro','O Cervo de Vidro','Criatura translúcida observada nas clareiras frias. Origem desconhecida; surgem fragmentos de galhada perto de árvores atingidas por raios. Evita grupos, mas imita o último gesto de quem o encara. Perigo: alto — olhar prolongado causa desorientação e perda de memória recente.','Uma presença cristalina que reproduz gestos e apaga lembranças.','monstros','Bestiário, folha 12'),
('a-mae-dos-musgos','A Mãe dos Musgos','Massa de raízes e musgo que se desloca por paredes úmidas. A tradição local diz que nasceu de uma sepultura sem nome. Segue fontes de calor e cobre acampamentos silenciosos. Perigo: grave — esporos provocam sono profundo e crescimento vegetal sob a pele.','Raízes errantes atraídas pelo calor e por quem dorme.','monstros','Iria Voss'),
('cao-de-tres-sombras','Cão de Três Sombras','Animal sem pelo, visto apenas ao crepúsculo. Sua origem é associada às trilhas antigas, embora não deixe rastros. Cerca viajantes até que alguém diga seu próprio nome em voz alta. Perigo: moderado — relatos de perseguição e desaparecimento isolado.','Um caçador que cerca quem revela o próprio nome.','monstros','Vigia de Arven'),
('as-costureiras','As Costureiras','Pequenos vultos de mãos longas encontrados em casas abandonadas. Recolhem fios, cabelos e fibras vegetais para fechar frestas nas paredes. Quando interrompidas, passam a costurar as sombras dos presentes. Perigo: alto — imobilização e desaparecimentos noturnos.','Vultos que remendam casas e, se provocados, as sombras de seus hóspedes.','monstros','Arquivo de campo'),
('o-hospede-do-poco','O Hóspede do Poço','Voz grave que responde a perguntas feitas sobre poços abandonados. Não possui forma confirmada; a água permanece imóvel durante as respostas. Ele conhece detalhes da infância de quem pergunta. Perigo: crítico — quem ouve três respostas sente necessidade de descer.','Uma voz em poços que conhece lembranças íntimas e chama para baixo.','monstros','N. Ferraz'),
('chave-de-osso-negro','Chave de Osso Negro','A chave não abre fechaduras; gira quando apontada para portas que ainda não foram construídas. Após cada uso, uma porta desaparece de algum lugar conhecido pelo portador.','Um artefato que encontra entradas futuras ao custo de apagar portas existentes.','outros','Coleção interditada'),
('confraria-da-luz-velada','Confraria da Luz Velada','Grupo itinerante que cobre espelhos antes de atravessar povoados. Seus membros deixam moedas nos umbrais e nunca aceitam troco. Os registros divergem sobre se a confraria protege as aldeias ou as prepara para algo.','Viajantes mascarados cujo ritual pode ser proteção ou aviso.','outros','Escrivão 04'),
('chuva-de-cinzas-azuis','Chuva de Cinzas Azuis','Fenômeno raro sem calor nem fumaça. Os grãos permanecem suspensos dentro de casas fechadas e formam mapas de lugares que não constam em atlas. Amostras se desfazem ao amanhecer.','Cinzas suspensas desenham territórios desconhecidos durante a noite.','outros','M. Avelar'),
('a-cartografa-sem-rosto','A Cartógrafa sem Rosto','Mulher de capa cinza que oferece mapas em troca de uma memória feliz. Os mapas são precisos até o momento em que o comprador tenta voltar pelo mesmo caminho. Seu rosto não aparece em espelhos nem em retratos.','Mapas impecáveis cobram uma lembrança e alteram o caminho de volta.','outros','Relato anônimo'),
('procissao-dos-fios','A Procissão dos Fios','Uma linha vermelha atravessa a mata uma vez por estação. Segui-la leva a uma clareira vazia, onde todos escutam passos chegando por direções diferentes. A linha some quando alguém tenta cortá-la.','Um fio sazonal conduz a uma clareira cercada por passos invisíveis.','outros','Arquivo de campo')
ON CONFLICT (slug) DO NOTHING;
