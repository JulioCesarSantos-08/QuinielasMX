import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"

import {
getFirestore,
doc,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"

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

let clasificados = {}

function obtenerDueño(team){

const state =
window.stateRefData()

const participants =
window.participantsRefData()

for(
const [user,data]
of Object.entries(
state.assignments || {}
)
){

const equipos = [

...(data.buenos || []),

...(data.malos || [])

]

if(
equipos.includes(team)
){

return {

nombre:
participants[user]?.nombre
|| user,

user

}

}

}

return null

}

function crearCardPartido(
equipo1,
equipo2
){

const dueño1 =
obtenerDueño(equipo1)

const dueño2 =
obtenerDueño(equipo2)

return `

<div class="partidoCard">

<div class="vs">

<div>

<div class="equipo">
${equipo1}
</div>

<div class="usuario">

👤 ${
dueño1?.nombre
|| "Sin dueño"
}

</div>

</div>

<div>

VS

</div>

<div>

<div class="equipo">
${equipo2}
</div>

<div class="usuario">

👤 ${
dueño2?.nombre
|| "Sin dueño"
}

</div>

</div>

</div>

</div>

`

}

function renderOctavos(){

const contenedor =
document.getElementById(
"octavosConfirmados"
)

if(!contenedor) return

if(
Object.keys(
clasificados
).length < 4
){

contenedor.innerHTML = `

<div class="empty">

Aún no hay suficientes
clasificados para mostrar
enfrentamientos.

</div>

`

return

}

let html = ""

if(
clasificados.A1 &&
clasificados.B2
){

html += crearCardPartido(
clasificados.A1,
clasificados.B2
)

}

if(
clasificados.B1 &&
clasificados.A2
){

html += crearCardPartido(
clasificados.B1,
clasificados.A2
)

}

if(
clasificados.C1 &&
clasificados.D2
){

html += crearCardPartido(
clasificados.C1,
clasificados.D2
)

}

if(
clasificados.D1 &&
clasificados.C2
){

html += crearCardPartido(
clasificados.D1,
clasificados.C2
)

}

if(
clasificados.E1 &&
clasificados.F2
){

html += crearCardPartido(
clasificados.E1,
clasificados.F2
)

}

if(
clasificados.F1 &&
clasificados.E2
){

html += crearCardPartido(
clasificados.F1,
clasificados.E2
)

}

if(
clasificados.G1 &&
clasificados.H2
){

html += crearCardPartido(
clasificados.G1,
clasificados.H2
)

}

if(
clasificados.H1 &&
clasificados.G2
){

html += crearCardPartido(
clasificados.H1,
clasificados.G2
)

}

if(
clasificados.I1 &&
clasificados.J2
){

html += crearCardPartido(
clasificados.I1,
clasificados.J2
)

}

if(
clasificados.J1 &&
clasificados.I2
){

html += crearCardPartido(
clasificados.J1,
clasificados.I2
)

}

if(
clasificados.K1 &&
clasificados.L2
){

html += crearCardPartido(
clasificados.K1,
clasificados.L2
)

}

if(
clasificados.L1 &&
clasificados.K2
){

html += crearCardPartido(
clasificados.L1,
clasificados.K2
)

}

contenedor.innerHTML =
html

}

function renderLlaveSimple(){

const contenedor =
document.getElementById(
"llaves"
)

if(!contenedor) return

let html = `

<div class="grupoCard">

<div class="grupoTitulo">

🏆 Eliminación Directa

</div>

<div class="usuario">

Los cruces se generan
automáticamente conforme
se registran clasificados.

</div>

</div>

`

contenedor.innerHTML =
html

}

function esperarSistema(){

if(
!window.stateRefData
||
!window.participantsRefData
){

setTimeout(
esperarSistema,
500
)

return

}

renderOctavos()

renderLlaveSimple()

}

const clasificadosRef =
doc(
db,
"mundialSorteo",
"clasificados"
)

onSnapshot(
clasificadosRef,
snap=>{

if(
!snap.exists()
){

clasificados = {}

renderOctavos()

return

}

clasificados =
snap.data()

renderOctavos()

}
)

esperarSistema()