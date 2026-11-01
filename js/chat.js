"use strict";
(() => {
  const dialog = document.querySelector("#oracleDialog");
  const openButton = document.querySelector("#oracleOpen");
  const closeButton = document.querySelector("#oracleClose");
  const form = document.querySelector("#oracleForm");
  const input = document.querySelector("#oracleInput");
  const transcript = document.querySelector("#oracleTranscript");
  const errorBox = document.querySelector("#oracleError");
  const sendButton = document.querySelector("#oracleSend");
  const hint = document.querySelector("#oracleHint");
  const history = [];
  const conversationKey = "tenebra-oracle-conversation";
  let conversationId;
  try {
    conversationId = localStorage.getItem(conversationKey);
    if (!conversationId || !/^[0-9a-f-]{36}$/i.test(conversationId)) {
      conversationId = crypto.randomUUID();
      localStorage.setItem(conversationKey, conversationId);
    }
  } catch {
    conversationId = crypto.randomUUID();
  }
  let busy = false;
  let historyLoaded = false;

  function addMessage(role, text, extraClass = "") {
    const message = document.createElement("p");
    message.className = `oracle-message oracle-${role}${extraClass ? ` ${extraClass}` : ""}`;
    const author = document.createElement("strong");
    author.className = "oracle-author";
    author.textContent = role === "user" ? "Você" : "Oráculo de Tenebra";
    const content = document.createElement("span");
    content.textContent = text;
    message.append(author, content);
    transcript.append(message);
    transcript.scrollTop = transcript.scrollHeight;
    return message;
  }

  function setBusy(value) {
    busy = value;
    sendButton.disabled = value;
    input.disabled = value;
    sendButton.innerHTML = value ? 'Consultando <span aria-hidden="true">…</span>' : 'Enviar <span aria-hidden="true">↗</span>';
    hint.textContent = value ? "O Oráculo consulta os arquivos…" : "Até 1.200 caracteres";
    if (value) addMessage("assistant", "O silêncio se move entre as páginas…", "oracle-typing");
    else transcript.querySelector(".oracle-typing")?.remove();
  }

  async function loadHistory() {
    if (historyLoaded || busy) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/chat?conversationId=${encodeURIComponent(conversationId)}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar a conversa salva.");
      for (const item of data.messages || []) {
        if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") continue;
        history.push({ role: item.role, content: item.content });
        addMessage(item.role, item.content);
      }
      historyLoaded = true;
    } catch (error) {
      errorBox.textContent = error.message || "Não foi possível carregar as mensagens salvas.";
      errorBox.hidden = false;
    } finally {
      setBusy(false);
    }
  }

  openButton.addEventListener("click", () => {
    dialog.showModal();
    loadHistory().finally(() => input.focus());
  });
  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  input.addEventListener("input", () => { hint.textContent = `${input.value.length}/1.200 caracteres`; });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (busy || !text || text.length > 1200) return;
    errorBox.hidden = true;
    history.push({ role: "user", content: text });
    addMessage("user", text);
    input.value = "";
    setBusy(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        cache: "no-store",
        body: JSON.stringify({ conversationId, message: text })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "O Oráculo não respondeu. Tente novamente.");
      if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("O Oráculo não encontrou palavras desta vez.");
      history.push({ role: "assistant", content: data.reply });
      addMessage("assistant", data.reply);
    } catch (error) {
      errorBox.textContent = error instanceof TypeError
        ? "Falha de comunicação com o servidor. Verifique se o portal está disponível e tente novamente."
        : error.message || "Oráculo temporariamente indisponível. Tente novamente.";
      errorBox.hidden = false;
      history.pop();
    } finally {
      setBusy(false);
      input.focus();
    }
  });
})();
