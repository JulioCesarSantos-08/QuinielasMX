import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
getAuth,
GoogleAuthProvider
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
getFirestore
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/*=========================================
CONFIGURACIÓN FIREBASE
=========================================*/

const firebaseConfig = {

apiKey:
"AIzaSyBky5T7wDukelYg3Giq_pXc4oveyfHN7go",

authDomain:
"rifaboletos-c1d0d.firebaseapp.com",

projectId:
"rifaboletos-c1d0d",

storageBucket:
"rifaboletos-c1d0d.appspot.com",

messagingSenderId:
"27051588350",

appId:
"1:27051588350:web:74559bf1d4fd5a67f603af"

};

/*=========================================
INICIALIZAR FIREBASE
=========================================*/

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const googleProvider =
new GoogleAuthProvider();

/*=========================================
CONFIGURACIÓN GOOGLE
=========================================*/

googleProvider.setCustomParameters({

prompt:"select_account"

});

/*=========================================
EXPORTAR
=========================================*/

export {

app,

auth,

db,

googleProvider

};