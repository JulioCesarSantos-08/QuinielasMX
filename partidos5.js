import {
doc,
getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"

async function cargarMisPartidos(){

const contenedor =
document.getElementById(
"misPartidos"
)

if(
!contenedor
||
!window.globalState
||
!window.globalSettings
){
return
}

const asignaciones =
window.globalState.assignments || {}

const misDatos =
asignaciones[
window.currentUser
]

if(!misDatos){

contenedor.innerHTML = `

<div class="empty">
No tienes equipos asignados
</div>

`

return

}

const misEquipos = [

...(misDatos.buenos || []),
...(misDatos.malos || [])

]

try{

const response =
await fetch(
"./partidosMundial.json"
)

const json =
await response.json()

const partidos =
json.partidos || []

const resultadosSnap =
await getDoc(
doc(
window.db,
"mundialCentro",
"resultados"
)
)

const resultados =
resultadosSnap.exists()
? resultadosSnap.data()
: {}

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
No tienes partidos registrados
</div>

`

return

}

let html =
`<div class="grid">`

misPartidos.forEach(partido=>{

const resultado =
resultados[
String(partido.id)
]

let estado = `

<div class="partidoPendiente">
⏳ Pendiente
</div>

`

if(
resultado &&
resultado.finalizado
){

const esLocal =
misEquipos.includes(
partido.local
)

const golesMiEquipo =
esLocal
? resultado.local
: resultado.visitante

const golesRival =
esLocal
? resultado.visitante
: resultado.local

if(
golesMiEquipo >
golesRival
){

estado = `

<div class="partidoGanado">

✅ Ganó

<br>

${golesMiEquipo}
-
${golesRival}

</div>

`

}
else if(
golesMiEquipo <
golesRival
){

estado = `

<div class="partidoPerdido">

❌ Perdió

<br>

${golesMiEquipo}
-
${golesRival}

</div>

`

}
else{

estado = `

<div class="partidoEmpate">

🤝 Empató

<br>

${golesMiEquipo}
-
${golesRival}

</div>

`

}

}

html += `

<div class="item">

<div style="
font-size:18px;
font-weight:800;
margin-bottom:10px;
">

⚽ ${partido.local}
vs
${partido.visitante}

</div>

<div style="
opacity:.8;
margin-bottom:10px;
">

📅 ${partido.fecha}

</div>

${estado}

</div>

`

})

html += `</div>`

contenedor.innerHTML =
html

}
catch(error){

console.error(
"Error cargando partidos:",
error
)

contenedor.innerHTML = `

<div class="empty">
Error al cargar partidos
</div>

`

}

}

const esperarSistema =
setInterval(()=>{

if(
window.partidosListo
){

clearInterval(
esperarSistema
)

cargarMisPartidos()

}

},300)