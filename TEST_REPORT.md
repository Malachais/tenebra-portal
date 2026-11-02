# Diagnóstico PostgreSQL — Blog Tenebra

## Configuração examinada sem expor segredos

- `npm start` executa `node --env-file=.env server.js`.
- `DATABASE_URL` é a variável realmente usada por `pg.Pool` e foi carregada por Node.
- Host `localhost`, porta `5432`, banco `tenebra` e usuário `tenebra` foram confirmados sem mostrar a senha.
- Não há caracteres reservados literais na senha da URL que indiquem necessidade de URL encoding. A senha não foi exibida nem alterada.
- Existem `migrations/001_initial.sql` e `migrations/002_chat_and_roles.sql`. A segunda cria a função dos usuários e o armazenamento do chat; não foi aplicada porque a conexão ao PostgreSQL não está disponível.

## Estado do serviço e conexão

- PostgreSQL 17 cluster `main`: **down**.
- `pg_isready`: sem resposta em `/var/run/postgresql:5432`.
- `npm start`: não alcança a etapa de migration. Resultado atual: conexão bloqueada/serviço indisponível (`EPERM`).
- O cluster pertence ao usuário de sistema `nobody`; este ambiente não tem permissão para iniciar o serviço nem acesso ao system bus.
- Como o serviço está parado, não foi possível confirmar se o banco `tenebra` e o papel `tenebra` existem, nem reproduzir o `28P01` informado na máquina do usuário. O `28P01` significa autenticação recusada; com o serviço ligado, as causas restantes mais prováveis são senha diferente da configurada ou URL encoding incorreto. A senha atual não foi redefinida.

## Alterações

- `server.js`: mensagens de inicialização agora distinguem `28P01`, banco inexistente (`3D000`), autenticação/papel (`28000`), conexão recusada, bloqueio `EPERM`, permissão (`42501`) e migration ausente/falha.
- `test/api.test.js`: adicionado teste dos diagnósticos de erro PostgreSQL.
- Backup anterior do servidor: `/tmp/tenebra-server.js.pre-postgres-diagnostics`.
- Nenhum `.env`, dado ou migration de banco foi alterado/executado.

## Testes

`npm test`: **9 aprovados, 0 falhas** (login, sessões, função administrativa, OpenRouter e persistência do chat com dependências simuladas). `node --check server.js`, `node --check js/chat.js` e `node --check scripts/create-admin.js`: aprovados.

O teste com banco real permanece pendente porque o cluster está parado e não pode ser iniciado por este processo. A tentativa atual de `npm start` também termina com `EPERM` antes de aplicar migrations ou abrir a porta HTTP.

## Evolução do portal (Fases 2–11)

- Identidade visual e navegação foram estendidas para as áreas de Grimório, Bestiário, personagens, rolador, chat, eventos, atlas e comunidade, preservando o site editorial existente.
- Migrations incrementais adicionadas: `003_grimoire.sql`, `004_bestiary.sql`, `005_characters.sql`, `006_community_chat.sql`, `007_admin_console.sql`, `008_events.sql`, `009_regions.sql` e `010_profiles_achievements.sql`. Nenhuma migration foi executada nesta máquina porque o PostgreSQL permanece bloqueado/parado.
- O projeto ampliou testes simulados para as novas rotas de eventos, regiões e perfis. `npm test`: **16 aprovados, 0 falhas**. Verificações `node --check` para servidor e módulos novos: aprovadas.
- `npm start` foi executado nesta etapa e encerrou antes de abrir a porta com `EPERM` ao tentar conectar ao PostgreSQL. Portanto, login, inscrição em eventos, migrations e interface com dados reais não puderam ser testados neste ambiente.
- Testes reais do Oráculo dependem de PostgreSQL ativo e acesso à OpenRouter com uma chave válida configurada no `.env`.


## Fase 12 — inventário e conteúdo inicial

