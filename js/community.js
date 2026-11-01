"use strict";
(() => {
  const messages = document.querySelector("#communityMessages");
  if (!messages) return;
  const status = document.querySelector("#communityStatus");
  const auth = document.querySelector("#communityAuth");
  const form = document.querySelector("#communityForm");
  const input = document.querySelector("#communityInput");
  const errorBox = document.querySelector("#communityError");
  const sendButton = document.querySelector("#communitySend");
  let role = "user";
  let latestId = "0";

  const roleLabels = { user: "Viajante", moderator: "Moderador", admin: "Administrador", editor: "Arquivista" };
  const idIsNewer = (a, b) => BigInt(String(a)) > BigInt(String(b));

  function appendMessage(item) {
    if (messages.querySelector(`[data-id="${CSS.escape(String(item.id))}"]`)) return;
    const row = document.createElement("li");
    row.className = "community-message";
    row.dataset.id = String(item.id);
    const header = document.createElement("header");
    const author = document.createElement("strong");
    author.textContent = item.author;
    const badge = document.createElement("span");
    badge.className = `community-role community-role-${item.role}`;
    badge.textContent = roleLabels[item.role] || "Membro";
    const time = document.createElement("time");
    const date = new Date(item.created_at);
    time.dateTime = date.toISOString();
    time.textContent = date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    header.append(author, badge, time);
    const text = document.createElement("p");
    text.textContent = item.content;
    row.append(header, text);
    if (String(item.user_id) === String(window.communityUserId) || ["admin", "moderator"].includes(role)) {
      const remove = document.createElement("button");
      remove.className = "community-remove";
      remove.type = "button";
      remove.textContent = "Remover";
      remove.setAttribute("aria-label", `Remover mensagem de ${item.author}`);
      remove.addEventListener("click", async () => {
        if (!confirm("Remover esta mensagem do ponto de encontro?")) return;
        try { await SFA.del(`/api/community/messages/${encodeURIComponent(item.id)}`); row.remove(); }
        catch (error) { showError(error.message); }
      });
      row.append(remove);
    }
    messages.append(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function showError(text) { errorBox.textContent = text; errorBox.hidden = false; }

  async function load(initial = false) {
    const query = initial ? "0" : latestId;
    const data = await SFA.get(`/api/community/messages?after=${encodeURIComponent(query)}`);
    for (const item of data.messages) {
      appendMessage(item);
      if (idIsNewer(item.id, latestId)) latestId = String(item.id);
    }
    if (initial) status.textContent = data.messages.length ? "As vozes mais recentes do ponto de encontro." : "Ainda não há mensagens. Deixe a primeira quando estiver pronto.";
    else if (data.messages.length) status.textContent = `${data.messages.length} nova(s) mensagem(ns).`;
  }

  input.addEventListener("input", () => { document.querySelector("#communityCount").textContent = `${input.value.length}/1.000 caracteres`; });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const content = input.value.trim();
    if (!content) { showError("Escreva uma mensagem antes de enviar."); return; }
    sendButton.disabled = true;
    errorBox.hidden = true;
    try {
      const { message } = await SFA.post("/api/community/messages", { content });
      message.user_id = window.communityUserId;
      appendMessage(message);
      latestId = String(message.id);
      input.value = "";
      document.querySelector("#communityCount").textContent = "Até 1.000 caracteres";
    } catch (error) { showError(error.message || "Não foi possível enviar a mensagem."); }
    finally { sendButton.disabled = false; input.focus(); }
  });

  (async () => {
    try {
      const me = await SFA.get("/api/me");
      role = me.role;
      window.communityUserId = me.id;
      SFA.setCsrf(me.csrf);
      auth.hidden = true;
      form.hidden = false;
      await load(true);
      setInterval(() => { if (!document.hidden) load(false).catch((error) => showError(error.message)); }, 5000);
    } catch (error) {
      status.textContent = error.status === 401 ? "Entre na sua conta para carregar o chat da comunidade." : "O ponto de encontro está indisponível.";
    }
  })();
})();
