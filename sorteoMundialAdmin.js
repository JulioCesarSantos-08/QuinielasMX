import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc
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

const usuariosBody = document.getElementById("usuariosBody")
const equiposFuertes = document.getElementById("equiposFuertes")
const equiposDebiles = document.getElementById("equiposDebiles")
const estadoEquiposBody = document.getElementById("estadoEquiposBody")

const guardarUsuarios = document.getElementById("guardarUsuarios")
const guardarFuertes = document.getElementById("guardarFuertes")
const guardarDebiles = document.getElementById("guardarDebiles")
const guardarEstados = document.getElementById("guardarEstados")

const resetPruebas = document.getElementById("resetPruebas")
const resetTotal = document.getElementById("resetTotal")

const settingsRef = doc(db, "mundialSorteo", "settings")
const participantsRef = doc(db, "mundialSorteo", "participants")
const stateRef = doc(db, "mundialSorteo", "state")

async function cargarUsuarios() {

  usuariosBody.innerHTML = ""

  const usuariosSnap =
    await getDocs(collection(db, "usuarios"))

  let savedParticipants = {}

  const pSnap = await getDoc(participantsRef)

  if (pSnap.exists()) {

    savedParticipants = pSnap.data()

  }

  usuariosSnap.forEach((docSnap) => {

    const data = docSnap.data()

    const email = docSnap.id

    const nombre =
      data.nombre || email

    const info =
      savedParticipants[email] || {}

    const participa =
      info.entradas > 0

    const entradas =
      info.entradas || 0

    const tr =
      document.createElement("tr")

    tr.innerHTML = `
      <td>
        <input 
          type="checkbox" 
          class="checkParticipa"
          data-email="${email}"
          ${participa ? "checked" : ""}
        >
      </td>

      <td>${nombre}</td>

      <td>
        <input
          type="number"
          min="0"
          value="${entradas}"
          class="inputEntradas"
          data-email="${email}"
        >
      </td>
    `

    usuariosBody.appendChild(tr)

  })

}

function generarInputsEquipos() {

  equiposFuertes.innerHTML = ""

  equiposDebiles.innerHTML = ""

  for (let i = 1; i <= 24; i++) {

    equiposFuertes.innerHTML += `
      <input 
        type="text"
        placeholder="Equipo fuerte ${i}"
      >
    `

    equiposDebiles.innerHTML += `
      <input 
        type="text"
        placeholder="Equipo regular ${i}"
      >
    `

  }

}

guardarUsuarios.addEventListener(
  "click",
  async () => {

    const checks =
      document.querySelectorAll(".checkParticipa")

    const inputs =
      document.querySelectorAll(".inputEntradas")

    const participantes = {}

    checks.forEach((check, index) => {

      const email =
  check.dataset.email
  .trim()
  .toLowerCase()
  .replace(/\./g, "_")

      const entradas =
        Number(inputs[index].value) || 0

      if (check.checked && entradas > 0) {

        participantes[email] = {

          nombre:
            check
            .closest("tr")
            .children[1]
            .textContent
            .trim(),

          entradas,

          girosBuenos: entradas,

          girosMalos: entradas

        }

      }

    })

    await setDoc(
      participantsRef,
      participantes
    )

    alert(
      "Participantes guardados correctamente"
    )

  }
)

guardarFuertes.addEventListener(
  "click",
  async () => {

    const equipos = Array.from(
      equiposFuertes.querySelectorAll("input")
    )
    .map(i => i.value.trim())
    .filter(Boolean)

    if (equipos.length !== 24) {

      alert(
        "Debes ingresar exactamente 24 equipos fuertes"
      )

      return

    }

    const settingsSnap =
      await getDoc(settingsRef)

    let actuales = {}

    if (settingsSnap.exists()) {

      actuales = settingsSnap.data()

    }

    await setDoc(settingsRef, {

      ...actuales,

      equiposBuenos: equipos

    })

    await setDoc(stateRef, {

      equiposBuenosDisponibles: equipos

    }, { merge: true })

    await actualizarTablaEstados()

    alert("Equipos fuertes guardados")

  }
)

