import {

auth,
db

}

from "./firebase.js"

import {

createUserWithEmailAndPassword

}

from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"

import {

collection,
doc,
getDocs,
setDoc

}

from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"

const boton =

document.getElementById(
"btnRegister"
)

boton.addEventListener(
"click",
registrar)

async function registrar(){

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

if(

password.length<6

){

alert(
"La contraseña debe tener al menos 6 caracteres."
)

return

}

let nombre =

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

const usuarios =

await getDocs(

collection(
db,
"usuarios"
)

)

let ocupado =
false

usuarios.forEach(docu=>{

const data =
docu.data()

if(

data.nombre

&&

data.nombre
.toLowerCase()

===

nombre
.toLowerCase()

){

ocupado =
true

}

})

if(

ocupado

){

alert(
"Ese nombre ya está siendo utilizado."
)

return

}

try{

await createUserWithEmailAndPassword(

auth,

email,

password

)

await setDoc(

doc(
db,
"usuarios",
email
),

{

nombre,

correo:email,

proveedor:"password",

fechaRegistro:
Date.now()

}

)

alert(
"Registro exitoso. Ya puedes iniciar sesión."
)

}catch(error){

switch(error.code){

case
"auth/email-already-in-use":

alert(
"Ese correo ya está registrado."
)

break

case
"auth/invalid-email":

alert(
"Correo inválido."
)

break

case
"auth/weak-password":

alert(
"La contraseña es demasiado débil."
)

break

default:

alert(
error.message
)

}

}

}