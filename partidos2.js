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

window.renderPartidos = function(){

const estadoMundial =
document.getElementById(
"estadoMundial"
)

const premioRegular =
document.getElementById(
"premioRegular"
)

const misEquipos =
document.getElementById(
"misEquipos"
)

const fuertesVivos =
document.getElementById(
"fuertesVivos"
)

const regularesVivos =
document.getElementById(
"regularesVivos"
)

const fuertes =
window.globalSettings.equiposBuenos || []

const regulares =
window.globalSettings.equiposMalos || []

const teamStatus =
window.globalState.teamStatus || {}

const fuertesActivos =
fuertes.filter(team=>

(teamStatus[team] || "activo")
=== "activo"

)

const regularesActivos =
regulares.filter(team=>

(teamStatus[team] || "activo")
=== "activo"

)

estadoMundial.innerHTML = `

<div class="grid">

<div class="item">

🏆 Fuertes vivos

<br><br>

${fuertesActivos.length}
/
${fuertes.length}

</div>

<div class="item">

🎁 Regulares vivos

<br><br>

${regularesActivos.length}
/
${regulares.length}

</div>

</div>

`

if(
regularesActivos.length === 1
){

const equipo =
regularesActivos[0]

const propietario =
buscarPropietario(equipo)

premioRegular.innerHTML = `

<div
class="item equipoCard"
data-team="${equipo}"
>

🏆 Último Regular Vivo

<br><br>

${equipo}

<br><br>

👤 ${
window.obtenerNombreVisible(
propietario
)
}

</div>

`

}else{

premioRegular.innerHTML = `

<div class="item">

Regulares vivos:

<br><br>

${regularesActivos.length}

</div>

`

}

const misDatos =
window.globalState.assignments?.[
window.currentUser
]

if(
misDatos
){

const equiposUsuario = [

...(misDatos.buenos || []),
...(misDatos.malos || [])

]

misEquipos.innerHTML =

`<div class="grid">`

+

equiposUsuario.map(team=>{

const estado =
teamStatus[team]
||
"activo"

return `

<div
class="item equipoCard"
data-team="${team}"
>

${team}

<br><br>

<span class="${
estado==="activo"
?
"vivo"
:
"eliminado"
}">

${
estado==="activo"
?
"🟢 Activo"
:
"❌ Eliminado"
}

</span>

</div>

`

}).join("")

+

`</div>`

}else{

misEquipos.innerHTML = `

<div class="empty">

No tienes equipos asignados

</div>

`

}

fuertesVivos.innerHTML =

`<div class="grid">`

+

fuertesActivos.map(team=>`

<div
class="item vivo equipoCard"
data-team="${team}"
>

🟢 ${team}

</div>

`).join("")

+

`</div>`

regularesVivos.innerHTML =

`<div class="grid">`

+

regularesActivos.map(team=>`

<div
class="item vivo equipoCard"
data-team="${team}"
>

🟢 ${team}

</div>

`).join("")

+

`</div>`

}

const esperarDatos = setInterval(()=>{

if(
window.partidosListo
){

clearInterval(
esperarDatos
)

window.renderPartidos()

}

},300)