guardarDebiles.addEventListener(
  "click",
  async () => {

    const equipos = Array.from(
      equiposDebiles.querySelectorAll("input")
    )
    .map(i => i.value.trim())
    .filter(Boolean)

    if (equipos.length !== 24) {

      alert(
        "Debes ingresar exactamente 24 equipos regulares"
      )

      return

    }

    const settingsSnap =
      await getDoc(settingsRef)

    let actuales = {}

    if (settingsSnap.exists()) {

      actuales = settingsSnap.data()

    }

    await setDoc(settingsRef, {

      ...actuales,

      equiposMalos: equipos

    })

    await setDoc(stateRef, {

      equiposMalosDisponibles: equipos

    }, { merge: true })

    await actualizarTablaEstados()

    alert("Equipos regulares guardados")

  }
)

async function cargarEquiposGuardados() {

  const snap =
    await getDoc(settingsRef)

  if (!snap.exists()) return

  const data = snap.data()

  const buenos =
    data.equiposBuenos || []

  const malos =
    data.equiposMalos || []

  const inputsBuenos =
    equiposFuertes.querySelectorAll("input")

  const inputsMalos =
    equiposDebiles.querySelectorAll("input")

  buenos.forEach((eq, i) => {

    if (inputsBuenos[i]) {

      inputsBuenos[i].value = eq

    }

  })

  malos.forEach((eq, i) => {

    if (inputsMalos[i]) {

      inputsMalos[i].value = eq

    }

  })

}

async function actualizarTablaEstados() {

  estadoEquiposBody.innerHTML = ""

  const settingsSnap =
    await getDoc(settingsRef)

  if (!settingsSnap.exists()) return

  const data = settingsSnap.data()

  const buenos =
    data.equiposBuenos || []

  const malos =
    data.equiposMalos || []

  const todos = [...buenos, ...malos]

  const stateSnap =
    await getDoc(stateRef)

  let estados = {}

  if (stateSnap.exists()) {

    estados =
      stateSnap.data().teamStatus || {}

  }

  todos.forEach((team) => {

    const estado =
      estados[team] || "activo"

    const tr =
      document.createElement("tr")

    tr.innerHTML = `
      <td>${team}</td>

      <td>

        <select data-team="${team}">

          <option
            value="activo"
            ${estado === "activo"
              ? "selected"
              : ""}
          >
            Compitiendo
          </option>

          <option
            value="eliminado"
            ${estado === "eliminado"
              ? "selected"
              : ""}
          >
            Eliminado
          </option>

        </select>

        <span class="estado ${estado}">
          ${estado === "activo"
            ? "🟢 Compitiendo"
            : "❌ Eliminado"}
        </span>

      </td>
    `

    estadoEquiposBody.appendChild(tr)

  })

}

guardarEstados.addEventListener(
  "click",
  async () => {

    const selects =
      estadoEquiposBody.querySelectorAll("select")

    const estados = {}

    selects.forEach((sel) => {

      const team =
        sel.dataset.team

      estados[team] = sel.value

    })

    await setDoc(stateRef, {

      teamStatus: estados

    }, { merge: true })

    await actualizarTablaEstados()

    alert("Estados actualizados")

  }
)

resetPruebas.addEventListener(
  "click",
  async () => {

    const seguro = confirm(
      "¿Reiniciar asignaciones y giros?"
    )

    if (!seguro) return

    const pSnap =
      await getDoc(participantsRef)

    if (!pSnap.exists()) return

    const participants =
      pSnap.data()

    Object.keys(participants)
    .forEach((email) => {

      const entradas =
        participants[email].entradas || 0

      participants[email].girosBuenos =
        entradas

      participants[email].girosMalos =
        entradas

    })

    const settingsSnap =
      await getDoc(settingsRef)

    const settings =
      settingsSnap.data()

    await setDoc(
      participantsRef,
      participants
    )

    await setDoc(stateRef, {

      assignments: {},

      equiposBuenosDisponibles:
        settings.equiposBuenos || [],

      equiposMalosDisponibles:
        settings.equiposMalos || []

    }, { merge: true })

    alert("Sorteo reiniciado")

  }
)

resetTotal.addEventListener(
  "click",
  async () => {

    const seguro = confirm(
      "¿Seguro que deseas borrar TODO?"
    )

    if (!seguro) return

    await deleteDoc(settingsRef)

    await deleteDoc(participantsRef)

    await deleteDoc(stateRef)

    alert(
      "Sistema reiniciado completamente"
    )

    location.reload()

  }
)

generarInputsEquipos()

cargarUsuarios()

cargarEquiposGuardados()

actualizarTablaEstados()