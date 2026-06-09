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

const saludo =
document.getElementById("saludo")

const alertas =
document.getElementById("alertas")

const estadoPago =
document.getElementById("estadoPago")

const misEquipos =
document.getElementById("misEquipos")

const misPartidos =
document.getElementById("misPartidos")

const calendarioMundial =
document.getElementById("calendarioMundial")

const clasificacion =
document.getElementById("clasificacion")

let currentUser = null

let participants = {}
let state = {}
let partidosMundial = []

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

    location.href="index.html"

    return false

  }

  currentUser =
  sanitize(user)

  saludo.textContent =
  `Hola ${nombre || user}`

  return true

}

async function cargarPartidos(){

  try{

    const response =
    await fetch("partidosMundial.json")

    const data =
    await response.json()

    partidosMundial =
    data.partidos || []

  }

  catch(error){

    console.error(
      "Error cargando partidos:",
      error
    )

    partidosMundial = []

  }

}

function renderPago(){

  const p =
  participants[currentUser]

  if(!p){

    estadoPago.innerHTML = `
      <div class="estadoPago pendiente">
        ⛔ No participas actualmente
      </div>
    `

    return

  }

  const pagado =
  p.pagado === true

  estadoPago.innerHTML = `
    <div class="estadoPago ${pagado ? "pagado" : "pendiente"}">
      ${
        pagado
        ? "✅ Pago confirmado"
        : "⏳ Pago pendiente"
      }
    </div>
  `

}

function renderEquipos(){

  const asignaciones =
  state.assignments?.[currentUser]

  if(!asignaciones){

    misEquipos.innerHTML = `
      <div class="empty">
        Actualmente no participas en esta edición
      </div>
    `

    return

  }

  const equipos = [

    ...(asignaciones.buenos || []),

    ...(asignaciones.malos || [])

  ]

  if(equipos.length===0){

    misEquipos.innerHTML = `
      <div class="empty">
        Aún no tienes equipos asignados
      </div>
    `

    return

  }

  let html =
  `<div class="equiposGrid">`

  equipos.forEach((team)=>{

    const status =
    state.teamStatus?.[team] || "activo"

    html += `
      <div class="equipoCard">

        <div class="equipoNombre">
          ${team}
        </div>

        <div class="${status}">
          ${
            status==="activo"
            ? "🟢 Activo"
            : "❌ Eliminado"
          }
        </div>

      </div>
    `

  })

  html += "</div>"

  misEquipos.innerHTML = html

}

function renderAlertas(){

  const asignaciones =
  state.assignments?.[currentUser]

  if(!asignaciones){

    alertas.innerHTML = `
      <div class="empty">
        No hay alertas disponibles
      </div>
    `

    return

  }

  const equipos = [

    ...(asignaciones.buenos || []),

    ...(asignaciones.malos || [])

  ]

  let html = ""

  equipos.forEach((team)=>{

    const status =
    state.teamStatus?.[team] || "activo"

    if(status==="activo"){

      html += `
        <div class="alerta">

          <strong>
            ⭐ ${team}
          </strong>

          Sigue compitiendo en el Mundial.

        </div>
      `

    }

  })

  if(html===""){

    html = `
      <div class="empty">
        No hay alertas disponibles
      </div>
    `

  }

  alertas.innerHTML = html

}

