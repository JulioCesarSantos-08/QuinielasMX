import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
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

const encabezado = document.getElementById("encabezado");
const tbody = document.querySelector("tbody");

function puedeVerTabla() {
  const ahora = new Date();
  const dia = ahora.getDay();
  const horas = ahora.getHours();
  const minutos = ahora.getMinutes();

  if (dia === 5 && (horas > 17 || (horas === 17 && minutos >= 0))) return true;
  if (dia === 6 || dia === 0) return true;
  if (dia === 1 && horas < 24) return true;
  return false;
}

async function cargarPartidos() {
  const docRef = doc(db, "config", "partidos");
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    alert("No se encontraron partidos configurados.");
    return [];
  }
  const data = docSnap.data();
  const jornada = data.jornada || "—";
  document.getElementById("jornada").textContent = `Jornada: ${jornada}`;
  return data.partidos || [];
}

function formatearEquipo(nombre) {
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

async function mostrarQuinielas() {
  const partidos = await cargarPartidos();

  const querySnapshot = await getDocs(collection(db, "quinielas"));
  const precioEntrada = 100;
  const totalJugadores = querySnapshot.size;
  const recaudado = precioEntrada * totalJugadores;
  const premioFinal = Math.round(recaudado * 0.9);
  document.getElementById("recaudado").textContent = `$${recaudado}`;
  document.getElementById("premio").textContent = `$${premioFinal}`;

  if (!puedeVerTabla()) {
    document.getElementById("bloqueo-msg").style.display = "block";
    return;
  }
  document.getElementById("tabla").style.display = "table";

  const resultadosSnap = await getDoc(doc(db, "resultados", "actuales"));
  const resultadosReales = resultadosSnap.exists() ? resultadosSnap.data() : {};

  // Crear encabezado
  partidos.forEach((p, i) => {
    const th = document.createElement("th");
    const marcador = resultadosReales[`marcador${i}`] || "-";
    th.innerHTML = `${formatearEquipo(p.equipo1)} vs ${formatearEquipo(p.equipo2)}<br><span class="marcador-final">${marcador}</span>`;
    encabezado.insertBefore(th, encabezado.lastElementChild);
  });

  const datos = [];

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    const userId = data.usuario;
    const quiniela = data.quiniela;

    let aciertos = 0;
    const fila = { usuario: userId, predicciones: [], aciertos: 0 };

    const usuarioDoc = await getDoc(doc(db, "usuarios", userId));
    if (usuarioDoc.exists()) {
      fila.usuario = usuarioDoc.data().nombre || userId;
    }

    partidos.forEach((_, i) => {
      const res = resultadosReales[`partido${i}`] ?? null;
      const pred = quiniela ? quiniela[`partido${i}`] : null;

      if (res === null || res === "") {
        fila.predicciones.push({ valor: pred, correcto: null });
      } else if (pred === res) {
        fila.predicciones.push({ valor: pred, correcto: true });
        aciertos++;
      } else {
        fila.predicciones.push({ valor: pred, correcto: false });
      }
    });

    fila.aciertos = aciertos;
    datos.push(fila);
  }

  datos.sort((a, b) => b.aciertos - a.aciertos);

  datos.forEach(jugador => {
    const tr = document.createElement("tr");
    const predHtml = jugador.predicciones.map(p =>
      `<td class="${
        p.valor
          ? (p.correcto === true
              ? 'correcto'
              : p.correcto === false
              ? 'incorrecto'
              : 'pendiente')
          : ''
      }">${p.valor ?? "-"}</td>`).join("");

    let claseAcierto = "";
    if (jugador.aciertos === 10) claseAcierto = "perfecto";
    else if (jugador.aciertos === datos[0].aciertos) claseAcierto = "lider";

    const aciertoHtml = `<td class="${claseAcierto}"><strong>${jugador.aciertos}</strong></td>`;
    tr.innerHTML = `<td>${jugador.usuario}</td>` + predHtml + aciertoHtml;

    if (jugador.aciertos === 10) {
      tr.classList.add("perfecto");
      tr.cells[0].innerHTML = `🌟 ${jugador.usuario} 🌟`;
    }

    tbody.appendChild(tr);
  });
}

mostrarQuinielas();
