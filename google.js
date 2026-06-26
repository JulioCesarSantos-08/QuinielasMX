import {

auth,
db,
googleProvider

}

from "./firebase.js"

import {

signInWithPopup

}

from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"

import {

doc,
getDoc,
setDoc

}

from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"

const boton =

document.getElementById(
"btnGoogle"
)

boton.addEventListener(
"click",
loginGoogle
)

async function loginGoogle(){

try{

const resultado =

await signInWithPopup(

auth,

googleProvider

)

const usuario =
resultado.user

const email =
usuario.email

const referencia =

doc(

db,

"usuarios",

email

)

const documento =

await getDoc(
referencia
)

let nombre = ""

if(

documento.exists()

){

nombre =
documento.data().nombre

}else{

nombre =

prompt(

"¿Con qué nombre quieres aparecer en la Quiniela?"

)

if(

!nombre

){

return

}

nombre =
nombre.trim()

if(

nombre.length<3

){

alert(
"El nombre debe tener al menos 3 caracteres."
)

return

}

await setDoc(

referencia,

{

nombre,

correo:email,

proveedor:"google",

fechaRegistro:
Date.now()

}

)

}

localStorage.setItem(

"user",

email

)

localStorage.setItem(

"nombre",

nombre

)

location.href =
"menu.html"

}catch(error){

switch(error.code){

case
"auth/popup-closed-by-user":

return

case
"auth/cancelled-popup-request":

return

default:

alert(
error.message
)

}

}

}