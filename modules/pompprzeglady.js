import {
  firestore,
  collection,
  query,
  orderBy,
  getDocs,
} from "../js/firebase.js";
import { setView } from "../js/viewManager.js";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

let historia = [];
let filtrOd = "";
let filtrDo = "";
let filtrPompownia = "";
let listaFiltrowana = [];

/* ===================================
   START
=================================== */

export async function pokazWidokPompPrzeglady() {
  setView("pompprzeglady");
  await pobierzHistorie();
  render();
}

/* ===================================
   FIRESTORE
=================================== */

async function pobierzHistorie() {
  const q = query(
    collection(firestore, "pomp_history"),
    orderBy("data", "desc"),
  );

  const snap = await getDocs(q);

  historia = snap.docs.map((d) => d.data());
}

function pobierzListeFiltrowana() {
  return historia.filter((p) => {
    const data =
      typeof p.data?.toDate === "function" ? p.data.toDate() : new Date(p.data);

    if (filtrOd && data < new Date(filtrOd)) return false;

    if (filtrDo) {
      const d = new Date(filtrDo);
      d.setHours(23, 59, 59, 999);

      if (data > d) return false;
    }

    if (filtrPompownia && p.pompownia_ref !== filtrPompownia) return false;

    return true;
  });
}

/* ===================================
   RENDER
=================================== */

function render() {
  const view = document.getElementById("view");

  const pompownie = [...new Set(historia.map((p) => p.pompownia_ref))].sort();

  let html = `

<div class="panel">

<h2>📋 Historia przeglądów pompowni</h2>

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

<label>

Pompownia

<select id="filtr-pompownia">

<option value="">Wszystkie</option>
`;

  pompownie.forEach((p) => {
    html += `
<option
value="${p}"
${filtrPompownia === p ? "selected" : ""}>

${p}

</option>
`;
  });

  html += `

</select>

</label>

<div style="flex:1"></div>
<button id="review-export">
    📥 Excel
</button>

</div>

<table class="review-table">

<thead>

<tr>

<th>Data</th>

<th>Pompownia</th>

<th>P1</th>

<th>P2</th>

<th>AUTO</th>

<th>FLOW</th>

<th>Uwagi</th>

</tr>

</thead>

<tbody>
`;

  pobierzListeFiltrowana().forEach((p) => {
    const data =
      typeof p.data?.toDate === "function" ? p.data.toDate() : new Date(p.data);

    html += `

<tr>

<td>

${data.toLocaleString("pl-PL")}

</td>

<td>

${p.pompownia_ref}

</td>

<td class="${p.p1ok ? "bool-ok" : "bool-bad"}">

${p.p1ok ? "🟢" : "🔴"}

</td>

<td class="${p.p2ok ? "bool-ok" : "bool-bad"}">

${p.p2ok ? "🟢" : "🔴"}

</td>

<td class="${p.auto ? "bool-ok" : "bool-bad"}">

${p.auto ? "🟢" : "🔴"}

</td>

<td style="text-align:right">

${p.flow !== undefined ? Number(p.flow).toLocaleString("pl-PL") : "—"}

</td>

<td
class="note"
title="${p.uwagi ?? ""}">

${p.uwagi ?? "—"}

</td>

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

  document.getElementById("filtr-pompownia").addEventListener("change", (e) => {
    filtrPompownia = e.target.value;

    render();
  });
  document
    .getElementById("review-export")
    .addEventListener("click", eksportExcel);
}
function eksportExcel() {
  const dane = pobierzListeFiltrowana().map((p) => {
    const data =
      typeof p.data?.toDate === "function" ? p.data.toDate() : new Date(p.data);

    return {
      Data: data.toLocaleString("pl-PL"),

      Pompownia: p.pompownia_ref,

      "Pompa 1": p.p1ok ? "OK" : "AWARIA",

      "Pompa 2": p.p2ok ? "OK" : "AWARIA",

      AUTO: p.auto ? "TAK" : "NIE",

      Przepływ: p.flow ?? "",

      Uwagi: p.uwagi ?? "",
    };
  });

  const wb = XLSX.utils.book_new();

  const ws = XLSX.utils.json_to_sheet(dane);

  XLSX.utils.book_append_sheet(wb, ws, "Przeglądy");

  XLSX.writeFile(
    wb,
    `Historia_przegladow_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}
