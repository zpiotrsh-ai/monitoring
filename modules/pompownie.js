import {
  firestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "../js/firebase.js";

const lista = ["Pompownia P3", "Pompownia P4", "Pompownia P2.1"];

let pompownie = [];

/* ---------------------------------
   Pobranie ostatnich wpisów
---------------------------------- */

async function pobierzOstatni(nazwa) {
  const q = query(
    collection(firestore, "pomp_history"),
    where("pompownia_ref", "==", nazwa),
    orderBy("datastamp", "desc"),
    limit(1),
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  return snap.docs[0].data();
}

/* ---------------------------------
   Status pompowni
---------------------------------- */

function status(d) {
  return d.auto && d.p1ok && d.p2ok;
}

/* ---------------------------------
   Start
---------------------------------- */

export async function startPompownie() {
  await refreshPompownie();
}

/* ---------------------------------
   Odświeżenie danych
---------------------------------- */

export async function refreshPompownie() {
  pompownie = await Promise.all(
    lista.map(async (nazwa) => ({
      nazwa,

      dane: await pobierzOstatni(nazwa),
    })),
  );

  odswiezKafelek();
}

/* ---------------------------------
   Dashboard
---------------------------------- */

function odswiezKafelek() {
  const tile = document.getElementById("pump-status");

  if (!tile) return;

  let alarm = 0;

  pompownie.forEach((p) => {
    if (!p.dane) {
      alarm++;

      return;
    }

    if (!status(p.dane)) {
      alarm++;
    }
  });

  if (alarm === 0) {
    tile.innerHTML = `

      <div class="tile-value">
        ${pompownie.length}/${pompownie.length}
      </div>

      <div class="tile-state">
        🟢 Wszystkie OK
      </div>

    `;
  } else {
    tile.innerHTML = `

      <div class="tile-value">
        ${alarm}
      </div>

      <div class="tile-state">
        🔴 Alarm
      </div>

    `;
  }
}

/* ---------------------------------
   Widok szczegółowy
---------------------------------- */

export function renderPompownie() {
  const view = document.getElementById("view");

  if (!view) return;

  let html = `

<div class="panel">

<h2>⚙️ Pompownie</h2>

`;

  pompownie.forEach((p) => {
    if (!p.dane) {
      html += `

<div class="row">

<span>${p.nazwa}</span>

<b>⚪ Brak danych</b>

</div>

`;

      return;
    }

    html += `

<div class="row">

<span>${p.nazwa}</span>

<b>${status(p.dane) ? "🟢 OK" : "🔴 ALARM"}</b>

</div>

<div class="row small">

<span>Pompa 1</span>

<b>${p.dane.p1ok ? "OK" : "Awaria"}</b>

</div>

<div class="row small">

<span>Pompa 2</span>

<b>${p.dane.p2ok ? "OK" : "Awaria"}</b>

</div>

<div class="row small">

<span>Auto</span>

<b>${p.dane.auto ? "Tak" : "Nie"}</b>

</div>

`;

    if (p.dane.flow !== undefined) {
      html += `

<div class="row small">

<span>Przepływ</span>

<b>${Number(p.dane.flow).toFixed(1)} m³/h</b>

</div>

`;
    }

    html += "<hr>";
  });

  html += "</div>";

  view.innerHTML = html;
}
