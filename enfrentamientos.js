// ===============================================
//  🏆 ENFRENTAMIENTOS OFICIALES — OCTAVOS DE FINAL
//  Este archivo genera los partidos y carga logos
// ===============================================

// ⚽ LISTA DE ENFRENTAMIENTOS DEFINIDOS POR TI  
const enfrentamientos = [
  {
    local: "J.C",
    visitante: "LEONEL",
    logoLocal: "imagenes/toluca.png",
    logoVisitante: "imagenes/juarez.png"
  },
  {
    local: "ANGEL",
    visitante: "KING",
    logoLocal: "imagenes/tigres.png",
    logoVisitante: "imagenes/xolos.png"
  },
  {
    local: "CHIT",
    visitante: "GAF",
    logoLocal: "imagenes/Cruz-azul.png",
    logoVisitante: "imagenes/Chivas.png"
  },
  {
    local: "GÜERA",
    visitante: "FALIA",
    logoLocal: "imagenes/america.png",
    logoVisitante: "imagenes/monterrey.png"
  }
];

// =============================
//  GENERAR TABLA AUTOMÁTICAMENTE
// =============================

document.addEventListener("DOMContentLoaded", () => {
  const tabla = document
    .getElementById("tablaEnfrentamientos")
    .querySelector("tbody");

  tabla.innerHTML = ""; // limpiar por si acaso

  enfrentamientos.forEach((partido) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>
        <img src="${partido.logoLocal}" alt="${partido.local}" class="logo-team">
      </td>
      <td class="team-name">${partido.local}</td>

      <td class="vs">VS</td>

      <td class="team-name">${partido.visitante}</td>
      <td>
        <img src="${partido.logoVisitante}" alt="${partido.visitante}" class="logo-team">
      </td>
    `;

    tabla.appendChild(fila);
  });
});
