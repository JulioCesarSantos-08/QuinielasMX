function obtenerDueñoEquipoGlobal(team){

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

        nombre:
        participants[user]?.nombre
        || user,

        user

      }

    }

  }

  return null

}

function renderTodosLosGrupos(){

  const contenedor =
  document.getElementById(
    "todosLosGrupos"
  )

  if(!contenedor) return

  const state =
  window.stateRefData()

  let html = ""

  Object.entries(
    window.GRUPOS
  ).forEach(([grupo,equipos])=>{

    html += `

      <div class="grupoCard">

        <div class="grupoTitulo">
          🌍 Grupo ${grupo}
        </div>

    `

    equipos.forEach(team=>{

      const dueño =
      obtenerDueñoEquipoGlobal(
        team
      )

      const status =
      state.teamStatus?.[team]
      || "activo"

      html += `

        <div class="
          integrante
          ${
            status==="activo"
            ? "clasificado"
            : "eliminado"
          }
        ">

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

          <div>

            ${
              status==="activo"
              ? "🟢"
              : "🔴"
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

function renderClasificados(){

  const contenedor =
  document.getElementById(
    "clasificados"
  )

  if(!contenedor) return

  const state =
  window.stateRefData()

  let html = ""

  Object.entries(
    window.GRUPOS
  ).forEach(([grupo,equipos])=>{

    const activos =

    equipos.filter(team=>{

      return (
        state.teamStatus?.[team]
        || "activo"
      ) === "activo"

    })

    html += `

      <div class="grupoCard">

        <div class="grupoTitulo">

          🏆 Grupo ${grupo}

        </div>

    `

    if(!activos.length){

      html += `
        <div class="empty">
          Sin equipos vivos
        </div>
      `

    }

    activos.forEach(team=>{

      const dueño =
      obtenerDueñoEquipoGlobal(
        team
      )

      html += `

        <div class="integrante clasificado">

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

    html += `
      </div>
    `

  })

  contenedor.innerHTML =
  html

}

function renderLlaves(){

  const contenedor =
  document.getElementById(
    "llaves"
  )

  if(!contenedor) return

  const llaves = [

    ["A","B"],
    ["C","D"],
    ["E","F"],
    ["G","H"],
    ["I","J"],
    ["K","L"]

  ]

  let html = `
    <div class="llavesContainer">
  `

  llaves.forEach(par=>{

    html += `

      <div class="partidoCard">

        <div class="grupoTitulo">

          ⚔️ Grupo ${par[0]}
          vs
          Grupo ${par[1]}

        </div>

        <div class="vs">

          1${par[0]}
          vs
          2${par[1]}

        </div>

        <div class="vs">

          1${par[1]}
          vs
          2${par[0]}

        </div>

      </div>

    `

  })

  html += `
    </div>
  `

  contenedor.innerHTML =
  html

}

function esperarDatos(){

  const state =
  window.stateRefData()

  if(
    !state ||
    !state.assignments
  ){

    setTimeout(
      esperarDatos,
      500
    )

    return

  }

  renderTodosLosGrupos()

  renderClasificados()

  renderLlaves()

}

esperarDatos()