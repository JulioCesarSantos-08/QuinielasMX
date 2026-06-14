import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBky5T7wDukelYg3Giq_pXc4oveyfHN7go",
  authDomain: "rifaboletos-c1d0d.firebaseapp.com",
  projectId: "rifaboletos-c1d0d"
});

const db = getFirestore(app);

const cont = document.getElementById("mis-jornadas");
const resumen = document.getElementById("resumen");
const canvas = document.getElementById("grafica");

const user =
(localStorage.getItem("user") || "")
.trim()
.toLowerCase();

async function cargar(){

  const snap =
  await getDocs(
    collection(
      db,
      "historial_jornadas"
    )
  );

  let encontrado = false;

  let totalResultados = 0;
  let totalMarcadores = 0;
  let totalPuntos = 0;
  let totalJornadas = 0;

  let jornadasData = [];

  snap.forEach(docu=>{

    const data =
    docu.data();

    const quinielas =
    data.quinielas || [];

    const resultados =
    data.resultados || {};

    const totalPartidos =
    Object.keys(resultados)
    .filter(
      k=>k.includes("partido")
    )
    .length;

    quinielas.forEach(q=>{

      const email =
      (q.usuario || "")
      .toLowerCase();

      if(email === user){

        encontrado = true;

        let resultadosCorrectos = 0;
        let marcadoresExactos = 0;

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
            resultadoReal &&
            resultadoUsuario === resultadoReal
          ){
            resultadosCorrectos++;
          }

          if(
            marcadorReal &&
            marcadorUsuario &&
            marcadorUsuario === marcadorReal
          ){
            marcadoresExactos++;
          }

        }

        const puntos =
        resultadosCorrectos +
        marcadoresExactos;

        jornadasData.push({

          jornada:
          data.jornada,

          resultados:
          resultadosCorrectos,

          marcadores:
          marcadoresExactos,

          puntos

        });

        totalResultados +=
        resultadosCorrectos;

        totalMarcadores +=
        marcadoresExactos;

        totalPuntos +=
        puntos;

        totalJornadas++;

      }

    });

  });

  jornadasData.sort(
    (a,b)=>
    a.jornada - b.jornada
  );

  jornadasData.forEach(j=>{

    const div =
    document.createElement(
      "div"
    );

    const clase =
    j.puntos >= 10
    ? "alto"
    : j.puntos >= 5
    ? "medio"
    : "bajo";

    div.className =
    "card";

    div.innerHTML = `

      <h3>
        📅 Jornada ${j.jornada}
      </h3>

      <div class="estadisticas">

        <div class="estadistica">
          ✅
          <strong>
            ${j.resultados}
          </strong>
          Resultados
        </div>

        <div class="estadistica">
          🎯
          <strong>
            ${j.marcadores}
          </strong>
          Marcadores
        </div>

        <div class="estadistica">
          🏆
          <strong class="${clase}">
            ${j.puntos}
          </strong>
          Puntos
        </div>

      </div>

    `;

    cont.appendChild(div);

  });

  if(totalJornadas > 0){

    const promedio =
    (
      totalPuntos /
      totalJornadas
    ).toFixed(1);

    resumen.innerHTML = `

      <h2>
        🏆 Resumen
      </h2>

      <div class="resumen-grid">

        <div class="resumen-item">
          📅 Jornadas
          <strong>
            ${totalJornadas}
          </strong>
        </div>

        <div class="resumen-item">
          ✅ Resultados
          <strong>
            ${totalResultados}
          </strong>
        </div>

        <div class="resumen-item">
          🎯 Marcadores
          <strong>
            ${totalMarcadores}
          </strong>
        </div>

        <div class="resumen-item">
          🏆 Puntos
          <strong>
            ${totalPuntos}
          </strong>
        </div>

        <div class="resumen-item">
          📈 Promedio
          <strong>
            ${promedio}
          </strong>
        </div>

      </div>

    `;

  }else{

    resumen.style.display =
    "none";

  }

  if(
    jornadasData.length > 0
  ){

    crearGrafica(
      jornadasData
    );

  }else{

    canvas.style.display =
    "none";

  }

  if(!encontrado){

    cont.innerHTML = `

      <div class="card">

        <h3>
          😕 Sin datos
        </h3>

        <p>
          Aún no tienes jornadas registradas.
        </p>

      </div>

    `;

    canvas.style.display =
    "none";

    resumen.style.display =
    "none";

  }

}

function crearGrafica(data){

  new Chart(canvas, {

    type:"line",

    data:{

      labels:
      data.map(
        d=>"J"+d.jornada
      ),

      datasets:[{

        label:
        "Puntos por jornada",

        data:
        data.map(
          d=>d.puntos
        ),

        borderWidth:3,

        tension:.35,

        fill:true

      }]

    },

    options:{

      responsive:true,

      plugins:{

        legend:{
          display:true
        }

      },

      scales:{

        y:{

          beginAtZero:true,

          ticks:{
            stepSize:1
          }

        }

      }

    }

  });

}

cargar();
