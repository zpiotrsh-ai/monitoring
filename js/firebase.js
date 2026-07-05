import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDWF___qnu6xIVs1r_OMjRd7cWRfGq8tQo",

  authDomain: "zzo-gaz.firebaseapp.com",

  databaseURL: "https://zzo-gaz-default-rtdb.europe-west1.firebasedatabase.app",

  projectId: "zzo-gaz",

  storageBucket: "zzo-gaz.firebasestorage.app",

  messagingSenderId: "618331919683",

  appId: "1:618331919683:web:a9403b326e79bf819b0bf6",
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  ref,
  onValue,
  firestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  auth,
};
