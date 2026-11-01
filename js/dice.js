"use strict";
(() => {
  const form = document.querySelector("#diceForm");
  if (!form) return;
  const result = document.querySelector("#diceResult"), errorBox = document.querySelector("#diceError");
  const button = document.querySelector("#rollButton"), mode = document.querySelector("#diceMode");
  const expression = document.querySelector("#customDiceExpression"), expressionLabel = document.querySelector("#customDiceLabel");
  mode.addEventListener("change", () => {
    const custom = mode.value === "custom";
    expression.hidden = expressionLabel.hidden = !custom;
    document.querySelector("#rollCharacter").disabled = custom;
    button.innerHTML = custom ? "Rolar dados <span>✶</span>" : "Rolar os dados <span>✶</span>";
  });

  function showDice(data, custom) {
    result.replaceChildren();
    if (custom) {
      const expr = document.createElement("p"); expr.textContent = `Expressão: ${data.expression}`;
      const values = document.createElement("p"); values.textContent = `Dados: ${data.dice.join(" | ")}`;
      const sum = document.createElement("p"); sum.textContent = `Soma dos dados: ${data.diceSum}`;
      const modifier = document.createElement("p"); modifier.textContent = `Modificador: ${data.modifier > 0 ? "+" : ""}${data.modifier}`;
      const total = document.createElement("p"); total.className = "dice-total"; total.textContent = `Resultado final: ${data.result}`;
      result.append(expr, values, sum, modifier, total);
      return;
    }
    data.dice.forEach((value, index) => {
      const die = document.createElement("span"); die.className = `die${index === data.discardedIndex ? " discarded" : ""}`;
      die.textContent = String(value); die.setAttribute("aria-label", `Dado ${index + 1}: ${value}${index === data.discardedIndex ? ", descartado" : ", mantido"}`); result.append(die);
    });
    const discarded = document.createElement("p"); discarded.className = "dice-discard"; discarded.textContent = `Descartado: ${data.discarded}`;
    const kept = document.createElement("p"); kept.textContent = `Mantidos: ${data.kept.join(" | ")}`;
    const total = document.createElement("p"); total.className = "dice-total"; total.textContent = `Resultado final: ${data.result}`;
    result.append(discarded, kept, total);
  }

  async function refreshHistory() {
    const history = document.querySelector("#rollHistory");
    try {
      const { rolls } = await SFA.get("/api/me/rolls");
      history.replaceChildren();
      if (!rolls.length) { history.innerHTML = "<li>Nenhuma rolagem registrada ainda.</li>"; return; }
      for (const roll of rolls) { const item = document.createElement("li"); item.textContent = `${new Date(roll.created_at).toLocaleString("pt-BR")} · ${roll.mode === "custom" ? roll.expression : `3d8 ${roll.dice.join(" | ")}`} · resultado ${roll.result}`; history.append(item); }
    } catch { /* Visitantes rolam sem guardar histórico; a API só expõe o do usuário autenticado. */ }
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); button.disabled = true; errorBox.hidden = true;
    result.replaceChildren(Object.assign(document.createElement("p"), { textContent: "Os símbolos giram no pergaminho…" }));
    const custom = mode.value === "custom";
    try {
      const characterId = custom ? null : document.querySelector("#rollCharacter")?.value || null;
      const data = custom ? await SFA.post("/api/roll/custom", { expression: expression.value }) : await SFA.post("/api/roll", { mode: mode.value, character_id: characterId });
      showDice(data, custom); await refreshHistory();
    } catch (error) {
      result.replaceChildren(Object.assign(document.createElement("p"), { textContent: "A rolagem não foi concluída." }));
      errorBox.textContent = error.message || "Não foi possível rolar os dados."; errorBox.hidden = false;
    } finally { button.disabled = false; }
  });
})();
