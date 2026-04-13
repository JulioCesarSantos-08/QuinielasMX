import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBky5T7wDukelYg3Giq_pXc4oveyfHN7go",
  authDomain: "rifaboletos-c1d0d.firebaseapp.com",
  projectId: "rifaboletos-c1d0d",
});

const db = getFirestore(app);

const cont = document.getElementById("mis-jornadas");
const resumen = document.getElementById("resumen");
const canvas = document.getElementById("grafica");

// 🔥 usuario actual
const user = (localStorage.getItem("user") || "").trim().toLowerCase();

let datosGrafica = [];

async function cargar() {
  const snap = await getDocs(collection(db, "historial_jornadas"));

  let encontrado = false;
  let totalAciertos = 0;
  let totalJornadas = 0;

  let jornadasData = [];

  snap.forEach(docu => {
    const data = docu.data();

    const quinielas = data.quinielas || [];
    const resultados = data.resultados || {};

    const totalPartidos = Object.keys(resultados).filter(k => k.includes("partido")).length;

    quinielas.forEach(q => {
      const email = (q.usuario || "").toLowerCase();

      if (email === user) {
        encontrado = true;

        let aciertos = 0;

        for (let i = 0; i < totalPartidos; i++) {
          const res = resultados[`partido${i}`];
          const pred = q.quiniela ? q.quiniela[`partido${i}`] : null;

          if (res && pred === res) aciertos++;
        }

        jornadasData.push({
          jornada: data.jornada,
          aciertos
        });

        totalAciertos += aciertos;
        totalJornadas++;
      }
    });
  });

  // 🔥 ordenar jornadas correctamente
  jornadasData.sort((a, b) => a.jornada - b.jornada);

  // 🔥 construir UI
  jornadasData.forEach(j => {
    const div = document.createElement("div");

    const clase =
      j.aciertos >= 7 ? "alto" :
      j.aciertos >= 4 ? "medio" :
      "bajo";

    div.className = "card";

    div.innerHTML = `
      <h3>📅 Jornada ${j.jornada}</h3>
      <p class="${clase}">🎯 Aciertos: ${j.aciertos}</p>
    `;

    cont.appendChild(div);
  });

  // 🔥 resumen
  if (totalJornadas > 0) {
    const promedio = (totalAciertos / totalJornadas).toFixed(1);

    resumen.innerHTML = `
      <h2>🏆 Resumen</h2>
      <p>Total Jornadas: ${totalJornadas}</p>
      <p>Total Aciertos: ${totalAciertos}</p>
      <p>Promedio: ${promedio}</p>
    `;
  } else {
    resumen.style.display = "none";
  }

  // 🔥 gráfica
  if (jornadasData.length > 0) {
    crearGrafica(jornadasData);
  } else {
    canvas.style.display = "none";
  }

  // 🔥 mensaje si no hay datos
  if (!encontrado) {
    cont.innerHTML = `
      <div class="card">
        <h3>😕 Sin datos</h3>
        <p>Aún no tienes jornadas registradas.</p>
      </div>
    `;
    canvas.style.display = "none";
    resumen.style.display = "none";
  }
}

// 📊 gráfica tipo FIFA
function crearGrafica(data) {
  new Chart(canvas, {
    type: "line",
    data: {
      labels: data.map(d => "J" + d.jornada),
      datasets: [{
        label: "Aciertos por jornada",
        data: data.map(d => d.aciertos),
        borderWidth: 3,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

cargar();
