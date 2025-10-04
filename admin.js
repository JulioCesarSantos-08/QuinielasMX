import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, doc, setDoc, getDoc, getDocs, collection, deleteDoc, updateDoc
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

const form = document.getElementById("resultados-form");
const selectGanador = document.getElementById("usuario-ganador");
const btnGuardar = document.getElementById("btn-guardar");
const btnReiniciar = document.getElementById("btn-reiniciar");

let partidos = [];

// 🔑 Administradores permitidos
const admins = ["ti43300@uvp.edu.mx", "jc@gmail.com", "guera00@gmail.com"];

// Verificar usuario
const user = localStorage.getItem("user");
const nombre = localStorage.getItem("nombre");

if (!user) {
  alert("Debes iniciar sesión.");
  window.location.href = "index.html";
} else if (!admins.includes(user)) {
  alert(`Hola ${nombre}, tú no tienes acceso como administrador.`);
  window.location.href = "menu.html";
} else {
  document.getElementById("formulario").style.display = "block";
  document.getElementById("titulo").textContent = `Panel de Administrador ⚙️ - Bienvenido, ${nombre}`;
  cargarPartidos();
  cargarUsuarios();
}

function formatearEquipo(nombre) {
  if (!nombre) return "";
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

async function cargarPartidos() {
  const docSnap = await getDoc(doc(db, "config", "partidos"));
  if (!docSnap.exists()) {
    alert("No se encontraron partidos configurados.");
    return;
  }
  partidos = docSnap.data().partidos || [];
  form.innerHTML = "";
  partidos.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "partido";
    div.innerHTML = `
      <label><strong>${formatearEquipo(p.equipo1)} vs ${formatearEquipo(p.equipo2)}</strong></label><br>
      <select id="resultado${i}">
        <option value="">Partido aún no jugado</option>
        <option value="local">Gana ${formatearEquipo(p.equipo1)}</option>
        <option value="empate">Empate</option>
        <option value="visitante">Gana ${formatearEquipo(p.equipo2)}</option>
      </select><br>
      <input type="text" id="marcador${i}" placeholder="Ej: 2-1" />
    `;
    form.appendChild(div);
  });
  cargarResultados();
}

async function cargarResultados() {
  const docSnap = await getDoc(doc(db, "resultados", "actuales"));
  if (docSnap.exists()) {
    const data = docSnap.data();
    for (let i = 0; i < partidos.length; i++) {
      const select = document.getElementById(`resultado${i}`);
      const input = document.getElementById(`marcador${i}`);
      if (select) select.value = data[`partido${i}`] || "";
      if (input) input.value = data[`marcador${i}`] || "";
    }
  }
}

async function cargarUsuarios() {
  const snapshot = await getDocs(collection(db, "usuarios"));
  selectGanador.innerHTML = '';
  snapshot.forEach(docu => {
    const nombre = docu.data().nombre;
    const email = docu.id;
    const option = document.createElement("option");
    option.value = email;
    option.textContent = nombre;
    selectGanador.appendChild(option);
  });

  const confSnap = await getDoc(doc(db, "configuracion", "general"));
  if (confSnap.exists() && confSnap.data().ganadores) {
    const ganadores = confSnap.data().ganadores;
    Array.from(selectGanador.options).forEach(opt => {
      if (ganadores.includes(opt.value)) opt.selected = true;
    });
  }
}

async function enviarNotificacionGanadores(ganadores) {
  try {
    for (const uid of ganadores) {
      await setDoc(doc(db, "usuarios", uid), {
        mensaje: "¡Felicidades! Has sido seleccionado como ganador 🎉",
      }, { merge: true });
    }
    console.log("Mensajes enviados a los ganadores.");
  } catch (error) {
    console.error("Error enviando mensajes a ganadores:", error);
  }
}

btnGuardar.addEventListener("click", async () => {
  const resultados = {};
  for (let i = 0; i < partidos.length; i++) {
    const select = document.getElementById(`resultado${i}`);
    const input = document.getElementById(`marcador${i}`);
    resultados[`partido${i}`] = select ? select.value || null : null;
    resultados[`marcador${i}`] = input ? input.value || "" : "";
  }

  const ganadores = Array.from(selectGanador.selectedOptions).map(opt => opt.value);

  try {
    await setDoc(doc(db, "resultados", "actuales"), resultados);
    await setDoc(doc(db, "configuracion", "general"), {
      ganadores,
      fecha: new Date().toLocaleString()
    });

    await enviarNotificacionGanadores(ganadores);
    alert("✅ Resultados y marcadores guardados correctamente.");
  } catch (e) {
    alert("❌ Error al guardar: " + e.message);
  }
});

btnReiniciar.addEventListener("click", async () => {
  const confirmar = confirm("¿Estás seguro de que deseas reiniciar la jornada? Esto eliminará resultados, ganador, quinielas y puntuaciones.");
  if (!confirmar) return;

  try {
    await deleteDoc(doc(db, "resultados", "actuales"));
    await deleteDoc(doc(db, "configuracion", "general"));

    const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
    for (const docu of usuariosSnapshot.docs) {
      const ref = doc(db, "usuarios", docu.id);
      await updateDoc(ref, {
        quiniela: [],
        puntos: 0,
        aciertos: 0,
        mensaje: ""
      });
    }

    const quinielasSnapshot = await getDocs(collection(db, "quinielas"));
    for (const qDoc of quinielasSnapshot.docs) {
      await deleteDoc(doc(db, "quinielas", qDoc.id));
    }

    alert("✅ Jornada reiniciada correctamente.");
    location.reload();
  } catch (e) {
    alert("❌ Error al reiniciar: " + e.message);
  }
});
