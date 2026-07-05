import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"

import {

getFirestore,

collection,

getDocs,

doc,

setDoc,

getDoc,

deleteDoc

} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"

const firebaseConfig={

apiKey:"AIzaSyBky5T7wDukelYg3Giq_pXc4oveyfHN7go",

authDomain:"rifaboletos-c1d0d.firebaseapp.com",

projectId:"rifaboletos-c1d0d",

storageBucket:"rifaboletos-c1d0d.appspot.com",

messagingSenderId:"27051588350",

appId:"1:27051588350:web:74559bf1d4fd5a67f603af"

}

const app=initializeApp(firebaseConfig)

const db=getFirestore(app)

const usuariosBody=document.getElementById("usuariosBody")

const equipos=document.getElementById("equipos")

const estadoEquiposBody=document.getElementById("estadoEquiposBody")

const guardarUsuarios=document.getElementById("guardarUsuarios")

const guardarEquipos=document.getElementById("guardarEquipos")

const guardarEstados=document.getElementById("guardarEstados")

const resetPruebas=document.getElementById("resetPruebas")

const resetTotal=document.getElementById("resetTotal")

const settingsRef=doc(db,"ruleta16s","settings")

const participantsRef=doc(db,"ruleta16s","participants")

const stateRef=doc(db,"ruleta16s","state")

function sanitize(email){

return email

.trim()

.toLowerCase()

.replace(/\./g,"_")

}

async function cargarUsuarios(){

usuariosBody.innerHTML=""

const usuariosSnap=

await getDocs(

collection(db,"usuarios")

)

let savedParticipants={}

const pSnap=

await getDoc(participantsRef)

if(pSnap.exists()){

savedParticipants=pSnap.data()

}

usuariosSnap.forEach(docSnap=>{

const data=docSnap.data()

const originalEmail=docSnap.id

const email=sanitize(originalEmail)

const nombre=

data.nombre||originalEmail

const info=

savedParticipants[email]||{}

const participa=

!!savedParticipants[email]

const entradas=

info.entradas||0

const tr=document.createElement("tr")

tr.innerHTML=`

<td>

<input

type="checkbox"

class="checkParticipa"

data-email="${email}"

${participa?"checked":""}

>

</td>

<td>

${nombre}

</td>

<td>

<input

type="number"

min="0"

value="${entradas}"

class="inputEntradas"

data-email="${email}"

>

</td>

`

usuariosBody.appendChild(tr)

})

}

function generarInputsEquipos(){

equipos.innerHTML=""

for(

let i=1;

i<=8;

i++

){

equipos.innerHTML+=`

<input

type="text"

placeholder="Equipo ${i}"

>

`

}

}

guardarUsuarios.addEventListener(

"click",

async()=>{

const checks=

document.querySelectorAll(

".checkParticipa"

)

const inputs=

document.querySelectorAll(

".inputEntradas"

)

const participantes={}

checks.forEach(

(check,index)=>{

const email=

sanitize(

check.dataset.email

)

const entradas=

Number(

inputs[index].value

)||0

if(

check.checked

&&

entradas>0

){

participantes[email]={

nombre:

check

.closest("tr")

.children[1]

.textContent

.trim(),

entradas,

giros:entradas

}

}

}

)

await setDoc(

participantsRef,

participantes

)

alert(

"Participantes guardados"

)

await cargarUsuarios()

}

)

guardarEquipos.addEventListener(

"click",

async()=>{

const lista=

Array.from(

equipos.querySelectorAll("input")

)

.map(i=>i.value.trim())

.filter(Boolean)

if(lista.length!==8){

alert(

"Debes ingresar exactamente 8 equipos"

)

return

}

await setDoc(

settingsRef,

{

equipos:lista

}

)

await setDoc(

stateRef,

{

equiposDisponibles:lista

},

{

merge:true

}

)

await actualizarTablaEstados()

alert(

"Equipos guardados"

)

}

)

async function cargarEquiposGuardados(){

const snap=

await getDoc(settingsRef)

if(!snap.exists())return

const data=snap.data()

const lista=data.equipos||[]

const inputs=

equipos.querySelectorAll("input")

lista.forEach((eq,i)=>{

if(inputs[i]){

inputs[i].value=eq

}

})

}
async function actualizarTablaEstados(){

estadoEquiposBody.innerHTML=""

const settingsSnap=

await getDoc(settingsRef)

if(!settingsSnap.exists())return

const data=settingsSnap.data()

const lista=data.equipos||[]

const stateSnap=

await getDoc(stateRef)

let estados={}

let eliminadoPor={}

if(stateSnap.exists()){

estados=

stateSnap.data().teamStatus||{}

eliminadoPor=

stateSnap.data().eliminadoPor||{}

}

lista.forEach(team=>{

const estado=

estados[team]||"activo"

const tr=

document.createElement("tr")

tr.innerHTML=`

<td>

${team}

</td>

<td>

<select data-team="${team}">

<option

value="activo"

${estado==="activo"?"selected":""}

>

Compitiendo

</option>

<option

value="eliminado"

${estado==="eliminado"?"selected":""}

>

Eliminado

</option>

</select>

<span class="estado ${estado}">

${estado==="activo"

?

"🟢 Compitiendo"

:

"❌ Eliminado"

}

</span>

</td>

<td>

<input

type="text"

class="inputEliminador"

data-team="${team}"

placeholder="Ej: Brasil"

value="${eliminadoPor[team]||""}"

>

</td>

`

estadoEquiposBody.appendChild(tr)

})

}

guardarEstados.addEventListener(

"click",

async()=>{

const selects=

estadoEquiposBody.querySelectorAll("select")

const inputs=

estadoEquiposBody.querySelectorAll(".inputEliminador")

const estados={}

const eliminadoPor={}

selects.forEach(sel=>{

estados[sel.dataset.team]=sel.value

})

inputs.forEach(input=>{

const ganador=

input.value.trim()

if(ganador){

eliminadoPor[input.dataset.team]=ganador

}

})

await setDoc(

stateRef,

{

teamStatus:estados,

eliminadoPor

},

{

merge:true

}

)

await actualizarTablaEstados()

alert(

"Estados actualizados"

)

}

)

resetPruebas.addEventListener(

"click",

async()=>{

const seguro=

confirm(

"¿Reiniciar sorteo?"

)

if(!seguro)return

const pSnap=

await getDoc(participantsRef)

if(!pSnap.exists())return

const participants=

pSnap.data()

Object.keys(participants)

.forEach(email=>{

const entradas=

participants[email].entradas||0

participants[email].giros=

entradas

})

const settingsSnap=

await getDoc(settingsRef)

const settings=

settingsSnap.data()

await setDoc(

participantsRef,

participants

)

await setDoc(

stateRef,

{

assignments:{},

equiposDisponibles:

settings.equipos||[]

},

{

merge:true

}

)

alert(

"Sorteo reiniciado"

)

}

)

resetTotal.addEventListener(

"click",

async()=>{

const seguro=

confirm(

"¿Seguro que deseas borrar TODO?"

)

if(!seguro)return

await deleteDoc(settingsRef)

await deleteDoc(participantsRef)

await deleteDoc(stateRef)

alert(

"Sistema reiniciado"

)

location.reload()

}

)

generarInputsEquipos()

await cargarUsuarios()

await cargarEquiposGuardados()

await actualizarTablaEstados()
