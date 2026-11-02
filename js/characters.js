"use strict";
(() => {
  const list = document.querySelector("#characterEntries");
  if (!list) return;
  const message = document.querySelector("#charactersMessage");
  const dialog = document.querySelector("#characterDialog");
  const form = document.querySelector("#characterForm");
  let characters = [];
  let editingId = null;
  const statusLabels = { draft: "Rascunho", private: "Privada", restricted: "Restrita", public: "Pública" };

  const fields = {
    name: "#characterName", title: "#characterTitle", race: "#characterRace", class_name: "#characterClass", origin: "#characterOrigin", veil: "#characterVeil",
    summary: "#characterSummary", image_url: "#characterImage",
    st: "#characterST", dx: "#characterDX", iq: "#characterIQ", ht: "#characterHT",
    san: "#characterSAN", life: "#characterLife", inventory: "#characterInventory",
    skills: "#characterSkills", backstory: "#characterBackstory"
  };
  const value = (row, key) => row[key] === null || row[key] === undefined ? "" : String(row[key]);
  const displayNumber = SFA.numericDisplay;
  const numericKeys = ["st", "dx", "iq", "ht", "san", "life"];

  function render() {
    message.hidden = characters.length > 0;
    if (!characters.length) { message.textContent = "Você ainda não criou uma ficha."; return; }
    const statLabels = [["ST", "st"], ["DX", "dx"], ["IQ", "iq"], ["HT", "ht"], ["SAN", "san"], ["Vida", "life"]];
    list.innerHTML = characters.map((character) => `<article class="character-card">
      <div class="character-card-head"><p class="card-category">${SFA.esc(character.race)} · ${SFA.esc(character.class_name)}${character.veil ? ` · ${SFA.esc(character.veil)}` : ""}</p><span class="character-status character-status-${SFA.esc(character.status || "private")}">${SFA.esc(statusLabels[character.status] || "Privada")}</span></div>
      <h3>${SFA.esc(character.name)}</h3>
      ${character.title ? `<p class="muted">${SFA.esc(character.title)}</p>` : ""}${character.origin ? `<p><strong>Origem:</strong> ${SFA.esc(character.origin)}</p>` : ""}
      ${character.summary ? `<p class="character-summary">${SFA.esc(character.summary)}</p>` : ""}
      ${SFA.mediaMarkup(character.image_url, `Imagem de ${character.name}`, "character-media")}
      <dl class="character-stats">${statLabels.map(([label, key]) => `<div><dt>${label}</dt><dd>${SFA.esc(displayNumber(character[key]))}</dd></div>`).join("")}</dl>
      <p class="character-history-preview">${SFA.esc(character.backstory || "História ainda não registrada.")}</p>
      <details><summary>Inventário e habilidades</summary><h4>Inventário</h4><p>${SFA.esc(character.inventory || "Sem itens registrados.").replaceAll("\n", "<br>")}</p><h4>Habilidades</h4><p>${SFA.esc(character.skills || "Sem habilidades registradas.").replaceAll("\n", "<br>")}</p></details>
      <div class="character-related" id="characterRelated${character.id}"></div><div class="character-actions">${character.status === "public" && character.slug ? `<a class="btn" href="/personagens/${encodeURIComponent(character.slug)}">Ver página pública ↗</a>` : ""}<button class="btn" type="button" data-character-act="edit" data-id="${character.id}">Editar ficha</button>${["public", "restricted"].includes(character.status) ? "" : `<button class="btn btn-danger" type="button" data-character-act="delete" data-id="${character.id}">Excluir</button>`}</div>
    </article>`).join("");
    characters.forEach(async character => {
      const target = document.querySelector(`#characterRelated${character.id}`);
      if (!target) return;
      try {
        const { links } = await SFA.get(`/api/me/characters/${character.id}/links`);
        if (links.length) target.innerHTML = `<h4>Registros relacionados</h4>${links.map(link => `<a class="related-link" href="${SFA.esc(link.href)}"><span class="card-category">${SFA.esc(link.relation)} · ${SFA.esc(link.kind)}</span><strong>${SFA.esc(link.title)}</strong></a>`).join("")}`;
      } catch { target.hidden = true; }
    });
  }

  async function load() {
    const data = await SFA.get("/api/me/characters");
    characters = data.characters;
    render();
    const selector = document.querySelector("#rollCharacter");
    if (selector) selector.innerHTML = '<option value="">Sem personagem</option>' + characters.map(character => `<option value="${character.id}">${SFA.esc(character.name)}</option>`).join("");
    const history = document.querySelector("#rollHistory");
    if (history) {
      try {
        const { rolls } = await SFA.get("/api/me/rolls");
        history.innerHTML = rolls.length ? rolls.map(roll => `<li>${SFA.esc(new Date(roll.created_at).toLocaleString("pt-BR"))}${roll.character_name ? ` · ${SFA.esc(roll.character_name)}` : ""} · ${SFA.esc(roll.dice.join(" | "))} · resultado ${SFA.esc(roll.result)}</li>`).join("") : "<li>Nenhuma rolagem registrada ainda.</li>";
      } catch { history.innerHTML = "<li>Não foi possível carregar o histórico agora.</li>"; }
    }
  }

  function openEditor(character = null) {
    editingId = character?.id ?? null;
    document.querySelector("#characterDialogTitle").textContent = character ? "Editar ficha" : "Nova personagem";
    for (const [key, selector] of Object.entries(fields)) document.querySelector(selector).value = character ? value(character, key) : "";
    for (const key of numericKeys) { const input = document.querySelector(fields[key]); input.value = character ? value(character, key) : ""; const error = document.querySelector(`#${input.id}Error`); error.textContent = ""; error.hidden = true; }
    const statusSelect = document.querySelector("#characterStatus");
    const statuses = ["draft", "private"];
    if (character && ["public", "restricted"].includes(character.status) && !statuses.includes(character.status)) statuses.push(character.status);
    statusSelect.innerHTML = statuses.map(status => `<option value="${status}">${statusLabels[status]}</option>`).join("");
    statusSelect.value = character?.status && statuses.includes(character.status) ? character.status : "private";
    document.querySelector("#characterVisibleProfile").checked = character?.visible_on_profile === true;
    document.querySelector("#characterError").hidden = true;
    dialog.showModal();
    document.querySelector(fields.name).focus();
  }

  async function initialize() {
    try {
      const user = await SFA.get("/api/me");
      SFA.setCsrf(user.csrf);
      document.querySelector("#newCharacterBtn").hidden = false;
      await load();
    } catch (error) {
      if (error.status === 401) {
        message.innerHTML = 'Acesse sua conta para criar e ver suas fichas. <a class="inline-link" href="login.html">Entrar no arquivo ↗</a>';
        return;
      }
      message.textContent = `Não foi possível carregar suas fichas. ${error.message}`;
    }
  }

  document.querySelector("#newCharacterBtn").addEventListener("click", () => openEditor());
  document.querySelector("#characterClose").addEventListener("click", () => dialog.close());
  document.querySelector("#characterCancel").addEventListener("click", () => dialog.close());
  for (const key of numericKeys) {
    const input = document.querySelector(fields[key]);
    const error = document.querySelector(`#${input.id}Error`);
    input.addEventListener("input", () => {
      const invalid = input.validity.badInput || (input.value !== "" && (!input.validity.valid || !Number.isFinite(input.valueAsNumber)));
      error.textContent = invalid ? "Informe um número entre 0 e 999999999,999, com até três casas decimais." : "";
      error.hidden = !invalid;
    });
  }
  list.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-character-act]");
    if (!button) return;
    const character = characters.find((item) => Number(item.id) === Number(button.dataset.id));
    if (!character) return;
    if (button.dataset.characterAct === "edit") openEditor(character);
    if (button.dataset.characterAct === "delete" && confirm(`Excluir a ficha de “${character.name}”? Esta ação não pode ser desfeita.`)) {
      try { await SFA.del(`/api/me/characters/${character.id}`); await load(); }
      catch (error) { message.hidden = false; message.textContent = `Não foi possível excluir a ficha. ${error.message}`; }
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const invalidInput = numericKeys.map(key => document.querySelector(fields[key])).find(input => input.validity.badInput || (input.value !== "" && (!input.validity.valid || !Number.isFinite(input.valueAsNumber))));
    if (invalidInput) {
      invalidInput.dispatchEvent(new Event("input", { bubbles: true }));
      invalidInput.focus();
      return;
    }
    const payload = Object.fromEntries(Object.entries(fields).map(([key, selector]) => [key, document.querySelector(selector).value]));
    payload.visible_on_profile = document.querySelector("#characterVisibleProfile").checked;
    payload.status = document.querySelector("#characterStatus").value;
    for (const key of ["st", "dx", "iq", "ht", "san", "life"]) payload[key] = payload[key] === "" ? null : Number(payload[key]);
    try {
      if (editingId) await SFA.put(`/api/me/characters/${editingId}`, payload);
      else await SFA.post("/api/me/characters", payload);
      dialog.close();
      await load();
    } catch (error) {
      const box = document.querySelector("#characterError");
      box.textContent = error.message;
      box.hidden = false;
    }
  });

  initialize();
})();
