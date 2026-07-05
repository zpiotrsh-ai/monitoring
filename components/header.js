import { auth } from "../js/firebase.js";

export function renderHeader() {
  const email = auth.currentUser?.email ?? "";

  return `
<header class="header">

    <div>

        <h1>Monitoring ZZO Gaz</h1>

        <p>System wizualizacji instalacji</p>

    </div>

    <div class="header-right">

        <div class="user-info">

            👤 ${email}

        </div>

        <div id="clock"></div>

        <button id="logout-button" class="logout-btn">

            🚪 Wyloguj

        </button>

    </div>

</header>
`;
}
