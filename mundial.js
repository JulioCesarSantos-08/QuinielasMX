import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const form = document.getElementById("quiniela-form");
const bloqueoDiv = document.getElementById("bloqueo");
const contadorDiv = document.getElementById("contador-tiempo");
const btnGuardar = document.getElementById("btn-guardar");

const musica = document.getElementById("musica");
const silbato = document.getElementById("silbatazo");
const errorSound = document.getElementById("bloqueadoSound");

window.addEventListener("click", () => {
  if (musica) musica.play().catch(() => {});
}, { once: true });

async function cargarPartidos() {
  const docRef = doc(db, "config", "partidos");
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    form.innerHTML = "<p>No se encontraron partidos configurados.</p>";
    btnGuardar.disabled = true;
    return;
  }

  const data = docSnap.data();
  const partidos = data.partidos || [];

  if (data.jornada) {
    document.getElementById("numero-jornada").textContent = `Fase: ${data.jornada}`;

    form.innerHTML = "";

    partidos.forEach((p, i) => {
      const equipoLocal = p.equipo1.toLowerCase().replace(/\s+/g, '-');
      const equipoVisitante = p.equipo2.toLowerCase().replace(/\s+/g, '-');

      form.innerHTML += `
        <div class="partido">
          <div class="equipos">
            <div class="equipo">
              <img src="imagenes/${equipoLocal}.png" />
              <span>${p.equipo1.toUpperCase()}</span>
            </div>

            <div class="vs">VS</div>

            <div class="equipo">
              <img src="imagenes/${equipoVisitante}.png" />
              <span>${p.equipo2.toUpperCase()}</span>
            </div>
          </div>

          <div class="opciones">

            <input type="radio" name="partido${i}" id="local${i}" value="local">
            <label for="local${i}">Gana ${p.equipo1.toUpperCase()}</label>

            <input type="radio" name="partido${i}" id="empate${i}" value="empate">
            <label for="empate${i}">Empate</label>

            <input type="radio" name="partido${i}" id="visitante${i}" value="visitante">
            <label for="visitante${i}">Gana ${p.equipo2.toUpperCase()}</label>

          </div>
        </div>
      `;
    });
  }
}

let estadoAnterior = null;

async function actualizarEstadoQuiniela() {
  const snap = await getDoc(doc(db, "configuracion", "estado"));
  const activa = snap.exists() ? snap.data().quinielaActiva : true;

  if (estadoAnterior === null) estadoAnterior = activa;

  if (!activa) {
    bloqueoDiv.textContent = "⛔ Quiniela cerrada por el administrador";
    contadorDiv.textContent = "Estado: ❌ Cerrado";

    btnGuardar.disabled = true;
    btnGuardar.style.background = '#555';
    btnGuardar.style.cursor = 'not-allowed';

    if (estadoAnterior !== activa) {
      if (errorSound) errorSound.play().catch(()=>{});
    }

  } else {
    bloqueoDiv.textContent = "";
    contadorDiv.textContent = "Estado: ✅ Abierto";

    btnGuardar.disabled = false;
    btnGuardar.style.background = '#FFD700';
    btnGuardar.style.cursor = 'pointer';

    if (estadoAnterior !== activa) {
      if (silbato) silbato.play().catch(()=>{});
    }
  }

  estadoAnterior = activa;
}

window.guardarQuiniela = async function () {
  const user = localStorage.getItem("user");

  if (!user) {
    alert("Debes iniciar sesión");
    return;
  }

  const snap = await getDoc(doc(db, "configuracion", "estado"));
  const activa = snap.exists() ? snap.data().quinielaActiva : true;

  if (!activa) {
    if (errorSound) errorSound.play().catch(()=>{});
    alert("La quiniela está cerrada");
    return;
  }

  const quiniela = {};
  let incompletos = false;

  const partidosCount = form.querySelectorAll('.partido').length;

  for (let i = 0; i < partidosCount; i++) {
    const seleccionado = form.querySelector(`input[name="partido${i}"]:checked`);

    if (!seleccionado) incompletos = true;

    quiniela[`partido${i}`] = seleccionado ? seleccionado.value : null;
  }

  if (incompletos && !confirm("Hay partidos sin seleccionar. ¿Deseas guardar así?")) return;

  try {
    await setDoc(doc(db, "quinielas", user), {
      usuario: user,
      quiniela,
      timestamp: Date.now()
    });

    alert("¡Quiniela guardada con éxito!");
  } catch (e) {
    alert("Error al guardar la quiniela: " + e.message);
  }
};

cargarPartidos();
actualizarEstadoQuiniela();
setInterval(actualizarEstadoQuiniela, 5000);