function renderMisPartidos(){

  const asignaciones =
  state.assignments?.[currentUser]

  if(!asignaciones){

    misPartidos.innerHTML = `
      <div class="empty">
        No participas actualmente
      </div>
    `

    return

  }

  const equipos = [

    ...(asignaciones.buenos || []),

    ...(asignaciones.malos || [])

  ]

  const partidosUsuario =

  partidosMundial.filter((partido)=>{

    return (
      equipos.includes(partido.local)
      ||
      equipos.includes(partido.visitante)
    )

  })

  if(partidosUsuario.length===0){

    misPartidos.innerHTML = `
      <div class="empty">
        Tus equipos aún no tienen partidos registrados
      </div>
    `

    return

  }

  let html = ""

  partidosUsuario.forEach((partido)=>{

    html += `
      <div class="partido">

        <div class="partidoFecha">
          ⭐ ${partido.fecha}
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

  misPartidos.innerHTML = html

}

function renderCalendario(){

  const calendarioGrid =
  document.getElementById("calendarioGrid")

  const fechaActual =
  document.getElementById("fechaActual")

  const partidosHoy =
  document.getElementById("partidosHoy")

  const partidosSeleccionados =
  document.getElementById("partidosSeleccionados")

  if(
    !calendarioGrid ||
    partidosMundial.length===0
  ){
    return
  }

  const hoy = new Date()

  fechaActual.textContent =
  hoy.toLocaleDateString(
    "es-MX",
    {
      weekday:"long",
      day:"numeric",
      month:"long",
      year:"numeric"
    }
  )

  const year = 2026
  const month = 5

  const primerDia =
  new Date(year,month,1)

  const ultimoDia =
  new Date(year,month+1,0)

  const totalDias =
  ultimoDia.getDate()

  const offset =
  (primerDia.getDay()+6)%7

  let html = ""

  for(
    let i=0;
    i<offset;
    i++
  ){

    html += `<div></div>`

  }

  for(
    let dia=1;
    dia<=totalDias;
    dia++
  ){

    const fecha =
    `2026-06-${String(dia).padStart(2,"0")}`

    const juegos =
    partidosMundial.filter(
      p=>p.fecha===fecha
    )

    const esHoy =
    hoy.getFullYear()===2026 &&
    hoy.getMonth()===5 &&
    hoy.getDate()===dia

    html += `

      <div
        class="
          diaCalendario
          ${esHoy ? "hoy" : ""}
          ${juegos.length ? "tienePartido" : ""}
        "
        data-fecha="${fecha}"
      >

        <div class="numeroDia">
          ${dia}
        </div>

        ${
          juegos
          .slice(0,2)
          .map(
            p=>`
            <div class="partidoMini">
              ${p.local}
              vs
              ${p.visitante}
            </div>
            `
          )
          .join("")
        }

      </div>

    `

  }

  calendarioGrid.innerHTML =
  html

  const hoyString =
  `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-${String(hoy.getDate()).padStart(2,"0")}`

  const juegosHoy =
  partidosMundial.filter(
    p=>p.fecha===hoyString
  )

  if(juegosHoy.length){

    partidosHoy.innerHTML =
    juegosHoy.map(
      p=>`
      <div class="partidoHoyItem">
        ${p.local}
        vs
        ${p.visitante}
      </div>
      `
    ).join("")

  }else{

    partidosHoy.innerHTML =
    "Sin partidos"

  }

  document
  .querySelectorAll(
    ".diaCalendario"
  )
  .forEach((dia)=>{

    dia.addEventListener(
      "click",
      ()=>{

        const fecha =
        dia.dataset.fecha

        const juegos =
        partidosMundial.filter(
          p=>p.fecha===fecha
        )

        if(!juegos.length){

          partidosSeleccionados.innerHTML = `
            <div class="empty">
              No hay partidos este día
            </div>
          `

          return

        }

        partidosSeleccionados.innerHTML =
        juegos.map((p)=>{

          const asignaciones =
          state.assignments?.[currentUser]

          const equiposUsuario = [

            ...(asignaciones?.buenos || []),

            ...(asignaciones?.malos || [])

          ]

          const esMio =

          equiposUsuario.includes(
            p.local
          )
          ||
          equiposUsuario.includes(
            p.visitante
          )

          return `

            <div class="
              partidoDetalle
              ${
                esMio
                ? "partidoDetalleUsuario"
                : ""
              }
            ">

              <strong>
                ${p.local}
                vs
                ${p.visitante}
              </strong>

              ${p.hora}

              <div class="faseTag">
                ${p.fase}
              </div>

            </div>

          `

        }).join("")

      }
    )

  })


}

function renderClasificacion(){

  const ranking = []

  Object.entries(participants)
  .forEach(([user,data])=>{

    const asignaciones =
    state.assignments?.[user]

    if(!asignaciones) return

    const equipos = [

      ...(asignaciones.buenos || []),

      ...(asignaciones.malos || [])

    ]

    let vivos = 0

    const equiposVivos = []

    equipos.forEach((team)=>{

      const status =
      state.teamStatus?.[team] || "activo"

      if(status==="activo"){

        vivos++

        equiposVivos.push(team)

      }

    })

    ranking.push({

      nombre:
      data.nombre || user,

      vivos,

      equiposVivos

    })

  })

  ranking.sort(
    (a,b)=>
    b.vivos - a.vivos
  )

  let html =
  `<div class="ranking">`

  ranking.forEach((item,index)=>{

    html += `
  <div class="rankingItem">

    <div class="posicion">
      ${index+1}
    </div>

    <div class="usuario">
      ${item.nombre}
    </div>

    <div
      class="puntos"
      data-equipos='${JSON.stringify(item.equiposVivos)}'
    >
      ${item.vivos} vivos
    </div>

  </div>
`

  })

  html += "</div>"

  clasificacion.innerHTML = html

  document
.querySelectorAll(".puntos")
.forEach(btn=>{

  btn.addEventListener(
    "click",
    ()=>{

      const equipos =
      JSON.parse(
        btn.dataset.equipos
      )

      mostrarEquiposVivos(
        equipos
      )

    }
  )

})

}

function mostrarEquiposVivos(equipos){

  const modal =
  document.getElementById(
    "modalVivos"
  )

  const lista =
  document.getElementById(
    "listaEquiposVivos"
  )

  const titulo =
  document.getElementById(
    "tituloModal"
  )

  titulo.textContent =
  "🏆 Equipos vivos"

  if(!equipos.length){

    lista.innerHTML = `
      <div class="empty">
        Sin equipos vivos
      </div>
    `

  }else{

    lista.innerHTML =
    equipos.map(team=>`

      <div class="equipoVivo">
        🟢 ${team}
      </div>

    `).join("")

  }

  modal.style.display =
  "flex"

}

function cerrarModalVivos(){

  const modal =
  document.getElementById(
    "modalVivos"
  )

  modal.style.display =
  "none"

}

function renderAll(){

  renderPago()

  renderEquipos()

  renderAlertas()

  renderMisPartidos()

  renderCalendario()

  renderClasificacion()

}

async function init(){

  if(!checkSession()) return

  await cargarPartidos()

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
    (snap)=>{

      if(!snap.exists()) return

      participants =
      snap.data()

      renderAll()

    }
  )

  onSnapshot(
    stateRef,
    (snap)=>{

      if(!snap.exists()) return

      state =
      snap.data()

      renderAll()

    }
  )
  const cerrarBtn =
  document.getElementById(
    "cerrarModal"
  )

  if(cerrarBtn){

    cerrarBtn.addEventListener(
      "click",
      cerrarModalVivos
    )

  }

  const modal =
  document.getElementById(
    "modalVivos"
  )

  if(modal){

    modal.addEventListener(
      "click",
      (e)=>{

        if(
          e.target === modal
        ){

          cerrarModalVivos()

        }

      }
    )

  }


}

init()
