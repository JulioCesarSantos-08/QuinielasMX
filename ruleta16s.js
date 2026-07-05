import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"

import {

  getFirestore,

  doc,

  getDoc,

  onSnapshot,

  runTransaction

} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"

const firebaseConfig = {

  apiKey: "AIzaSyBky5T7wDukelYg3Giq_pXc4oveyfHN7go",

  authDomain: "rifaboletos-c1d0d.firebaseapp.com",

  projectId: "rifaboletos-c1d0d",

  storageBucket: "rifaboletos-c1d0d.appspot.com",

  messagingSenderId: "27051588350",

  appId: "1:27051588350:web:74559bf1d4fd5a67f603af"

}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

const saludo = document.getElementById("saludo")

const entradasText = document.getElementById("entradasText")

const girosText = document.getElementById("girosText")

const spin = document.getElementById("spin")

const msg = document.getElementById("msg")

const tablaBody = document.getElementById("tablaBody")

const misEquipos = document.getElementById("misEquipos")

const themeToggle = document.getElementById("themeToggle")

const toast = document.getElementById("toast")

const audio = document.getElementById("bgMusic")

const canvas = document.getElementById("wheel")

const ctx = canvas.getContext("2d")

/* ===========================
      FIREBASE NUEVO
=========================== */

const settingsRef = doc(

  db,

  "ruleta16s",

  "settings"

)

const participantsRef = doc(

  db,

  "ruleta16s",

  "participants"

)

const stateRef = doc(

  db,

  "ruleta16s",

  "state"

)

let currentUser = null

let currentName = null

let settings = {}

let state = {}

let participants = {}

let spinning = false

const playlistOriginal=[

"imagenes/mundial.mp3",

"imagenes/mundial2.mp3",

"imagenes/mundial3.mp3",

"imagenes/mundial4.mp3"

]

let playlist=[]

function mezclarCanciones(){

playlist=[...playlistOriginal]

for(

let i=playlist.length-1;

i>0;

i--

){

const j=Math.floor(

Math.random()*(i+1)

)

;[playlist[i],playlist[j]]=[

playlist[j],

playlist[i]

]

}

}

async function reproducirSiguiente(){

if(playlist.length===0){

mezclarCanciones()

}

audio.pause()

audio.currentTime=0

audio.src=playlist.shift()

audio.load()

await audio.play()

}

audio.addEventListener(

"ended",

reproducirSiguiente

)
audio.volume=0.30

/* ===========================
      UTILIDADES
=========================== */

function sanitizeUser(user){

  return user

    .trim()

    .toLowerCase()

    .replace(/\./g,"_")

}

function normalizeParticipants(data){

  const clean={}

  Object.entries(data||{}).forEach(

    ([key,value])=>{

      if(

        typeof value==="object"

        &&

        value!==null

      ){

        clean[key]=value

      }

    }

  )

  return clean

}

function showToast(text){

  toast.textContent=text

  toast.classList.remove("hidden")

  setTimeout(()=>{

    toast.classList.add("hidden")

  },3500)

}

function loadTheme(){

  const saved=

  localStorage.getItem("theme")

  if(saved==="light"){

    document.body.classList.add("light")

    themeToggle.textContent="☀️"

  }

}

themeToggle.addEventListener(

"click",

()=>{

document.body.classList.toggle("light")

const isLight=

document.body.classList.contains("light")

localStorage.setItem(

"theme",

isLight?"light":"dark"

)

themeToggle.textContent=

isLight?"☀️":"🌙"

}

)

function checkSession(){

const user=

localStorage.getItem("user")

const nombre=

localStorage.getItem("nombre")

if(!user){

location.href="index.html"

return false

}

currentUser=sanitizeUser(user)

currentName=nombre||user

saludo.textContent=`Hola ${currentName}`

return true

}

/* ===========================
      RULETA
=========================== */

function resizeCanvas(canvas){

const size=

Math.min(

520,

window.innerWidth-40

)

canvas.width=size

canvas.height=size

}