- Fontes verificadas: migrations PostgreSQL no projeto, documentos Markdown e `data/grimorio.sqlite` em modo somente leitura. O SQLite tem cinco posts: quatro páginas-modelo/editoriais e `TESTE.404`; a tabela de contas não foi consultada nem exportada. As migrations atuais declaram vinte posts, cinco criaturas e cinco regiões; a migration 004 já migra as criaturas por slug.
- Criada a migration incremental `011_lore_imports.sql`: adiciona categorias de Facções, Raças e Povos, Classes, Habilidades, Relatos e Aventuras/Eventos; relaciona registros regionais e itens/posts existentes sem apagar originais; preenche somente campos vazios de bestiário com indicação de informação desconhecida.
- Criados seeds idempotentes para os sete Véus, os nomes pedidos de personagens, classes e povos, o Cálice de Nefalem e Circo de Klaus. Permanecem em rascunho porque os arquivos não trazem descrições. Regras 3d8 e rótulos ST/DX/IQ/HT/SAN são publicados conforme texto fornecido pelo criador. Da’kor é apresentado apenas como arquipélago, informação encontrada no índice SQLite; mapa visual é placeholder temporário.
- `npm test`: aprovado após acrescentar verificações das categorias, rascunhos, regras publicadas, importação somente de posts e idempotência. O exportador Python foi validado: retorna os cinco posts e não consulta a tabela `users`.
- Migrations e seed **não executados no PostgreSQL**: `npm start` e `npm run seed:content` dependem de um PostgreSQL que segue inacessível a este processo (`EPERM`).


## Administrador `malachais`

- Adicionado `npm run admin:malachais` com prompt oculto; cria ou atualiza somente `malachais`, usando o hash scrypt existente e preservando `merjin`.
- Teste unitário cobre criação e redefinição via `ensureAdmin`, incluindo armazenamento de hash e preservação da outra conta.
- A tentativa real não foi concluída porque o PostgreSQL recusou conexão com `EPERM` antes do prompt e antes de qualquer escrita. Após iniciar o PostgreSQL, execute o comando e informe a senha no prompt protegido.


## Fase 13 — personagens públicos, visibilidade e estabilização (02/11/2026)

### Diagnóstico

- O portal não tinha rota pública de personagens, nem rota individual, nem API pública. As únicas fichas eram as privadas de jogadores, listadas apenas para o dono.
- O modelo `characters` não possuía `slug`, status editorial, resumo público, imagem ou data de publicação. O campo existente `visible_on_profile` apenas exibia nome/raça/classe no perfil e não tornava a ficha pública.
- Regiões e eventos já eram renderizados pelo frontend com imagem, mas as consultas públicas e administrativas não selecionavam `image_url`.
- `/api/profiles` referenciava `event_count` sem selecioná-lo; a consulta foi corrigida.
- Páginas de detalhe liam o slug apenas da query string `?slug=`, embora os links e rotas limpas usem `/secao/:slug`. O navegador mantém o caminho, então as páginas de artigo, Grimório, Bestiário e personagem não encontravam o registro. Foi adicionado fallback pelo último segmento de `location.pathname`, no mesmo padrão já usado por eventos, regiões, campanhas e perfis.
- Erros internos não expunham um código estável para o cliente, dificultando distinguir validação, permissão e falha de servidor.

### Modelo e regras

- Migration incremental `014_public_characters.sql`: `slug`, `status`, `summary`, `image_url`, `published_at`, índice único de slug, índice parcial do elenco público, tabela `character_access` e colunas opcionais `regions.image_url` e `events.image_url`.
- Fichas existentes receberam slug estável com sufixo de ID e permaneceram `private`; nenhuma ficha de jogador foi publicada automaticamente.
- Status permitidos: `draft`, `private`, `restricted`, `public`.
  - `public`: visitante anônimo, dono, usuários autorizados e administradores.
  - `private`: dono e administradores.
  - `restricted`: dono, administradores e usuários com linha explícita em `character_access`.
  - `draft`: dono e administradores; não aparece em listagens públicas.
- Apenas administradores definem `public` ou `restricted`. Donos podem usar `draft`/`private` e preservar um status já publicado ao editar.
- Donos não excluem fichas `public`/`restricted` diretamente; a API responde `CHARACTER_PUBLISHED_LOCKED` e orienta a despublicar primeiro.
- Acesso anônimo ou não autorizado a ficha privada/rascunho/restrita responde 404, sem revelar a existência do registro.
- A API pública não devolve `user_id` nem a função interna do dono.
- Relações usam `universe_links` com `source_type = 'character-sheet'` e só são gravadas para slugs existentes e publicados/visíveis.

### Rotas e interface

