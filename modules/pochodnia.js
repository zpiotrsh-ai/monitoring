import { db, ref, onValue } from "../js/firebase.js";
import { setView, isView } from "../js/viewManager.js";

let danePochodni = null;

/* ---------------------------------
   Start - nasłuchiwanie RTDB
---------------------------------- */

export function start() {
  const dane = ref(db, "rut200/stan_aktualny");

  onValue(dane, (snapshot) => {
    danePochodni = snapshot.val();

    odswiezKafelek();

    // Odśwież widok tylko jeśli jest aktywny
    if (isView("pochodnia")) {
      render();
    }
  });
}

/* ---------------------------------
   Dashboard
---------------------------------- */

function odswiezKafelek() {
  const tile = document.getElementById("flare-status");

  if (!tile || !danePochodni) return;

  let status = "🟢";

  const wiek = (Date.now() - danePochodni.timestamp) / 1000;

  if (wiek > 180) {
    status = "🔴";
  } else if (wiek > 60) {
    status = "🟡";
  }

  tile.innerHTML = `
    <div class="tile-value">
      ${Math.round(danePochodni.temperatura)} °C
    </div>

    <div class="tile-small">
      ${(danePochodni.podcisnienie / 10).toFixed(1)} mbar
    </div>

    <div class="tile-state">
      ${status}
    </div>
  `;
}

/* ---------------------------------
   Kliknięcie w kafelek
---------------------------------- */

export function pokazWidokPochodni() {
  setView("pochodnia");
  render();
}

/* ---------------------------------
   Render
---------------------------------- */

function render() {
  if (!danePochodni) return;

  const view = document.getElementById("view");

  if (!view) return;

  let status = "🟢 ONLINE";

  const wiek = (Date.now() - danePochodni.timestamp) / 1000;

  if (wiek > 180) {
    status = "🔴 OFFLINE";
  } else if (wiek > 60) {
    status = "🟡 BRAK AKTUALIZACJI";
  }

  view.innerHTML = `
    <div class="panel">

      <h2>🔥 Pochodnia</h2>

      <div class="row">
        <span>Status</span>
        <b>${status}</b>
      </div>

      <div class="row">
        <span>Temperatura</span>
        <b>${Math.round(danePochodni.temperatura)} °C</b>
      </div>

      <div class="row">
        <span>Podciśnienie</span>
        <b>${(danePochodni.podcisnienie / 10).toFixed(1)} mbar</b>
      </div>

      <div class="row">
        <span>Falownik</span>
        <b>${Math.round(danePochodni.falownik / 100)} Hz</b>
      </div>

      <div class="row">
        <span>Aktualizacja</span>
        <b>${new Date(danePochodni.timestamp).toLocaleString("pl-PL")}</b>
      </div>

    </div>
  `;
}
