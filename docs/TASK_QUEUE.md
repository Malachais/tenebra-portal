# Fila de processos

Atualizada em 02/11/2026. A fila anterior não estava presente no repositório; itens abaixo foram registrados sem apagar tarefas históricas (não localizadas). Status: BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE.

## TNE-REG-001 — Abertura dos Registros por modal

- **Prioridade:** P1
- **Descrição:** Abrir o detalhe de qualquer card de Registro em modal sobre a listagem, preservando a rota direta por slug.
- **Sistema afetado:** Registros / UX / acessibilidade.
- **Arquivos envolvidos:** `index.html`, `js/script.js`, `css/style.css`, `test/ui.test.js`.
- **Dependências:** Nenhuma.
- **Critérios de aceitação:** clique não navega; card mostra dados reais; URL individual continua funcional; botão, ESC e overlay fecham; clique interno não fecha; rolagem interna; fundo bloqueado e restaurado; sem requests repetidas; cenários desktop/mobile e dados incompletos verificados.
- **Status:** REVIEW — implementação e regressão automatizada passaram; validação interativa ainda pendente.

## TNE-REG-002 — Validar interação do modal em navegador

- **Prioridade:** P1
- **Descrição:** Executar checklist manual da abertura, fechamento, acessibilidade, viewport e preservação do estado da listagem.
- **Sistema afetado:** Registros.
- **Arquivos envolvidos:** `index.html`, `js/script.js`, `css/style.css`.
- **Dependências:** Navegador e API com registros de teste publicados, incluindo imagem ausente e campos opcionais ausentes.
- **Critérios de aceitação:** validar abrir vários registros; fechar por botão, ESC e overlay; clicar no conteúdo; rolar corpo longo sem rolar documento; desktop e celular; inexistente; dados incompletos; rápida repetição; URL; posição/filtros da página preservados.
- **Status:** READY.

## TNE-GLOBAL-001 — Auditoria funcional global no browser e serviços reais

- **Prioridade:** P2
- **Descrição:** Confrontar interfaces do Grimório, Bestiário, busca, personagens, eventos, atlas, perfis, campanhas, chat, Oráculo, fichas e painel com comportamento real, além da cobertura atual de API.
- **Sistema afetado:** Portal inteiro.
- **Arquivos envolvidos:** páginas HTML, `js/`, `css/`, `server.js`.
- **Dependências:** PostgreSQL ativo e credenciais locais válidas; chave externa apenas para validar resposta real do Oráculo.
- **Critérios de aceitação:** registrar resultado reproduzível por feature como FUNCIONAL, PARCIAL, QUEBRADA, PLANEJADA ou NÃO VERIFICADA; criar bugs individuais com arquivos/dependências/aceitação; preservar features já funcionais.
- **Status:** READY.

## TNE-OPS-001 — Confirmar migrations e API no banco corrente

- **Prioridade:** P2
- **Descrição:** Confirmar conexão e migrations pendentes em ambiente corrente sem alterar credenciais locais.
- **Sistema afetado:** Banco/API.
- **Arquivos envolvidos:** `server.js`, `migrations/`.
- **Dependências:** PostgreSQL acessível e `.env` local válido.
- **Critérios de aceitação:** servidor inicia, migrations aplicadas, endpoints públicos principais respondem e nenhum segredo aparece em logs/documentação.
- **Status:** READY.
