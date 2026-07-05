import {
  firestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "../js/firebase.js";

import { isView } from "../js/viewManager.js";

const lista = ["Pompownia P3", "Pompownia P4", "Pompownia P2.1"];

let pompownie = [];

/* ---------------------------------
   Pobranie ostatniego wpisu
---------------------------------- */

async function pobierzOstatni(nazwa) {
  const q = query(
    collection(firestore, "pomp_history"),
    where("pompownia_ref", "==", nazwa),
    orderBy("data", "desc"),
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

  // Jeżeli użytkownik ogląda pompownie,
  // odśwież również widok szczegółowy.
  if (isView("pompownie")) {
    renderPompownie();
  }
}

/* ---------------------------------
   Dashboard
---------------------------------- */

function odswiezKafelek() {
  const tile = document.getElementById("pump-status");

  if (!tile) return;

  let alarm = 0;

  pompownie.forEach((p) => {
    if (!p.dane || !status(p.dane)) {
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

<div class="pump-container">
`;

  pompownie.forEach((p) => {
    if (!p.dane) {
      html += `
<div class="pump-card">

    <div class="pump-header">

        <div class="pump-title">${p.nazwa}</div>

        <div class="pump-state pump-alarm">
            ⚪ Brak danych
        </div>

    </div>

</div>
`;
      return;
    }

    const ok = status(p.dane);

    let data = "-";

    if (p.dane.data) {
      data =
        typeof p.dane.data.toDate === "function"
          ? p.dane.data.toDate()
          : new Date(p.dane.data);

      data = data.toLocaleString("pl-PL");
    }

    html += `
<div class="pump-card">

<div class="pump-header">

    <div class="pump-title">
        ⚙️ ${p.nazwa}
    </div>

    <div class="pump-state ${ok ? "pump-ok" : "pump-alarm"}">
        ${ok ? "🟢 OK" : "🔴 ALARM"}
    </div>

</div>

<div class="pump-grid">

    <div class="pump-label">Tryb AUTO</div>
    <div class="pump-value">${p.dane.auto ? "TAK" : "NIE"}</div>

    <div class="pump-label">Pompa 1</div>
    <div class="pump-value">${p.dane.p1ok ? "OK" : "AWARIA"}</div>

    <div class="pump-label">Pompa 2</div>
    <div class="pump-value">${p.dane.p2ok ? "OK" : "AWARIA"}</div>
`;

    if (p.dane.flow !== undefined) {
      html += `
    <div class="pump-label">Przepływ</div>
    <div class="pump-value">${Number(p.dane.flow).toLocaleString("pl-PL")} m³</div>
`;
    }

    html += `
    <div class="pump-label">Odczyt</div>
    <div class="pump-value">${data}</div>

</div>

</div>
`;
  });

  html += `
</div>
</div>
`;

  view.innerHTML = html;
}
