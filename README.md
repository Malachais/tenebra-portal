# Blog Tenebra — Arquivo de campo

Blog responsivo para explorar os registros do universo Tenebra. O projeto combina HTML, CSS e JavaScript sem framework no frontend, servidor HTTP nativo em Node.js, API editorial e PostgreSQL. A interface preserva o grimório de papel envelhecido, tinta, musgo, ferrugem e símbolos arcanos.

## Requisitos

- Node.js 20.12 ou superior (inclui `fetch` e a opção `--env-file` usados pelo servidor)
- npm
- PostgreSQL 14 ou superior
- Uma chave OpenRouter para habilitar o Oráculo de Tenebra. Sem chave, o blog e o painel continuam disponíveis, mas o chatbot retorna uma mensagem de configuração pendente.

## Instalação

Clone o repositório e entre na pasta do app:

```sh
git clone URL_DO_REPOSITORIO
cd NOME_DO_REPOSITORIO/segredo_floresta_grimorio-26.10.26
npm install
```

Se esta pasta já for a raiz clonada, use apenas `cd NOME_DO_REPOSITORIO`. Para consultar os scripts realmente disponíveis no `package.json`, execute `npm run`.

Crie banco e usuário PostgreSQL (ajuste a senha para seu ambiente):

```sql
CREATE USER tenebra WITH PASSWORD 'escolha-uma-senha-local';
CREATE DATABASE tenebra OWNER tenebra;
```

## Configuração do ambiente

Crie `.env` a partir do exemplo **somente se ainda não existir**:

```sh
cp -n .env.example .env
```

Se já houver `.env`, preserve-o e acrescente/ajuste apenas as variáveis necessárias. Não substitua o arquivo existente: ele pode conter credenciais locais do PostgreSQL. Configure pelo menos:

```dotenv
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://tenebra:sua_senha@localhost:5432/tenebra
OPENROUTER_API_KEY=sua_chave_da_openrouter
OPENROUTER_MODEL=openai/gpt-4o-mini
```

Use sua própria chave OpenRouter. Nunca a coloque em HTML, JavaScript do navegador, commits ou no README. `.env`, `.env.local` e arquivos `.env.*.local` são ignorados pelo Git. `OPENROUTER_MODEL` recebe o identificador `provedor/modelo` escolhido no catálogo da OpenRouter; altere-o no `.env` para trocar o modelo.

## Iniciar o servidor

Os scripts definidos em `package.json` são:

```sh
npm start
```

`npm start` inicia `node --env-file=.env server.js`. Acesse <http://localhost:3000>. Não há script `dev` configurado.

Garanta a conta administrativa `merjin`, armazenada no PostgreSQL, em outro terminal:

```sh
npm run admin:create
```

O comando corrige a função para `admin` se `merjin` já existir, sem alterar a senha atual. Se ainda não existir, solicita a senha inicial em modo oculto e salva apenas o hash scrypt na tabela `users`. Para automação, defina `ADMIN_INITIAL_PASSWORD` no ambiente do processo apenas durante a criação. Faça login em `/login.html` com essa conta. Para criar ou redefinir especificamente `malachais`, use `npm run admin:malachais`; a senha é solicitada sem eco e somente o hash scrypt é salvo. Esse comando altera apenas `malachais`, preservando `merjin`.

Depois que `npm start` tiver aplicado as migrations, importe as referências em modo idempotente com `npm run seed:content`. O processo lê somente os posts do SQLite legado em modo somente leitura; não importa contas. Entradas sem fonte suficiente e dados de teste permanecem em rascunho.

Execute os testes isolados com:

```sh
npm test
```

Os testes cobrem rotas, login, função administrativa, chat, dados do portal, comportamento do seed e mensagens de inicialização PostgreSQL; serviços reais permanecem necessários para importação ponta a ponta. Para os testes ponta a ponta, inicie PostgreSQL e o servidor e use uma chave OpenRouter válida.

Na primeira inicialização, a aplicação aplica as migrations pendentes em ordem e insere vinte registros de exemplo (cinco por categoria). `002_chat_and_roles.sql` adiciona a função dos usuários e o armazenamento das conversas; `003_grimoire.sql` cria páginas categorizadas do Grimório, `004_bestiary.sql` importa criaturas legadas sem duplicá-las, `005_characters.sql` cria fichas privadas, `006_community_chat.sql` adiciona o chat da comunidade e permissões, `007_admin_console.sql` dá suporte ao painel, e `008_events.sql`, `009_regions.sql` e `010_profiles_achievements.sql` adicionam calendário, atlas, perfis e conquistas; `011_lore_imports.sql` amplia categorias do Grimório, vincula importações legadas e marca dados incompletos do Bestiário sem apagar conteúdo. Todas são incrementais e preservam dados existentes. As contas e hashes de senha são mantidos no PostgreSQL; garanta `merjin` com `npm run admin:create`. As próximas inicializações preservam os dados.

