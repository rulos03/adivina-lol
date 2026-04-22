'use strict';

class GameState {
  constructor() {
    this._sala       = '';
    this._miId       = null;
    this._esMiTurno  = false;
    this._estado     = 'conectando'; // conectando | esperando_rival | en_juego | fin_juego
    this._tablero    = [];
    this._listeners  = [];
  }

  // --- Getters ---
  get sala()      { return this._sala; }
  get miId()      { return this._miId; }
  get esMiTurno() { return this._esMiTurno; }
  get estado()    { return this._estado; }
  get tablero()   { return this._tablero; }

  // --- Actualización interna ---
  _update(updates) {
    const prev = {
      sala:      this._sala,
      miId:      this._miId,
      esMiTurno: this._esMiTurno,
      estado:    this._estado,
      tablero:   this._tablero,
    };
    Object.keys(updates).forEach(k => { this['_' + k] = updates[k]; });
    this._listeners.forEach(fn => fn(prev, this));
  }

  // --- API pública ---
  setSala(sala)    { this._update({ sala }); }
  setMiId(id)      { this._update({ miId: id }); }
  setTablero(list) { this._update({ tablero: list }); }

  setTurno(turnoId) {
    this._update({ esMiTurno: turnoId === this._miId });
  }

  setEstado(nuevoEstado) {
    this._update({ estado: nuevoEstado });
  }

  reset() {
    this._update({ sala: '', esMiTurno: false, tablero: [], estado: 'conectando' });
  }

  subscribe(fn) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(l => l !== fn); };
  }
}

const gameState = new GameState();
