"use strict";
const races = [
 {name:"Humano",type:"Raça",file:"/img/racas/humano.png",desc:"Povo versátil e adaptável."},
 {name:"Elfos",type:"Raça",file:"/img/racas/elfos.png",desc:"Povo ligado à natureza e à magia."},
 {name:"Druida",type:"Raça / tradição",file:"/img/racas/druida.png",desc:"Guardiões da natureza e do equilíbrio."},
 {name:"Invocador",type:"Raça / tradição",file:"/img/racas/invocador.png",desc:"Intermediários entre o mundo mortal e o espiritual."},
 {name:"Licantropos",type:"Raça",file:"/img/racas/licantropos.png",desc:"Seres capazes de assumir formas animais."},
 {name:"Fey (Fada)",type:"Raça",file:"/img/racas/fey.png",desc:"Seres feéricos ligados às ilusões e à magia."}
];
const variants = [
 {name:"Elfo Sangrento",type:"Variante",file:"/img/variantes/elfo-sangrento.png",desc:"Linhagem élfica de toque sombrio e magia sanguinária."},
 {name:"Diabrete",type:"Variante",file:"/img/variantes/diabrete.png",desc:"Demônio menor associado a ilusões e travessuras."},
 {name:"Triller",type:"Variante",file:"/img/variantes/triller.png",desc:"Lenhador amaldiçoado que drena a energia da floresta."},
 {name:"Nephalem",type:"Variante",file:"/img/variantes/nephalem.png",desc:"Descendente de humanos e demônios."},
 {name:"Druida Selvagem",type:"Variante",file:"/img/variantes/druida-selvagem.png",desc:"Druida ligado à natureza selvagem e à transformação."},
 {name:"Necromancer",type:"Variante",file:"/img/variantes/necromancer.png",desc:"Praticante da magia da morte e dos mortos-vivos."},
 {name:"Metamorpho",type:"Variante",file:"/img/variantes/metamorpho.png",desc:"Ser capaz de assumir formas de criaturas da floresta."}
];
const organizations = [
 ["Clã dos Espíritos Selvagens","Natural","Dríades e seres da floresta","Protege os bosques e os segredos naturais de Da’kor; busca preservar o ecossistema e a harmonia entre os seres."],
 ["Culto das Profundesas","Caótico","Demônios e seres das trevas","Organização secreta que cultua entidades sombrias, corrompe facções e procura abrir portais para planos infernais."],
 ["Guilda dos Alquimistas","Luminário","Humanos e seres da superfície","Pesquisa minerais e gemas mágicas, cria poções e itens mágicos e atua no comércio e na conversão de moedas."],
 ["Tribo das Montanhas","Neutral","Anões e habitantes das montanhas","Domina mineração, metalurgia e forjaria; protege suas terras e tradições."],
 ["Confraria dos Ancestrais","Independente","Elfos e seres ligados à magia","Estuda astros e energias mágicas para ampliar o conhecimento e equilibrar forças naturais e arcanas."],
 ["Cidade Flutuante de Skyrise","Neutral","Raças diversas","Metrópole flutuante e centro de comércio, diplomacia, aprendizado e convivência entre culturas."],
 ["Ordem da Lua Radiante","Neutral e Caótico","Lupinos e criaturas noturnas","Vigia a noite, protege comunidades e caça criaturas das trevas."]
];
const commands = [
 {name:"Começar a Auxiliar",trigger:"Ativar apoio ao mestre",body:`Você agora vai me auxiliar a mestrar um RPG chamado "Segredo Floresta Adentro". Use as regras de GURPS 4ª Edição e, se necessário, adapte-as ao cenário de horror lovecraftiano e sobrevivência na floresta.

Sinopse: Nas terras de Da’kor, um arquipélago onde luz e escuridão coexistiam, o culto secreto dos Filhos do Caos busca despertar antigas divindades e mergulhar o mundo na escuridão. Uma névoa densa provoca paranoia e alucinações. Em Silvestreon, dois destinados recebem uma mensagem criptografada de Sombranegra e são convocados a descobrir o que foi libertado. Realidade e ilusão se misturam; ainda existe a possibilidade de trazer luz a Da’kor.`},
 {name:"Começar a Narrar",trigger:"Iniciar sessão",body:`Inicie o RPG Segredo Floresta Adentro usando as diretrizes da campanha. Sistema indicado neste comando: GURPS 4ª Edição, rolagens 3d6, testes de habilidade e resistência, modificadores, acertos e falhas críticos. Cenário: Da’kor, Filhos do Caos, névoa, paranoia, alucinações e Silvestreon.

Apresente as opções ao jogador:
1 — Habilidade
2 — Item
3 — Procurar algo
4 — Rolar atributo (Força, Destreza, Inteligência, Vitalidade ou Sanidade)
5 — Outro (aguarde o comando do jogador)

Não misture automaticamente as regras GURPS 4E deste prompt com o sistema próprio 3d8 do portal; confirme qual sistema a sessão está usando.`},
 {name:"Gerar NPC Agressivo (GNA)",trigger:"Quando o mestre digitar GNA",body:`Sempre que eu disser "GNA", repita o processo:
1. Role 3d4; divida a soma por 3 para obter a quantidade de NPCs agressivos.
2. Para cada NPC, role 1d4: 1 Fácil, 2 Moderado, 3 Difícil, 4 Muito Difícil.
3. Faixas de atributos do prompt original: Fácil 5–9; Moderado 8–12; Difícil 10–14; Muito Difícil 18–22 (ST, Sanidade, DX, HT e IQ).
4. Role 2d4 para selecionar uma raça da base de dados (se der 16, use 15).
5. Gere ficha com raça, nome, descrição, dificuldade, ST, Sanidade, DX, HT, IQ, HP, Will, Percepção, Velocidade Básica/Pontos de Ação, Deslocamento, Dodge, habilidades, perícias, desvantagens e vantagens.
Mostre rolagens e fichas, sem texto adicional. Use as raças e recomendações do compêndio original. Se houver conflito entre os intervalos e a matemática do dado, sinalize a inconsistência em vez de inventar uma rolagem válida.`},
 {name:"Gerar Iniciativas",trigger:"Organizar início do combate",body:`Role 1d100 para cada monstro/NPC/animal e 1d100 para cada jogador. Jogadores e tokens indicados no prompt: Urias (ciano), Vih (roxo claro), Bruno (vermelho). Organize todos em uma lista única, em ordem decrescente de iniciativa.

Para NPCs, inclua: nome, iniciativa, pontos de ação por turno, descrição, habilidades, perícias, vantagens e desvantagens. Para jogadores, inclua nome e iniciativa. Atribua cor de token entre vermelho, marrom, ciano, roxo claro, verde e verde escuro. Posição usa grade A–K e 1–9; jogadores começam na linha K. Exiba apenas quantidade/dificuldade das rolagens e a lista de iniciativa.`},
 {name:"Gerar Monstros",trigger:"Criar criaturas para uma região",body:`Gere monstros para Segredo Floresta Adentro usando a base de exemplos do grimório. Distribua as criaturas por dificuldade: Comum (Fácil), Incomum (Moderada), Paranormal (Difícil) e Semi-Divino/Semi-Deuses (Muito Difícil). Cada criatura deve ter nome, descrição e dificuldade. Use o cenário, região e tema solicitados pelo mestre; não transforme exemplos em criaturas canônicas sem confirmação.`},
 {name:"Prompt rápido — Silvestreon",trigger:"Gerar monstros em Silvestreon",body:"Gerar monstros silvestreon"}
];
function card(item){return `<article class="atlas-race-card"><img src="${item.file}" alt="Arte original de ${item.name}" loading="lazy" onerror="this.closest('article').classList.add('image-missing')"><div class="atlas-race-copy"><span class="atlas-tag">${item.type}</span><h4>${item.name}</h4><p>${item.desc}</p></div></article>`;}
document.querySelector("#baseRaces").innerHTML=races.map(card).join("");
document.querySelector("#variantRaces").innerHTML=variants.map(card).join("");
document.querySelector("#organizationEntries").innerHTML=organizations.map(([name,alignment,people,goal])=>`<article class="atlas-org"><span class="atlas-tag">${alignment}</span><h3>${name}</h3><p><strong>Participantes:</strong> ${people}</p><p>${goal}</p></article>`).join("");
document.querySelector("#gptCommands").innerHTML=commands.map((c,i)=>`<article class="atlas-command"><span class="atlas-tag">GPT CMD · ${String(i+1).padStart(2,"0")}</span><h3>${c.name}</h3><p>${c.trigger}</p><details><summary>Ver prompt</summary><pre>${c.body.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}</pre></details><button class="button button-dark atlas-copy" type="button" data-command="${i}">Copiar comando</button></article>`).join("");
document.querySelectorAll(".atlas-copy").forEach(button=>button.addEventListener("click",async()=>{const command=commands[Number(button.dataset.command)];try{await navigator.clipboard.writeText(command.body);button.textContent="Copiado";}catch{button.textContent="Permita acesso à área de transferência";}setTimeout(()=>button.textContent="Copiar comando",2200);}));
