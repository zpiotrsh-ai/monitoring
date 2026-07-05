import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* ===================================
   LOGOWANIE
=================================== */

export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Zalogowano poprawnie");
    return null;
  } catch (err) {
    return getError(err.code);
  }
}

/* ===================================
   SPRAWDZENIE SESJI
=================================== */

export function checkAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    console.log("AUTH:", user);

    callback(user);
  });
}

/* ===================================
   TŁUMACZENIE BŁĘDÓW
=================================== */

function getError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Niepoprawny adres e-mail.";

    case "auth/user-not-found":
      return "Nie znaleziono użytkownika.";

    case "auth/wrong-password":
      return "Nieprawidłowe hasło.";

    case "auth/invalid-credential":
      return "Nieprawidłowy e-mail lub hasło.";

    case "auth/too-many-requests":
      return "Zbyt wiele prób logowania.";

    default:
      return "Błąd logowania.";
  }
}

/* ===================================
   WYLOGOWANIE
=================================== */

export async function logout() {
  await signOut(auth);
}
