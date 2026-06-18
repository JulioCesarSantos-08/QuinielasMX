import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"

import {
getFirestore,
doc,
getDoc,
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"

const firebaseConfig = {
apiKey: "AIzaSyBky5T7wDukelYg3Giq_pXc4oveyfHN7go",
authDomain: "rifaboletos-c1d0d.firebaseapp.com",
projectId: "rifaboletos-c1d0d",
storageBucket: "rifaboletos-c1d0d.appspot.com",
messagingSenderId: "27051588350",
appId: "1:27051588350:web:74559bf1d4fd5a67f603af"
}

const app =
initializeApp(firebaseConfig)

const db =
getFirestore(app)

window.db = db

window.globalState = {}
window.globalSettings = {}
window.userNames = {}
window.currentUser = ""
window.partidosListo = false

window.sanitize = function(user){

return user
.trim()
.toLowerCase()
.replace(/\./g,"_")

}

window.obtenerNombreVisible = function(usuario){

return (
window.userNames?.[usuario]
||
usuario
)

}

async function cargarUsuarios(){

const snap =
await getDocs(
collection(
db,
"usuarios"
)
)

snap.forEach(docu=>{

const data =
docu.data()

const key =
docu.id
.toLowerCase()
.replace(/\./g,"_")

window.userNames[key] =
data.nombre
||
docu.id

})

}

async function init(){

const user =
localStorage.getItem("user")

const nombre =
localStorage.getItem("nombre")

if(!user){

location.href =
"index.html"

return

}

window.currentUser =
window.sanitize(user)

const subtitulo =
document.getElementById(
"subtitulo"
)

if(subtitulo){

subtitulo.textContent =
`Hola ${nombre || user}`

}

await cargarUsuarios()

const settingsSnap =
await getDoc(
doc(
db,
"mundialSorteo",
"settings"
)
)

const stateSnap =
await getDoc(
doc(
db,
"mundialSorteo",
"state"
)
)

if(
!settingsSnap.exists()
||
!stateSnap.exists()
){

return

}

window.globalSettings =
settingsSnap.data()

window.globalState =
stateSnap.data()

window.partidosListo =
true

}

init()