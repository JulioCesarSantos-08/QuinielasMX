function buscarPropietario(equipo){

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

function mostrarEquipo(equipo){

const propietario =
buscarPropietario(equipo)

const nombreVisible =
window.obtenerNombreVisible(
propietario
)

const datosUsuario =
window.globalState.assignments?.[
propietario
]

const equiposUsuario = [

...(datosUsuario?.buenos || []),
...(datosUsuario?.malos || [])

]

const estado =
window.globalState.teamStatus?.[
equipo
]
||
"activo"

const tipo =
(
window.globalSettings.equiposBuenos || []
)
.includes(equipo)
?
"🏆 Fuerte"
:
"⚠️ Regular"

const contenidoModal =
document.getElementById(
"contenidoModal"
)

contenidoModal.innerHTML = `

<div class="infoEquipo">

<div class="infoCard">

<b>
🌎 Equipo
</b>

<br>

${equipo}

</div>

<div class="infoCard">

<b>
👤 Propietario
</b>

<br>

${nombreVisible}

</div>

<div class="infoCard">

<b>
📋 Tipo
</b>

<br>

${tipo}

</div>

<div class="infoCard">

<b>
📊 Estado
</b>

<br>

${
estado==="activo"
?
"🟢 Activo"
:
"❌ Eliminado"
}

</div>

<div class="infoCard">

<b>
⭐ Equipos del Usuario
</b>

<div class="listaEquipos">

${equiposUsuario.map(eq=>`

<div>

${eq}

</div>

`).join("")}

</div>

</div>

</div>

`

document.getElementById(
"modalEquipo"
).style.display =
"flex"

}

function activarClicksEquipos(){

document
.querySelectorAll(".equipoCard")
.forEach(card=>{

card.onclick = ()=>{

mostrarEquipo(
card.dataset.team
)

}

})

}

const esperarRender = setInterval(()=>{

if(
window.partidosListo
){

activarClicksEquipos()

clearInterval(
esperarRender
)

}

},500)

const modalEquipo =
document.getElementById(
"modalEquipo"
)

const cerrarModal =
document.getElementById(
"cerrarModal"
)

cerrarModal.onclick = ()=>{

modalEquipo.style.display =
"none"

}

modalEquipo.onclick = e=>{

if(
e.target === modalEquipo
){

modalEquipo.style.display =
"none"

}

}

window.addEventListener(
"click",
()=>{

setTimeout(()=>{

activarClicksEquipos()

},50)

}
)