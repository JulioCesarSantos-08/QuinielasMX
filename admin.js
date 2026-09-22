import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp
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

const selectGanador =
  document.getElementById("usuario-ganador");

const listaGanadores =
  document.getElementById("lista-ganadores");

const buscarUsuario =
  document.getElementById("buscar-usuario");

const cantidadGanadores =
  document.getElementById("cantidad-ganadores");

const totalPartidos =
  document.getElementById("total-partidos");

const partidosCapturados =
  document.getElementById("partidos-capturados");

const btnGuardar =
  document.getElementById("btn-guardar");

const btnReiniciar =
  document.getElementById("btn-reiniciar");

const btnToggle =
  document.getElementById("btn-toggle");

const btnTabla =
  document.getElementById("btn-tabla");

const toast =
  document.getElementById("toast");

const radiosDestinatario =
  document.querySelectorAll(
    'input[name="tipo-destinatario"]'
  );

const opcionesDestinatario =
  document.querySelectorAll(
    ".tipo-opcion"
  );

const selectorDestinatarios =
  document.getElementById(
    "selector-destinatarios"
  );

const listaDestinatarios =
  document.getElementById(
    "lista-destinatarios"
  );

const buscarDestinatario =
  document.getElementById(
    "buscar-destinatario"
  );

const cantidadDestinatarios =
  document.getElementById(
    "cantidad-destinatarios"
  );

const mensajeNotificacion =
  document.getElementById(
    "mensaje-notificacion"
  );

const contadorMensaje =
  document.getElementById(
    "contador-mensaje"
  );

const previewMensaje =
  document.getElementById(
    "preview-mensaje"
  );

const btnEnviarNotificacion =
  document.getElementById(
    "btn-enviar-notificacion"
  );

let partidos = [];
let usuarios = [];
let destinatariosSeleccionados = new Set();
let toastTimer = null;

const admins = [
  "ti43300@uvp.edu.mx",
  "jc@gmail.com",
  "guera00@gmail.com"
];

const user =
  localStorage.getItem("user");

const nombre =
  localStorage.getItem("nombre");

if (!user) {
  alert("Debes iniciar sesión.");

  window.location.href =
    "index.html";
} else if (
  !admins.includes(user)
) {
  alert(
    `Hola ${nombre || "Usuario"}, tú no tienes acceso como administrador.`
  );

  window.location.href =
    "menu.html";
} else {
  document.getElementById(
    "formulario"
  ).style.display = "block";

  document.getElementById(
    "titulo"
  ).textContent =
    `Panel de Administrador · ${nombre || "Admin"}`;

  iniciarPanel();
}

async function iniciarPanel() {
  try {
    await Promise.all([
      cargarPartidos(),
      cargarUsuarios(),
      actualizarBoton(),
      actualizarBotonTabla()
    ]);

    configurarCentroNotificaciones();
  } catch (error) {
    console.error(error);

    mostrarToast(
      "Ocurrió un error al cargar el panel.",
      "error"
    );
  }
}

function mostrarToast(
  mensaje,
  tipo = "info"
) {
  clearTimeout(toastTimer);

  toast.textContent = mensaje;

  toast.className =
    `toast visible ${tipo}`;

  toastTimer = setTimeout(() => {
    toast.className = "toast";
  }, 3500);
}

