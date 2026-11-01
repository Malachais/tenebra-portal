# Direção visual — Blog Tenebra e Oráculo

## Leitura da interface existente

A página usa papel envelhecido, tons de tinta escura, musgo e ferrugem, ornamentos circulares, símbolos, fontes serifadas e animações de névoa/luzes. Cabeçalho e cards já se adaptam em breakpoints móveis; há suporte a foco visível e movimento reduzido. A proposta preserva a hierarquia, o conteúdo, o menu, a busca, os filtros, o painel e os efeitos já existentes.

## Especificação de design

- Tratar o chatbot como ferramenta auxiliar persistente, com acesso pelo canto inferior sem competir com a navegação.
- Usar botão discreto de tinta escura e selo arcano dourado; o painel deve parecer uma folha do mesmo arquivo, com borda fina, papel claro, contraste de texto e cabeçalho editorial.
- Diferenciar perguntas e respostas com alinhamento e tons sutis, sem depender apenas da cor para comunicar autoria.
- Manter área rolável para o histórico, textarea confortável, envio explícito e Enter para enviar (Shift+Enter mantém nova linha).
- Mostrar estado de consulta, erros legíveis e limite de caracteres. Preservar o histórico enquanto a aba permanecer aberta.
- Em telas pequenas, apresentar o painel como gaveta inferior de largura total, com altura limitada e controles acessíveis. Manter o botão afastado do atalho do Discord.
- Respeitar foco de teclado e `prefers-reduced-motion`; inserir texto recebido com `textContent` para evitar interpretação como HTML.

## Voz do Oráculo

O servidor fornece a instrução de sistema definida no escopo: ajudar a explorar registros, regiões, monstros, histórias e mistérios; manter uma voz clara com atmosfera sombria; admitir quando não há informação suficiente e não inventar fatos do projeto.
