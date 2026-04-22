'use strict';

// --- Conectar / Unirse a sala ---
function unirse() {
  const sala = document.getElementById('inputSala').value.trim();
  if (!sala) {
    UI.mostrarAlerta('Ingresa el código de sala');
    document.getElementById('inputSala').focus();
    return;
  }
  gameState.setSala(sala);
  socketManager.emitEntrarSala(sala);
  UI.mostrarMenuPersonaje();
}

// --- Confirmar personaje secreto ---
function confirmarPersonaje() {
  const pj = UI.selectPersonaje.value;
  socketManager.emitJugadorListo(gameState.sala, pj);
  UI.bloquearSeleccion();
  UI.marcarSecreta(pj);
  UI.mostrarBarra('ESPERANDO RIVAL...');
}

// --- Pasar turno ---
function pasarTurno() {
  if (!gameState.esMiTurno) return;
  socketManager.emitPasarTurno(gameState.sala);
}

// --- Chat ---
function enviar() {
  const inp = document.getElementById('inputMensaje');
  const txt = inp.value.trim();
  if (!txt) return;
  socketManager.emitMensaje(gameState.sala, txt);
  UI.agregarMensaje('Yo: ' + txt);
  inp.value = '';
}

// --- Event listeners globales ---
document.addEventListener('DOMContentLoaded', () => {
  socketManager.init();

  // Tecla Enter en sala
  document.getElementById('inputSala').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') unirse();
  });

  // Tecla Enter en chat
  document.getElementById('inputMensaje').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enviar();
  });
});
