// octavos.js — versión completa con ruleta animada + sincronización de estatus + campeón
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, runTransaction, onSnapshot, getDocs, collection
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ------------ Firebase Config ------------ */
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

/* ------------ DOM ------------ */
const saludoEl = document.getElementById("saludo");
const subEl = document.getElementById("sub");
const wheelCard = document.getElementById("wheelCard");
const btnTake = document.getElementById("btnTake");
const canvas = document.getElementById("wheel");
const spinMsg = document.getElementById("spinMsg");
const resultsTbody = document.querySelector("#resultsTable tbody");
const winnerBanner = document.getElementById("winnerBanner");
const backBtn = document.getElementById("backBtn");
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeHelp = document.getElementById("closeHelp");
const ctx = canvas.getContext("2d");

/* ------------ Variables ------------ */
let currentUserEmail = null;
let currentUserName = null;
let participants = [];
let settings = { teams: [] };
let state = { teamsRemaining: [], assignments: {}, teamStatus: {}, winner: null };

const settingsRef = doc(db, "octavos", "settings");
const stateRef = doc(db, "octavos", "state");
const permitidosRef = doc(db, "octavos", "permitidos");
const usuariosColl = collection(db, "usuarios");

/* ------------ Audio ------------ */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(freq = 880, time = 0.05) {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.value = 0.0001;
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + time);
  o.stop(audioCtx.currentTime + time + 0.02);
}
function playWin() {
  playBeep(880, 0.08);
  setTimeout(() => playBeep(1100, 0.06), 90);
}

/* ------------ Sesión ------------ */
function checkSession() {
  const user = localStorage.getItem("user");
  const nombre = localStorage.getItem("nombre");
  if (!user) {
    alert("Debes iniciar sesión.");
    window.location.href = "index.html";
    return false;
  }
  currentUserEmail = user.trim().toLowerCase();
  currentUserName = nombre || user;
  saludoEl.textContent = `Hola ${currentUserName}`;
  subEl.textContent = "Verificando acceso...";
  return true;
}

/* ------------ Firestore ------------ */
async function fetchUsuariosMap() {
  const snap = await getDocs(usuariosColl);
  const map = {};
  snap.forEach((d) => {
    const data = d.data();
    map[d.id.trim().toLowerCase()] = data.nombre || d.id;
  });
  return map;
}

async function loadParticipants() {
  const pSnap = await getDoc(permitidosRef);
  let emails = [];
  if (pSnap.exists() && Array.isArray(pSnap.data().allowed)) {
    emails = pSnap.data().allowed.map((e) => e.trim().toLowerCase());
  }
  const usuariosMap = await fetchUsuariosMap();
  participants = emails.map((e) => ({
    email: e,
    nombre: usuariosMap[e] || e.split("@")[0],
    status: "activo",
  }));
}

async function loadSettingsAndState() {
  const sSnap = await getDoc(settingsRef);
  settings.teams = sSnap.exists() && Array.isArray(sSnap.data().teams)
    ? sSnap.data().teams.slice()
    : [];

  const stSnap = await getDoc(stateRef);
  if (stSnap.exists()) {
    state = stSnap.data();
    if (!state.teamStatus) state.teamStatus = {};
    if (!Array.isArray(state.teamsRemaining) || state.teamsRemaining.length === 0) {
      state.teamsRemaining = settings.teams.slice();
      await setDoc(stateRef, state, { merge: true });
    }
    if (!state.assignments) state.assignments = {};
  } else {
    state = { teamsRemaining: settings.teams.slice(), assignments: {}, teamStatus: {}, winner: null };
    await setDoc(stateRef, state);
  }
}

