import {
  firestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "../js/firebase.js";
import { setView } from "../js/viewManager.js";

let historia = [];
let filtrOd = "";
let filtrDo = "";

/* ===================================
   START
=================================== */

export async function pokazWidokPompPrzeplyw() {
  setView("pompprzeplyw");
  await pobierz();
  render();
}

/* ===================================
   FIRESTORE
=================================== */

async function pobierz() {
  const q = query(
    collection(firestore, "pomp_history"),
    where("pompownia_ref", "==", "Pompownia P4"),
    orderBy("data", "asc"),
  );

  const snap = await getDocs(q);

  historia = snap.docs.map((d) => d.data());
}

/* ===================================
   Render
=================================== */

function render() {
  const view = document.getElementById("view");

  if (!view) return;

  const lista = historia.filter((p) => {
    const d =
      typeof p.data?.toDate === "function" ? p.data.toDate() : new Date(p.data);

    if (filtrOd && d < new Date(filtrOd)) return false;

    if (filtrDo) {
      const x = new Date(filtrDo);
      x.setHours(23, 59, 59, 999);

      if (d > x) return false;
    }

    return true;
  });

  if (lista.length === 0) {
    view.innerHTML = `
<div class="panel">
<h2>🌊 Przepływ pompowni P4</h2>
Brak danych.
</div>`;
    return;
  }

  const pierwszy = Number(lista[0].flow);
  const ostatni = Number(lista.at(-1).flow);
  const suma = ostatni - pierwszy;

  const dataStart =
    typeof lista[0].data?.toDate === "function"
      ? lista[0].data.toDate()
      : new Date(lista[0].data);

  const dataStop =
    typeof lista.at(-1).data?.toDate === "function"
      ? lista.at(-1).data.toDate()
      : new Date(lista.at(-1).data);

  const dni = Math.max(1, (dataStop - dataStart) / 86400000);

  const srednia = suma / dni;

  const dobowe = obliczDobowePrzeplywy(lista);

  const values = Object.values(dobowe);

  const minDobowy = values.length ? Math.min(...values) : 0;

  const maxDobowy = values.length ? Math.max(...values) : 0;

  const avgDobowy = values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;

  let html = `
<div class="panel">

<h2>🌊 Historia przepływu pompowni P4</h2>

<div class="filters">

<label>

Od

<input
type="date"
id="flow-od"
value="${filtrOd}">

</label>

<label>

Do

<input
type="date"
id="flow-do"
value="${filtrDo}">

</label>

<div style="flex:1"></div>

<button id="flow-export">

📥 Excel

</button>

</div>

<div class="flow-summary">

<div>

<span>Pierwszy:</span>

<b>${pierwszy.toLocaleString("pl-PL")} m³</b>

</div>

<div>

<span>Ostatni:</span>

<b>${ostatni.toLocaleString("pl-PL")} m³</b>

</div>

<div>

<span>Przepływ:</span>

<b>${suma.toLocaleString("pl-PL")} m³</b>

</div>

<div>

<span>Średnio/dzień:</span>

<b>${avgDobowy.toFixed(1)} m³</b>

</div>

<div>

<span>Minimum:</span>

<b>${minDobowy.toLocaleString("pl-PL")} m³</b>

</div>

<div>

<span>Maksimum:</span>

<b>${maxDobowy.toLocaleString("pl-PL")} m³</b>

</div>

</div>

<div class="flow-chart">

<canvas id="flowChart"></canvas>

</div>

<table class="review-table">

<thead>

<tr>

<th>Data</th>

<th class="num">Licznik</th>

<th class="num">Przyrost</th>

<th>Uwagi</th>

</tr>

</thead>

<tbody>
`;

  for (let i = lista.length - 1; i >= 0; i--) {
    const p = lista[i];

    const data =
      typeof p.data?.toDate === "function" ? p.data.toDate() : new Date(p.data);

    const dataTxt = data.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    let przyrost = "—";

    if (i > 0) {
      przyrost = Number(p.flow) - Number(lista[i - 1].flow);
    }

    html += `

<tr>

<td>${dataTxt}</td>

<td style="text-align:right">

${Number(p.flow).toLocaleString("pl-PL")} m³

</td>

<td style="text-align:right">

${przyrost === "—" ? "—" : "+" + przyrost.toLocaleString("pl-PL") + " m³"}

</td>

<td
class="note"
title="${p.uwagi ?? ""}">

${p.uwagi ?? "—"}

</td>

</tr>
`;
  }

  html += `

</tbody>

</table>

</div>
`;

  view.innerHTML = html;

  rysujWykres(lista);

  document.getElementById("flow-od").addEventListener("change", (e) => {
    filtrOd = e.target.value;
    render();
  });

  document.getElementById("flow-do").addEventListener("change", (e) => {
    filtrDo = e.target.value;
    render();
  });

  document
    .getElementById("flow-export")
    .addEventListener("click", eksportExcel);
}

/* ===================================
   Dobowe przepływy (ważone czasem)
=================================== */

function obliczDobowePrzeplywy(lista) {
  const dni = {};

  if (!lista || lista.length < 2) return dni;

  for (let i = 0; i < lista.length - 1; i++) {
    const a = lista[i];
    const b = lista[i + 1];

    const start =
      typeof a.data?.toDate === "function" ? a.data.toDate() : new Date(a.data);

    const stop =
      typeof b.data?.toDate === "function" ? b.data.toDate() : new Date(b.data);

    const deltaFlow = Number(b.flow) - Number(a.flow);

    const deltaMs = stop - start;

    if (deltaMs <= 0) continue;

    const flowPerMs = deltaFlow / deltaMs;

    let aktualny = new Date(start);

    while (aktualny < stop) {
      const koniecDoby = new Date(aktualny);

      koniecDoby.setHours(24, 0, 0, 0);

      const fragmentStop = koniecDoby < stop ? koniecDoby : stop;

      const fragmentMs = fragmentStop - aktualny;

      const fragmentFlow = flowPerMs * fragmentMs;

      const klucz =
        aktualny.getFullYear() +
        "-" +
        String(aktualny.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(aktualny.getDate()).padStart(2, "0");

      dni[klucz] = (dni[klucz] || 0) + fragmentFlow;

      aktualny = fragmentStop;
    }
  }

  // usunięcie pierwszej i ostatniej niepełnej doby

  const daty = Object.keys(dni).sort();

  if (daty.length > 2) {
    delete dni[daty[0]];
    delete dni[daty[daty.length - 1]];
  }

  Object.keys(dni).forEach((d) => {
    dni[d] = Math.round(dni[d]);
  });

  return dni;
}

/* ===================================
   Średnia krocząca
=================================== */

function sredniaKroczaca(values, okno = 7) {
  const wynik = [];

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - okno + 1);

    let suma = 0;

    for (let j = start; j <= i; j++) {
      suma += values[j];
    }

    wynik.push(Math.round(suma / (i - start + 1)));
  }

  return wynik;
}

