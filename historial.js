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
let mapaUsuariosGlobal = {}; // 🔥 GLOBAL

// 🔥 1. CARGAR USUARIOS REALES DESDE FIREBASE
async function cargarUsuarios() {
  const snap = await getDocs(collection(db, "usuarios"));

  snap.forEach(docu => {
    const email = docu.id;
    const nombre = docu.data().nombre;

    mapaUsuariosGlobal[email] = nombre;
  });
}

// 🔥 2. CARGAR HISTORIAL
async function cargarHistorial() {
  const snap = await getDocs(collection(db, "historial_jornadas"));

  let jornadas = [];

  snap.forEach(docu => {
    jornadas.push(docu.data());
  });

  jornadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  jornadas.forEach(j => {
    const btn = document.createElement("button");
    btn.textContent = `📅 Jornada ${j.jornada} - ${j.fecha}`;
    btn.onclick = () => mostrarDetalle(j);
    lista.appendChild(btn);

    const totalPartidos = Object.keys(j.resultados || {})
      .filter(k => k.includes("partido")).length;

    (j.quinielas || []).forEach(q => {
      let aciertos = 0;

      for (let i = 0; i < totalPartidos; i++) {
        const res = j.resultados[`partido${i}`];
        const pred = q.quiniela ? q.quiniela[`partido${i}`] : null;

        if (res && pred === res) aciertos++;
      }

      // 🔥 nombre REAL desde Firebase
      const nombre = mapaUsuariosGlobal[q.usuario] || q.usuario;

      if (!rankingGlobal[nombre]) rankingGlobal[nombre] = 0;
      rankingGlobal[nombre] += aciertos;
    });
  });

  crearRankingGlobal();
}

// 🔥 MOSTRAR DETALLE
function mostrarDetalle(data) {
  document.getElementById("detalle").style.display = "block";

  encabezado.innerHTML = "<th>Usuario</th>";
  tbody.innerHTML = "";
  infoExtra.innerHTML = "";

  const resultados = data.resultados || {};
  const quinielas = data.quinielas || [];

  const totalPartidos = Object.keys(resultados).filter(k => k.includes("partido")).length;

  for (let i = 0; i < totalPartidos; i++) {
    const th = document.createElement("th");
    th.textContent = `P${i + 1}`;
    encabezado.appendChild(th);
  }

  encabezado.innerHTML += "<th>Aciertos</th>";

  const datos = [];

  quinielas.forEach(q => {
    let aciertos = 0;
    const predicciones = [];

    for (let i = 0; i < totalPartidos; i++) {
      const res = resultados[`partido${i}`];
      const pred = q.quiniela ? q.quiniela[`partido${i}`] : null;

      if (res === null || res === "") {
        predicciones.push({ valor: pred, correcto: null });
      } else if (pred === res) {
        predicciones.push({ valor: pred, correcto: true });
        aciertos++;
      } else {
        predicciones.push({ valor: pred, correcto: false });
      }
    }

    // 🔥 nombre REAL
    const nombreUsuario = mapaUsuariosGlobal[q.usuario] || q.usuario;

    datos.push({
      usuario: nombreUsuario,
      aciertos,
      predicciones
    });
  });

  datos.sort((a, b) => b.aciertos - a.aciertos);

  crearPodium(datos.slice(0, 3));

  if (data.premio || data.recaudado) {
    infoExtra.innerHTML = `
      💰 <strong>Recaudado:</strong> $${data.recaudado || 0}
      &nbsp;&nbsp;
      🏆 <strong>Premio:</strong> $${data.premio || 0}
    `;
  }

  datos.forEach((jugador, index) => {
    const tr = document.createElement("tr");

    let claseTop = "";
    if (index === 0) claseTop = "top1";
    else if (index === 1) claseTop = "top2";
    else if (index === 2) claseTop = "top3";

    const predHtml = jugador.predicciones.map(p => `
      <td class="${
        p.correcto === true ? 'correcto' :
        p.correcto === false ? 'incorrecto' :
        'pendiente'
      }">${p.valor ?? "-"}
      </td>
    `).join("");

    tr.className = claseTop;

    tr.innerHTML = `
      <td>${jugador.usuario}</td>
      ${predHtml}
      <td><strong>${jugador.aciertos}</strong></td>
    `;

    tbody.appendChild(tr);
  });
}

// 🥇 PODIUM
function crearPodium(top3) {
  podium.innerHTML = `
    <div class="podium-box second">🥈 ${top3[1]?.usuario || "-"}</div>
    <div class="podium-box first">🥇 ${top3[0]?.usuario || "-"}</div>
    <div class="podium-box third">🥉 ${top3[2]?.usuario || "-"}</div>
  `;
}

// 📊 RANKING GLOBAL
function crearRankingGlobal() {
  rankingContainer.innerHTML = "<h2>📊 Lider General</h2>";

  const tabla = document.createElement("table");

  const datos = Object.entries(rankingGlobal)
    .map(([nombre, puntos]) => ({ nombre, puntos }))
    .sort((a, b) => b.puntos - a.puntos);

  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Usuario</th>
        <th>Total Aciertos</th>
      </tr>
    </thead>
    <tbody>
      ${datos.map(d => `
        <tr>
          <td>${d.nombre}</td>
          <td>${d.puntos}</td>
        </tr>
      `).join("")}
    </tbody>
  `;

  rankingContainer.appendChild(tabla);
}

// 🔥 EJECUCIÓN CORRECTA
async function init() {
  await cargarUsuarios();   // 👈 PRIMERO usuarios reales
  await cargarHistorial();  // 👈 luego historial
}

init();
