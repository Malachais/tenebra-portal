# Seeds do Arquivo Tenebra

## Fontes examinadas

- `migrations/001_initial.sql`: vinte posts iniciais em `records`, incluindo cinco criaturas, cinco regiões, relatos e itens diversos.
- `migrations/004_bestiary.sql`: já importa os posts da categoria `monstros` para `monsters` com `ON CONFLICT (slug) DO NOTHING`; não replique essa importação.
- `data/grimorio.sqlite`: cinco posts no SQLite legado; há quatro textos estruturais/guias e um item `TESTE.404`. O seed importa somente esses posts como rascunhos e não acessa a tabela `users`.
- Demais documentos: requisitos, instalação e design; não contêm biografias nem descrições canônicas dos Véus, culturas, personagens, relíquias ou aventuras citadas.

## Importar

1. Garanta que o PostgreSQL esteja disponível.
2. Execute `npm start` para migrations incrementais.
3. Execute `npm run seed:content`.
4. Revise no painel e publique os rascunhos somente após confirmar o cânone.

A operação usa slugs/títulos/fontes únicos e `ON CONFLICT DO NOTHING`. Repeti-la não substitui páginas já editadas. As regras-base 3d8 e os nomes dos atributos são publicados porque vieram explicitamente do criador; os demais nomes novos permanecem rascunhos. O único dado de mapa publicado é a menção legada de que Da’kor é um arquipélago; não há mapa oficial.
