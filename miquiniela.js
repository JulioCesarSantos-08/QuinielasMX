import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =======================
   FIREBASE
======================= */

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

/* =======================
   DOM
======================= */

const user =
localStorage.getItem("user");

const contenedor =
document.getElementById(
  "contenedor"
);

const resumen =
document.getElementById(
  "resumen"
);

const puntosTotales =
document.getElementById(
  "puntosTotales"
);

const aciertosResultado =
document.getElementById(
  "aciertosResultado"
);

const aciertosMarcador =
document.getElementById(
  "aciertosMarcador"
);

const barraProgreso =
document.getElementById(
  "barraProgreso"
);

/* =======================
   HELPERS
======================= */

function cap(txt){

  if(!txt) return "";

  return (
    txt.charAt(0)
    .toUpperCase() +
    txt.slice(1)
  );

}

function textoResultado(valor){

  if(valor==="local")
    return "Local";

  if(valor==="empate")
    return "Empate";

  if(valor==="visitante")
    return "Visitante";

  return "-";

}

/* =======================
   MAIN
======================= */

async function cargarQuiniela(){

  if(!user){

    contenedor.innerHTML = `
      <div class="empty">
        Debes iniciar sesión.
      </div>
    `;

    return;

  }

  const partidosSnap =
  await getDoc(
    doc(
      db,
      "config",
      "partidos"
    )
  );

  if(!partidosSnap.exists()){

    contenedor.innerHTML = `
      <div class="empty">
        No hay partidos configurados.
      </div>
    `;

    return;

  }

  const partidos =
  partidosSnap.data().partidos || [];

  const jornada =
  partidosSnap.data().jornada || "—";

  document.getElementById(
    "jornada"
  ).textContent =
  `Jornada: ${jornada}`;

  const quinielaSnap =
  await getDoc(
    doc(
      db,
      "quinielas",
      user
    )
  );

  if(!quinielaSnap.exists()){

    contenedor.innerHTML = `
      <div class="empty">
        No se encontró tu quiniela.
      </div>
    `;

    return;

  }

  const quiniela =
  quinielaSnap.data().quiniela || {};

  const resultadosSnap =
  await getDoc(
    doc(
      db,
      "resultados",
      "actuales"
    )
  );

  const resultados =
  resultadosSnap.exists()
  ? resultadosSnap.data()
  : {};

  let puntos = 0;
  let aciertos = 0;
  let exactos = 0;

  contenedor.innerHTML = "";

  partidos.forEach((p,i)=>{

    const resultadoUsuario =
    quiniela[`partido${i}`];

    const marcadorUsuario =
    quiniela[`marcador${i}`] || "-";

    const resultadoReal =
    resultados[`partido${i}`];

    const marcadorReal =
    resultados[`marcador${i}`] || "-";

    let puntosPartido = 0;

    const badges = [];

    if(resultadoReal){

      if(
        resultadoUsuario ===
        resultadoReal
      ){

        puntos++;
        puntosPartido++;
        aciertos++;

        badges.push(`
          <div class="badge badge-ok">
            ✅ Resultado correcto
          </div>
        `);

      }

      if(
        marcadorUsuario ===
        marcadorReal
      ){

        puntos++;
        puntosPartido++;
        exactos++;

        badges.push(`
          <div class="badge badge-exacto">
            ⭐ Marcador exacto
          </div>
        `);

      }

      if(
        puntosPartido === 0
      ){

        badges.push(`
          <div class="badge badge-fallo">
            ❌ Sin puntos
          </div>
        `);

      }

    }else{

      badges.push(`
        <div class="badge">
          ⏳ Partido pendiente
        </div>
      `);

    }

    contenedor.innerHTML += `

      <div class="card-partido">

        <div class="partido-header">

          <div class="partido-equipos">

            ${cap(p.equipo1)}
            vs
            ${cap(p.equipo2)}

          </div>

          <div class="estado-puntos puntos-${puntosPartido}">

            +${puntosPartido} pts

          </div>

        </div>

        <div class="bloques">

          <div class="bloque">

            <h4>
              🎯 Tu pronóstico
            </h4>

            <div class="valor">

              ${textoResultado(resultadoUsuario)}

            </div>

            <div class="valor">

              ⚽ ${marcadorUsuario}

            </div>

          </div>

          <div class="bloque">

            <h4>
              🏆 Resultado oficial
            </h4>

            <div class="valor">

              ${
                resultadoReal
                ? textoResultado(resultadoReal)
                : "Pendiente"
              }

            </div>

            <div class="valor">

              ⚽ ${marcadorReal}

            </div>

          </div>

        </div>

        <div class="badges">

          ${badges.join("")}

        </div>

      </div>

    `;

  });

  const maximo =
  partidos.length * 2;

  puntosTotales.textContent =
  `${puntos} / ${maximo}`;

  aciertosResultado.textContent =
  aciertos;

  aciertosMarcador.textContent =
  exactos;

  const porcentaje =
  maximo > 0
  ? (puntos / maximo) * 100
  : 0;

  barraProgreso.style.width =
  `${porcentaje}%`;

  resumen.innerHTML = `
    🏆 Has conseguido
    ${puntos}
    de
    ${maximo}
    puntos posibles
  `;

}

cargarQuiniela();