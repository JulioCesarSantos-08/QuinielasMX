import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBky5T7wDukelYg3Giq_pXc4oveyfHN7go",
  authDomain: "rifaboletos-c1d0d.firebaseapp.com",
  projectId: "rifaboletos-c1d0d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const lista = document.getElementById("lista");
const encabezado = document.getElementById("encabezado");
const tbody = document.querySelector("tbody");
const podium = document.getElementById("podium");
const rankingContainer = document.getElementById("ranking-global");
const infoExtra = document.getElementById("info-extra");

let rankingGlobal = {};
let mapaUsuariosGlobal = {};

// ==========================
// CARGAR USUARIOS
// ==========================

async function cargarUsuarios() {

  const snap =
  await getDocs(
    collection(db, "usuarios")
  );

  snap.forEach(docu => {

    const email =
    docu.id;

    const nombre =
    docu.data().nombre;

    mapaUsuariosGlobal[email] =
    nombre;

  });

}

// ==========================
// CARGAR HISTORIAL
// ==========================

async function cargarHistorial() {

  const snap =
  await getDocs(
    collection(
      db,
      "historial_jornadas"
    )
  );

  let jornadas = [];

  snap.forEach(docu => {

    jornadas.push(
      docu.data()
    );

  });

  jornadas.sort(
    (a,b)=>
    new Date(b.fecha) -
    new Date(a.fecha)
  );

  jornadas.forEach(j => {

    const btn =
    document.createElement(
      "button"
    );

    btn.textContent =
    `📅 Jornada ${j.jornada} - ${j.fecha}`;

    btn.onclick =
    ()=>mostrarDetalle(j);

    lista.appendChild(btn);

    const totalPartidos =
    Object.keys(
      j.resultados || {}
    ).filter(
      k => k.includes("partido")
    ).length;

    (j.quinielas || []).forEach(q => {

      let puntos = 0;

      for(
        let i=0;
        i<totalPartidos;
        i++
      ){

        const resultadoReal =
        j.resultados[
          `partido${i}`
        ];

        const resultadoUsuario =
        q.quiniela
        ? q.quiniela[
            `partido${i}`
          ]
        : null;

        const marcadorReal =
        j.resultados[
          `marcador${i}`
        ];

        const marcadorUsuario =
        q.quiniela
        ? q.quiniela[
            `marcador${i}`
          ]
        : null;

        if(
          resultadoReal &&
          resultadoUsuario === resultadoReal
        ){
          puntos += 1;
        }

        if(
          marcadorReal &&
          marcadorUsuario &&
          marcadorUsuario === marcadorReal
        ){
          puntos += 1;
        }

      }

      const nombre =
      mapaUsuariosGlobal[
        q.usuario
      ] || q.usuario;

      if(
        !rankingGlobal[nombre]
      ){
        rankingGlobal[nombre] = 0;
      }

      rankingGlobal[nombre] +=
      puntos;

    });

  });

  crearRankingGlobal();

}

// ==========================
// MOSTRAR DETALLE
// ==========================