function drawWheel(

canvas,

ctx,

teams,

rotation=0

){

if(!teams||teams.length===0)return

resizeCanvas(canvas)

const w=canvas.width

const h=canvas.height

const cx=w/2

const cy=h/2

const radius=

Math.min(cx,cy)-10

ctx.clearRect(0,0,w,h)

ctx.save()

ctx.translate(cx,cy)

ctx.rotate(

(rotation*Math.PI)/180

)

ctx.translate(-cx,-cy)

const colors=[

"#00b3ff",

"#14d47a",

"#ffcc45",

"#ff5f5f",

"#7a5cff",

"#ff8c42",

"#00d2a0",

"#f54291"

]

const n=teams.length

const slice=(2*Math.PI)/n

for(

let i=0;

i<n;

i++

){

const start=i*slice

const end=start+slice

ctx.beginPath()

ctx.moveTo(cx,cy)

ctx.arc(

cx,

cy,

radius,

start,

end

)

ctx.closePath()

ctx.fillStyle=

colors[i%colors.length]

ctx.fill()

ctx.save()

ctx.translate(cx,cy)

ctx.rotate(start+slice/2)

ctx.textAlign="right"

ctx.fillStyle="#fff"

ctx.font=

`${Math.round(w*.038)}px bold sans-serif`

ctx.fillText(

teams[i],

radius-18,

0

)

ctx.restore()

}

ctx.restore()

ctx.beginPath()

ctx.arc(

cx,

cy,

radius*.14,

0,

Math.PI*2

)

ctx.fillStyle="#111"

ctx.fill()

}
function animateWheel(

canvas,

ctx,

teams,

selected

){

return new Promise((resolve)=>{

const n=teams.length

const idx=teams.indexOf(selected)

const slice=360/n

const target=

270-(idx*slice+slice/2)

const spins=

6+Math.floor(

Math.random()*3

)

const total=

spins*360+target

const duration=5500

const start=performance.now()

function frame(now){

const t=

Math.min(

(now-start)/duration,

1

)

const ease=

1-Math.pow(1-t,3)

const deg=

ease*total

drawWheel(

canvas,

ctx,

teams,

deg

)

if(t<1){

requestAnimationFrame(frame)

}else{

resolve()

}

}

requestAnimationFrame(frame)

})

}

/* ===========================
      GIRAR RULETA
=========================== */

async function spinWheel(){

if(spinning)return

const pData=

participants[currentUser]

if(!pData){

showToast(

"No tienes acceso"

)

return

}

if(

(pData.giros||0)<=0

){

showToast(

"No tienes giros disponibles"

)

return

}

spinning=true

let selected=null

try{

await runTransaction(

db,

async(transaction)=>{

const stateSnap=

await transaction.get(

stateRef

)

const participantsSnap=

await transaction.get(

participantsRef

)

const currentState=

stateSnap.data()

const currentParticipants=

normalizeParticipants(

participantsSnap.data()

)

const userData=

currentParticipants[currentUser]

if(

!currentState.assignments

){

currentState.assignments={}

}

if(

!currentState.assignments[currentUser]

){

currentState.assignments[currentUser]=[]

}

const disponibles=[

...(currentState.equiposDisponibles||[])

]

if(

disponibles.length===0

){

throw new Error(

"No quedan equipos"

)

}

selected=

disponibles[

Math.floor(

Math.random()

*

disponibles.length

)

]

currentState

.assignments[currentUser]

.push(selected)

currentState

.equiposDisponibles=

currentState

.equiposDisponibles

.filter(

t=>t!==selected

)

userData.giros-=1

transaction.set(

participantsRef,

currentParticipants

)

transaction.update(

stateRef,

currentState

)

}

)

}catch(error){

console.error(error)

showToast(

"No quedan equipos disponibles"

)

spinning=false

return

}

msg.textContent=

"🎡 Girando..."

await animateWheel(

canvas,

ctx,

settings.equipos||[],

selected

)

msg.textContent=

`🏆 Equipo asignado: ${selected}`

showToast(

`Te tocó ${selected}`

)

spinning=false

}

spin.addEventListener(

"click",

spinWheel

)
/* ===========================
      RENDER MIS EQUIPOS
=========================== */

