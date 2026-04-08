import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp({ /* config */ });
const db = getFirestore(app);

const cont = document.getElementById("mis-jornadas");
const user = localStorage.getItem("user");

async function cargar() {
  const snap = await getDocs(collection(db, "historial_jornadas"));

  snap.forEach(docu => {
    const data = docu.data();

    const jugador = data.usuarios.find(u => u.email === user);

    if (jugador) {
      const div = document.createElement("div");
      div.innerHTML = `
        <h3>Jornada ${data.jornada}</h3>
        <p>🎯 Aciertos: ${jugador.aciertos}</p>
        <hr>
      `;
      cont.appendChild(div);
    }
  });
}

cargar();