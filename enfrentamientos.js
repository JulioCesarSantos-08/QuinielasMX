// ⚽ LISTA DE ENFRENTAMIENTOS — CUARTOS DE FINAL
const enfrentamientos = [
  {
    local: "J.C",
    visitante: "LEONEL",
    logoLocal: "imagenes/toluca.png",
    logoVisitante: "imagenes/eliminado.png"
  },
  {
    local: "ANGEL",
    visitante: "KING",
    logoLocal: "imagenes/tigres.png",
    logoVisitante: "imagenes/eliminado.png"
  },
  {
    local: "CHIT",
    visitante: "GAF",
    logoLocal: "imagenes/cruz-azul.png",
    logoVisitante: "imagenes/eliminado.png"
  },
  {
    local: "GÜERA",
    visitante: "FALIA",
    logoLocal: "imagenes/eliminado.png",
    logoVisitante: "imagenes/monterrey.png"
  }
];

// ⚽ LISTA DE SEMIFINALES — MISMA ESTRUCTURA QUE CUARTOS
const semifinales = [
  {
    local: "CHIT",
    visitante: "ANGEL",
    logoLocal: "imagenes/eliminado.png",
    logoVisitante: "imagenes/tigres.png"
  },
  {
    local: "FALIA",
    visitante: "J.C",
    logoLocal: "imagenes/eliminado.png",
    logoVisitante: "imagenes/toluca.png"
  }
];

// 🏆 PARTIDO FINAL — TOLUCA VS TIGRES
const finalPartido = [
  {
    local: "J.C",
    visitante: "ANGEL",
    logoLocal: "imagenes/toluca.png",
    logoVisitante: "imagenes/eliminado.png"
  }
];

document.addEventListener("DOMContentLoaded", () => {

  // =============================
  //  TABLA CUARTOS DE FINAL
  // =============================
  const tablaCuartos = document
    .getElementById("tablaEnfrentamientos")
    .querySelector("tbody");

  tablaCuartos.innerHTML = "";

  enfrentamientos.forEach((partido) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td><img src="${partido.logoLocal}" alt="${partido.local}" class="logo-team"></td>
      <td class="team-name">${partido.local}</td>

      <td class="vs">VS</td>

      <td class="team-name">${partido.visitante}</td>
      <td><img src="${partido.logoVisitante}" alt="${partido.visitante}" class="logo-team"></td>
    `;

    tablaCuartos.appendChild(fila);
  });

  // =============================
  //  TABLA SEMIFINALES
  // =============================
  const tablaSemis = document
    .getElementById("tabla-semis")
    .querySelector("tbody");

  tablaSemis.innerHTML = "";

  semifinales.forEach((semi) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td><img src="${semi.logoLocal}" alt="${semi.local}" class="logo-team"></td>
      <td class="team-name">${semi.local}</td>

      <td class="vs">VS</td>

      <td class="team-name">${semi.visitante}</td>
      <td><img src="${semi.logoVisitante}" alt="${semi.visitante}" class="logo-team"></td>
    `;

    tablaSemis.appendChild(fila);
  });

  // =============================
  //  TABLA FINAL
  // =============================
  const tablaFinal = document
    .getElementById("tabla-final")
    .querySelector("tbody");

  tablaFinal.innerHTML = "";

  finalPartido.forEach((final) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td><img src="${final.logoLocal}" alt="${final.local}" class="logo-team"></td>
      <td class="team-name">${final.local}</td>

      <td class="vs">VS</td>

      <td class="team-name">${final.visitante}</td>
      <td><img src="${final.logoVisitante}" alt="${final.visitante}" class="logo-team"></td>
    `;

    tablaFinal.appendChild(fila);
  });

});
