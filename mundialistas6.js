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

async function renderCalendarioMiGrupo(){

  const contenedor =
  document.getElementById(
    "calendarioMiGrupo"
  )

  if(!contenedor) return

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

  if(
    misPartidos.length === 0
  ){

    contenedor.innerHTML = `

      <div class="empty">

        No hay partidos cargados
        para tus equipos.

      </div>

    `

    return

  }

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
    `2026-06-${String(dia)
    .padStart(2,"0")}`

    const juegosDia =
    misPartidos.filter(
      p=>p.fecha===fecha
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

        ${juegosDia.map(juego=>`

          <div class="
            partidoMini
            partidoMio
          ">

            ${juego.local}

            <br>

            vs

            <br>

            ${juego.visitante}

          </div>

        `).join("")}

      </div>

    `

  }

  html += `
    </div>
  `

  contenedor.innerHTML =
  html

}

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