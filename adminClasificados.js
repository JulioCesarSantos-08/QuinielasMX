import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBky5T7wDukelYg3Giq_pXc4oveyfHN7go",
  authDomain: "rifaboletos-c1d0d.firebaseapp.com",
  projectId: "rifaboletos-c1d0d",
  storageBucket: "rifaboletos-c1d0d.appspot.com",
  messagingSenderId: "27051588350",
  appId: "1:27051588350:web:74559bf1d4fd5a67f603af"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const gruposContainer = document.getElementById("gruposContainer");

const GRUPOS = {
  A: [
    "México",
    "Sudáfrica",
    "Corea del Sur",
    "República Checa"
  ],

  B: [
    "Canadá",
    "Bosnia y Herzegovina",
    "Catar",
    "Suiza"
  ],

  C: [
    "Brasil",
    "Marruecos",
    "Haití",
    "Escocia"
  ],

  D: [
    "Estados Unidos",
    "Paraguay",
    "Australia",
    "Turquía"
  ],

  E: [
    "Alemania",
    "Curazao",
    "Costa de Marfil",
    "Ecuador"
  ],

  F: [
    "Países Bajos",
    "Japón",
    "Suecia",
    "Túnez"
  ],

  G: [
    "Bélgica",
    "Egipto",
    "Irán",
    "Nueva Zelanda"
  ],

  H: [
    "España",
    "Cabo Verde",
    "Arabia Saudita",
    "Uruguay"
  ],

  I: [
    "Francia",
    "Senegal",
    "Irak",
    "Noruega"
  ],

  J: [
    "Argentina",
    "Argelia",
    "Austria",
    "Jordania"
  ],

  K: [
    "Portugal",
    "El Congo",
    "Uzbekistán",
    "Colombia"
  ],

  L: [
    "Inglaterra",
    "Croacia",
    "Ghana",
    "Panamá"
  ]
};

function crearGrupoHTML(letra, equipos, guardados = {}) {
  const div = document.createElement("div");

  div.className = "grupoCard";

  div.innerHTML = `
    <div class="grupoTitulo">
      🏆 Grupo ${letra}
    </div>

    <div class="campo">
      <label>🥇 Primer Lugar</label>

      <select id="${letra}1">
        <option value="">Sin definir</option>

        ${equipos
          .map(
            (team) => `
              <option
                value="${team}"
                ${
                  guardados[`${letra}1`] === team
                    ? "selected"
                    : ""
                }>
                ${team}
              </option>
            `
          )
          .join("")}
      </select>
    </div>

    <div class="campo">
      <label>🥈 Segundo Lugar</label>

      <select id="${letra}2">
        <option value="">Sin definir</option>

        ${equipos
          .map(
            (team) => `
              <option
                value="${team}"
                ${
                  guardados[`${letra}2`] === team
                    ? "selected"
                    : ""
                }>
                ${team}
              </option>
            `
          )
          .join("")}
      </select>
    </div>
  `;

  gruposContainer.appendChild(div);
}

async function cargarClasificados() {
  gruposContainer.innerHTML = "";

  const snap = await getDoc(
    doc(
      db,
      "mundialSorteo",
      "clasificados"
    )
  );

  const guardados = snap.exists()
    ? snap.data()
    : {};

  Object.entries(GRUPOS).forEach(
    ([grupo, equipos]) => {
      crearGrupoHTML(
        grupo,
        equipos,
        guardados
      );
    }
  );
}

async function guardarClasificados() {
  const datos = {};

  for (const grupo of Object.keys(GRUPOS)) {
    const primero =
      document.getElementById(
        `${grupo}1`
      ).value;

    const segundo =
      document.getElementById(
        `${grupo}2`
      ).value;

    if (
      primero &&
      segundo &&
      primero === segundo
    ) {
      alert(
        `Grupo ${grupo}: no puedes repetir equipo`
      );

      return;
    }

    if (primero) {
      datos[`${grupo}1`] = primero;
    }

    if (segundo) {
      datos[`${grupo}2`] = segundo;
    }
  }

  await setDoc(
    doc(
      db,
      "mundialSorteo",
      "clasificados"
    ),
    datos,
    {
      merge: true
    }
  );

  mostrarMensaje(
    "✅ Clasificados guardados correctamente"
  );
}

async function limpiarClasificados() {
  const confirmar = confirm(
    "¿Eliminar todos los clasificados guardados?"
  );

  if (!confirmar) return;

  await deleteDoc(
    doc(
      db,
      "mundialSorteo",
      "clasificados"
    )
  );

  await cargarClasificados();

  mostrarMensaje(
    "🗑️ Clasificados eliminados"
  );
}

function mostrarMensaje(texto) {
  let mensaje =
    document.getElementById(
      "mensajeGuardado"
    );

  if (!mensaje) {
    mensaje =
      document.createElement("div");

    mensaje.id =
      "mensajeGuardado";

    mensaje.className =
      "mensaje";

    document
      .querySelector(".container")
      .appendChild(mensaje);
  }

  mensaje.textContent = texto;

  setTimeout(() => {
    if (
      document.getElementById(
        "mensajeGuardado"
      )
    ) {
      mensaje.remove();
    }
  }, 3000);
}

document
  .getElementById("guardarBtn")
  .addEventListener(
    "click",
    guardarClasificados
  );

const limpiarBtn =
  document.getElementById(
    "limpiarBtn"
  );

if (limpiarBtn) {
  limpiarBtn.addEventListener(
    "click",
    limpiarClasificados
  );
}

cargarClasificados();