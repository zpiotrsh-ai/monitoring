export let aktywnyWidok = "pochodnia";

export function ustawWidok(widok) {
  aktywnyWidok = widok;
}

import { renderHeader } from "../components/header.js";
import { renderDashboard } from "../components/dashboard.js";
import { start } from "../modules/pochodnia.js";
import { pokazWidokPochodni } from "../modules/pochodnia.js";
import {
  startPompownie,
  refreshPompownie,
  renderPompownie,
} from "../modules/pompownie.js";

const app = document.getElementById("app");

app.innerHTML = `
    ${renderHeader()}
    ${renderDashboard()}
`;

start();

document
  .getElementById("tile-pochodnia")
  .addEventListener("click", pokazWidokPochodni);

document
  .getElementById("tile-pompownie")
  .addEventListener("click", refreshPompownie);

document
  .getElementById("tile-pompownie")
  .addEventListener("click", renderPompownie);

await startPompownie();

setInterval(refreshPompownie, 15000);

// zegar

function updateClock() {
  const clock = document.getElementById("clock");

  if (clock) {
    clock.textContent = new Date().toLocaleString("pl-PL");
  }
}

updateClock();

setInterval(updateClock, 1000);