### PostgreSQL local não inicia

O servidor web depende do PostgreSQL ativo. Verifique o serviço antes de `npm start`:

- Debian/Ubuntu: `pg_lsclusters`, depois `sudo pg_ctlcluster 17 main start` (ajuste a versão do cluster instalada).
- Windows: inicie o serviço PostgreSQL em Serviços ou com PowerShell elevado: `Start-Service postgresql-x64-17` (ajuste a versão instalada).
- Confirme com `pg_isready` e confira host, porta e nome do banco em `DATABASE_URL`; não divulgue a senha.

## Oráculo de Tenebra

O botão **Consultar o Oráculo** fica no canto inferior da página inicial. O histórico usa um identificador aleatório guardado no navegador e as mensagens são persistidas no PostgreSQL. O navegador envia para `POST /api/chat` e carrega conversas com `GET /api/chat`; o servidor mantém a chave privada e chama a OpenRouter com contexto dos registros publicados. O Oráculo responde em português com voz acolhedora e misteriosa, sem inventar fatos ausentes do arquivo. Erros são apresentados sem expor detalhes da chave ou do provedor.

Configure `OPENROUTER_API_KEY` e `OPENROUTER_MODEL` no `.env`, reinicie o servidor e consulte o Oráculo. Sem a chave, a rota responde que o serviço está indisponível. O modelo pode ser trocado pelo slug correspondente no catálogo/documentação da OpenRouter. A chamada usa a API compatível com chat completions: [documentação oficial da OpenRouter](https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request).

## Funcionalidades do blog

- Página inicial com busca e filtros por Registros, Regiões Não Registradas, Monstros e Outros.
- Busca global classificada por tipo, com resultados apenas de conteúdos publicados.
- Placeholder responsivo em SVG/CSS para publicações sem imagem ou com imagem indisponível.
- Oráculo com conversas persistidas por navegador no PostgreSQL e identificação de autor.
- Grimório com busca, categorias, páginas próprias e edição pelo painel.
- Bestiário com fichas públicas e gestão administrativa.
- Fichas privadas com validação numérica no cliente e servidor e rolador 3d8 no servidor; rolagens autenticadas podem ser guardadas por ficha.
- Chat comunitário autenticado com histórico, polling e moderação.
- Eventos com inscrição limitada por transação e páginas individuais.
- Campanhas gerenciáveis pelo painel, inscrição, diário com controle de visibilidade e linha do tempo de eventos e fatos históricos datados.
- Relações administráveis entre registros do Grimório, criaturas, regiões, eventos, campanhas e fichas, exibidas nas páginas públicas conforme a visibilidade.
- Atlas de regiões, perfis públicos e conquistas concedidas manualmente.
- Páginas individuais por slug em `/registro/slug-do-artigo`.
- Painel editorial em `/login.html` e `/admin.html`: criação, edição, publicação, ocultação e remoção de artigos, mais alteração de senha.
- PostgreSQL com datas de criação/atualização, autoria e imagem opcional.
- Vantagem, desvantagem e Saque Rápido permanecem bloqueados até a documentação da regra oficial; o sistema não presume fórmulas.
- Senhas com scrypt, sessão HttpOnly, token CSRF, bloqueio básico de tentativas, consultas SQL parametrizadas e conteúdo escapado no navegador.

Em produção, sirva o site sob HTTPS e defina `COOKIE_SECURE=1`. Para PostgreSQL com TLS, use `PGSSL=true` e configure a validação de certificado conforme o provedor.

## Estrutura

```text
server.js                 servidor HTTP, APIs, OpenRouter e inicialização
migrations/                esquema PostgreSQL, registros iniciais e upgrades incrementais
index.html                página inicial, filtros e Oráculo
article.html              página-base para artigo individual
login.html / admin.html   login e painel editorial do portal
css/                      identidade visual, responsividade e movimento
js/                       APIs de tela, eventos, mapa, perfis, chat e painel
.env.example              modelo de configuração sem segredo
DESIGN_NOTES.md           recomendações visuais e decisões do chatbot
TEST_REPORT.md            relatório das verificações realizadas
```
