import { db, ref, onValue } from "../js/firebase.js";
import { setView, isView } from "../js/viewManager.js";

let dane = null;

// ===============================
// START
// ===============================

export function startOczyszczalnia() {
  const daneRef = ref(db, "rut200/stan_nodered");

  onValue(daneRef, (snapshot) => {
    dane = snapshot.val();

    aktualizujKafelek();

    if (isView("oczyszczalnia")) {
      render();
    }
  });
}

// ===============================
// KAFELEK
// ===============================

function aktualizujKafelek() {
  const pole = document.getElementById("ocz-status");

  if (!pole) return;

  if (!dane) {
    pole.innerHTML = "Brak danych";
    return;
  }

  pole.innerHTML = `
      <div class="status ok">ONLINE</div>

      <div>${dane.PIRZA16221.toFixed(1)} bar</div>

      <div>Przew. II ${Math.round(dane.NIRZA28021)} µS</div>
  `;
}

// ===============================
// OTWARCIE WIDOKU
// ===============================

export function pokazWidokOczyszczalni() {
  setView("oczyszczalnia");

  render();
}

// ===============================
// RENDER
// ===============================

function render() {
  const view = document.getElementById("view");

  if (!view) return;

  if (!dane) {
    view.innerHTML = `
      <div class="panel">
          <h2>💧 Oczyszczalnia</h2>
          <p>Brak danych...</p>
      </div>
    `;
    return;
  }

  view.innerHTML = `
<div class="panel">

<h2>💧 Oczyszczalnia</h2>

<div class="ocz-grid">

<div class="ocz-column">

<h3>Stopień I</h3>

<div class="ocz-row">
<span>Ciśnienie</span>
<b>${dane.PIRZA16221.toFixed(1)} bar</b>
</div>

<div class="ocz-row">
<span>Przepływ</span>
<b>${dane.FIRCA18021.toFixed(2)} m³/h</b>
</div>

<div class="ocz-row">
<span>Przewodność</span>
<b>${Math.round(dane.NIRZA18021)} µS</b>
</div>

<div class="ocz-row">
<span>DP</span>
<b>${dane.DP.toFixed(1)} bar</b>
</div>

</div>

<div class="ocz-column">

<h3>Stopień II</h3>

<div class="ocz-row">
<span>Ciśnienie</span>
<b>${dane.PIRZA26021.toFixed(1)} bar</b>
</div>

<div class="ocz-row">
<span>Przepływ</span>
<b>${dane.FIRCA28021.toFixed(2)} m³/h</b>
</div>

<div class="ocz-row">
<span>Przewodność</span>
<b>${Math.round(dane.NIRZA28021)} µS</b>
</div>

</div>

</div>

</div>
`;
}
