import { renderHeader } from "../components/header.js";
import { renderDashboard } from "../components/dashboard.js";

import { setView } from "./viewManager.js";

import { start, pokazWidokPochodni } from "../modules/pochodnia.js";

import {
  startOczyszczalnia,
  pokazWidokOczyszczalni,
} from "../modules/oczyszczalnia.js";

import {
  startPompownie,
  refreshPompownie,
  renderPompownie,
} from "../modules/pompownie.js";

import { startPomiary, pokazWidokPomiary } from "../modules/pomiary.js";

import { pokazWidokKalendarz } from "../modules/kalendarz.js";

import "./test_supabase.js";

const app = document.getElementById("app");

app.innerHTML = `
    ${renderHeader()}
    ${renderDashboard()}
`;

/* ===================================
   Start modułów
=================================== */

start();
startOczyszczalnia();
await startPompownie();
await startPomiary();

/* ===================================
   Pochodnia
=================================== */

document.getElementById("tile-pochodnia").addEventListener("click", () => {
  setView("pochodnia");

  pokazWidokPochodni();
});

/* ===================================
   Pompownie
=================================== */

document
  .getElementById("tile-pompownie")
  .addEventListener("click", async () => {
    setView("pompownie");

    await refreshPompownie();

    renderPompownie();
  });

/* ===================================
   Oczyszczalnia
=================================== */

document.getElementById("tile-oczyszczalnia").addEventListener("click", () => {
  setView("oczyszczalnia");

  pokazWidokOczyszczalni();
});

/* ===================================
   Pomiary
=================================== */

document.getElementById("tile-pomiary").addEventListener("click", () => {
  setView("pomiary");

  pokazWidokPomiary();
});

/* ===================================
   Kalendarz
=================================== */

document.getElementById("tile-kalendarz").addEventListener("click", () => {
  setView("kalendarz");

  pokazWidokKalendarz();
});

/* ===================================
   Auto refresh pompowni
=================================== */

setInterval(refreshPompownie, 15000);

/* ===================================
   Zegar
=================================== */

function updateClock() {
  const clock = document.getElementById("clock");

  if (!clock) return;

  clock.textContent = new Date().toLocaleString("pl-PL");
}

updateClock();

setInterval(updateClock, 1000);