/* ------------ Render ------------ */
function renderParticipants() {
  resultsTbody.innerHTML = "";
  participants.forEach((p) => {
    const assigned = state.assignments?.[p.email] || "-";
    const teamStat = assigned !== "-" ? state.teamStatus?.[assigned] || "activo" : "activo";
    const statusClass =
      teamStat === "eliminado" ? "danger"
      : assigned !== "-" ? "muted"
      : "success";
    const statusLabel =
      teamStat === "eliminado" ? "Eliminado"
      : assigned !== "-" ? "Asignado"
      : "Activo";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>${assigned}</td>
      <td><span class="status ${statusClass}">${statusLabel}</span></td>
    `;
    resultsTbody.appendChild(tr);
  });
}

/* ------------ Ruleta ------------ */
function resizeCanvas() {
  const size = Math.min(520, window.innerWidth - 40);
  canvas.width = size;
  canvas.height = size;
}

function drawWheel(teams, rotation = 0) {
  resizeCanvas();
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2, radius = Math.min(cx, cy) - 10;
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-cx, -cy);

  const n = teams.length;
  const slice = (2 * Math.PI) / n;
  const colors = ["#FF6B6B", "#FFD86B", "#8AE89A", "#6BD3FF", "#9A8CFF", "#FF83C1", "#FFA06B", "#88E0EF"];

  for (let i = 0; i < n; i++) {
    const team = teams[i];
    const start = i * slice, end = start + slice;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    const status = state.teamStatus?.[team] || "activo";
    ctx.fillStyle = status === "eliminado" ? "#ccc" : colors[i % colors.length];
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = status === "eliminado" ? "#444" : "#fff";
    ctx.font = `${Math.round(w * 0.045)}px bold sans-serif`;
    const label = status === "eliminado" ? `${team} ❌` : team;
    ctx.fillText(label, radius - 20, 0);
    ctx.restore();
  }

  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "#0b1220";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = `${Math.round(w * 0.05)}px bold sans-serif`;
  ctx.fillText("🎯", cx, cy);
  drawPointer(w, h);
}

function drawPointer(w, h) {
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(w / 2 - 10, 10);
  ctx.lineTo(w / 2 + 10, 10);
  ctx.lineTo(w / 2, 40);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ------------ Animación de giro ------------ */
function animateWheelToTeam(teams, selectedTeam) {
  return new Promise((resolve) => {
    const n = teams.length;
    const idx = teams.indexOf(selectedTeam);
    if (idx === -1) return resolve(false);

    const slice = 360 / n;
    const targetDeg = 270 - (idx * slice + slice / 2);
    const spins = 5 + Math.floor(Math.random() * 3);
    const totalDeg = spins * 360 + targetDeg;
    const duration = 5000;
    const start = performance.now();

    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const currentDeg = ease * totalDeg;
      drawWheel(teams, currentDeg);
      if (t < 1) {
        if (Math.random() < 0.1) playBeep(600 + Math.random() * 400, 0.03);
        requestAnimationFrame(frame);
      } else {
        playWin();
        resolve(true);
      }
    }
    requestAnimationFrame(frame);
  });
}

/* ------------ Asignar equipo ------------ */
async function takeTeam() {
  if (!state.teamsRemaining || state.teamsRemaining.length === 0) {
    alert("⚠️ No quedan equipos disponibles.");
    return;
  }
  btnTake.disabled = true;
  spinMsg.textContent = "🎡 Girando la ruleta...";

  const teamsBefore = [...state.teamsRemaining];
  let assigned = null;

  try {
    await runTransaction(db, async (t) => {
      const st = await t.get(stateRef);
      if (!st.exists()) throw new Error("Estado no inicializado por el admin.");
      const s = st.data();
      if (!s.teamsRemaining?.length) throw new Error("No quedan equipos.");

      const idx = Math.floor(Math.random() * s.teamsRemaining.length);
      assigned = s.teamsRemaining[idx];
      const newTeams = s.teamsRemaining.filter((_, i) => i !== idx);
      const newAssignments = { ...(s.assignments || {}), [currentUserEmail]: assigned };
      t.update(stateRef, { teamsRemaining: newTeams, assignments: newAssignments });
    });

    await animateWheelToTeam(teamsBefore, assigned);
    spinMsg.textContent = `🎉 ¡Tu equipo es ${assigned.toUpperCase()}!`;
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    btnTake.disabled = false;
  }
}

/* ------------ Ganador ------------ */
function checkWinner() {
  const activeTeams = Object.entries(state.teamStatus || {})
    .filter(([_, st]) => st === "activo")
    .map(([team]) => team);

  if (activeTeams.length === 1) {
    const winner = activeTeams[0];
    winnerBanner.style.display = "block";
    winnerBanner.innerHTML = `🏆 ¡${winner.toUpperCase()} CAMPEÓN! 🥳`;
    winnerBanner.classList.add("animate__animated", "animate__tada");
  } else {
    winnerBanner.style.display = "none";
  }
}

/* ------------ Realtime sincronizado ------------ */
function watchStateRealtime() {
  onSnapshot(stateRef, (snap) => {
    if (!snap.exists()) return;
    state = snap.data();
    if (!state.teamStatus) state.teamStatus = {};

    const wheelTeams = state.teamsRemaining?.length
      ? state.teamsRemaining
      : settings.teams;

    drawWheel(wheelTeams);
    renderParticipants();
    checkWinner();

    const myTeam = state.assignments?.[currentUserEmail];
    btnTake.disabled = !!myTeam || !state.teamsRemaining?.length;
    if (myTeam) spinMsg.textContent = `Ya tienes asignado: ${myTeam}`;
  });

  // Escuchar cambios en configuración
  onSnapshot(settingsRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.teams)) settings.teams = data.teams;
    }
  });
}

/* ------------ Modal ayuda ------------ */
helpModal.classList.add("hidden");
helpBtn.addEventListener("click", () => {
  helpModal.classList.remove("hidden");
  helpModal.style.display = "flex";
  helpModal.setAttribute("aria-hidden", "false");
});
closeHelp.addEventListener("click", () => {
  helpModal.classList.add("hidden");
  helpModal.style.display = "none";
  helpModal.setAttribute("aria-hidden", "true");
});
helpModal.addEventListener("click", (e) => {
  if (e.target === helpModal) {
    helpModal.classList.add("hidden");
    helpModal.style.display = "none";
    helpModal.setAttribute("aria-hidden", "true");
  }
});

/* ------------ Init ------------ */
(async function init() {
  if (!checkSession()) return;
  await loadParticipants();
  await loadSettingsAndState();

  const allowedEmails = participants.map(p => p.email);
  if (!allowedEmails.includes(currentUserEmail)) {
    subEl.textContent = "❌ No tienes acceso a esta sección";
    setTimeout(() => (window.location.href = "menu.html"), 2000);
    return;
  }

  wheelCard.classList.remove("hidden");
  document.getElementById("resultsCard").classList.remove("hidden");

  const initialTeams = state.teamsRemaining?.length ? state.teamsRemaining : settings.teams;
  drawWheel(initialTeams);
  renderParticipants();

  btnTake.addEventListener("click", async () => {
    if (audioCtx.state === "suspended") await audioCtx.resume();
    await takeTeam();
  });
  backBtn.addEventListener("click", () => (window.location.href = "menu.html"));

  watchStateRealtime();
})();
