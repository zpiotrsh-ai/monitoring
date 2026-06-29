import { db, ref, onValue } from "../js/firebase.js";

export function start() {
  const dane = ref(db, "rut200/stan_aktualny");

  onValue(dane, (snapshot) => {
    const d = snapshot.val();

    if (!d) {
      document.getElementById("view").innerHTML = "Brak danych";

      return;
    }

    let status = "🟢 ONLINE";

    const wiek = (Date.now() - d.timestamp) / 1000;

    if (wiek > 180) {
      status = "🔴 OFFLINE";
    } else if (wiek > 60) {
      status = "🟡 BRAK AKTUALIZACJI";
    }

    document.getElementById("view").innerHTML = `

<div class="card">

<div class="status">

${status}

</div>

<div class="row">

<span>Termopara</span>

<b>${d.temperatura} °C</b>

</div>

<div class="row">

<span>Podciśnienie</span>

<b>${(d.podcisnienie / 10).toFixed(1).replace(".", ",")} mbar</b>

</div>

<div class="row">

<span>Falownik</span>

<b>${Math.round(d.falownik / 100)} Hz</b>

</div>

<div class="row">

<span>Aktualizacja</span>

<b>${new Date(d.timestamp).toLocaleString("pl-PL")}</b>

</div>

</div>

`;
  });
}

export function pokazWidokPochodni() {
  const view = document.getElementById("view");

  if (!view) return;

  view.innerHTML = `

<div class="panel">

    <h2>🔥 Pochodnia</h2>

    <p>Ładowanie danych...</p>

</div>

`;
}
