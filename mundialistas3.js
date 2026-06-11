function obtenerDueñoEquipoM3(team){

  const participants =
  window.participantsRefData()

  const state =
  window.stateRefData()

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

        user,

        nombre:
        participants[user]?.nombre
        || user

      }

    }

  }

  return null

}

function buscarGrupoM3(team){

  for(
    const [grupo,equipos]
    of Object.entries(
      window.GRUPOS
    )
  ){

    if(
      equipos.includes(team)
    ){

      return grupo

    }

  }

  return null

}

function renderMisEnfrentamientos(){

  const contenedor =
  document.getElementById(
    "misEnfrentamientos"
  )

  if(!contenedor) return

  const state =
  window.stateRefData()

  const asignacion =
  state.assignments?.[
    localStorage
    .getItem("user")
    ?.trim()
    .toLowerCase()
    .replace(/\./g,"_")
  ]

  if(!asignacion){

    contenedor.innerHTML = `
      <div class="empty">
        No participas actualmente
      </div>
    `
    return

  }

  const equiposUsuario = [

    ...(asignacion.buenos || []),

    ...(asignacion.malos || [])

  ]

  let html = ""

  equiposUsuario.forEach(team=>{

    const grupo =
    buscarGrupoM3(team)

    if(!grupo) return

    html += `

      <div class="grupoCard">

        <div class="grupoTitulo">

          ⚔️ ${team}

          · Grupo ${grupo}

        </div>

    `

    window.GRUPOS[grupo]
    .forEach(rival=>{

      if(rival===team) return

      const dueño =
      obtenerDueñoEquipoM3(
        rival
      )

      const status =
      state.teamStatus?.[rival]
      || "activo"

      html += `

        <div class="partidoCard">

          <div class="vs">

            ${team}

          </div>

          <div class="vs">

            VS

          </div>

          <div class="vs">

            ${rival}

          </div>

          <br>

          <div class="usuario">

            👤

            ${
              dueño?.nombre
              || "Sin dueño"
            }

          </div>

          <div>

            ${
              status==="activo"
              ? "🟢 Sigue vivo"
              : "🔴 Eliminado"
            }

          </div>

        </div>

      `

    })

    html += `
      </div>
    `

  })

  contenedor.innerHTML =
  html

}

function esperarDatosM3(){

  const state =
  window.stateRefData()

  if(
    !state ||
    !state.assignments
  ){

    setTimeout(
      esperarDatosM3,
      500
    )

    return

  }

  renderMisEnfrentamientos()

}

esperarDatosM3()