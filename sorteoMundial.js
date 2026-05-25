import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"
import {
  getFirestore,
  doc,
  getDoc,
  onSnapshot,
  runTransaction
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

const saludo = document.getElementById("saludo")

const entradasText = document.getElementById("entradasText")
const girosBuenosText = document.getElementById("girosBuenosText")
const girosMalosText = document.getElementById("girosMalosText")

const spinBuenos = document.getElementById("spinBuenos")
const spinMalos = document.getElementById("spinMalos")

const msgBuenos = document.getElementById("msgBuenos")
const msgMalos = document.getElementById("msgMalos")

const tablaBody = document.getElementById("tablaBody")

const misBuenos = document.getElementById("misBuenos")
const misMalos = document.getElementById("misMalos")

const musicToggle = document.getElementById("musicToggle")
const themeToggle = document.getElementById("themeToggle")

const toast = document.getElementById("toast")

const audio = document.getElementById("bgMusic")

const canvasBuenos = document.getElementById("wheelBuenos")
const canvasMalos = document.getElementById("wheelMalos")

const ctxBuenos = canvasBuenos.getContext("2d")
const ctxMalos = canvasMalos.getContext("2d")

const settingsRef = doc(db, "mundialSorteo", "settings")
const participantsRef = doc(db, "mundialSorteo", "participants")
const stateRef = doc(db, "mundialSorteo", "state")

let currentUser = null
let currentName = null

let settings = {}
let state = {}
let participants = {}

let spinningBuenos = false
let spinningMalos = false

function sanitizeUser(user) {

  return user
    .trim()
    .toLowerCase()
    .replace(/\./g, "_")

}

function normalizeParticipants(data) {

  const clean = {}

  Object.entries(data || {}).forEach(([key, value]) => {

    if (
      typeof value === "object" &&
      value !== null &&
      (
        value.entradas !== undefined ||
        value.nombre !== undefined
      )
    ) {

      clean[key] = value

    }

  })

  return clean

}

function showToast(text) {

  toast.textContent = text

  toast.classList.remove("hidden")

  setTimeout(() => {

    toast.classList.add("hidden")

  }, 3500)

}

function loadTheme() {

  const saved = localStorage.getItem("theme")

  if (saved === "light") {

    document.body.classList.add("light")

    themeToggle.textContent = "☀️"

  }

}

themeToggle.addEventListener("click", () => {

  document.body.classList.toggle("light")

  const isLight =
    document.body.classList.contains("light")

  localStorage.setItem(
    "theme",
    isLight ? "light" : "dark"
  )

  themeToggle.textContent =
    isLight ? "☀️" : "🌙"

})

musicToggle.addEventListener("click", async () => {

  if (audio.paused) {

    await audio.play()

    musicToggle.textContent = "🔊"

    localStorage.setItem("music", "on")

  } else {

    audio.pause()

    musicToggle.textContent = "🎵"

    localStorage.setItem("music", "off")

  }

})

async function restoreMusic() {

  const music = localStorage.getItem("music")

  if (music === "on") {

    try {

      await audio.play()

      musicToggle.textContent = "🔊"

    } catch {}

  }

}

function checkSession() {

  const user = localStorage.getItem("user")
  const nombre = localStorage.getItem("nombre")

  if (!user) {

    location.href = "index.html"

    return false

  }

  currentUser = sanitizeUser(user)

  currentName = nombre || user

  saludo.textContent = `Hola ${currentName}`

  return true

}

function resizeCanvas(canvas) {

  const size =
    Math.min(520, window.innerWidth - 40)

  canvas.width = size
  canvas.height = size

}

function drawWheel(
  canvas,
  ctx,
  teams,
  rotation = 0
) {

  if (!teams || teams.length === 0) return

  resizeCanvas(canvas)

  const w = canvas.width
  const h = canvas.height

  const cx = w / 2
  const cy = h / 2

  const radius =
    Math.min(cx, cy) - 10

  ctx.clearRect(0, 0, w, h)

  ctx.save()

  ctx.translate(cx, cy)

  ctx.rotate((rotation * Math.PI) / 180)

  ctx.translate(-cx, -cy)

  const colors = [
    "#00b3ff",
    "#14d47a",
    "#ffcc45",
    "#ff5f5f",
    "#7a5cff",
    "#ff8c42",
    "#00d2a0",
    "#f54291"
  ]

  const n = teams.length

  const slice = (2 * Math.PI) / n

  for (let i = 0; i < n; i++) {

    const start = i * slice
    const end = start + slice

    ctx.beginPath()

    ctx.moveTo(cx, cy)

    ctx.arc(
      cx,
      cy,
      radius,
      start,
      end
    )

    ctx.closePath()

    ctx.fillStyle =
      colors[i % colors.length]

    ctx.fill()

    ctx.save()

    ctx.translate(cx, cy)

    ctx.rotate(start + slice / 2)

    ctx.textAlign = "right"

    ctx.fillStyle = "#fff"

    ctx.font =
      `${Math.round(w * 0.038)}px bold sans-serif`

    ctx.fillText(
      teams[i],
      radius - 18,
      0
    )

    ctx.restore()

  }

  ctx.restore()

  ctx.beginPath()

  ctx.arc(
    cx,
    cy,
    radius * 0.14,
    0,
    Math.PI * 2
  )

  ctx.fillStyle = "#111"

  ctx.fill()

}

function animateWheel(
  canvas,
  ctx,
  teams,
  selected
) {

  return new Promise((resolve) => {

    const n = teams.length

    const idx = teams.indexOf(selected)

    const slice = 360 / n

    const target =
      270 - (idx * slice + slice / 2)

    const spins =
      6 + Math.floor(Math.random() * 3)

    const total =
      spins * 360 + target

    const duration = 5500

    const start = performance.now()

    function frame(now) {

      const t =
        Math.min((now - start) / duration, 1)

      const ease =
        1 - Math.pow(1 - t, 3)

      const deg = ease * total

      drawWheel(
        canvas,
        ctx,
        teams,
        deg
      )

      if (t < 1) {

        requestAnimationFrame(frame)

      } else {

        resolve()

      }

    }

    requestAnimationFrame(frame)

  })

}

async function spin(type) {

  if (type === "buenos" && spinningBuenos)
    return

  if (type === "malos" && spinningMalos)
    return

  const pData =
    participants[currentUser]

  if (!pData) {

    showToast("No tienes acceso")

    return

  }

  if (type === "buenos") {

    if (pData.girosBuenos <= 0) {

      showToast(
        "No tienes más giros fuertes"
      )

      return

    }

    spinningBuenos = true

  }

  if (type === "malos") {

    if (pData.girosMalos <= 0) {

      showToast(
        "No tienes más giros regulares"
      )

      return

    }

    spinningMalos = true

  }

  const disponibles =
    type === "buenos"
      ? state.equiposBuenosDisponibles || []
      : state.equiposMalosDisponibles || []

  if (disponibles.length === 0) {

    showToast(
      "No quedan equipos disponibles"
    )

    spinningBuenos = false
    spinningMalos = false

    return

  }

  const selected =
    disponibles[
      Math.floor(
        Math.random() * disponibles.length
      )
    ]

  if (type === "buenos") {

    msgBuenos.textContent =
      "🎡 Girando ruleta..."

    await animateWheel(
      canvasBuenos,
      ctxBuenos,
      disponibles,
      selected
    )

  } else {

    msgMalos.textContent =
      "🎡 Girando ruleta..."

    await animateWheel(
      canvasMalos,
      ctxMalos,
      disponibles,
      selected
    )

  }

  await runTransaction(db, async (transaction) => {

    const stateSnap =
      await transaction.get(stateRef)

    const participantsSnap =
      await transaction.get(participantsRef)

    const currentState =
      stateSnap.data()

    const currentParticipants =
      normalizeParticipants(
        participantsSnap.data()
      )

    const userData =
      currentParticipants[currentUser]

    if (!currentState.assignments) {

      currentState.assignments = {}

    }

    if (!currentState.assignments[currentUser]) {

      currentState.assignments[currentUser] = {
        buenos: [],
        malos: []
      }

    }

    if (type === "buenos") {

      currentState
        .assignments[currentUser]
        .buenos
        .push(selected)

      currentState
        .equiposBuenosDisponibles =
        currentState
          .equiposBuenosDisponibles
          .filter(t => t !== selected)

      userData.girosBuenos -= 1

    } else {

      currentState
        .assignments[currentUser]
        .malos
        .push(selected)

      currentState
        .equiposMalosDisponibles =
        currentState
          .equiposMalosDisponibles
          .filter(t => t !== selected)

      userData.girosMalos -= 1

    }

    transaction.set(
      participantsRef,
      currentParticipants
    )

    transaction.update(
      stateRef,
      currentState
    )

  })

  if (type === "buenos") {

    msgBuenos.textContent =
      `🏆 ${selected}`

    spinningBuenos = false

  } else {

    msgMalos.textContent =
      `🏆 ${selected}`

    spinningMalos = false

  }

  showToast(`Te tocó ${selected}`)

}

spinBuenos.addEventListener(
  "click",
  () => {

    spin("buenos")

  }
)

spinMalos.addEventListener(
  "click",
  () => {

    spin("malos")

  }
)

function renderMyTeams() {

  misBuenos.innerHTML = ""

  misMalos.innerHTML = ""

  const mine =
    state.assignments?.[currentUser]

  if (!mine) return

  const buenos = mine.buenos || []
  const malos = mine.malos || []

  buenos.forEach((team) => {

    const status =
      state.teamStatus?.[team] || "activo"

    misBuenos.innerHTML += `
      <div class="team-chip ${status}">
        ${status === "activo" ? "🟢" : "❌"}
        ${team}
      </div>
    `

  })

  malos.forEach((team) => {

    const status =
      state.teamStatus?.[team] || "activo"

    misMalos.innerHTML += `
      <div class="team-chip ${status}">
        ${status === "activo" ? "🟢" : "❌"}
        ${team}
      </div>
    `

  })

}

function renderTable() {

  tablaBody.innerHTML = ""

  Object.entries(participants).forEach(([email, p]) => {

    if (
      typeof p !== "object" ||
      p === null
    ) return

    const assign =
      state.assignments?.[email] || {
        buenos: [],
        malos: []
      }

    const buenos = assign.buenos || []
    const malos = assign.malos || []

    const allTeams = [...buenos, ...malos]

    let estadoFinal = `
      <span class="estadoBadge">
        ⏳ Sin equipos
      </span>
    `

    if (allTeams.length > 0) {

      const active = allTeams.some((team) => {

        return (
          state.teamStatus?.[team] || "activo"
        ) === "activo"

      })

      estadoFinal = active
        ? `
          <span class="estadoBadge good">
            🟢 Compitiendo
          </span>
        `
        : `
          <span class="estadoBadge bad">
            ❌ Eliminado
          </span>
        `
    }

    tablaBody.innerHTML += `
      <tr>

        <td>
          ${p.nombre || email}
        </td>

        <td>
          ${buenos.length
            ? buenos.join(", ")
            : "-"}
        </td>

        <td>
          ${malos.length
            ? malos.join(", ")
            : "-"}
        </td>

        <td>
          ${estadoFinal}
        </td>

      </tr>
    `

  })

}

function updateStats() {

  const data =
    participants[currentUser]

  if (!data) return

  entradasText.textContent =
    data.entradas || 0

  girosBuenosText.textContent =
    data.girosBuenos || 0

  girosMalosText.textContent =
    data.girosMalos || 0

}

function updateButtons() {

  const data =
    participants[currentUser]

  if (!data) return

  spinBuenos.disabled =
    data.girosBuenos <= 0

  spinMalos.disabled =
    data.girosMalos <= 0

}

function listenRealtime() {

  onSnapshot(settingsRef, (snap) => {

    if (!snap.exists()) return

    settings = snap.data()

    drawWheel(
      canvasBuenos,
      ctxBuenos,
      state.equiposBuenosDisponibles ||
      settings.equiposBuenos ||
      []
    )

    drawWheel(
      canvasMalos,
      ctxMalos,
      state.equiposMalosDisponibles ||
      settings.equiposMalos ||
      []
    )

  })

  onSnapshot(stateRef, (snap) => {

    if (!snap.exists()) return

    state = snap.data()

    renderMyTeams()

    renderTable()

    drawWheel(
      canvasBuenos,
      ctxBuenos,
      state.equiposBuenosDisponibles || []
    )

    drawWheel(
      canvasMalos,
      ctxMalos,
      state.equiposMalosDisponibles || []
    )

  })

  onSnapshot(participantsRef, (snap) => {

    if (!snap.exists()) return

    participants =
      normalizeParticipants(
        snap.data()
      )

    if (!participants[currentUser]) {

      showToast("No estás autorizado")

      setTimeout(() => {

        location.href = "menu.html"

      }, 2000)

      return

    }

    renderTable()

    updateStats()

    updateButtons()

  })

}

window.addEventListener("resize", () => {

  drawWheel(
    canvasBuenos,
    ctxBuenos,
    state.equiposBuenosDisponibles ||
    settings.equiposBuenos ||
    []
  )

  drawWheel(
    canvasMalos,
    ctxMalos,
    state.equiposMalosDisponibles ||
    settings.equiposMalos ||
    []
  )

})

async function init() {

  loadTheme()

  restoreMusic()

  if (!checkSession()) return

  const settingsSnap =
    await getDoc(settingsRef)

  const stateSnap =
    await getDoc(stateRef)

  const participantsSnap =
    await getDoc(participantsRef)

  settings =
    settingsSnap.exists()
      ? settingsSnap.data()
      : {}

  state =
    stateSnap.exists()
      ? stateSnap.data()
      : {}

  participants =
    participantsSnap.exists()
      ? normalizeParticipants(
          participantsSnap.data()
        )
      : {}

  if (!participants[currentUser]) {

    showToast("No autorizado")

    setTimeout(() => {

      location.href = "menu.html"

    }, 2000)

    return

  }

  drawWheel(
    canvasBuenos,
    ctxBuenos,
    state.equiposBuenosDisponibles ||
    settings.equiposBuenos ||
    []
  )

  drawWheel(
    canvasMalos,
    ctxMalos,
    state.equiposMalosDisponibles ||
    settings.equiposMalos ||
    []
  )

  renderMyTeams()

  renderTable()

  updateStats()

  updateButtons()

  listenRealtime()

}

init()