# Requisitos do Blog Tenebra

## Runtime e pacotes

- Node.js **20.12+** (o projeto usa `fetch`, `AbortSignal.timeout()` e `--env-file`).
- npm compatível com a versão do Node.
- PostgreSQL **14+**, acessível pela `DATABASE_URL`.
- Dependência de produção: `pg` (travada pelo `package-lock.json`). Os testes usam o test runner nativo do Node.
- Chave OpenRouter e identificador de modelo para habilitar o Oráculo. A chave é opcional para o site/painel e obrigatória para respostas do chatbot.

## Configuração

Copie `.env.example` para `.env` somente quando `.env` ainda não existir; se já existir, preserve suas credenciais e edite as variáveis necessárias. Configure `DATABASE_URL`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `PORT` e `NODE_ENV`. As contas administrativas e seus hashes ficam exclusivamente no PostgreSQL.

## Comandos disponíveis

- `npm install`: instala dependências a partir de `package-lock.json`.
- `npm start`: inicia o servidor HTTP e aplica migrations pendentes.
- `npm run admin:create`: garante a conta `merjin` sem redefinir uma senha existente.
- `npm run admin:malachais`: cria ou promove `malachais` e redefine sua senha, solicitada sem eco; não altera `merjin`.
- `npm run seed:content`: importa referências do projeto como conteúdo do Grimório, mantendo material incompleto em rascunho e sem importar contas SQLite. Requer Python 3 e PostgreSQL ativo.
- `npm test`: executa testes simulados de API, autenticação, chat, conteúdo do portal e segurança/idempotência do seed. Os testes isolados não substituem verificações ponta a ponta com serviços reais.
