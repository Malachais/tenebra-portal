"use strict";

const form = document.querySelector("#loginForm");
const errorBox = document.querySelector("#loginError");
const card = document.querySelector("#loginCard");
const btn = document.querySelector("#loginBtn");

FX.startFireflies(document.querySelector("#fireflies"), 34);

/* já logado? vai direto ao painel */
SFA.get("/api/me").then((user) => location.replace(user.role === "admin" ? "admin.html" : "index.html#chat-comunidade")).catch(() => {});

document.querySelector("#passToggle").addEventListener("click", (e) => {
  const input = document.querySelector("#senha");
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  e.currentTarget.setAttribute("aria-pressed", String(show));
  e.currentTarget.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
});

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = false;
  if (!FX.reduceMotion) {
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.hidden = true;
  btn.disabled = true;
  try {
    const data = await SFA.post("/api/login", {
      username: document.querySelector("#usuario").value.trim(),
      password: document.querySelector("#senha").value
    });
    SFA.setCsrf(data.csrf);
    location.href = data.role === "admin" ? "admin.html" : "index.html#chat-comunidade";
  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
  }
});
