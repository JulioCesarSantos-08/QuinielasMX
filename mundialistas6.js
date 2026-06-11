async function cargarPartidosMundialM6(){

  try{

    const response =
    await fetch(
      "partidosMundial.json"
    )

    const data =
    await response.json()

    return data.partidos || []

  }

  catch(error){

    console.error(
      "Error cargando partidos:",
      error
    )

    return []

  }

}

function obtenerBanderaM6(equipo){

  return `imagenes/${
    equipo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/\s+/g,"-")
  }.png`

}

function obtenerMisEquiposM6(){

  const state =
  window.stateRefData()

  const usuario =
  localStorage
  .getItem("user")
  ?.trim()
  .toLowerCase()
  .replace(/\./g,"_")

  const asignacion =
  state.assignments?.[
    usuario
  ]

  if(!asignacion){

    return []

  }

  return [

    ...(asignacion.buenos || []),

    ...(asignacion.malos || [])

  ]

}

function obtenerNombreUsuarioM6(correo){

  const participants =
  window.participantsRefData()

  return (
    participants?.[
      correo
    ]?.nombre
    || correo
  )

}

function obtenerDueñoEquipoM6(equipo){

  const state =
  window.stateRefData()

  for(
    const [correo,data]
    of Object.entries(
      state.assignments || {}
    )
  ){

    const equipos = [

      ...(data.buenos || []),

      ...(data.malos || [])

    ]

    if(
      equipos.includes(
        equipo
      )
    ){

      return {

        correo,

        nombre:
        obtenerNombreUsuarioM6(
          correo
        )

      }

    }

  }

  return null

}

function abrirModalPartidoM6(
juego,
dueñoLocal,
dueñoVisitante
){

const modal =
document.getElementById(
"modalPartido"
)

const contenido =
document.getElementById(
"contenidoModalPartido"
)

contenido.innerHTML = `

<div class="modalTitulo">

⚔️ Partido Mundialista

</div>

<div style="
text-align:center;
">

<img
src="${obtenerBanderaM6(
juego.local
)}"
class="banderaMini"
style="
width:50px;
height:50px;
margin:auto;
"
/>

<h3>
${juego.local}
</h3>

<div>

👤 ${
dueñoLocal?.nombre
|| "Sin dueño"
}

</div>

<br>

<div style="
font-size:1.4rem;
color:#FFD700;
">

VS

</div>

<br>

<img
src="${obtenerBanderaM6(
juego.visitante
)}"
class="banderaMini"
style="
width:50px;
height:50px;
margin:auto;
"
/>

<h3>
${juego.visitante}
</h3>

<div>

👤 ${
dueñoVisitante?.nombre
|| "Sin dueño"
}

</div>

<br>

<div>

📅 ${juego.fecha}

</div>

</div>

`

modal.classList.add(
"modalPartidoActivo"
)

}

