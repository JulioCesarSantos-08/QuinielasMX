import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
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

const pagosContainer =
document.getElementById("pagosContainer")

const guardarPagos =
document.getElementById("guardarPagos")

const totalParticipantes =
document.getElementById("totalParticipantes")

const totalPagados =
document.getElementById("totalPagados")

const totalPendientes =
document.getElementById("totalPendientes")

const partidosContainer =
document.getElementById("partidosContainer")

const resultadosContainer =
document.getElementById("resultadosContainer")

const totalPartidos =
document.getElementById("totalPartidos")

const partidosFinalizados =
document.getElementById("partidosFinalizados")

const equiposEliminados =
document.getElementById("equiposEliminados")

const estadoResultados =
document.getElementById("estadoResultados")

let participants = {}
let partidosMundial = []
let resultados = {}

const participantsRef =
doc(
  db,
  "mundialSorteo",
  "participants"
)

const resultadosRef =
doc(
  db,
  "mundialCentro",
  "resultados"
)

function renderPagos(){

  const lista =
  Object.entries(participants)

  if(lista.length===0){

    pagosContainer.innerHTML = `
      <div class="empty">
        No hay participantes registrados
      </div>
    `

    return

  }

  let html = ""
  let pagados = 0

  lista.forEach(([user,data])=>{

    const isPaid =
    data.pagado === true

    if(isPaid){

      pagados++

    }

    html += `

      <div class="pagoCard">

        <div class="pagoInfo">

          <div class="pagoNombre">
            ${data.nombre || user}
          </div>

          <div class="pagoEntradas">
            Entradas:
            ${data.entradas || 0}
          </div>

          <div class="${
            isPaid
            ? "badgePagado"
            : "badgePendiente"
          }">

            ${
              isPaid
              ? "✅ Pagado"
              : "⏳ Pendiente"
            }

          </div>

        </div>

        <input
          type="checkbox"
          class="switch"
          data-user="${user}"
          ${isPaid ? "checked" : ""}
        >

      </div>

    `

  })

  pagosContainer.innerHTML =
  html

  totalParticipantes.textContent =
  lista.length

  totalPagados.textContent =
  pagados

  totalPendientes.textContent =
  lista.length - pagados

}

async function guardarEstadoPagos(){

  const switches =
  document.querySelectorAll(".switch")

  const updated = {}

  Object.entries(participants)
  .forEach(([user,data])=>{

    updated[user] = {
      ...data
    }

  })

  switches.forEach((input)=>{

    const user =
    input.dataset.user

    if(updated[user]){

      updated[user].pagado =
      input.checked

    }

  })

  await setDoc(
    participantsRef,
    updated
  )

  alert(
    "Pagos actualizados correctamente"
  )

}

async function cargarPartidos(){

  try{

    const response =
    await fetch(
      "partidosMundial.json"
    )

    const data =
    await response.json()

    partidosMundial =
    data.partidos || []

    renderPartidos()

    renderResultados()

  }

  catch(error){

    console.error(error)

  }

}

async function cargarResultados(){

  const snap =
  await getDoc(
    resultadosRef
  )

  if(
    snap.exists()
  ){

    resultados =
    snap.data()

  }

  renderResultados()

}

function renderPartidos(){

  if(partidosMundial.length===0){

    partidosContainer.innerHTML = `
      <div class="empty">
        No hay partidos disponibles
      </div>
    `

    return

  }

  let html = ""

  partidosMundial.forEach((partido)=>{

    html += `

      <div class="partidoCard">

        <div class="partidoFecha">
          ${partido.fecha}
        </div>

        <div class="partidoEquipos">
          ${partido.local}
          vs
          ${partido.visitante}
        </div>

        <div class="partidoHora">
          ${partido.hora}
        </div>

      </div>

    `

  })

  partidosContainer.innerHTML =
  html

}

function renderResultados(){

  if(partidosMundial.length===0){

    resultadosContainer.innerHTML = `
      <div class="empty">
        No hay partidos disponibles
      </div>
    `

    return

  }

  let html = ""

  let finalizados = 0

  partidosMundial.forEach((partido)=>{

    const resultado =
    resultados[partido.id] || {}

    if(resultado.finalizado){

      finalizados++

    }

    html += `

      <div class="resultadoCard">

        <div class="partidoFecha">
          ${partido.fecha}
        </div>

        <div class="resultadoEquipos">
          ${partido.local}
          vs
          ${partido.visitante}
        </div>

        <div class="resultadoInputs">

          <input
            type="number"
            min="0"
            value="${resultado.local ?? ""}"
            class="golLocal"
            data-id="${partido.id}"
          >

          <span>
            -
          </span>

          <input
            type="number"
            min="0"
            value="${resultado.visitante ?? ""}"
            class="golVisitante"
            data-id="${partido.id}"
          >

        </div>

        <label class="resultadoFinalizado">

          <input
            type="checkbox"
            class="finalizado"
            data-id="${partido.id}"
            ${
              resultado.finalizado
              ? "checked"
              : ""
            }
          >

          Partido Finalizado

        </label>

        <button
          class="resultadoBtn"
          data-id="${partido.id}"
        >

          Guardar Resultado

        </button>

      </div>

    `

  })

  resultadosContainer.innerHTML =
  html

  partidosFinalizados.textContent =
  finalizados

  totalPartidos.textContent =
  partidosMundial.length

  estadoResultados.textContent =
  "Activo"

  bindResultados()

}

function bindResultados(){

  document
  .querySelectorAll(
    ".resultadoBtn"
  )
  .forEach((btn)=>{

    btn.addEventListener(
      "click",
      guardarResultado
    )

  })

}

async function guardarResultado(e){

  const id =
  e.target.dataset.id

  const local =
  document.querySelector(
    `.golLocal[data-id="${id}"]`
  )

  const visitante =
  document.querySelector(
    `.golVisitante[data-id="${id}"]`
  )

  const finalizado =
  document.querySelector(
    `.finalizado[data-id="${id}"]`
  )

  resultados[id] = {

    local:
    Number(local.value),

    visitante:
    Number(visitante.value),

    finalizado:
    finalizado.checked

  }

  await setDoc(
    resultadosRef,
    resultados
  )

  renderResultados()

  alert(
    "Resultado guardado"
  )

}

guardarPagos.addEventListener(
  "click",
  guardarEstadoPagos
)

function initRealtime(){

  onSnapshot(
    participantsRef,
    (snap)=>{

      if(!snap.exists()){

        participants = {}

      }else{

        participants =
        snap.data()

      }

      renderPagos()

    }
  )

}

async function init(){

  await cargarPartidos()

  await cargarResultados()

  initRealtime()

}

init()