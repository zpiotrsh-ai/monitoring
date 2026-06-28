import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";


const firebaseConfig = {

    apiKey: "TWOJ_API_KEY",

    authDomain: "zzo-gaz.firebaseapp.com",

    databaseURL: "https://zzo-gaz-default-rtdb.europe-west1.firebasedatabase.app",

    projectId: "zzo-gaz",

    storageBucket: "zzo-gaz.firebasestorage.app",

    messagingSenderId: "618331919683",

    appId: "1:618331919683:web:a9403b326e79bf819b0bf6"

};


const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export {ref,onValue};
