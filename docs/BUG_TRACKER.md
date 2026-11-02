# Rastreador de bugs

Atualizado em 02/11/2026. Estados refletem a evidência acessível nesta sessão.

| ID | Prioridade | Descrição | Sistema | Arquivos | Dependências | Status |
|---|---|---|---|---|---|---|
| BUG-REG-001 | P1 | Clique em “Ler registro” seguia a rota individual porque o render emitia um `<a>` normal, mas a inicialização tentava ligar handlers a `.open-record`, ausente no HTML gerado. | Registros | `js/script.js`, `index.html`, `css/style.css` | Nenhuma | REVIEW — corrigido; falta validação interativa em navegador |
| BUG-REG-002 | P2 | A experiência de modal ainda precisa de confirmação em desktop/mobile quanto a rolagem do documento, foco de retorno, overlay e troca rápida de registros. Não foi reproduzido visualmente nesta sessão. | Registros / acessibilidade | `js/script.js`, `index.html`, `css/style.css` | Navegador disponível | READY |
| BUG-OPS-001 | P2 | Estado atual de conexão PostgreSQL e aplicação de migrations não foi verificado nesta sessão. Histórico anterior registra bloqueio do serviço em outra validação. | Inicialização / banco | `server.js`, migrations | Serviço PostgreSQL acessível | READY |

Não foram identificados outros bugs reproduzíveis além do problema de abertura. Itens não cobertos por teste/browser não devem ser interpretados como ausência de bugs.