function renderMyTeams(){

misEquipos.innerHTML=""

const mine=

state.assignments?.[currentUser]||[]

if(mine.length===0){

misEquipos.innerHTML=`

<div class="team-chip">

Sin equipos asignados

</div>

`

return

}

mine.forEach(team=>{

const status=

state.teamStatus?.[team]||

"activo"

misEquipos.innerHTML+=`

<div class="team-chip ${status}">

${status==="activo"?"🟢":"❌"}

${team}

</div>

`

})

}

/* ===========================
      TABLA GENERAL
=========================== */

function renderTable(){

tablaBody.innerHTML=""

Object.entries(

participants

).forEach(

([email,p])=>{

if(

typeof p!=="object"

||

p===null

)return

const equipos=

state.assignments?.[email]||[]

let estadoFinal=`

<span class="estadoBadge">

⏳ Sin equipos

</span>

`

if(equipos.length>0){

const activo=

equipos.some(team=>{

return(

state.teamStatus?.[team]

||

"activo"

)==="activo"

})

estadoFinal=

activo

?

`

<span class="estadoBadge good">

🟢 Compitiendo

</span>

`

:

`

<span class="estadoBadge bad">

❌ Eliminado

</span>

`

}

tablaBody.innerHTML+=`

<tr>

<td>

${p.nombre||email}

</td>

<td>

${equipos.length

?

equipos.join(", ")

:

"-"

}

</td>

<td>

${estadoFinal}

</td>

</tr>

`

}

)

}

/* ===========================
      ESTADÍSTICAS
=========================== */

function updateStats(){

const data=

participants[currentUser]

if(!data)return

entradasText.textContent=

data.entradas||0

girosText.textContent=

data.giros||0

}

function updateButtons(){

const data=

participants[currentUser]

if(!data)return

spin.disabled=

(data.giros||0)<=0

}

/* ===========================
      TIEMPO REAL
=========================== */

function listenRealtime(){

onSnapshot(

settingsRef,

snap=>{

if(!snap.exists())return

settings=snap.data()

drawWheel(

canvas,

ctx,

state.equiposDisponibles

||

settings.equipos

||

[]

)

}

)

onSnapshot(

stateRef,

snap=>{

if(!snap.exists())return

state=snap.data()

renderMyTeams()

renderTable()

drawWheel(

canvas,

ctx,

state.equiposDisponibles||[]

)

}

)

onSnapshot(

participantsRef,

snap=>{

if(!snap.exists())return

participants=

normalizeParticipants(

snap.data()

)

if(

!participants[currentUser]

){

showToast(

"No estás autorizado"

)

setTimeout(()=>{

location.href="menu.html"

},2000)

return

}

renderTable()

updateStats()

updateButtons()

}

)

}

window.addEventListener(

"resize",

()=>{

drawWheel(

canvas,

ctx,

state.equiposDisponibles

||

settings.equipos

||

[]

)

}

)
/* ===========================
      INICIALIZAR
=========================== */

async function init(){

loadTheme()

mezclarCanciones()

const iniciarMusica=()=>{

reproducirSiguiente().catch(()=>{})

eventos.forEach(evento=>{

document.removeEventListener(

evento,

iniciarMusica

)

})

}

const eventos=[

"click",

"touchstart",

"touchend",

"pointerdown",

"mousedown",

"keydown",

"scroll"

]

eventos.forEach(evento=>{

document.addEventListener(

evento,

iniciarMusica,

{once:true,passive:true}

)

})

if(!checkSession())return



const settingsSnap=

await getDoc(

settingsRef

)

const stateSnap=

await getDoc(

stateRef

)

const participantsSnap=

await getDoc(

participantsRef

)

settings=

settingsSnap.exists()

?

settingsSnap.data()

:

{}

state=

stateSnap.exists()

?

stateSnap.data()

:

{}

participants=

participantsSnap.exists()

?

normalizeParticipants(

participantsSnap.data()

)

:

{}

drawWheel(

canvas,

ctx,

state.equiposDisponibles

||

settings.equipos

||

[]

)

if(

participants[currentUser]

){

renderMyTeams()

renderTable()

updateStats()

updateButtons()

}else{

entradasText.textContent="0"

girosText.textContent="0"

spin.disabled=true

showToast(

"No tienes giros asignados"

)

}

listenRealtime()

}

init()
