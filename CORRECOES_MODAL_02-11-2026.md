# Correções de interface — 02/11/2026

## O que foi alterado
- Corrigidos os caminhos de CSS, JavaScript e imagens para caminhos absolutos a partir da raiz (`/css`, `/js`, `/img`). Isso evita que rotas limpas como `/personagens/nome` tentem carregar arquivos em `/personagens/css/...`.
- Criado `js/record-modal.js`, uma janela modal compartilhada para personagens públicos, monstros, páginas do Grimório, registros, eventos e regiões.
- A janela fecha pelo botão, clique no fundo ou tecla Esc e mantém um link para abrir a página completa.
- O modal já existente na página inicial para registros foi preservado para evitar duas janelas sobrepostas.
- Adicionados estilos responsivos ao `css/style.css`.

## Verificações executadas
- `node --check js/record-modal.js`
- `node --test test/ui.test.js test/seeds.test.js` — 8 testes passaram.

## Aplicação
Substitua os arquivos do projeto pelos arquivos deste pacote, mantendo seu `.env` local. O pacote não inclui `.env`, `node_modules`, logs ou arquivos temporários SQLite `-wal`/`-shm`. Não execute migrations nem comandos de seed para aplicar esta correção; são alterações de frontend.
