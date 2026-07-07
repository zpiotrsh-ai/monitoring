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

<span>Pierwszy</span>

<b>${pierwszy.toLocaleString("pl-PL")} m³</b>

</div>

<div>

<span>Ostatni</span>

<b>${ostatni.toLocaleString("pl-PL")} m³</b>

</div>

<div>

<span>Przepływ</span>

<b>${suma.toLocaleString("pl-PL")} m³</b>

</div>

<div>

<span>Średnio / dzień</span>

<b>${srednia.toFixed(1)} m³</b>

</div>

</div>

<div class="flow-chart">

<canvas id="flowChart"></canvas>

</div>

<table class="review-table">

<thead>

<tr>

<th>Data</th>

<th>Licznik</th>

<th>Przyrost</th>

<th>Uwagi</th>

</tr>

</thead>

<tbody>
`;

  for (let i = lista.length - 1; i >= 0; i--) {
    const p = lista[i];

    const data =
      typeof p.data?.toDate === "function" ? p.data.toDate() : new Date(p.data);

    const dataTxt = data.toLocaleDateString("pl-PL");

    const godzina = data.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    let przyrost = "—";

    if (i > 0) {
      przyrost = Number(p.flow) - Number(lista[i - 1].flow);
    }

    html += `

<tr>

<td>

${dataTxt}<br>

<span class="time">

${godzina}

</span>

</td>

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

function rysujWykres(lista) {
  console.log(window.flowChart);
  const canvas = document.getElementById("flowChart");

  if (!canvas) return;

  if (window.flowChart && typeof window.flowChart.destroy === "function") {
    window.flowChart.destroy();
  }

  const labels = [];
  const values = [];

  // przyrost pomiędzy kolejnymi odczytami
  for (let i = 1; i < lista.length; i++) {
    const poprzedni = Number(lista[i - 1].flow);
    const aktualny = Number(lista[i].flow);

    const d =
      typeof lista[i].data?.toDate === "function"
        ? lista[i].data.toDate()
        : new Date(lista[i].data);

    labels.push(
      d.toLocaleDateString("pl-PL") +
        " " +
        d.toLocaleTimeString("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    );

    values.push(aktualny - poprzedni);
  }

  window.flowChart = new Chart(canvas, {
    type: "bar",

    data: {
      labels,

      datasets: [
        {
          label: "Przyrost",

          data: values,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },

        tooltip: {
          callbacks: {
            label: (ctx) =>
              "+" + Number(ctx.raw).toLocaleString("pl-PL") + " m³",
          },
        },
      },

      scales: {
        x: {
          ticks: {
            maxRotation: 90,
            minRotation: 45,
          },
        },

        y: {
          beginAtZero: true,

          title: {
            display: true,

            text: "Przyrost [m³]",
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