function rysujWykres(lista) {
  const canvas = document.getElementById("flowChart");

  if (!canvas) return;

  if (window.flowChart && typeof window.flowChart.destroy === "function") {
    window.flowChart.destroy();
  }

  const dobowe = obliczDobowePrzeplywy(lista);

  const labels = Object.keys(dobowe).map((d) => {
    const [r, m, dz] = d.split("-");
    return `${dz}.${m}`;
  });

  const values = Object.values(dobowe);

  const avg7 = sredniaKroczaca(values, 7);

  const sredniaOkresu = values.reduce((suma, v) => suma + v, 0) / values.length;

  const avgAll = values.map(() => sredniaOkresu);

  window.flowChart = new Chart(canvas, {
    data: {
      labels,

      datasets: [
        {
          type: "bar",
          label: "Dobowy przepływ",

          data: values,

          order: 2,
        },

        {
          type: "line",
          label: "Średnia 7 dni",

          data: avg7,

          tension: 0.3,

          pointRadius: 0,

          borderWidth: 2,

          fill: false,

          order: 1,
        },

        {
          type: "line",

          label: "Średnia okresu",

          data: avgAll,

          borderDash: [8, 6],

          pointRadius: 0,

          borderWidth: 2,

          tension: 0,

          fill: false,

          order: 0,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      interaction: {
        mode: "index",
        intersect: false,
      },

      plugins: {
        legend: {
          display: true,
        },

        tooltip: {
          callbacks: {
            label(ctx) {
              return (
                ctx.dataset.label +
                ": " +
                Number(ctx.raw).toLocaleString("pl-PL") +
                " m³"
              );
            },
          },
        },
      },

      scales: {
        x: {
          ticks: {
            maxRotation: 0,
          },
        },

        y: {
          beginAtZero: true,

          title: {
            display: true,

            text: "m³ / dobę",
          },
        },
      },
    },
  });
}

function listaDoEksportu() {
  return historia.filter((p) => {
    const d =
      typeof p.data?.toDate === "function" ? p.data.toDate() : new Date(p.data);

    if (filtrOd && d < new Date(filtrOd)) return false;

    if (filtrDo) {
      const x = new Date(filtrDo);

      x.setHours(23, 59, 59, 999);

      if (d > x) return false;
    }

    return true;
  });
}

function eksportExcel() {
  const dane = [];

  let poprzedni = null;

  listaDoEksportu().forEach((p) => {
    const data =
      typeof p.data?.toDate === "function" ? p.data.toDate() : new Date(p.data);

    const licznik = Number(p.flow);

    let przyrost = "";

    if (poprzedni !== null) {
      przyrost = licznik - poprzedni;
    }

    poprzedni = licznik;

    dane.push({
      Data: data.toLocaleString("pl-PL"),

      Licznik: licznik,

      Przyrost: przyrost,

      Uwagi: p.uwagi ?? "",
    });
  });

  const wb = XLSX.utils.book_new();

  const ws = XLSX.utils.json_to_sheet(dane);

  XLSX.utils.book_append_sheet(wb, ws, "Przepływ P4");

  XLSX.writeFile(
    wb,
    `Przeplyw_P4_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}
