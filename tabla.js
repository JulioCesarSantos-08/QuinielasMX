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

async function puedeVerTabla() {

  const snap = await getDoc(
    doc(
      db,
      "configuracion",
      "estadoTabla"
    )
  );

  if (!snap.exists()) {
    return false;
  }

  return snap.data().tablaVisible === true;

}

async function cargarPartidos() {

  const docRef =
    doc(db, "config", "partidos");

  const docSnap =
    await getDoc(docRef);

  if (!docSnap.exists()) {

    alert(
      "No se encontraron partidos configurados."
    );

    return [];

  }

  const data = docSnap.data();

  const jornada =
    data.jornada || "—";

  document.getElementById(
    "jornada"
  ).textContent =
    `Jornada: ${jornada}`;

  return data.partidos || [];

}

function formatearEquipo(nombre) {

  return nombre
    .charAt(0)
    .toUpperCase() +
    nombre.slice(1);

}

async function mostrarQuinielas() {

  const partidos =
    await cargarPartidos();

  const querySnapshot =
    await getDocs(
      collection(
        db,
        "quinielas"
      )
    );

  const precioEntrada = 100;

  const totalJugadores =
    querySnapshot.size;

  const recaudado =
    precioEntrada *
    totalJugadores;

  const premioFinal =
    Math.round(
      recaudado * 0.9
    );

  document.getElementById(
    "recaudado"
  ).textContent =
    `$${recaudado}`;

  document.getElementById(
    "premio"
  ).textContent =
    `$${premioFinal}`;

  const tablaVisible =
    await puedeVerTabla();

  if (!tablaVisible) {

    document.getElementById(
      "bloqueo-msg"
    ).style.display = "block";

    return;

  }

  document.getElementById(
    "bloqueo-msg"
  ).style.display = "none";

  document.getElementById(
    "tabla"
  ).style.display = "table";

  const resultadosSnap =
    await getDoc(
      doc(
        db,
        "resultados",
        "actuales"
      )
    );

  const resultadosReales =
    resultadosSnap.exists()
      ? resultadosSnap.data()
      : {};

  // ENCABEZADO

  partidos.forEach((p, i) => {

    const th =
      document.createElement(
        "th"
      );

    const marcador =
      resultadosReales[
        `marcador${i}`
      ] || "-";

    th.innerHTML = `
      ${formatearEquipo(p.equipo1)}
      vs
      ${formatearEquipo(p.equipo2)}
      <br>
      <span class="marcador-final">
        ${marcador}
      </span>
    `;

    encabezado.insertBefore(
      th,
      encabezado.lastElementChild
    );

  });

  const datos = [];

  for (
    const docSnap
    of querySnapshot.docs
  ) {

    const data =
      docSnap.data();

    const userId =
      data.usuario;

    const quiniela =
      data.quiniela;

    let puntos = 0;

    const fila = {
      usuario: userId,
      predicciones: [],
      puntos: 0
    };

    const usuarioDoc =
      await getDoc(
        doc(
          db,
          "usuarios",
          userId
        )
      );

    if (
      usuarioDoc.exists()
    ) {

      fila.usuario =
        usuarioDoc.data()
          .nombre || userId;

    }

    partidos.forEach(
      (_, i) => {

        const resultadoReal =
          resultadosReales[
            `partido${i}`
          ] ?? null;

        const marcadorReal =
          resultadosReales[
            `marcador${i}`
          ] ?? "";

        const resultadoUsuario =
          quiniela
            ? quiniela[
                `partido${i}`
              ]
            : null;

        const marcadorUsuario =
          quiniela
            ? quiniela[
                `marcador${i}`
              ]
            : "";

        let correcto =
          false;

        let marcadorExacto =
          false;

        if (
          resultadoReal !== null &&
          resultadoReal !== ""
        ) {

          if (
            resultadoUsuario ===
            resultadoReal
          ) {

            correcto = true;
            puntos += 1;

          }

          if (
            marcadorUsuario &&
            marcadorUsuario ===
              marcadorReal
          ) {

            marcadorExacto =
              true;

            puntos += 1;

          }

        }

        fila.predicciones.push({
          valor:
            resultadoUsuario,
          marcador:
            marcadorUsuario,
          correcto,
          marcadorExacto,
          pendiente:
            resultadoReal ===
              null ||
            resultadoReal === ""
        });

      }
    );

    fila.puntos = puntos;

    datos.push(fila);

  }

  datos.sort(
    (a, b) =>
      b.puntos - a.puntos
  );

  datos.forEach(
    jugador => {

      const tr =
        document.createElement(
          "tr"
        );

      const predHtml =
        jugador.predicciones
          .map(p => {

            let clase =
              "pendiente";

            let iconos = "";

            if (
              !p.pendiente
            ) {

              if (
                p.correcto
              ) {

                clase =
                  "correcto";

                iconos = "✅";

              } else {

                clase =
                  "incorrecto";

                iconos = "❌";

              }

              if (
                p.marcadorExacto
              ) {

                iconos +=
                  "⭐";

              }

            }

            return `
              <td class="${clase}">
                <div>
                  ${iconos}
                </div>

                <div>
                  ${p.valor ?? "-"}
                </div>

                <div style="
                  font-size:11px;
                  margin-top:4px;
                ">
                  ${
                    p.marcador || "-"
                  }
                </div>
              </td>
            `;

          })
          .join("");

      let clasePuntos =
        "";

      const maximoPuntos =
        partidos.length * 2;

      if (
        jugador.puntos ===
        maximoPuntos
      ) {

        clasePuntos =
          "perfecto";

      } else if (
        datos.length > 0 &&
        jugador.puntos ===
          datos[0].puntos
      ) {

        clasePuntos =
          "lider";

      }

      const puntosHtml =
        `
        <td class="${clasePuntos}">
          <strong>
            ${jugador.puntos}
          </strong>
        </td>
      `;

      tr.innerHTML =
        `<td>${jugador.usuario}</td>` +
        predHtml +
        puntosHtml;

      if (
        jugador.puntos ===
        maximoPuntos
      ) {

        tr.classList.add(
          "perfecto"
        );

        tr.cells[0].innerHTML =
          `🌟 ${jugador.usuario} 🌟`;

      }

      tbody.appendChild(
        tr
      );

    }
  );

}

mostrarQuinielas();