function escaparHTML(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatearEquipo(
  nombreEquipo
) {
  if (!nombreEquipo) {
    return "";
  }

  return nombreEquipo
    .charAt(0)
    .toUpperCase() +
    nombreEquipo.slice(1);
}

function obtenerIniciales(
  nombreUsuario
) {
  if (!nombreUsuario) {
    return "U";
  }

  const palabras =
    nombreUsuario
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  return palabras
    .slice(0, 2)
    .map(
      palabra =>
        palabra
          .charAt(0)
          .toUpperCase()
    )
    .join("");
}

async function cargarPartidos() {
  const docSnap =
    await getDoc(
      doc(
        db,
        "config",
        "partidos"
      )
    );

  if (!docSnap.exists()) {
    mostrarToast(
      "No se encontraron partidos configurados.",
      "error"
    );

    return;
  }

  partidos =
    docSnap.data().partidos || [];

  form.innerHTML = "";

  totalPartidos.textContent =
    partidos.length;

  partidos.forEach(
    (partido, index) => {
      crearTarjetaPartido(
        partido,
        index
      );
    }
  );

  await cargarResultados();

  actualizarResumenPartidos();
}

function crearTarjetaPartido(
  partido,
  index
) {
  const equipo1 =
    formatearEquipo(
      partido.equipo1
    );

  const equipo2 =
    formatearEquipo(
      partido.equipo2
    );

  const equipo1Seguro =
    escaparHTML(equipo1);

  const equipo2Seguro =
    escaparHTML(equipo2);

  const tarjeta =
    document.createElement(
      "article"
    );

  tarjeta.className =
    "partido";

  tarjeta.dataset.index =
    index;

  tarjeta.innerHTML = `
    <div class="partido-top">

      <span class="numero-partido">
        Partido ${index + 1}
      </span>

      <span
        class="estado-partido"
        id="estado-partido-${index}"
      >
        Pendiente
      </span>

    </div>

    <div class="enfrentamiento">

      <div class="equipo equipo-local">
        ${equipo1Seguro}
      </div>

      <span class="vs">
        VS
      </span>

      <div class="equipo equipo-visitante">
        ${equipo2Seguro}
      </div>

    </div>

    <div class="marcador">

      <input
        class="gol-input"
        type="number"
        id="goles-local-${index}"
        min="0"
        max="99"
        step="1"
        inputmode="numeric"
        aria-label="Goles de ${equipo1Seguro}"
        placeholder="0"
      >

      <span class="marcador-separador">
        —
      </span>

      <input
        class="gol-input"
        type="number"
        id="goles-visitante-${index}"
        min="0"
        max="99"
        step="1"
        inputmode="numeric"
        aria-label="Goles de ${equipo2Seguro}"
        placeholder="0"
      >

    </div>

    <div
      class="selector-resultado"
      data-index="${index}"
    >

      <button
        type="button"
        class="resultado-btn activo"
        data-value=""
      >
        Pendiente
      </button>

      <button
        type="button"
        class="resultado-btn"
        data-value="local"
      >
        ${equipo1Seguro}
      </button>

      <button
        type="button"
        class="resultado-btn"
        data-value="empate"
      >
        Empate
      </button>

      <button
        type="button"
        class="resultado-btn"
        data-value="visitante"
      >
        ${equipo2Seguro}
      </button>

    </div>

    <input
      type="hidden"
      id="resultado${index}"
      value=""
    >

    <input
      type="hidden"
      id="marcador${index}"
      value=""
    >
  `;

  form.appendChild(
    tarjeta
  );

  configurarPartido(
    index
  );
}

function configurarPartido(
  index
) {
  const tarjeta =
    form.querySelector(
      `.partido[data-index="${index}"]`
    );

  const botones =
    tarjeta.querySelectorAll(
      ".resultado-btn"
    );

  const golesLocal =
    document.getElementById(
      `goles-local-${index}`
    );

  const golesVisitante =
    document.getElementById(
      `goles-visitante-${index}`
    );

  botones.forEach(
    boton => {
      boton.addEventListener(
        "click",
        () => {
          seleccionarResultado(
            index,
            boton.dataset.value
          );

          actualizarEstadoPartido(
            index
          );
        }
      );
    }
  );

  golesLocal.addEventListener(
    "input",
    () => {
      normalizarGol(
        golesLocal
      );

      sincronizarMarcador(
        index
      );
    }
  );

  golesVisitante.addEventListener(
    "input",
    () => {
      normalizarGol(
        golesVisitante
      );

      sincronizarMarcador(
        index
      );
    }
  );
}

function normalizarGol(input) {
  if (input.value === "") {
    return;
  }

  let valor =
    Number(input.value);

  if (
    Number.isNaN(valor) ||
    valor < 0
  ) {
    valor = 0;
  }

  if (valor > 99) {
    valor = 99;
  }

  input.value =
    Math.floor(valor);
}

function sincronizarMarcador(
  index
) {
  const inputLocal =
    document.getElementById(
      `goles-local-${index}`
    );

  const inputVisitante =
    document.getElementById(
      `goles-visitante-${index}`
    );

  const marcador =
    document.getElementById(
      `marcador${index}`
    );

  const local =
    inputLocal.value;

  const visitante =
    inputVisitante.value;

  if (
    local === "" &&
    visitante === ""
  ) {
    marcador.value = "";

    actualizarEstadoPartido(
      index
    );

    return;
  }

  marcador.value =
    `${local || 0}-${visitante || 0}`;

  if (
    local !== "" &&
    visitante !== ""
  ) {
    const golesL =
      Number(local);

    const golesV =
      Number(visitante);

    let resultado = "";

    if (golesL > golesV) {
      resultado = "local";
    } else if (
      golesL < golesV
    ) {
      resultado =
        "visitante";
    } else {
      resultado =
        "empate";
    }

    seleccionarResultado(
      index,
      resultado
    );
  }

  actualizarEstadoPartido(
    index
  );
}

function seleccionarResultado(
  index,
  valor
) {
  const tarjeta =
    form.querySelector(
      `.partido[data-index="${index}"]`
    );

  if (!tarjeta) {
    return;
  }

  const botones =
    tarjeta.querySelectorAll(
      ".resultado-btn"
    );

  botones.forEach(
    boton => {
      boton.classList.toggle(
        "activo",
        boton.dataset.value ===
          (valor || "")
      );
    }
  );

  const input =
    document.getElementById(
      `resultado${index}`
    );

  if (input) {
    input.value =
      valor || "";
  }
}

function actualizarEstadoPartido(
  index
) {
  const resultado =
    document.getElementById(
      `resultado${index}`
    )?.value || "";

  const marcador =
    document.getElementById(
      `marcador${index}`
    )?.value || "";

  const tarjeta =
    form.querySelector(
      `.partido[data-index="${index}"]`
    );

  const estado =
    document.getElementById(
      `estado-partido-${index}`
    );

  const completo =
    Boolean(
      resultado &&
      marcador
    );

  tarjeta?.classList.toggle(
    "resultado-completo",
    completo
  );

  if (estado) {
    estado.textContent =
      completo
        ? "Capturado"
        : "Pendiente";
  }

  actualizarResumenPartidos();
}

function actualizarResumenPartidos() {
  let capturados = 0;

  partidos.forEach(
    (_, index) => {
      const resultado =
        document.getElementById(
          `resultado${index}`
        );

      const marcador =
        document.getElementById(
          `marcador${index}`
        );

      if (
        resultado?.value &&
        marcador?.value
      ) {
        capturados++;
      }
    }
  );

  partidosCapturados.textContent =
    capturados;
}

async function cargarResultados() {
  const docSnap =
    await getDoc(
      doc(
        db,
        "resultados",
        "actuales"
      )
    );

  if (!docSnap.exists()) {
    return;
  }

  const data =
    docSnap.data();

  for (
    let i = 0;
    i < partidos.length;
    i++
  ) {
    const resultado =
      data[`partido${i}`] || "";

    const marcador =
      data[`marcador${i}`] || "";

    seleccionarResultado(
      i,
      resultado
    );

    const inputMarcador =
      document.getElementById(
        `marcador${i}`
      );

    if (inputMarcador) {
      inputMarcador.value =
        marcador;
    }

    if (marcador) {
      const partes =
        marcador
          .split("-")
          .map(
            valor =>
              valor.trim()
          );

      const inputLocal =
        document.getElementById(
          `goles-local-${i}`
        );

      const inputVisitante =
        document.getElementById(
          `goles-visitante-${i}`
        );

      if (inputLocal) {
        inputLocal.value =
          partes[0] ?? "";
      }

      if (inputVisitante) {
        inputVisitante.value =
          partes[1] ?? "";
      }
    }

    actualizarEstadoPartido(
      i
    );
  }
}

async function cargarUsuarios() {
  const snapshot =
    await getDocs(
      collection(
        db,
        "usuarios"
      )
    );

  usuarios = [];

  snapshot.forEach(
    docu => {
      const data =
        docu.data();

      usuarios.push({
        email: docu.id,
        nombre:
          data.nombre ||
          docu.id
      });
    }
  );

  usuarios.sort(
    (a, b) =>
      a.nombre.localeCompare(
        b.nombre,
        "es",
        {
          sensitivity:
            "base"
        }
      )
  );

  selectGanador.innerHTML =
    "";

  usuarios.forEach(
    usuario => {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        usuario.email;

      option.textContent =
        usuario.nombre;

      selectGanador.appendChild(
        option
      );
    }
  );

  const confSnap =
    await getDoc(
      doc(
        db,
        "configuracion",
        "general"
      )
    );

  const ganadoresGuardados =
    confSnap.exists() &&
    Array.isArray(
      confSnap.data().ganadores
    )
      ? confSnap.data().ganadores
      : [];

  Array.from(
    selectGanador.options
  ).forEach(
    option => {
      option.selected =
        ganadoresGuardados.includes(
          option.value
        );
    }
  );

  renderizarUsuariosGanadores();
  renderizarDestinatarios();
}

function renderizarUsuariosGanadores(
  filtro = ""
) {
  const termino =
    filtro
      .trim()
      .toLowerCase();

  listaGanadores.innerHTML =
    "";

  const filtrados =
    usuarios.filter(
      usuario =>
        usuario.nombre
          .toLowerCase()
          .includes(termino) ||
        usuario.email
          .toLowerCase()
          .includes(termino)
    );

  if (
    filtrados.length === 0
  ) {
    listaGanadores.innerHTML = `
      <div class="sin-usuarios">
        No se encontraron usuarios.
      </div>
    `;

    actualizarCantidadGanadores();

    return;
  }

  filtrados.forEach(
    usuario => {
      const option =
        Array.from(
          selectGanador.options
        ).find(
          item =>
            item.value ===
            usuario.email
        );

      const seleccionado =
        option?.selected ||
        false;

      const tarjeta =
        crearTarjetaUsuario({
          usuario,
          seleccionado,
          clase:
            "usuario-ganador"
        });

      const checkbox =
        tarjeta.querySelector(
          "input"
        );

      checkbox.addEventListener(
        "change",
        () => {
          const seleccionadoAhora =
            checkbox.checked;

          tarjeta.classList.toggle(
            "seleccionado",
            seleccionadoAhora
          );

          actualizarCheckTarjeta(
            tarjeta,
            seleccionadoAhora
          );

          const hiddenOption =
            Array.from(
              selectGanador.options
            ).find(
              item =>
                item.value ===
                usuario.email
            );

          if (hiddenOption) {
            hiddenOption.selected =
              seleccionadoAhora;
          }

          actualizarCantidadGanadores();
        }
      );

      listaGanadores.appendChild(
        tarjeta
      );
    }
  );

  actualizarCantidadGanadores();
}

function crearTarjetaUsuario({
  usuario,
  seleccionado,
  clase
}) {
  const tarjeta =
    document.createElement(
      "label"
    );

  tarjeta.className =
    `${clase}${
      seleccionado
        ? " seleccionado"
        : ""
    }`;

  tarjeta.dataset.email =
    usuario.email;

  const checkbox =
    document.createElement(
      "input"
    );

  checkbox.type =
    "checkbox";

  checkbox.checked =
    seleccionado;

  const avatar =
    document.createElement(
      "span"
    );

  avatar.className =
    "usuario-avatar";

  avatar.textContent =
    obtenerIniciales(
      usuario.nombre
    );

  const info =
    document.createElement(
      "span"
    );

  info.className =
    "usuario-info";

  const nombreUsuario =
    document.createElement(
      "strong"
    );

  nombreUsuario.textContent =
    usuario.nombre;

  info.appendChild(
    nombreUsuario
  );

  const check =
    document.createElement(
      "span"
    );

  check.className =
    "usuario-check";

  check.textContent =
    seleccionado
      ? "✓"
      : "";

  tarjeta.append(
    checkbox,
    avatar,
    info,
    check
  );

  return tarjeta;
}

function actualizarCheckTarjeta(
  tarjeta,
  seleccionado
) {
  const check =
    tarjeta.querySelector(
      ".usuario-check"
    );

  if (check) {
    check.textContent =
      seleccionado
        ? "✓"
        : "";
  }
}

function actualizarCantidadGanadores() {
  cantidadGanadores.textContent =
    selectGanador
      .selectedOptions
      .length;
}

buscarUsuario.addEventListener(
  "input",
  () => {
    renderizarUsuariosGanadores(
      buscarUsuario.value
    );
  }
);

function configurarCentroNotificaciones() {
  radiosDestinatario.forEach(
    radio => {
      radio.addEventListener(
        "change",
        manejarCambioTipoDestinatario
      );
    }
  );

  mensajeNotificacion.addEventListener(
    "input",
    actualizarVistaPreviaMensaje
  );

  buscarDestinatario.addEventListener(
    "input",
    () => {
      renderizarDestinatarios(
        buscarDestinatario.value
      );
    }
  );

  btnEnviarNotificacion.addEventListener(
    "click",
    enviarNotificacionManual
  );

  manejarCambioTipoDestinatario();
  actualizarVistaPreviaMensaje();
}

function obtenerTipoDestinatario() {
  return (
    document.querySelector(
      'input[name="tipo-destinatario"]:checked'
    )?.value || "todos"
  );
}

function manejarCambioTipoDestinatario() {
  const tipo =
    obtenerTipoDestinatario();

  opcionesDestinatario.forEach(
    opcion => {
      const radio =
        opcion.querySelector(
          'input[type="radio"]'
        );

      opcion.classList.toggle(
        "seleccionado",
        radio.checked
      );
    }
  );

  if (tipo === "todos") {
    selectorDestinatarios.classList.add(
      "oculto"
    );

    destinatariosSeleccionados.clear();

    actualizarCantidadDestinatarios();

    return;
  }

  selectorDestinatarios.classList.remove(
    "oculto"
  );

  if (
    tipo === "uno" &&
    destinatariosSeleccionados.size > 1
  ) {
    const primero =
      Array.from(
        destinatariosSeleccionados
      )[0];

    destinatariosSeleccionados =
      new Set(
        primero
          ? [primero]
          : []
      );
  }

  renderizarDestinatarios(
    buscarDestinatario.value
  );
}

function renderizarDestinatarios(
  filtro = ""
) {
  listaDestinatarios.innerHTML =
    "";

  const termino =
    filtro
      .trim()
      .toLowerCase();

  const filtrados =
    usuarios.filter(
      usuario =>
        usuario.nombre
          .toLowerCase()
          .includes(termino) ||
        usuario.email
          .toLowerCase()
          .includes(termino)
    );

  if (
    filtrados.length === 0
  ) {
    listaDestinatarios.innerHTML = `
      <div class="sin-usuarios">
        No se encontraron usuarios.
      </div>
    `;

    actualizarCantidadDestinatarios();

    return;
  }

  filtrados.forEach(
    usuario => {
      const seleccionado =
        destinatariosSeleccionados.has(
          usuario.email
        );

      const tarjeta =
        crearTarjetaUsuario({
          usuario,
          seleccionado,
          clase:
            "usuario-destinatario"
        });

      const checkbox =
        tarjeta.querySelector(
          "input"
        );

      checkbox.addEventListener(
        "change",
        () => {
          cambiarSeleccionDestinatario(
            usuario.email,
            checkbox.checked
          );
        }
      );

      listaDestinatarios.appendChild(
        tarjeta
      );
    }
  );

  actualizarCantidadDestinatarios();
}

function cambiarSeleccionDestinatario(
  email,
  seleccionar
) {
  const tipo =
    obtenerTipoDestinatario();

  if (
    tipo === "uno" &&
    seleccionar
  ) {
    destinatariosSeleccionados.clear();

    destinatariosSeleccionados.add(
      email
    );

    renderizarDestinatarios(
      buscarDestinatario.value
    );

    return;
  }

  if (seleccionar) {
    destinatariosSeleccionados.add(
      email
    );
  } else {
    destinatariosSeleccionados.delete(
      email
    );
  }

  actualizarTarjetasDestinatarios();
  actualizarCantidadDestinatarios();
}

function actualizarTarjetasDestinatarios() {
  listaDestinatarios
    .querySelectorAll(
      ".usuario-destinatario"
    )
    .forEach(
      tarjeta => {
        const email =
          tarjeta.dataset.email;

        const seleccionado =
          destinatariosSeleccionados.has(
            email
          );

        tarjeta.classList.toggle(
          "seleccionado",
          seleccionado
        );

        const checkbox =
          tarjeta.querySelector(
            "input"
          );

        if (checkbox) {
          checkbox.checked =
            seleccionado;
        }

        actualizarCheckTarjeta(
          tarjeta,
          seleccionado
        );
      }
    );
}

function actualizarCantidadDestinatarios() {
  cantidadDestinatarios.textContent =
    destinatariosSeleccionados.size;
}

function actualizarVistaPreviaMensaje() {
  const texto =
    mensajeNotificacion.value;

  contadorMensaje.textContent =
    `${texto.length} / 300`;

  previewMensaje.textContent =
    texto.trim() ||
    "Tu mensaje aparecerá aquí.";
}

async function enviarNotificacionManual() {
  const texto =
    mensajeNotificacion.value.trim();

  const tipo =
    obtenerTipoDestinatario();

  if (!texto) {
    mostrarToast(
      "Escribe un mensaje antes de enviarlo.",
      "error"
    );

    mensajeNotificacion.focus();

    return;
  }

  let destinatarios = [];

  if (tipo !== "todos") {
    destinatarios =
      Array.from(
        destinatariosSeleccionados
      );

    if (
      destinatarios.length === 0
    ) {
      mostrarToast(
        tipo === "uno"
          ? "Selecciona al usuario que recibirá el mensaje."
          : "Selecciona al menos un destinatario.",
        "error"
      );

      return;
    }
  }

  if (
    tipo === "uno" &&
    destinatarios.length !== 1
  ) {
    mostrarToast(
      "Selecciona solamente un usuario.",
      "error"
    );

    return;
  }

  const confirmacion =
    tipo === "todos"
      ? confirm(
          `¿Enviar esta notificación a todos los usuarios?\n\n"${texto}"`
        )
      : confirm(
          `¿Enviar esta notificación a ${destinatarios.length} usuario${destinatarios.length === 1 ? "" : "s"}?\n\n"${texto}"`
        );

  if (!confirmacion) {
    return;
  }

  try {
    btnEnviarNotificacion.classList.add(
      "boton-cargando"
    );

    btnEnviarNotificacion.disabled =
      true;

    await addDoc(
      collection(
        db,
        "notificaciones"
      ),
      {
        texto,
        tipo,
        paraTodos:
          tipo === "todos",
        destinatarios:
          tipo === "todos"
            ? []
            : destinatarios,
        fecha:
          new Date()
            .toLocaleString(
              "es-MX"
            ),
        creadoEn:
          serverTimestamp(),
        autor:
          user,
        autorNombre:
          nombre ||
          "Administrador"
      }
    );

    mostrarToast(
      tipo === "todos"
        ? "Notificación enviada a todos los usuarios."
        : `Notificación enviada a ${destinatarios.length} usuario${destinatarios.length === 1 ? "" : "s"}.`,
      "exito"
    );

    limpiarFormularioNotificacion();
  } catch (error) {
    console.error(
      "Error enviando notificación:",
      error
    );

    mostrarToast(
      `No se pudo enviar la notificación: ${error.message}`,
      "error"
    );
  } finally {
    btnEnviarNotificacion.classList.remove(
      "boton-cargando"
    );

    btnEnviarNotificacion.disabled =
      false;
  }
}

function limpiarFormularioNotificacion() {
  mensajeNotificacion.value =
    "";

  destinatariosSeleccionados.clear();

  const radioTodos =
    document.querySelector(
      'input[name="tipo-destinatario"][value="todos"]'
    );

  if (radioTodos) {
    radioTodos.checked =
      true;
  }

  buscarDestinatario.value =
    "";

  manejarCambioTipoDestinatario();
  actualizarVistaPreviaMensaje();
  actualizarCantidadDestinatarios();
}

async function enviarNotificacionGanadores(
  ganadores
) {
  for (
    const uid of ganadores
  ) {
    await setDoc(
      doc(
        db,
        "usuarios",
        uid
      ),
      {
        mensaje:
          "¡Felicidades! Has sido seleccionado como ganador 🎉"
      },
      {
        merge: true
      }
    );
  }
}

async function obtenerEstado() {
  const snap =
    await getDoc(
      doc(
        db,
        "configuracion",
        "estado"
      )
    );

  return snap.exists()
    ? snap.data().quinielaActiva
    : true;
}

async function obtenerEstadoTabla() {
  const snap =
    await getDoc(
      doc(
        db,
        "configuracion",
        "estadoTabla"
      )
    );

  return snap.exists()
    ? snap.data().tablaVisible
    : false;
}

async function actualizarBoton() {
  const estado =
    await obtenerEstado();

  const titulo =
    btnToggle.querySelector(
      "strong"
    );

  const descripcion =
    btnToggle.querySelector(
      "small"
    );

  const icono =
    btnToggle.querySelector(
      ".accion-icono"
    );

  titulo.textContent =
    estado
      ? "Quiniela activa"
      : "Quiniela desactivada";

  descripcion.textContent =
    estado
      ? "Presiona para desactivarla"
      : "Presiona para activarla";

  icono.textContent =
    estado
      ? "●"
      : "○";
}

async function actualizarBotonTabla() {
  const visible =
    await obtenerEstadoTabla();

  const titulo =
    btnTabla.querySelector(
      "strong"
    );

  const descripcion =
    btnTabla.querySelector(
      "small"
    );

  const icono =
    btnTabla.querySelector(
      ".accion-icono"
    );

  titulo.textContent =
    visible
      ? "Tabla General visible"
      : "Tabla General oculta";

  descripcion.textContent =
    visible
      ? "Presiona para ocultarla"
      : "Presiona para mostrarla";

  icono.textContent =
    visible
      ? "◉"
      : "○";
}

btnToggle.addEventListener(
  "click",
  async () => {
    try {
      btnToggle.classList.add(
        "boton-cargando"
      );

      const estadoActual =
        await obtenerEstado();

      await setDoc(
        doc(
          db,
          "configuracion",
          "estado"
        ),
        {
          quinielaActiva:
            !estadoActual
        }
      );

      await actualizarBoton();

      mostrarToast(
        !estadoActual
          ? "Quiniela activada."
          : "Quiniela desactivada.",
        "exito"
      );
    } catch (error) {
      console.error(error);

      mostrarToast(
        "No se pudo cambiar el estado de la quiniela.",
        "error"
      );
    } finally {
      btnToggle.classList.remove(
        "boton-cargando"
      );
    }
  }
);

btnTabla.addEventListener(
  "click",
  async () => {
    try {
      btnTabla.classList.add(
        "boton-cargando"
      );

      const visibleActual =
        await obtenerEstadoTabla();

      await setDoc(
        doc(
          db,
          "configuracion",
          "estadoTabla"
        ),
        {
          tablaVisible:
            !visibleActual
        }
      );

      await actualizarBotonTabla();

      mostrarToast(
        !visibleActual
          ? "Tabla General visible."
          : "Tabla General oculta.",
        "exito"
      );
    } catch (error) {
      console.error(error);

      mostrarToast(
        "No se pudo cambiar el estado de la tabla.",
        "error"
      );
    } finally {
      btnTabla.classList.remove(
        "boton-cargando"
      );
    }
  }
);

btnGuardar.addEventListener(
  "click",
  async () => {
    const resultados = {};

    for (
      let i = 0;
      i < partidos.length;
      i++
    ) {
      const resultado =
        document.getElementById(
          `resultado${i}`
        );

      const marcador =
        document.getElementById(
          `marcador${i}`
        );

      resultados[
        `partido${i}`
      ] =
        resultado?.value ||
        null;

      resultados[
        `marcador${i}`
      ] =
        marcador?.value ||
        "";
    }

    const ganadores =
      Array.from(
        selectGanador
          .selectedOptions
      ).map(
        option =>
          option.value
      );

    try {
      btnGuardar.classList.add(
        "boton-cargando"
      );

      await setDoc(
        doc(
          db,
          "resultados",
          "actuales"
        ),
        resultados
      );

      await setDoc(
        doc(
          db,
          "configuracion",
          "general"
        ),
        {
          ganadores,
          fecha:
            new Date()
              .toLocaleString(
                "es-MX"
              )
        }
      );

      await enviarNotificacionGanadores(
        ganadores
      );

      mostrarToast(
        "Resultados, marcadores y ganadores guardados correctamente.",
        "exito"
      );
    } catch (error) {
      console.error(error);

      mostrarToast(
        `Error al guardar: ${error.message}`,
        "error"
      );
    } finally {
      btnGuardar.classList.remove(
        "boton-cargando"
      );
    }
  }
);

async function guardarHistorial() {
  const resultadosSnap = await getDoc(
    doc(db, "resultados", "actuales")
  );

  const resultados = resultadosSnap.exists()
    ? resultadosSnap.data()
    : {};

  const quinielasSnap = await getDocs(
    collection(db, "quinielas")
  );

  const quinielas = [];

  quinielasSnap.forEach(docu => {
    quinielas.push({
      id: docu.id,
      ...docu.data()
    });
  });

  const usuariosSnap = await getDocs(
    collection(db, "usuarios")
  );

  const usuariosHistorial = [];

  usuariosSnap.forEach(docu => {
    const data = docu.data();

    usuariosHistorial.push({
      id: docu.id,
      nombre: data.nombre ?? "Sin nombre",
      puntos: Number.isFinite(data.puntos) ? data.puntos : 0,
      aciertos: Number.isFinite(data.aciertos) ? data.aciertos : 0
    });
  });

  const configSnap = await getDoc(
    doc(db, "config", "partidos")
  );

  const jornadaActual = configSnap.exists()
    ? configSnap.data().jornada ?? "Sin jornada"
    : "Sin jornada";

  const jornadaID = `jornada_${Date.now()}`;

  await setDoc(
    doc(db, "historial_jornadas", jornadaID),
    {
      fecha: new Date().toLocaleString("es-MX"),
      jornada: jornadaActual,
      resultados,
      quinielas,
      usuarios: usuariosHistorial
    }
  );
}

btnReiniciar.addEventListener(
  "click",
  async () => {
    const confirmar =
      confirm(
        "¿Estás seguro de que deseas reiniciar la jornada?\n\nLa jornada actual se guardará en el historial antes de eliminar los datos."
      );

    if (!confirmar) {
      return;
    }

    try {
      btnReiniciar.classList.add(
        "boton-cargando"
      );

      btnReiniciar.disabled =
        true;

      await guardarHistorial();

      await deleteDoc(
        doc(
          db,
          "resultados",
          "actuales"
        )
      );

      await deleteDoc(
        doc(
          db,
          "configuracion",
          "general"
        )
      );

      const usuariosSnapshot =
        await getDocs(
          collection(
            db,
            "usuarios"
          )
        );

      for (
        const docu of
        usuariosSnapshot.docs
      ) {
        const ref =
          doc(
            db,
            "usuarios",
            docu.id
          );

        await updateDoc(
          ref,
          {
            quiniela: [],
            puntos: 0,
            aciertos: 0,
            mensaje: ""
          }
        );
      }

      const quinielasSnapshot =
        await getDocs(
          collection(
            db,
            "quinielas"
          )
        );

      for (
        const qDoc of
        quinielasSnapshot.docs
      ) {
        await deleteDoc(
          doc(
            db,
            "quinielas",
            qDoc.id
          )
        );
      }

      mostrarToast(
        "Jornada guardada en historial y reiniciada correctamente.",
        "exito"
      );

      setTimeout(
        () => {
          location.reload();
        },
        1000
      );
    } catch (error) {
      console.error(error);

      mostrarToast(
        `Error al reiniciar: ${error.message}`,
        "error"
      );

      btnReiniciar.classList.remove(
        "boton-cargando"
      );

      btnReiniciar.disabled =
        false;
    }
  }
);
