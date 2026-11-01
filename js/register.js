"use strict";
const form = document.querySelector("#registerForm");
const errorBox = document.querySelector("#registerError");
const button = document.querySelector("#registerButton");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.hidden = true;
  const password = document.querySelector("#registerPassword").value;
  if (password !== document.querySelector("#registerConfirm").value) {
    errorBox.textContent = "As senhas não coincidem.";
    errorBox.hidden = false;
    return;
  }
  button.disabled = true;
  try {
    const data = await SFA.post("/api/register", { username: document.querySelector("#registerUsername").value, password });
    SFA.setCsrf(data.csrf);
    location.replace("index.html#chat-comunidade");
  } catch (error) {
    errorBox.textContent = error.message || "Não foi possível criar a conta.";
    errorBox.hidden = false;
  } finally { button.disabled = false; }
});
