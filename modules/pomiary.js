import { supabase } from "../js/supabase.js";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

let pomiary = [];
let widokAktywny = false;
let filtrStacja = "";
let filtrKomin = "";
let filtrOd = "";
let filtrDo = "";

/* ===================================
   START
=================================== */

export async function startPomiary() {
  await refreshPomiary();

  setInterval(refreshPomiary, 60000);
}

/* ===================================
   POBRANIE DANYCH
=================================== */

export async function refreshPomiary() {
  const { data, error } = await supabase
    .from("widok_pelne_pomiary")
    .select("*")
    .order("data", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  pomiary = data ?? [];

  odswiezKafelek();

  if (widokAktywny) {
    render();
  }
}

/* ===================================
   DASHBOARD
=================================== */

function odswiezKafelek() {
  const tile = document.getElementById("gas-status");

  if (!tile) return;

  const glowne = ["Generator", "Ssawy", "Surowy"];

  let html = "";

  glowne.forEach((komin) => {
    const p = pomiary.find((x) => x.komin_nazwa === komin);

    if (!p) return;

    html += `
      <div class="measure-line">

        <div class="measure-title">${komin}</div>

        <div class="measure-values">
          CH₄ <b>${Number(p.CH4).toFixed(1)}</b>
          O₂ <b>${Number(p.O2).toFixed(1)}</b>
          H₂S <b>${Number(p.H2S).toFixed(0)}</b>
        </div>

      </div>
    `;
  });

  tile.innerHTML = html;
}

/* ===================================
   POKAŻ WIDOK
=================================== */

export function pokazWidokPomiary() {
  widokAktywny = true;

  render();
}

function pobierzListeFiltrowana() {
  return pomiary
    .filter((p) => {
      const data = new Date(p.data);

      if (filtrOd && data < new Date(filtrOd)) return false;

      if (filtrDo) {
        const d = new Date(filtrDo);
        d.setHours(23, 59, 59, 999);

        if (data > d) return false;
      }

      return true;
    })
    .filter((p) => !filtrStacja || p.stacja_nazwa === filtrStacja)
    .filter((p) => !filtrKomin || p.komin_nazwa === filtrKomin);
}

function eksportExcel() {
  const dane = pobierzListeFiltrowana().map((p) => ({
    Data: new Date(p.data).toLocaleString("pl-PL"),

    Stacja: p.stacja_nazwa,

    Komin: p.komin_nazwa,

    CH4: Number(p.CH4),

    CO2: Number(p.CO2),

    O2: Number(p.O2),

    H2S: Number(p.H2S),

    N2: Number(p.N),

    Zawor: p.zawór,
  }));

  const wb = XLSX.utils.book_new();

  const ws = XLSX.utils.json_to_sheet(dane);

  XLSX.utils.book_append_sheet(wb, ws, "Pomiary");

  XLSX.writeFile(
    wb,
    `Pomiary_gazu_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

/* ===================================
   RENDER
=================================== */

function render() {
  const view = document.getElementById("view");

  if (!view) return;

  const stacje = [...new Set(pomiary.map((p) => p.stacja_nazwa))].sort();

  const daneStacji = filtrStacja
    ? pomiary.filter((p) => p.stacja_nazwa === filtrStacja)
    : pomiary;

  const kominy = [...new Set(daneStacji.map((p) => p.komin_nazwa))].sort();

  let html = `

<div class="panel">

<h2>🧪 Historia pomiarów gazu</h2>

<div class="filters">

<label>

Od

<input
type="date"
id="filtr-od"
value="${filtrOd}">

</label>

<label>

Do

<input
type="date"
id="filtr-do"
value="${filtrDo}">

</label>

<select id="filtr-stacja">

<option value="">Wszystkie stacje</option>
`;

  stacje.forEach((s) => {
    html += `
<option value="${s}" ${filtrStacja === s ? "selected" : ""}>
${s}
</option>
`;
  });

  html += `
</select>

<select id="filtr-komin">

<option value="">Wszystkie kominy</option>
`;

  kominy.forEach((k) => {
    html += `
<option value="${k}" ${filtrKomin === k ? "selected" : ""}>
${k}
</option>
`;
  });

  html += `
</select>

<div style="flex:1"></div>

<button id="pomiary-export">
📥 Excel
</button>

</div>

<table class="measure-table">

<thead>

<tr>

<th>Data</th>
<th>Stacja</th>
<th>Komin</th>
<th>CH₄</th>
<th>CO₂</th>
<th>O₂</th>
<th>H₂S</th>
<th>N₂</th>
<th>Zawór</th>

</tr>

</thead>

<tbody>
`;

  pobierzListeFiltrowana().forEach((p) => {
    html += `

<tr>

<td>${new Date(p.data).toLocaleString("pl-PL")}</td>

<td>${p.stacja_nazwa}</td>

<td>${p.komin_nazwa}</td>

<td>${Number(p.CH4).toFixed(1)}</td>

<td>${Number(p.CO2).toFixed(1)}</td>

<td>${Number(p.O2).toFixed(1)}</td>

<td>${Number(p.H2S).toFixed(0)}</td>

<td>${Number(p.N).toFixed(1)}</td>

<td>${p.zawór}</td>

</tr>

`;
  });

  html += `
</tbody>

</table>

</div>
`;

  view.innerHTML = html;

  document.getElementById("filtr-od").addEventListener("change", (e) => {
    filtrOd = e.target.value;
    render();
  });

  document.getElementById("filtr-do").addEventListener("change", (e) => {
    filtrDo = e.target.value;
    render();
  });

  document.getElementById("filtr-stacja").addEventListener("change", (e) => {
    filtrStacja = e.target.value;

    const kominyDlaStacji = [
      ...new Set(
        pomiary
          .filter((p) => !filtrStacja || p.stacja_nazwa === filtrStacja)
          .map((p) => p.komin_nazwa),
      ),
    ];

    if (!kominyDlaStacji.includes(filtrKomin)) {
      filtrKomin = "";
    }

    render();
  });

  document.getElementById("filtr-komin").addEventListener("change", (e) => {
    filtrKomin = e.target.value;
    render();
  });

  document
    .getElementById("pomiary-export")
    .addEventListener("click", eksportExcel);
}
