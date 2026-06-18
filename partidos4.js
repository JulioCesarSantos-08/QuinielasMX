function obtenerPropietarioEquipo(equipo){

const assignments =
window.globalState.assignments || {}

for(
const [usuario,data]
of Object.entries(assignments)
){

const equipos = [

...(data.buenos || []),
...(data.malos || [])

]

if(
equipos.includes(equipo)
){

return usuario

}

}

return null

}

function crearCardEliminacion({

equipoGanador,
equipoPerdedor,
usuarioGanador,
usuarioPerdedor

}){

const nombreGanador =
window.obtenerNombreVisible(
usuarioGanador
)

const nombrePerdedor =
window.obtenerNombreVisible(
usuarioPerdedor
)

return `

<div class="item">

<div style="
font-size:18px;
font-weight:800;
margin-bottom:10px;
">

⚔️ ${equipoGanador}

eliminó a

${equipoPerdedor}

</div>

<div>

👤

<b>${nombreGanador}</b>

eliminó a

<b>${nombrePerdedor}</b>

</div>

</div>

`

}

function renderHistorialEliminaciones(){

const contenedor =
document.getElementById(
"historialEliminaciones"
)

if(!contenedor){

return

}

const eliminadoPor =
window.globalState.eliminadoPor || {}

const eliminaciones =
Object.entries(eliminadoPor)

if(
eliminaciones.length === 0
){

contenedor.innerHTML = `

<div class="empty">

Todavía no hay eliminaciones registradas

</div>

`

return

}

const html =

eliminaciones
.reverse()
.map(([equipoPerdedor,equipoGanador])=>{

const usuarioPerdedor =
obtenerPropietarioEquipo(
equipoPerdedor
)

const usuarioGanador =
obtenerPropietarioEquipo(
equipoGanador
)

return crearCardEliminacion({

equipoGanador,
equipoPerdedor,
usuarioGanador,
usuarioPerdedor

})

})
.join("")

contenedor.innerHTML =
html

}

const esperarHistorial =
setInterval(()=>{

if(
window.partidosListo
){

clearInterval(
esperarHistorial
)

renderHistorialEliminaciones()

}

},300)