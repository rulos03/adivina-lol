'use strict';

const socketManager = (() => {
  const socket = io();

  function esMiTurno(turnoId) {
    return turnoId === socket.id;
  }

  function init() {
    socket.on('iniciar_tablero', (data) => {
      // Compatibilidad: si llega array directo, es el formato viejo
      const { personajes, franquicia } = typeof data === 'object' && !Array.isArray(data)
        ? data
        : { personajes: data, franquicia: 'lol' };

      // Bloquear y sincronizar el selector visual de franquicia
      bloquearSelectorFranquicia(franquicia);

      gameState.setTablero(personajes);
      UI.renderTablero(personajes);
    });

    socket.on('error_franquicia', ({ mensaje }) => {
      UI.mostrarAlerta(mensaje);
    });

    socket.on('inicio_partida', (data) => {
      gameState.setEstado('en_juego');
      gameState._update({ esMiTurno: esMiTurno(data.turno) });
      UI.tablero.classList.add('activo');
      UI.actualizarTurno(gameState.esMiTurno);
      UI.barraTurno.style.display = 'block';
      UI.mostrarAlerta('¡PARTIDA INICIADA!');
    });

    socket.on('cambio_turno', (data) => {
      gameState._update({ esMiTurno: esMiTurno(data.turno) });
      UI.actualizarTurno(gameState.esMiTurno);
    });

    socket.on('fin_juego', (data) => {
      gameState.setEstado('fin_juego');
      UI.mostrarFinJuego(data, socket.id);
    });

    socket.on('intento_fallido', (data) => {
      const esMiCulpa = data.culpable === socket.id;
      const msg = esMiCulpa
        ? 'SISTEMA: Fallaste tu ultimate. Turno perdido.'
        : `SISTEMA: El rival falló su ataque sobre ${data.personaje}. Es tu turno.`;
      UI.agregarMensaje(msg, 'msg-sistema');
      if (!esMiCulpa) UI.sacudirTablero();
    });

    socket.on('recibir_mensaje', (m) => {
      UI.agregarMensaje('Rival: ' + m);
    });
  }

  function emitEntrarSala(sala, franquicia) {
    socket.emit('entrar_sala', { sala, franquicia });
  }

  function emitJugadorListo(sala, personaje) {
    socket.emit('jugador_listo', { sala, personaje });
  }

  function emitPasarTurno(sala) {
    socket.emit('pasar_turno', sala);
  }

  function emitMensaje(sala, texto) {
    socket.emit('mensaje_chat', { sala, texto });
  }

  function emitIntentarAdivinar(nombre) {
    socket.emit('intentar_adivinar', {
      sala: gameState.sala,
      personajeAdivinado: nombre,
    });
  }

  return { init, emitEntrarSala, emitJugadorListo, emitPasarTurno, emitMensaje, emitIntentarAdivinar };
})();
