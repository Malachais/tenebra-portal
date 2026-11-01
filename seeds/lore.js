"use strict";

const UNKNOWN = "Informação ainda desconhecida nos arquivos consultados.";
const draft = (title, category, known = "") => ({
  slug: slugify(title), title, category,
  summary: `Rascunho de referência para ${title}. A informação canônica ainda precisa de revisão do criador.`,
  content: [
    `Status editorial: RASCUNHO — nome presente no material do projeto ou na lista fornecida pelo criador.`,
    `Descrição: ${known || UNKNOWN}`,
    `Origem: ${UNKNOWN}`,
    `Características: ${UNKNOWN}`,
    `Habitantes ou entidades relacionadas: ${UNKNOWN}`,
    `Relações com outras regiões, Véus ou personagens: ${UNKNOWN}`,
    `História conhecida: ${UNKNOWN}`,
    `Nota: esta página não afirma como oficial qualquer detalhe além do nome e da informação explicitamente indicada acima.`
  ].join("\n\n"), author: "Arquivo Tenebra · rascunho", published: false,
  source_system: "owner-roster", source_id: slugify(title)
});
function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 150);
}

const entries = [
  draft("Tenebra", "historia-tenebra", "Tenebra é o nome do universo deste portal; os documentos não descrevem sua cosmologia."),
  draft("Segredo da Floresta Adentro", "historia-tenebra", "Título do universo de RPG indicado pelo criador. Detalhes de cenário ainda não estão documentados."),
  draft("Malachais", "personagens"),
  draft("Merjin", "personagens"),
  draft("O Inominável", "personagens"),
  draft("Facções de Tenebra — catálogo inicial", "faccoes", "O registro legado menciona a Confraria da Luz Velada; seu vínculo com o cânone precisa de revisão."),
  draft("Raças e Povos — catálogo inicial", "racas-povos"),
  draft("Classes — catálogo inicial", "classes"),
  draft("Habilidades — catálogo inicial", "habilidades"),
  ...["Druida", "Druida Selvagem"].map(name => draft(name, "classes-habilidades", "Nome indicado pelo criador; classificação como classe/subclasse é provisória e precisa de confirmação.")),
  ...["Elfo", "Elfo Rubro", "Fada", "Fada Sombria", "Licantropo", "Diabretes", "Lenhadores Amaldiçoados"].map(name => draft(name, "racas-povos", "Nome indicado para investigação; natureza e classificação ainda não foram confirmadas nos arquivos.")),
  ...["Véu Material", "Véu Neutral", "Véu Silvestre", "Véu Caótico", "Véu Rubro", "Véu da Névoa", "Véu dos Ancestrais"].map(name => draft(name, "sete-veus")),
  draft("Cálice de Nefalem", "reliquias"),
  draft("Circo de Klaus", "aventuras-eventos")
];

const rules = [
  {
    slug: "regra-base-3d8", title: "Regra-base: rolagem 3d8", category: "regras-rpg",
    summary: "Role três dados de oito faces, descarte o menor e some os dois maiores; compare conforme a regra do atributo.",
    content: "Regra informada pelo criador: role três dados de oito faces (3d8), descarte o menor resultado e some os dois maiores. Compare a soma conforme a regra do atributo.\n\nExemplo: 8, 6 e 2 → descarta 2 → resultado 14.\n\nA fórmula de sucesso, os alvos e os efeitos de vantagem, desvantagem e Saque Rápido não estão definidos no material consultado; não são inferidos nesta página.",
    author: "Projeto Tenebra · regra fornecida pelo criador", published: true,
    source_system: "owner-roster", source_id: "regra-base-3d8"
  },
  {
    slug: "atributos-base", title: "Atributos do sistema", category: "regras-rpg",
    summary: "Nomes e identificadores dos cinco atributos listados pelo criador; fórmulas ainda não documentadas.",
    content: "Atributos listados pelo criador:\n\nST — Força\nDX — Destreza\nIQ — Inteligência\nHT — Vitalidade\nSAN — Sanidade\n\nO material consultado não define escalas, valores iniciais, testes-alvo nem fórmulas derivados. Consulte a regra da mesa antes de calcular ou alterar uma ficha.",
    author: "Projeto Tenebra · regra fornecida pelo criador", published: true,
    source_system: "owner-roster", source_id: "atributos-base"
  }
];

const regions = [{
  slug: "arquipelago-dakor", name: "Arquipélago Da'kor",
  description: "O banco SQLite legado menciona Da’kor como um arquipélago. Geografia, habitantes e status canônico não são descritos no registro consultado.",
  history: "História: informação ainda desconhecida nos arquivos consultados.",
  factions: [], creatures: [], related_events: [], published: true
}];

module.exports = { entries, rules, regions, draft };
