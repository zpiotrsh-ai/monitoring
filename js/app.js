import { renderHeader } from "../components/header.js";
import { renderDashboard } from "../components/dashboard.js";

import { renderLogin } from "./login.js";
import { login, checkAuth, logout } from "./auth.js";

import { setView } from "./viewManager.js";

import { start, pokazWidokPochodni } from "../modules/pochodnia.js";

import {
  startOczyszczalnia,
  pokazWidokOczyszczalni,
} from "../modules/oczyszczalnia.js";

import {
  startPompownie,
  refreshPompownie,
  renderPompownie,
} from "../modules/pompownie.js";

import { startPomiary, pokazWidokPomiary } from "../modules/pomiary.js";

import { pokazWidokKalendarz } from "../modules/kalendarz.js";

const app = document.getElementById("app");

/* ===================================
   START
=================================== */

checkAuth((user) => {
  if (user) {
    uruchomAplikacje();
  } else {
    pokazLogowanie();
  }
});

/* ===================================
   LOGOWANIE
=================================== */

function pokazLogowanie() {
  app.innerHTML = renderLogin();

  const password = document.getElementById("login-password");

  document.getElementById("toggle-password").addEventListener("click", () => {
    password.type = password.type === "password" ? "text" : "password";
  });

  const loginEnter = async () => {
    const button = document.getElementById("login-button");

    button.disabled = true;
    button.textContent = "Logowanie...";

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const error = await login(email, password);

    if (error) {
      document.getElementById("login-error").textContent = error;

      button.disabled = false;
      button.textContent = "Zaloguj";
    }
  };

  document.getElementById("login-button").addEventListener("click", loginEnter);

  document.getElementById("login-email").addEventListener("keydown", (e) => {
    if (e.key === "Enter") loginEnter();
  });

  document.getElementById("login-password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") loginEnter();
  });
}

/* ===================================
   APLIKACJA
=================================== */

async function uruchomAplikacje() {
  app.innerHTML = `
        ${renderHeader()}
        ${renderDashboard()}
    `;
  document
    .getElementById("logout-button")
    .addEventListener("click", async () => {
      await logout();
    });
  /* ----- start modułów ----- */

  start();

  startOczyszczalnia();

  await startPompownie();

  await startPomiary();

  /* ----- pochodnia ----- */

  document.getElementById("tile-pochodnia").addEventListener("click", () => {
    setView("pochodnia");

    pokazWidokPochodni();
  });

  /* ----- pompownie ----- */

  document
    .getElementById("tile-pompownie")
    .addEventListener("click", async () => {
      setView("pompownie");

      await refreshPompownie();

      renderPompownie();
    });

  /* ----- oczyszczalnia ----- */

  document
    .getElementById("tile-oczyszczalnia")
    .addEventListener("click", () => {
      setView("oczyszczalnia");

      pokazWidokOczyszczalni();
    });

  /* ----- pomiary ----- */

  document.getElementById("tile-pomiary").addEventListener("click", () => {
    setView("pomiary");

    pokazWidokPomiary();
  });

  /* ----- kalendarz ----- */

  document.getElementById("tile-kalendarz").addEventListener("click", () => {
    setView("kalendarz");

    pokazWidokKalendarz();
  });

  /* ----- auto refresh ----- */

  setInterval(refreshPompownie, 15000);

  /* ----- zegar ----- */

  function updateClock() {
    const clock = document.getElementById("clock");

    if (!clock) return;

    clock.textContent = new Date().toLocaleString("pl-PL");
  }

  updateClock();

  setInterval(updateClock, 1000);
}
