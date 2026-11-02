# Estado do projeto — Portal de Tenebra

Atualizado em 02/11/2026. Fonte desta auditoria: código presente, `README.md`, `TEST_REPORT.md` e testes locais. Os documentos de continuidade solicitados não existiam antes desta atualização.

## Panorama

- Aplicação: frontend HTML/CSS/JavaScript sem framework; servidor Node.js; PostgreSQL como banco do servidor.
- Registros: listagem, busca textual, filtros por categoria, cards e API pública existem. Clique do card agora abre detalhes em modal; a rota individual continua disponível para acesso direto e nova aba.
- Grimório: listagem própria, busca/categorias e detalhe individual por slug. Mantido sem alteração nesta correção.
- Bestiário, personagens, eventos, atlas, perfis, campanhas, chat, Oráculo, fichas e roladores possuem implementação no código; a cobertura é desigual, veja a classificação abaixo.
- Estado do banco real e da inicialização precisa ser confirmado no ambiente do próximo agente; o histórico em `TEST_REPORT.md` registra indisponibilidade local do PostgreSQL em validação anterior e também uma validação E2E anterior de personagens públicos.

## Classificação baseada em evidência

| Funcionalidade | Estado | Evidência / limite |
|---|---|---|
| Registros: busca, filtros e listagem | FUNCIONAL (automatizado) | Renderização e filtros em `js/script.js`; API coberta por testes. Sem validação visual nesta sessão. |
| Registros: detalhes em modal | PARCIAL | Código corrigido e testes estáticos/suíte aprovados; faltam os cenários interativos em navegador e mobile. |
| Rota direta `/registro/:slug` | FUNCIONAL (automatizado) | Rota servida em `server.js`, leitura em `js/article.js`; permanece como fallback compatível. |
| Grimório | FUNCIONAL (automatizado) | API coberta; `js/portal.js` e `js/lore.js` mantêm listagem e detalhe próprios. UX visual não revalidada. |
| Bestiário e criaturas | FUNCIONAL (automatizado) | Rotas cobertas por testes; detalhe separado em `js/monster-page.js`. |
| Busca global | FUNCIONAL (automatizado) | API coberta; UI não validada nesta sessão. |
| Personagens públicos e restritos | FUNCIONAL (automatizado); E2E anterior documentado | `TEST_REPORT.md` documenta fluxo E2E anterior; suíte atual passou. Reconfirmar no banco corrente quando disponível. |
| Eventos, atlas e perfis | FUNCIONAL (automatizado) | Cobertura de API, sem inspeção de navegador nesta sessão. |
| Grimório, chat, Oráculo, campanhas, fichas e roladores | PARCIAL | Há código e cobertura automatizada em domínios relevantes; fluxo completo de navegador/serviços externos não foi refeito. |
| Login, permissões e painel editorial | FUNCIONAL (automatizado) | Cobertura de API autenticada; painel não foi exercitado visualmente nesta sessão. |
| PostgreSQL e migrations no estado atual | NÃO VERIFICADO | Nenhuma conexão ou inicialização de serviço foi tentada nesta auditoria. |

## Mudanças desta auditoria

- Cards dos Registros passam a interceptar clique e abrir `#recordDialog` usando o registro já presente na listagem.
- O modal apresenta categoria/data/autoria, título, resumo, imagem/crédito pelo renderizador compartilhado, descrição e link para a página individual.
- Rota `/registro/:slug` permanece válida. Grimório e demais detalhes não foram substituídos por modal.
- Arquivos: `index.html`, `js/script.js`, `css/style.css`, `test/ui.test.js` e documentos em `docs/`.

## Validação executada

- `node --check js/script.js`: aprovado.
- `npm test`: aprovado, 24 testes de API e 2 grupos de testes de seeds/UI, zero falhas.
- Teste manual de desktop/mobile, teclado, overlay, rolagem e preservação visual de contexto: NÃO VERIFICADO.
