import {

auth,
db

}

from "./firebase.js"

import {

signInWithEmailAndPassword

}

from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"

import {

doc,
getDoc

}

from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"

const boton =

document.getElementById(
"btnLogin"
)

boton.addEventListener(
"click",
login
)

document
.getElementById("password")
.addEventListener(
"keydown",
e=>{

if(
e.key==="Enter"
){

login()

}

}
)

async function login(){

const email =

document
.getElementById("email")
.value
.trim()

const password =

document
.getElementById("password")
.value
.trim()

if(

!email

||

!password

){

alert(
"Completa todos los campos."
)

return

}

try{

await signInWithEmailAndPassword(

auth,

email,

password

)

const usuario =

await getDoc(

doc(
db,
"usuarios",
email
)

)

if(

!usuario.exists()

){

alert(
"No se encontró la información del usuario."
)

return

}

const datos =
usuario.data()

localStorage.setItem(

"user",

email

)

localStorage.setItem(

"nombre",

datos.nombre

)

location.href =
"menu.html"

}catch(error){

switch(error.code){

case
"auth/user-not-found":

alert(
"El usuario no existe."
)

break

case
"auth/wrong-password":

alert(
"Contraseña incorrecta."
)

break

case
"auth/invalid-credential":

alert(
"Correo o contraseña incorrectos."
)

break

case
"auth/invalid-email":

alert(
"Correo inválido."
)

break

default:

alert(
error.message
)

}

}

}