function mostrarDetalle(data){

  document.getElementById(
    "detalle"
  ).style.display = "block";

  encabezado.innerHTML =
  "<th>Usuario</th>";

  tbody.innerHTML = "";

  infoExtra.innerHTML = "";

  const resultados =
  data.resultados || {};

  const quinielas =
  data.quinielas || [];

  const totalPartidos =
  Object.keys(resultados)
  .filter(
    k=>k.includes("partido")
  )
  .length;

  for(
    let i=0;
    i<totalPartidos;
    i++
  ){

    const th =
    document.createElement(
      "th"
    );

    th.textContent =
    `P${i+1}`;

    encabezado.appendChild(
      th
    );

  }

  encabezado.innerHTML += `
    <th>Resultados</th>
    <th>Marcadores</th>
    <th>Total</th>
  `;

  const datos = [];

  quinielas.forEach(q=>{

    let resultadosCorrectos = 0;
    let marcadoresExactos = 0;

    const predicciones = [];

    for(
      let i=0;
      i<totalPartidos;
      i++
    ){

      const resultadoReal =
      resultados[
        `partido${i}`
      ];

      const resultadoUsuario =
      q.quiniela
      ? q.quiniela[
          `partido${i}`
        ]
      : null;

      const marcadorReal =
      resultados[
        `marcador${i}`
      ];

      const marcadorUsuario =
      q.quiniela
      ? q.quiniela[
          `marcador${i}`
        ]
      : null;

      if(
        resultadoReal === null ||
        resultadoReal === ""
      ){

        predicciones.push({
          valor: resultadoUsuario,
          correcto: null
        });

      }else if(
        resultadoUsuario === resultadoReal
      ){

        predicciones.push({
          valor: resultadoUsuario,
          correcto: true
        });

        resultadosCorrectos++;

      }else{

        predicciones.push({
          valor: resultadoUsuario,
          correcto: false
        });

      }

      if(
        marcadorReal &&
        marcadorUsuario &&
        marcadorUsuario === marcadorReal
      ){
        marcadoresExactos++;
      }

    }

    const nombreUsuario =
    mapaUsuariosGlobal[
      q.usuario
    ] || q.usuario;

    datos.push({

      usuario:
      nombreUsuario,

      resultados:
      resultadosCorrectos,

      marcadores:
      marcadoresExactos,

      puntos:
      resultadosCorrectos +
      marcadoresExactos,

      predicciones

    });

  });

  datos.sort(
    (a,b)=>
    b.puntos - a.puntos
  );

  crearPodium(
    datos.slice(0,3)
  );

  if(
    data.premio ||
    data.recaudado
  ){

    infoExtra.innerHTML = `
      💰 <strong>Recaudado:</strong> $${data.recaudado || 0}
      &nbsp;&nbsp;
      🏆 <strong>Premio:</strong> $${data.premio || 0}
    `;

  }

  datos.forEach(
    (jugador,index)=>{

      const tr =
      document.createElement(
        "tr"
      );

      let claseTop = "";

      if(index===0)
        claseTop="top1";

      else if(index===1)
        claseTop="top2";

      else if(index===2)
        claseTop="top3";

      const predHtml =
      jugador.predicciones
      .map(p=>`

        <td class="${
          p.correcto===true
          ? "correcto"
          : p.correcto===false
          ? "incorrecto"
          : "pendiente"
        }">
          ${p.valor ?? "-"}
        </td>

      `).join("");

      tr.className =
      claseTop;

      tr.innerHTML = `
        <td>${jugador.usuario}</td>
        ${predHtml}
        <td>${jugador.resultados}</td>
        <td>${jugador.marcadores}</td>
        <td><strong>${jugador.puntos}</strong></td>
      `;

      tbody.appendChild(tr);

    }
  );

}

// ==========================
// PODIUM
// ==========================

function crearPodium(top3){

  podium.innerHTML = `
    <div class="podium-box second">
      🥈 ${top3[1]?.usuario || "-"}
    </div>

    <div class="podium-box first">
      🥇 ${top3[0]?.usuario || "-"}
    </div>

    <div class="podium-box third">
      🥉 ${top3[2]?.usuario || "-"}
    </div>
  `;

}

// ==========================
// RANKING GLOBAL
// ==========================

function crearRankingGlobal(){

  rankingContainer.innerHTML =
  "<h2>📊 Ranking Global</h2>";

  const tabla =
  document.createElement(
    "table"
  );

  const datos =
  Object.entries(
    rankingGlobal
  )
  .map(([nombre,puntos])=>({
    nombre,
    puntos
  }))
  .sort(
    (a,b)=>
    b.puntos-a.puntos
  );

  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Usuario</th>
        <th>Total Puntos</th>
      </tr>
    </thead>

    <tbody>

      ${datos.map(d=>`

        <tr>
          <td>${d.nombre}</td>
          <td>${d.puntos}</td>
        </tr>

      `).join("")}

    </tbody>
  `;

  rankingContainer.appendChild(
    tabla
  );

}


async function init(){

  await cargarUsuarios();

  await cargarHistorial();

}

init();
