import {

auth

}

from "./firebase.js"

import {

sendPasswordResetEmail

}

from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"

const boton =

document.getElementById(
"btnReset"
)

boton.addEventListener(
"click",
resetPassword
)

async function resetPassword(){

const email =

document
.getElementById("email")
.value
.trim()

if(

!email

){

alert(

"Primero escribe tu correo electrónico."

)

return

}

try{

await sendPasswordResetEmail(

auth,

email

)

alert(

"Se envió un enlace para restablecer tu contraseña.\n\nRevisa tu bandeja de entrada y también la carpeta de spam."

)

}catch(error){

switch(error.code){

case
"auth/user-not-found":

alert(
"No existe una cuenta con ese correo."
)

break

case
"auth/invalid-email":

alert(
"Correo electrónico inválido."
)

break

default:

alert(
error.message
)

}

}

}