async function renderCalendarioMiGrupo(){

  const contenedor =
  document.getElementById(
    "calendarioMiGrupo"
  )

  if(!contenedor) return

  const state =
  window.stateRefData()

  const usuarioActual =
  localStorage
  .getItem("user")
  ?.trim()
  .toLowerCase()
  .replace(/\./g,"_")

  const misEquipos =
  obtenerMisEquiposM6()

  if(
    misEquipos.length === 0
  ){

    contenedor.innerHTML = `

      <div class="empty">

        No tienes equipos asignados

      </div>

    `

    return

  }

  const partidos =
  await cargarPartidosMundialM6()

  const misPartidos =
  partidos.filter(partido=>{

    return (

      misEquipos.includes(
        partido.local
      )

      ||

      misEquipos.includes(
        partido.visitante
      )

    )

  })

  const year = 2026
  const month = 5

  const primerDia =
  new Date(
    year,
    month,
    1
  )

  const ultimoDia =
  new Date(
    year,
    month + 1,
    0
  )

  const totalDias =
  ultimoDia.getDate()

  const offset =
  (
    primerDia.getDay()
    + 6
  ) % 7

  let html = `

    <div class="calendarioGrupoGrid">

      <div class="calendarioHeader">
        Lun
      </div>

      <div class="calendarioHeader">
        Mar
      </div>

      <div class="calendarioHeader">
        Mié
      </div>

      <div class="calendarioHeader">
        Jue
      </div>

      <div class="calendarioHeader">
        Vie
      </div>

      <div class="calendarioHeader">
        Sáb
      </div>

      <div class="calendarioHeader">
        Dom
      </div>

  `

  for(
    let i=0;
    i<offset;
    i++
  ){

    html += `
      <div></div>
    `

  }

  for(
    let dia=1;
    dia<=totalDias;
    dia++
  ){

    const fecha =
    `2026-06-${String(
      dia
    ).padStart(
      2,
      "0"
    )}`

    const juegosDia =
    misPartidos.filter(
      p =>
      p.fecha === fecha
    )

    html += `

      <div class="
        calendarioDia
        ${
          juegosDia.length
          ? "calendarioDiaActivo"
          : ""
        }
      ">

        <div class="numeroDia">

          ${dia}

        </div>

    `

    juegosDia.forEach(
      juego=>{

      const dueñoLocal =
      obtenerDueñoEquipoM6(
        juego.local
      )

      const dueñoVisitante =
      obtenerDueñoEquipoM6(
        juego.visitante
      )

      const soyLocal =
      dueñoLocal?.correo ===
      usuarioActual

      const soyVisitante =
      dueñoVisitante?.correo ===
      usuarioActual

      html += `

<div
class="
partidoMini
partidoMio
abrirPartido
"
data-local="${juego.local}"
data-visitante="${juego.visitante}"
data-fecha="${juego.fecha}"
>

          <img
            src="${obtenerBanderaM6(
              juego.local
            )}"
            class="banderaMini"
          >

          <div class="usuarioMini">

            ${
              soyLocal
              ? "👑 "
              : ""
            }

            ${
              dueñoLocal?.nombre
              || "?"
            }

          </div>

          <div class="equipoMini">

            ${juego.local}

          </div>

          <div class="vsMini">

            ⚔️

          </div>

          <img
            src="${obtenerBanderaM6(
              juego.visitante
            )}"
            class="banderaMini"
          >

          <div class="usuarioMini">

            ${
              soyVisitante
              ? "👑 "
              : ""
            }

            ${
              dueñoVisitante?.nombre
              || "?"
            }

          </div>

          <div class="equipoMini">

            ${juego.visitante}

          </div>

        </div>

      `

    })

    html += `

      </div>

    `

  }

  html += `
    </div>
  `

  contenedor.innerHTML =
  html

}

document
.addEventListener(
"click",
e=>{

const partido =
e.target.closest(
".abrirPartido"
)

if(partido){

const local =
partido.dataset.local

const visitante =
partido.dataset.visitante

const fecha =
partido.dataset.fecha

const dueñoLocal =
obtenerDueñoEquipoM6(
local
)

const dueñoVisitante =
obtenerDueñoEquipoM6(
visitante
)

abrirModalPartidoM6(

{
local,
visitante,
fecha
},

dueñoLocal,
dueñoVisitante

)

}

}

)

document
.getElementById(
"cerrarModalPartido"
)
?.addEventListener(
"click",
()=>{

document
.getElementById(
"modalPartido"
)
.classList.remove(
"modalPartidoActivo"
)

}
)

document
.getElementById(
"modalPartido"
)
?.addEventListener(
"click",
e=>{

if(
e.target.id ===
"modalPartido"
){

e.currentTarget
.classList.remove(
"modalPartidoActivo"
)

}

}
)

function esperarCalendarioM6(){

  const state =
  window.stateRefData()

  if(
    !state ||
    !state.assignments
  ){

    setTimeout(
      esperarCalendarioM6,
      500
    )

    return

  }

  renderCalendarioMiGrupo()

}

esperarCalendarioM6()
