export function renderDashboard() {
  return `

<section class="dashboard">

    <div class="tile" id="tile-pochodnia">

        <div class="icon">🔥</div>

        <h2>Pochodnia</h2>

        <p>Online</p>

    </div>

    <div class="tile" id="tile-pompownie">

        <span class="material-symbols-outlined icon">
            settings
        </span>

        <h2>Pompownie</h2>

        <div id="pump-status">

            Ładowanie...

        </div>

    </div>

    <div class="tile" id="tile-oczyszczalnia">

        <div class="icon">💧</div>

        <h2>Oczyszczalnia</h2>

        <p>Wkrótce...</p>

    </div>

    <div class="tile" id="tile-elektro">

        <div class="icon">🏭</div>

        <h2>Elektrociepłownia</h2>

        <p>Wkrótce...</p>

    </div>

</section>

<div id="view"></div>

`;
}
