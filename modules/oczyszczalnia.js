import { db, ref, onValue } from "../js/firebase.js";
import { isView } from "../js/viewManager.js";

let dane = null;

/* ---------------------------------
   Start - RTDB
---------------------------------- */

export function startOczyszczalnia() {
  const daneRef = ref(db, "rut200/stan_nodered");

  onValue(daneRef, (snapshot) => {
    dane = snapshot.val();

    odswiezKafelek();

    // Odśwież widok tylko jeśli jest aktywny
    if (isView("oczyszczalnia")) {
      render();
    }
  });
}

/* ---------------------------------
   Dashboard
---------------------------------- */

function odswiezKafelek() {
  const tile = document.getElementById("ocz-status");

  if (!tile || !dane) return;

  tile.innerHTML = `
    <div class="tile-value">
      ${Number(dane.NIRZA28021).toFixed(1)}
    </div>

    <div class="tile-small">
      µS/cm
    </div>

    <div class="tile-state">
      🟢 ONLINE
    </div>
  `;
}

/* ---------------------------------
   Kliknięcie
---------------------------------- */

export function pokazWidokOczyszczalni() {
  render();
}

/* ---------------------------------
   Render
---------------------------------- */

function render() {
  if (!dane) return;

  const view = document.getElementById("view");

  if (!view) return;

  view.innerHTML = `

<div class="panel">

<h2>💧 Oczyszczalnia</h2>

<div class="pump-container">

    <div class="pump-card">

        <div class="pump-header">

            <div class="pump-title">
                I stopień
            </div>

        </div>

        <div class="pump-grid">

    <div class="pump-label">Ciśnienie</div>
<div class="pump-value">${Number(dane.PIRZA16221).toFixed(2).replace(".", ",")} bar</div>

    <div class="pump-label">Przepływ</div>
    <div class="pump-value">${Number(dane.FIRCA18021).toFixed(2)} m³/h</div>

    <div class="pump-label">Przewodność</div>
    <div class="pump-value">${Number(dane.NIRZA18021).toFixed(0)} µS/cm</div>

    <div class="pump-label">ΔP</div>
    <div class="pump-value">${Number(dane.DP).toFixed(2)} bar</div>

</div>

    </div>

    <div class="pump-card">

        <div class="pump-header">

            <div class="pump-title">
                II stopień
            </div>

        </div>

        <div class="pump-grid">

    <div class="pump-label">Ciśnienie</div>
<div class="pump-value">${Number(dane.PIRZA26021).toFixed(2).replace(".", ",")} bar</div>

    <div class="pump-label">Przepływ</div>
    <div class="pump-value">${Number(dane.FIRCA28021).toFixed(2)} m³/h</div>

    <div class="pump-label">Przewodność</div>
    <div class="pump-value">${Number(dane.NIRZA28021).toFixed(0)} µS/cm</div>

</div>

    </div>

</div>

`;
}
