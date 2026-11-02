# Handoff — Portal de Tenebra

Atualizado em 02/11/2026. Leia também `PROJECT_STATUS.md`, `TASK_QUEUE.md` e `BUG_TRACKER.md`.

## Estado atual

Portal editorial sem framework no frontend, Node.js no servidor e PostgreSQL. O repositório já contém módulos para Registros, Grimório, Bestiário, personagens públicos/privados, eventos, atlas, perfis, campanhas, comunidade, fichas e rolagens. `README.md` e `TEST_REPORT.md` contêm histórico de configuração e validações anteriores. Nesta sessão, os documentos `docs/AGENT_HANDOFF.md`, `docs/TASK_QUEUE.md`, `docs/BUG_TRACKER.md` e `docs/PROJECT_STATUS.md` não existiam; foram criados agora.

## Correção dos Registros

Causa: `renderPosts()` criava links `/registro/:slug`; o código de abertura buscava elementos `.open-record`, classe nunca renderizada. O clique seguia então a rota válida para `article.html`, em vez do modal já existente.

Correção localizada: link do card tem `data-open-record` e mantém seu `href`; delegação de clique usa o registro no snapshot de `/api/records` e abre o `<dialog>` sem requisição adicional. Dados exibidos: título, categoria, data, autor, resumo, imagem/crédito e corpo; conteúdo ausente recebe indicação neutra. Modal nativo dá suporte ao foco/modalidade e ESC; botão e overlay fecham; overflow do fundo é bloqueado/restaurado; corpo interno rola. Link de página completa preserva acesso direto. O Grimório usa sua própria página e não foi alterado.

## Funcionalidades revisadas

- Foram lidos os componentes de Registros, detalhe individual, Grimório, API de conteúdo e testes associados.
- A suíte cobre APIs de login/permissões, Grimório, Bestiário, personagens, busca, eventos, roladores, chat, Oráculo, perfis/atlas e seeds. Veja a matriz e limites em `PROJECT_STATUS.md`.
- Não foi realizada auditoria manual completa das telas nem dos serviços reais nesta sessão. Não considerar a matriz automatizada como validação visual/E2E.

## Arquivos desta sessão

- `index.html`: semântica/estrutura do modal de Registros.
- `js/script.js`: interceptação dos cards e renderização do detalhe com dados existentes.
- `css/style.css`: modal responsivo e scroll interno.
- `test/ui.test.js`: contrato estático para fluxo/modal.
- `docs/PROJECT_STATUS.md`, `docs/BUG_TRACKER.md`, `docs/TASK_QUEUE.md`, `docs/AGENT_HANDOFF.md`: estado e continuidade.

O checkout já tinha alterações não commitadas em vários arquivos antes desta sessão. Não foram revertidas nem assumidas como parte desta correção.

## Bugs corrigidos e pendentes

- Corrigido: clique no card ignorava modal por incompatibilidade entre o seletor `.open-record` e o HTML produzido.
- Pendente em REVIEW: confirmar foco ao retornar, fechamento por overlay/ESC, rolagem, reabertura rápida e responsividade em navegador real.
- Pendente: confirmar estado do PostgreSQL/migrations correntes.
- Não foi possível afirmar que não há bugs globais; ver `BUG_TRACKER.md` e `TASK_QUEUE.md`.

## Testes executados

- `node --check js/script.js`: aprovado.
- `npm test`: aprovado — 24 testes de API e 2 grupos de testes para seeds/UI, 0 falhas.
- Browser desktop/mobile e cenários manuais do pedido: não executados nesta sessão.
- Banco real e API ao vivo: não verificados nesta sessão.

## Próximo passo recomendado

Executar TNE-REG-002 primeiro num navegador com a API ligada e dados publicados (incluindo registro sem imagem/campos opcionais e slug inexistente). Corrigir qualquer falha observada e só então mover TNE-REG-001 para DONE. Depois seguir TNE-GLOBAL-001 e TNE-OPS-001 conforme disponibilidade do PostgreSQL.
