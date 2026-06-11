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

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

let currentUser = null
let participants = {}
let state = {}

const GRUPOS = {

A:[
"Mexico",
"Sudafrica",
"Corea del Sur",
"Republica Checa"
],

B:[
"Canada",
"Bosnia y Herzegovina",
"Catar",
"Suiza"
],

C:[
"Brasil",
"Marruecos",
"Haiti",
"Escocia"
],

D:[
"Estados Unidos",
"Paraguay",
"Australia",
"Turquia"
],

E:[
"Alemania",
"Curazao",
"Costa de Marfil",
"Ecuador"
],

F:[
"Paises Bajos",
"Japon",
"Suecia",
"Tunez"
],

G:[
"Belgica",
"Egipto",
"Iran",
"Nueva Zelanda"
],

H:[
"España",
"Cabo Verde",
"Arabia Saudita",
"Uruguay"
],

I:[
"Francia",
"Senegal",
"Irak",
"Noruega"
],

J:[
"Argentina",
"Argelia",
"Austria",
"Jordania"
],

K:[
"Portugal",
"El Congo",
"Uzbekistan",
"Colombia"
],

L:[
"Inglaterra",
"Croacia",
"Ghana",
"Panama"
]

}

function sanitize(user){

  return user
  .trim()
  .toLowerCase()
  .replace(/\./g,"_")

}

function checkSession(){

  const user =
  localStorage.getItem("user")

  const nombre =
  localStorage.getItem("nombre")

  if(!user){

    location.href =
    "index.html"

    return false

  }

  currentUser =
  sanitize(user)

  document.getElementById(
    "saludo"
  ).textContent =
  `Hola ${nombre || user}`

  return true

}

function obtenerDueñoEquipo(team){

  for(const [user,data] of Object.entries(
    state.assignments || {}
  )){

    const equipos = [

      ...(data.buenos || []),

      ...(data.malos || [])

    ]

    if(
      equipos.includes(team)
    ){

      return {
        user,
        nombre:
        participants[user]?.nombre
        || user
      }

    }

  }

  return null

}

function buscarGrupo(team){

  for(
    const [grupo,equipos]
    of Object.entries(GRUPOS)
  ){

    if(
      equipos.includes(team)
    ){

      return grupo

    }

  }

  return null

}

function renderMisEquipos(){

  const contenedor =
  document.getElementById(
    "misEquipos"
  )

  const asignacion =
  state.assignments?.[
    currentUser
  ]

  if(!asignacion){

    contenedor.innerHTML = `
      <div class="empty">
        No participas actualmente
      </div>
    `
    return
  }

  const equipos = [

    ...(asignacion.buenos || []),

    ...(asignacion.malos || [])

  ]

  let html = ""

  equipos.forEach(team=>{

    const grupo =
    buscarGrupo(team)

    const status =
    state.teamStatus?.[team]
    || "activo"

    html += `

      <div class="miEquipoCard">

        <div class="equipoNombre">
          ${team}
        </div>

        <div class="equipoPais">
          Grupo ${grupo || "-"}
        </div>

        <div class="${
          status==="activo"
          ? "estadoVivo"
          : "estadoMuerto"
        }">

          ${
            status==="activo"
            ? "🟢 Vivo"
            : "🔴 Eliminado"
          }

        </div>

      </div>

    `

  })

  contenedor.innerHTML =
  html

}

function renderMisRivales(){

  const contenedor =
  document.getElementById(
    "misRivales"
  )

  const asignacion =
  state.assignments?.[
    currentUser
  ]

  if(!asignacion){

    contenedor.innerHTML =
    `
      <div class="empty">
        Sin rivales
      </div>
    `
    return
  }

  const equiposUsuario = [

    ...(asignacion.buenos || []),

    ...(asignacion.malos || [])

  ]

  const gruposUsuario =
  equiposUsuario.map(
    buscarGrupo
  )

  let html = ""

  gruposUsuario.forEach(grupo=>{

    if(!grupo) return

    html += `
      <div class="grupoCard">

        <div class="grupoTitulo">
          Grupo ${grupo}
        </div>
    `

    GRUPOS[grupo].forEach(team=>{

      const dueño =
      obtenerDueñoEquipo(team)

      html += `
        <div class="integrante">

          <div class="integranteInfo">

            <div class="usuario">
              ${
                dueño?.nombre
                || "Sin dueño"
              }
            </div>

            <div class="equipo">
              ${team}
            </div>

          </div>

        </div>
      `

    })

    html += `</div>`

  })

  contenedor.innerHTML =
  html

}

function renderMiGrupo(){

  const contenedor =
  document.getElementById(
    "miGrupo"
  )

  const asignacion =
  state.assignments?.[
    currentUser
  ]

  if(!asignacion){

    contenedor.innerHTML =
    `
      <div class="empty">
        Sin grupo
      </div>
    `
    return
  }

  const primerEquipo =
  (
    asignacion.buenos?.[0]
    ||
    asignacion.malos?.[0]
  )

  const grupo =
  buscarGrupo(
    primerEquipo
  )

  if(!grupo){

    contenedor.innerHTML =
    `
      <div class="empty">
        Grupo no encontrado
      </div>
    `
    return
  }

  let html =
  `<div class="tablaGrupo">`

  GRUPOS[grupo].forEach((team,index)=>{

    const dueño =
    obtenerDueñoEquipo(team)

    html += `

      <div class="posicion">

        <div class="numeroPosicion">
          ${index+1}
        </div>

        <div>

          <div class="usuario">
            ${
              dueño?.nombre
              || "Sin dueño"
            }
          </div>

          <div class="equipo">
            ${team}
          </div>

        </div>

      </div>

    `

  })

  html += "</div>"

  contenedor.innerHTML =
  html

}

function renderAll(){

  renderMisEquipos()
  renderMisRivales()
  renderMiGrupo()

}

function init(){

  if(
    !checkSession()
  ) return

  const participantsRef =
  doc(
    db,
    "mundialSorteo",
    "participants"
  )

  const stateRef =
  doc(
    db,
    "mundialSorteo",
    "state"
  )

  onSnapshot(
    participantsRef,
    snap=>{

      if(!snap.exists())
      return

      participants =
      snap.data()

      renderAll()

    }
  )

  onSnapshot(
    stateRef,
    snap=>{

      if(!snap.exists())
      return

      state =
      snap.data()

      renderAll()

    }
  )

}

init()

window.GRUPOS =
GRUPOS

window.participantsRefData =
()=>participants

window.stateRefData =
()=>state