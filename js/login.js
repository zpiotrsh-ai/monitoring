export function renderLogin() {
  return `

<div class="login-page">

    <div class="login-card">

        <h1>🔥 Monitoring ZZO Gaz</h1>

      <div class="login-field">

    <input
        id="login-email"
        type="email"
        placeholder="Adres e-mail"
        autocomplete="username"
    >

</div>

<div class="login-field">

    <input
        id="login-password"
        type="password"
        placeholder="Hasło"
        autocomplete="current-password"
    >

    <span id="toggle-password" class="toggle-password">
        👁️
    </span>

</div>

        <button id="login-button">
            Zaloguj
        </button>

        <div id="login-error" class="login-error"></div>

    </div>

</div>

`;
}
