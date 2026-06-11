function obtenerDatosM4() {

  const state =
  window.stateRefData()

  const participants =
  window.participantsRefData()

  return {
    state,
    participants
  }

}

function obtenerDueñoM4(team) {

  const {
    state,
    participants
  } = obtenerDatosM4()

  for (
    const [user,data]
    of Object.entries(
      state.assignments || {}
    )
  ) {

    const equipos = [

      ...(data.buenos || []),

      ...(data.malos || [])

    ]

    if (
      equipos.includes(team)
    ) {

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

function buscarGrupoM4(team) {

  for (
    const [grupo,equipos]
    of Object.entries(
      window.GRUPOS
    )
  ) {

    if (
      equipos.includes(team)
    ) {

      return grupo

    }

  }

  return null

}

function renderCaminoCampeonato() {

  const contenedor =
  document.getElementById(
    "caminoCampeonato"
  )

  if (!contenedor) return

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

  if (!asignacion) {

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

  equiposUsuario.forEach(team => {

    const grupo =
    buscarGrupoM4(team)

    const status =
    state.teamStatus?.[team]
    || "activo"

    const vivosGrupo =
    window.GRUPOS[grupo]
    .filter(equipo => {

      return (
        state.teamStatus?.[
          equipo
        ] || "activo"
      ) === "activo"

    })

    html += `

      <div class="grupoCard">

        <div class="grupoTitulo">

          🏆 Camino de ${team}

        </div>

        <div class="partidoCard">

          <strong>
          Grupo ${grupo}
          </strong>

          <br><br>

          Estado:

          ${
            status === "activo"
            ? "🟢 Sigue vivo"
            : "🔴 Eliminado"
          }

        </div>

        <div class="partidoCard">

          <strong>
          Rivales vivos del grupo
          </strong>

        </div>

    `

    vivosGrupo.forEach(rival => {

      const dueño =
      obtenerDueñoM4(rival)

      const esMio =
      rival === team

      html += `

        <div class="integrante">

          <div class="integranteInfo">

            <div class="usuario">

              ${
                esMio
                ? "👑 " + (
                  dueño?.nombre
                  || "Tú"
                )
                : (
                  dueño?.nombre
                  || "Sin dueño"
                )
              }

            </div>

            <div class="equipo">

              ${rival}

            </div>

          </div>

        </div>

      `

    })

    html += `

      <div class="partidoCard">

        <strong>
        Próximamente
        </strong>

        <br><br>

        ⚔️ Octavos

        <br>

        ⚔️ Cuartos

        <br>

        ⚔️ Semifinal

        <br>

        🏆 Final

      </div>

      </div>

    `

  })

  contenedor.innerHTML =
  html

}

function esperarDatosM4() {

  const state =
  window.stateRefData()

  if (
    !state ||
    !state.assignments
  ) {

    setTimeout(
      esperarDatosM4,
      500
    )

    return

  }

  renderCaminoCampeonato()

}

esperarDatosM4()