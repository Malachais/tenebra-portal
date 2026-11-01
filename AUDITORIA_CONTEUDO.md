# Auditoria interna de conteúdo — 1 nov. 2026

Este inventário foi preparado antes de qualquer nova importação. Nenhuma conta do SQLite foi consultada ou importada. Os seeds usam inserções condicionais e conflitos por slug/fonte; não removem nem substituem páginas existentes.

## Fontes verificadas

- `migrations/001_initial.sql`: 20 registros narrativos de exemplo, dos quais 5 são criaturas, 5 regiões, 5 relatos e 5 itens/outros.
- `migrations/004_bestiary.sql`: migração pré-existente das 5 criaturas para `monsters`, sem duplicação por slug.
- `migrations/009_regions.sql` e `011_lore_imports.sql`: regiões legadas e registros já existentes são relacionados/importados de modo incremental.
- `data/grimorio.sqlite`: 5 posts. Quatro são páginas-guia (Cosmologia & mundo, Habitantes da penumbra, Terras não mapeadas e Diários de expedição); `TESTE.404` é conteúdo de teste. A exportação lê somente `records` em modo somente leitura.
- `seeds/lore.js`: lista nomes fornecidos sem descrição (Malachais, Merjin, O Inominável, sete Véus, Druida/Druida Selvagem, povos, Cálice de Nefalem e Circo de Klaus) como rascunhos; publica somente regras e atributos explicitamente documentados. Da'kor aparece no legado apenas como arquipélago.
- `README.md`, `REQUIREMENTS.md`, `TEST_REPORT.md` e código: regras da ficha, controles de acesso, eventos e rolagem. Não foi encontrada ficha de personagem de lore nem regra canônica de vantagem, desvantagem ou Saque Rápido.

## Organização e decisão de importação

| Conteúdo | Evidência encontrada | Tratamento |
|---|---|---|
| Fichas de personagens | Nenhuma ficha narrativa nos arquivos/SQLite | Não criar fichas inventadas; fichas de jogador permanecem privadas e vinculadas à conta |
| Grimório | 20 registros SQL iniciais + 5 posts SQLite | Migrações 003/011 e seed idempotente existentes; posts SQLite entram como rascunhos |
| Personagens/entidades | Apenas nomes no pedido e listas do seed | Entradas próprias em rascunho, separadas das contas |
| Criaturas | 5 descrições completas em `001_initial.sql` | Migração 004 já cria Bestiário; não duplicar via novo seed |
| Regiões | 5 descrições em `001_initial.sql`; Da'kor citado no índice SQLite | Regiões legadas ligadas em 011; Da'kor com afirmação restrita à fonte |
| Relíquias | Chave de Osso Negro no SQL; Cálice de Nefalem apenas como nome | Chave mantida no registro legado; Cálice em rascunho |
| Regras | 3d8 normal e rótulos ST/DX/IQ/HT/SAN fornecidos | Páginas publicadas; sem fórmulas derivadas presumidas |
| Aventuras/eventos | Circo de Klaus apenas como nome | Rascunho; não há data/evento concreto para cadastrar no calendário |

## Estado operacional observado

Em 1 nov. 2026, `pg_isready` não encontrou serviço em `/var/run/postgresql:5432`. `npm start` foi tentado, mas o sandbox retornou `EPERM` antes de aplicar migrations ou abrir o servidor. Portanto a quantidade real de registros atualmente no banco e a aplicação do seed não puderam ser verificadas nesta execução.
