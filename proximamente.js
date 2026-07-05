const dias=document.getElementById("dias")
const horas=document.getElementById("horas")
const minutos=document.getElementById("minutos")
const segundos=document.getElementById("segundos")
const estado=document.getElementById("estado")
const audio=document.getElementById("bgMusic")

const playlistOriginal=[
"imagenes/Mundial.mp3",
"imagenes/Mundial2.mp3",
"imagenes/Mundial3.mp3",
"imagenes/Mundial4.mp3"
]

let playlist=[]

function mezclarCanciones(){

playlist=[...playlistOriginal]

for(let i=playlist.length-1;i>0;i--){

const j=Math.floor(Math.random()*(i+1))

;[playlist[i],playlist[j]]=[playlist[j],playlist[i]]

}

}

async function reproducirSiguiente(){

if(playlist.length===0){

mezclarCanciones()

}

audio.src=playlist.shift()

try{

await audio.play()

}catch{}

}

audio.addEventListener(
"ended",
reproducirSiguiente
)

audio.volume=.30

const iniciarMusica=()=>{

reproducirSiguiente()

document.removeEventListener(
"click",
iniciarMusica
)

document.removeEventListener(
"touchstart",
iniciarMusica
)

}

try{

reproducirSiguiente()

}catch{

document.addEventListener(
"click",
iniciarMusica,
{once:true}
)

document.addEventListener(
"touchstart",
iniciarMusica,
{once:true}
)

}

const objetivo=new Date(
"2026-07-08T20:30:00"
).getTime()

function actualizar(){

const ahora=Date.now()

let diferencia=objetivo-ahora

if(diferencia<=0){

dias.textContent="00"
horas.textContent="00"
minutos.textContent="00"
segundos.textContent="00"

estado.classList.add("final")

estado.innerHTML=`

🎉<br><br>

¡EL SORTEO YA ESTÁ DISPONIBLE!<br><br>

Redirigiendo...

`

setTimeout(()=>{

location.href="ruleta16s.html"

},3000)

return

}

const d=Math.floor(
diferencia/86400000
)

const h=Math.floor(
(diferencia%86400000)/3600000
)

const m=Math.floor(
(diferencia%3600000)/60000
)

const s=Math.floor(
(diferencia%60000)/1000
)

dias.textContent=
String(d).padStart(2,"0")

horas.textContent=
String(h).padStart(2,"0")

minutos.textContent=
String(m).padStart(2,"0")

segundos.textContent=
String(s).padStart(2,"0")

if(d===0&&h===0&&m===0&&s<=10){

segundos.classList.add("urgente")

estado.innerHTML=`

🚨 ¡Comenzamos en segundos!

`

}else{

segundos.classList.remove("urgente")

estado.innerHTML=`

⏳ Esperando el inicio del sorteo oficial...

`

}

}

actualizar()

setInterval(
actualizar,
1000
)