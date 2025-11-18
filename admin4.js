import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBky5T7wDukelYg3Giq_pXc4oveyfHN7go",
  authDomain: "rifaboletos-c1d0d.firebaseapp.com",
  projectId: "rifaboletos-c1d0d",
  storageBucket: "rifaboletos-c1d0d.appspot.com",
  messagingSenderId: "27051588350",
  appId: "1:27051588350:web:74559bf1d4fd5a67f603af",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const usuariosContainer = document.getElementById("usuariosContainer");
const equiposContainer = document.getElementById("equiposContainer");
const listaPermitidos = document.getElementById("listaPermitidos");
const listaEquipos = document.getElementById("listaEquipos");
const tbodyEstadoEquipos = document.getElementById("tbodyEstadoEquipos");

const btnGuardarParticipantes = document.getElementById("guardarParticipantes");
const btnGuardarEquipos = document.getElementById("guardarEquipos");
const btnGuardarEstado = document.getElementById("guardarEstado");
const btnReiniciar = document.getElementById("btnReiniciar");

async function cargarUsuarios() {
  usuariosContainer.innerHTML = "<p>Cargando usuarios...</p>";
  const usuariosSnap = await getDocs(collection(db, "usuarios"));
  let html = "";
  usuariosSnap.forEach((docSnap) => {
    const data = docSnap.data();
    html += `
      <label>
        <input type="checkbox" value="${docSnap.id}" data-nombre="${data.nombre || ""}">
        ${data.nombre || "(Sin nombre)"} — ${docSnap.id}
      </label>
    `;
  });
  usuariosContainer.innerHTML = html;
}

btnGuardarParticipantes.addEventListener("click", async () => {
  const seleccionados = Array.from(
    usuariosContainer.querySelectorAll("input[type='checkbox']:checked")
  ).map((input) => input.value);

  if (seleccionados.length !== 8) {
    alert("Debes seleccionar exactamente 8 participantes.");
    return;
  }

  await setDoc(doc(db, "octavos", "permitidos"), { allowed: seleccionados });
  alert("✅ Participantes guardados correctamente.");
  mostrarPermitidos();
});

btnGuardarEquipos.addEventListener("click", async () => {
  const equipos = Array.from(document.querySelectorAll(".lista-equipos input"))
    .map((input) => input.value.trim())
    .filter((e) => e);

  if (equipos.length !== 8) {
    alert("Debes ingresar exactamente 8 equipos.");
    return;
  }

  await setDoc(doc(db, "octavos", "settings"), { teams: equipos });

  const estadoInicial = {};
  equipos.forEach((eq) => (estadoInicial[eq] = "activo"));
  await setDoc(doc(db, "octavos", "state"), { teamStatus: estadoInicial }, { merge: true });

  alert("✅ Equipos guardados correctamente.");
  mostrarEquipos();
  mostrarTablaEstado();
});

async function mostrarPermitidos() {
  const docSnap = await getDoc(doc(db, "octavos", "permitidos"));
  listaPermitidos.innerHTML = "";
  if (docSnap.exists()) {
    docSnap.data().allowed.forEach((user) => {
      const li = document.createElement("li");
      li.textContent = user;
      listaPermitidos.appendChild(li);
    });
  }
}

async function mostrarEquipos() {
  const docSnap = await getDoc(doc(db, "octavos", "settings"));
  listaEquipos.innerHTML = "";
  if (docSnap.exists()) {
    docSnap.data().teams.forEach((team) => {
      const li = document.createElement("li");
      li.textContent = team;
      listaEquipos.appendChild(li);
    });
  }
}

function generarCamposEquipos() {
  equiposContainer.innerHTML = "";
  for (let i = 1; i <= 8; i++) {
    equiposContainer.innerHTML += `<input type="text" placeholder="Equipo ${i}">`;
  }
}

async function mostrarTablaEstado() {
  tbodyEstadoEquipos.innerHTML = "";

  const settingsSnap = await getDoc(doc(db, "octavos", "settings"));
  const stateSnap = await getDoc(doc(db, "octavos", "state"));

  if (!settingsSnap.exists()) return;

  const equipos = settingsSnap.data().teams || [];
  const teamStatus = stateSnap.exists() ? stateSnap.data().teamStatus || {} : {};

  equipos.forEach((team) => {
    const estadoActual = teamStatus[team] || "activo";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${team}</td>
      <td>
        <select data-equipo="${team}">
          <option value="activo" ${estadoActual === "activo" ? "selected" : ""}>Activo</option>
          <option value="eliminado" ${estadoActual === "eliminado" ? "selected" : ""}>Eliminado</option>
        </select>
      </td>
      <td><span class="estado-label ${estadoActual}">${estadoActual.toUpperCase()}</span></td>
    `;
    tbodyEstadoEquipos.appendChild(tr);
  });
}

btnGuardarEstado.addEventListener("click", async () => {
  const selects = tbodyEstadoEquipos.querySelectorAll("select");
  const nuevosEstados = {};
  selects.forEach((sel) => {
    const equipo = sel.dataset.equipo;
    const estado = sel.value;
    nuevosEstados[equipo] = estado;
  });

  await setDoc(
    doc(db, "octavos", "state"),
    { teamStatus: nuevosEstados },
    { merge: true }
  );
  alert("✅ Estados actualizados correctamente.");
  mostrarTablaEstado();
});

btnReiniciar.addEventListener("click", async () => {
  const seguro = confirm("¿Seguro que deseas REINICIAR TODO OCTAVOS? Esto borrará participantes, equipos y estados.");
  if (!seguro) return;

  try {
    await deleteDoc(doc(db, "octavos", "permitidos"));
    await deleteDoc(doc(db, "octavos", "settings"));
    await deleteDoc(doc(db, "octavos", "state"));

    alert("✔ Se ha reiniciado completamente la sección de Octavos.");
    location.reload();
  } catch (e) {
    alert("Error al reiniciar.");
    console.error(e);
  }
});

generarCamposEquipos();
cargarUsuarios();
mostrarPermitidos();
mostrarEquipos();
mostrarTablaEstado();
