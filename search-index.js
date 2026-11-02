'use strict';

/*
 * Índice estático do portal: páginas institucionais, seções, ajuda e
 * funcionalidades que não vivem em tabelas de conteúdo. Nunca inclui
 * credenciais, dados privados, painel administrativo ou informações de contas.
 */
const STATIC_SEARCH_ENTRIES = Object.freeze([
  { kind: 'Página', title: 'Início do arquivo', summary: 'Portal de Tenebra: cosmologia, criaturas, registros e relatos de Segredo da Floresta Adentro.', href: '/', keywords: 'tenebra segredo floresta adentro arquivo início portal' },
  { kind: 'Seção', title: 'O universo de Tenebra', summary: 'Nota do arquivista e apresentação do mundo, da mata e dos registros vivos.', href: '/#universo', keywords: 'universo cosmologia mundo lore história arquivista' },
  { kind: 'Seção', title: 'Registros', summary: 'Documentos, relatos e acontecimentos preservados pelo arquivo.', href: '/#registros', keywords: 'registros documentos relatos crônicas arquivo posts artigos' },
  { kind: 'Seção', title: 'Grimório', summary: 'Páginas de história, personagens, bestiário, regras, relíquias, facções, raças e aventuras.', href: '/#grimorio', keywords: 'grimório lore páginas história personagens regras relíquias facções raças aventuras' },
  { kind: 'Seção', title: 'Bestiário', summary: 'Criaturas observadas nos limites da floresta e além deles.', href: '/#bestiario', keywords: 'bestiário criaturas monstros animais penumbra' },
  { kind: 'Seção', title: 'Atlas e mapa', summary: 'Regiões não registradas, territórios e lugares do mundo de Tenebra.', href: '/#mapa', keywords: 'mapa atlas regiões localidades lugares territórios' },
  { kind: 'Seção', title: 'Eventos', summary: 'Calendário de encontros, sessões e inscrições abertas.', href: '/#eventos', keywords: 'eventos calendário sessões encontros inscrições' },
  { kind: 'Seção', title: 'Campanhas e linha do tempo', summary: 'Campanhas publicadas, diários e marcos históricos do arquivo.', href: '/#campanhas', keywords: 'campanhas linha do tempo diários crônicas marcos' },
  { kind: 'Funcionalidade', title: 'Rolador de dados', summary: 'Role 3d8 pelo sistema de Tenebra ou use expressões personalizadas como 1d20, 2d10+1d8 e 3d8+2d6+5.', href: '/#rolador', keywords: 'rolador dados dados rolagem 3d8 1d20 2d20 4d6 d8 d20 expressão' },
  { kind: 'Ajuda', title: 'Sistema de rolagem 3d8', summary: 'A rolagem normal usa três d8 e descarta o menor resultado. O histórico fica disponível para contas autenticadas.', href: '/#rolador', keywords: 'regra 3d8 rolagem normal descarta menor histórico dados' },
  { kind: 'Ajuda', title: 'Expressões de dados', summary: 'Aceita grupos de dados com + ou -, por exemplo 2d8+4, 1d20-2, 2d10+1d8 e 3d8+2d6+5. Entradas inválidas são rejeitadas.', href: '/#rolador', keywords: 'expressões dados parser 2d8+4 1d20-2 2d10+1d8 3d8+2d6+5 ajuda' },
  { kind: 'Funcionalidade', title: 'Chat da comunidade', summary: 'Conversa pública entre viajantes e arquivistas; requer conta para enviar mensagens.', href: '/#chat-comunidade', keywords: 'chat comunidade conversa mensagens viajantes' },
  { kind: 'Funcionalidade', title: 'Busca global', summary: 'Pesquise registros, Grimório, criaturas, personagens, regiões, eventos e páginas do portal. Atalho Ctrl+K.', href: '/#busca', keywords: 'busca pesquisa procurar encontrar global ctrl+k atalho' },
  { kind: 'Página', title: 'Personagens públicos', summary: 'Elenco de personagens publicados pelos arquivistas, com fichas resumidas e relações narrativas.', href: '/personagens', keywords: 'personagens elenco fichas públicas arquivistas' },
  { kind: 'Funcionalidade', title: 'Fichas de personagem', summary: 'Crie, edite e organize fichas privadas com atributos, inventário, habilidades e histórico de rolagens.', href: '/login.html', keywords: 'fichas personagem atributos inventário habilidades rolagens conta privada' },
  { kind: 'Página', title: 'Comunidade de viajantes', summary: 'Perfis públicos dos viajantes e arquivistas registrados no portal.', href: '/perfis', keywords: 'comunidade perfis viajantes usuários arquivistas' },
  { kind: 'Página', title: 'Criar conta', summary: 'Registre uma conta para fichas, histórico de rolagens, inscrições e mensagens na comunidade.', href: '/register.html', keywords: 'cadastro criar conta registro entrar participar' },
  { kind: 'Página', title: 'Entrar no arquivo', summary: 'Acesso restrito para contas registradas.', href: '/login.html', keywords: 'login entrar acesso restrito conta sessão' }
]);

function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function searchTokens(query) {
  return [...new Set(normalizeSearchText(query).split(' ').filter(Boolean))].slice(0, 10);
}

function scoreStaticEntry(entry, query, tokens) {
  const normalizedQuery = normalizeSearchText(query);
  const title = normalizeSearchText(entry.title);
  const keywords = normalizeSearchText(entry.keywords);
  const summary = normalizeSearchText(entry.summary);
  const haystack = `${title} ${keywords} ${summary}`;
  if (!tokens.every(token => haystack.includes(token))) return 0;
  if (title === normalizedQuery) return 100;
  if (title.startsWith(normalizedQuery)) return 85;
  if (title.includes(normalizedQuery)) return 70;
  if (tokens.every(token => keywords.includes(token))) return 55;
  return 35;
}

function searchStatic(query) {
  const tokens = searchTokens(query);
  if (!tokens.length) return [];
  return STATIC_SEARCH_ENTRIES
    .map(entry => ({ ...entry, score: scoreStaticEntry(entry, query, tokens) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'pt-BR'))
    .map(({ kind, title, summary, href, score }) => ({ kind, title, summary, href, score, source: 'static' }));
}

function escapeLikePattern(value) {
  return String(value).replace(/[\\%_]/g, '\\$&');
}

module.exports = { STATIC_SEARCH_ENTRIES, normalizeSearchText, searchTokens, searchStatic, escapeLikePattern };
