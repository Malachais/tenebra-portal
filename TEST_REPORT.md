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