- `GET /api/characters` — elenco público com busca por nome, título, raça, classe, origem, véu e resumo.
- `GET /api/characters/:slug` — ficha pública conforme permissão, com `can_edit` para dono/admin.
- `GET /api/links?type=character-sheet&id=...` — relações públicas ou autorizadas.
- `/personagens` e `/personagens/:slug` — páginas HTML servidas sem sessão.
- Painel administrativo: seção “Personagens do universo” com criar, editar, publicar/despublicar, excluir, relações e liberação de acesso restrito.
- Formulário do jogador: resumo, imagem e visibilidade `draft`/`private`; link “Ver página pública” quando aplicável; exclusão bloqueada para fichas publicadas.
- Busca global inclui personagens públicos com destino `/personagens/:slug`.
- Placeholder existente de árvore SVG com `?` é reutilizado quando não há imagem.

### Automação de publicação pelo administrador

Ao criar ou editar um personagem no painel, a API valida os campos, gera slug único quando necessário, grava o status, define `published_at` ao publicar, sincroniza somente as relações selecionadas que existem, e passa a incluir o registro na listagem e na página individual. O fluxo foi validado com dados reais e sem intervenção manual no banco.

### Testes automatizados

- `npm test`: **24 testes de API + 6 testes de seeds/UI aprovados, 0 falhas**.
- Novos testes cobrem: criação pública pelo admin, slug, listagem anônima, busca, detalhe sem `user_id`, relações, ficha privada oculta, ficha restrita oculta, concessão/revogação de acesso, despublicação/republicação e limpeza. O teste de UI confirma as páginas e scripts do elenco e o fallback de slug por rota limpa.
- `node --check` aprovado em `server.js`, `test/api.test.js`, `test/ui.test.js`, `js/characters.js`, `js/public-characters.js`, `js/character-page.js`, `js/article.js`, `js/lore.js`, `js/monster-page.js` e `js/admin.js`.

### Validação ponta a ponta com PostgreSQL real

Servidor iniciado em porta de teste, migration `014_public_characters` aplicada. Fluxo executado contra o banco real:

1. Administrador autenticado por login real.
2. Personagem público criado pelo painel/API com região e Grimório relacionados.
3. Registro confirmado no PostgreSQL com `status = public` e `published_at` preenchido.
4. Visitante anônimo encontrou o personagem em `/api/characters`, na busca global e em `/api/characters/:slug`.
5. `/personagens` e `/personagens/:slug` responderam HTML 200 sem sessão.
6. As relações apareceram em `/api/links`.
7. As fichas privadas existentes (`noctharis-1`, `mensageiro-2`) continuaram retornando 404 para visitantes.
8. Usuário comum de teste foi criado; não acessou o painel nem conseguiu publicar diretamente.
9. Personagem restrito ficou oculto para visitante e para o usuário comum antes da concessão; após liberação pelo admin, o usuário autorizado recebeu 200; após revogação, voltou a 404.
10. Personagem foi despublicado para `draft` (sumiu da listagem e da página) e republicado (voltou a 200).
11. Todos os personagens, vínculos, acessos e o usuário de teste foram removidos; o banco terminou com os 2 personagens privados e 2 usuários originais.

### Checklist do personagem público

- [x] Criado pelo administrador.
- [x] Salvo no PostgreSQL.
- [x] Status `public` com `published_at`.
- [x] Slug único gerado automaticamente.
- [x] Aparece na listagem pública.
- [x] Página individual acessível.
- [x] Funciona sem login.
- [x] Não expõe `user_id` ou dados internos do dono.
- [x] Relações selecionadas conectadas e visíveis.
- [x] Fichas privadas existentes continuam privadas.
- [x] Acesso restrito exige autorização explícita.
- [x] Despublicar remove da área pública; republicar restaura.

### Git

- Alterações funcionais em `server.js`, `migrations/014_public_characters.sql`, `test/api.test.js`, `index.html`, `characters.html`, `character.html`, `admin.html`, `css/style.css`, `js/characters.js`, `js/admin.js`, `js/public-characters.js`, `js/character-page.js`, `js/article.js`, `js/lore.js` e `js/monster-page.js`.
- Documentação em `README.md` e `TEST_REPORT.md`.
- Nenhum `.env`, senha, token ou credencial foi incluído. Nenhum `git push` foi executado.
