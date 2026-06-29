import {
  firestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "../js/firebase.js";

const POMPOWNIE = ["Pompownia P3", "Pompownia P4", "Pompownia P2.1"];

// tutaj przechowujemy ostatnie dane
let cache = {};

function icon(ok) {
  return ok ? "🟢" : "🔴";
}

function statusOK(d) {
  if (!d) return false;

  return d.auto && d.p1ok && d.p2ok;
}

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

// ----------------------------------------------------
// pobieranie danych z Firestore
// ----------------------------------------------------

export async function startPompownie() {
  const wyniki = await Promise.all(
    POMPOWNIE.map(async (nazwa) => ({
      nazwa,
      dane: await pobierzOstatni(nazwa),
    })),
  );

  cache = {};

  wyniki.forEach((w) => {
    cache[w.nazwa] = w.dane;
  });

  updateTile();
}

// ----------------------------------------------------
// odświeżanie co np. 15 s
// ----------------------------------------------------

export async function refreshPompownie() {
  await startPompownie();
}

// ----------------------------------------------------
// aktualizacja kafelka
// ----------------------------------------------------

function updateTile() {
  const pole = document.getElementById("pump-status");

  if (!pole) return;

  const wszystkieOK = Object.values(cache).every(statusOK);

  pole.innerHTML = `
        <div class="${wszystkieOK ? "ok" : "alarm"}">
            ${wszystkieOK ? "🟢 Wszystkie OK" : "🔴 Alarm"}
        </div>
    `;
}

// ----------------------------------------------------
// panel szczegółów
// ----------------------------------------------------

export function renderPompownie() {
  const view = document.getElementById("view");

  if (!view) return;

  let html = `
<div class="panel">

<h2>💧 Pompownie</h2>
`;

  POMPOWNIE.forEach((nazwa) => {
    const d = cache[nazwa];

    if (!d) {
      html += `
<div class="pump-card">

<h3>⚪ ${nazwa}</h3>

Brak danych

</div>
`;
      return;
    }

    html += `
<div class="pump-card">

<h3>${icon(statusOK(d))} ${nazwa}</h3>

<div class="pump-line">

<span>Pompa 1</span>

<b>${icon(d.p1ok)}</b>

</div>

<div class="pump-line">

<span>Pompa 2</span>

<b>${icon(d.p2ok)}</b>

</div>

<div class="pump-line">

<span>Tryb AUTO</span>

<b>${icon(d.auto)}</b>

</div>
`;

    if (nazwa === "Pompownia P4" && d.flow !== undefined) {
      html += `
<div class="pump-line">

<span>Przepływ</span>

<b>${Number(d.flow).toFixed(1)} m³</b>

</div>
`;
    }

    if (d.datastamp?.seconds) {
      html += `
<div class="pump-time">

${new Date(d.datastamp.seconds * 1000).toLocaleString("pl-PL")}

</div>
`;
    }

    html += `
</div>
`;
  });

  html += `
</div>
`;

  view.innerHTML = html;
}
