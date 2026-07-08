// gasChart.js

let chart = null;

/* ===================================
   RYSOWANIE
=================================== */

export function rysujGasChart(lista, gaz = "CH4") {
  const canvas = document.getElementById("gasChart");

  if (!canvas) return;

  if (chart && typeof chart.destroy === "function") {
    chart.destroy();
  }

  const labels = lista.map((p) => {
    const d = new Date(p.data);

    return (
      d.toLocaleDateString("pl-PL") +
      " " +
      d.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  });

  const dane = lista.map((p) => Number(p[gaz]));

  chart = new Chart(canvas.getContext("2d"), {
    type: "line",

    data: {
      labels,

      datasets: [
        {
          label: opisGazu(gaz),

          data: dane,

          borderWidth: 2,

          tension: 0.25,

          pointRadius: 2,

          fill: false,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      interaction: {
        mode: "nearest",

        intersect: false,
      },

      plugins: {
        legend: {
          display: true,
        },

        tooltip: {
          callbacks: {
            label(context) {
              return `${opisGazu(gaz)}: ${context.parsed.y}`;
            },
          },
        },
      },

      scales: {
        y: {
          beginAtZero: false,

          ticks: {
            callback(value) {
              return value;
            },
          },
        },

        x: {
          ticks: {
            maxRotation: 45,

            autoSkip: true,

            maxTicksLimit: 12,
          },
        },
      },
    },
  });
}

/* ===================================
   USUNIĘCIE
=================================== */

export function usunGasChart() {
  if (chart && typeof chart.destroy === "function") {
    chart.destroy();

    chart = null;
  }
}

/* ===================================
   OPIS GAZU
=================================== */

function opisGazu(gaz) {
  switch (gaz) {
    case "CH4":
      return "CH₄ [%]";

    case "CO2":
      return "CO₂ [%]";

    case "O2":
      return "O₂ [%]";

    case "H2S":
      return "H₂S [ppm]";

    case "N":
      return "N₂ [%]";

    default:
      return gaz;
  }
}
