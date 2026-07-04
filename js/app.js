import { renderHeader } from "../components/header.js";
import { renderDashboard } from "../components/dashboard.js";

import {
  start as startPochodnia,
  pokazWidokPochodni,
} from "../modules/pochodnia.js";

import {
  startPompownie,
  refreshPompownie,
  renderPompownie,
} from "../modules/pompownie.js";

import {
  startOczyszczalnia,
  pokazWidokOczyszczalni,
} from "../modules/oczyszczalnia.js";

import { pokazWidokPomiary } from "../modules/pomiary.js";
import { pokazWidokKalendarz } from "../modules/kalendarz.js";

const app = document.getElementById("app");

app.innerHTML = `
    ${renderHeader()}
    ${renderDashboard()}
`;

/* -----------------------------
   Uruchomienie modułów
------------------------------ */

startPochodnia();

// await startPompownie();

startOczyszczalnia();

/* -----------------------------
   Dashboard
------------------------------ */

document
  .getElementById("tile-pochodnia")
  .addEventListener("click", pokazWidokPochodni);

document
  .getElementById("tile-pompownie")
  .addEventListener("click", renderPompownie);

document
  .getElementById("tile-oczyszczalnia")
  .addEventListener("click", pokazWidokOczyszczalni);

document
  .getElementById("tile-pomiary")
  .addEventListener("click", pokazWidokPomiary);

document
  .getElementById("tile-kalendarz")
  .addEventListener("click", pokazWidokKalendarz);

/* -----------------------------
   Timery
------------------------------ */

setInterval(refreshPompownie, 15000);

/* -----------------------------
   Zegar
------------------------------ */

function updateClock() {
  const clock = document.getElementById("clock");

  if (!clock) return;

  clock.textContent = new Date().toLocaleString("pl-PL");
}

updateClock();

setInterval(updateClock, 1000);

/* -----------------------------
   Domyślny ekran
------------------------------ */

pokazWidokPochodni();
