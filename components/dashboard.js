export function renderDashboard() {
  return `
<section class="dashboard">

    <!-- POCHODNIA -->
    <div class="tile" id="tile-pochodnia">

        <div class="tile-icon">🔥</div>

        <div class="tile-title">
            Pochodnia
        </div>

        <div id="flare-status" class="tile-content">

            <div class="tile-value">
                Ładowanie...
            </div>

        </div>

    </div>

    <!-- POMPOWNIE -->
    <div class="tile" id="tile-pompownie">

        <div class="tile-icon">⚙️</div>

        <div class="tile-title">
            Pompownie
        </div>

        <div id="pump-status" class="tile-content">

            Ładowanie...

        </div>

    </div>

    <!-- OCZYSZCZALNIA -->
    <div class="tile" id="tile-oczyszczalnia">

        <div class="tile-icon">💧</div>

        <div class="tile-title">
            Oczyszczalnia
        </div>

        <div id="ocz-status" class="tile-content">

            Ładowanie...

        </div>

    </div>

    <!-- POMIARY -->
    <div class="tile" id="tile-pomiary">

        <div class="tile-icon">🧪</div>

        <div class="tile-title">
            Pomiary
        </div>

        <div id="gas-status" class="tile-content">

            Brak danych

        </div>

    </div>

    <!-- KALENDARZ -->
    <div class="tile" id="tile-kalendarz">

        <div class="tile-icon">📅</div>

        <div class="tile-title">
            Kalendarz
        </div>

        <div id="calendar-status" class="tile-content">

            0 wydarzeń

        </div>

    </div>

    <!-- EC -->
    <div class="tile" id="tile-ec">

        <div class="tile-icon">🏭</div>

        <div class="tile-title">
            EC
        </div>

        <div class="tile-content">

            W budowie

        </div>

    </div>

</section>

<section id="view" class="view">

</section>

`;
}
