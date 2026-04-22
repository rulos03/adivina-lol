'use strict';

const UI = {
  // --- Selectors (cached) ---
  get barraTurno()      { return document.getElementById('barra-turno'); },
  get tablero()         { return document.getElementById('tablero'); },
  get selectPersonaje() { return document.getElementById('selectPersonaje'); },
  get btnPasarTurno()   { return document.getElementById('btnPasarTurno'); },
  get mensajes()        { return document.getElementById('mensajes'); },
  get pasoConexion()    { return document.getElementById('paso-conexion'); },
  get menuPersonaje()   { return document.getElementById('menu-personaje'); },
  get btnConfirmar()    { return document.getElementById('btnConfirmar'); },
  get overlayFin()      { return document.getElementById('overlay-fin-juego'); },

  // -------------------------
  // TABLERO
  // -------------------------
  renderTablero(lista) {
    const tablero = this.tablero;
    const select  = this.selectPersonaje;

    // Batch inserts con DocumentFragment
    const fragTablero = document.createDocumentFragment();
    const fragSelect  = document.createDocumentFragment();

    lista.forEach(({ nombre, imagen }, i) => {
      // Option del select
      const opt    = document.createElement('option');
      opt.value    = nombre;
      opt.textContent = nombre;
      fragSelect.appendChild(opt);

      // Carta
      const carta = this._crearCarta(nombre, imagen, i);
      fragTablero.appendChild(carta);
    });

    select.innerHTML  = '';
    tablero.innerHTML = '';
    select.appendChild(fragSelect);
    tablero.appendChild(fragTablero);
  },

  _crearCarta(nombre, imagen, index) {
    const carta  = document.createElement('div');
    carta.className = 'carta';
    carta.id        = 'carta-' + nombre;

    // Retraso escalonado para la animación de entrada
    carta.style.animationDelay = `${index * 30}ms`;

    // Imagen con lazy loading
    const img       = document.createElement('img');
    img.dataset.src = imagen;
    img.alt         = nombre;
    lazyLoader.observe(img);

    // Nombre en la base
    const nombre_el = document.createElement('div');
    nombre_el.className   = 'carta-nombre';
    nombre_el.textContent = nombre;
    nombre_el.setAttribute('aria-hidden', 'true');

    // Overlay de acciones
    const overlay = this._crearOverlayAcciones(nombre, carta);

    // Fix mobile: tap activa/desactiva la clase .activa para mostrar overlay
    carta.addEventListener('click', (e) => {
      if (e.target.closest('.btn-accion')) return;
      if (!UI.tablero.classList.contains('activo')) return;
      // Solo activar en touch (en desktop el hover ya lo maneja CSS)
      if (!window.matchMedia('(hover: none)').matches) return;
      const estaActiva = carta.classList.contains('activa');
      document.querySelectorAll('.carta.activa').forEach(c => c.classList.remove('activa'));
      if (!estaActiva) carta.classList.add('activa');
    });

    carta.append(img, nombre_el, overlay);
    return carta;
  },

  _crearOverlayAcciones(nombre, carta) {
    const overlay = document.createElement('div');
    overlay.className   = 'overlay-acciones';
    overlay.setAttribute('role', 'group');
    overlay.setAttribute('aria-label', `Acciones para ${nombre}`);

    const btnDesc = document.createElement('button');
    btnDesc.className   = 'btn-accion btn-descartar';
    btnDesc.textContent = 'Descartar';
    btnDesc.setAttribute('aria-label', `Descartar a ${nombre}`);
    btnDesc.addEventListener('click', (e) => {
      e.stopPropagation();
      if (UI.tablero.classList.contains('activo')) {
        carta.classList.toggle('descartado');
        const descartado = carta.classList.contains('descartado');
        btnDesc.setAttribute('aria-pressed', String(descartado));
        btnDesc.textContent = descartado ? 'Restaurar' : 'Descartar';
      }
    });

    const btnUlt = document.createElement('button');
    btnUlt.className   = 'btn-accion btn-ultear';
    btnUlt.textContent = 'ULTEAR !';
    btnUlt.setAttribute('aria-label', `Usar ultimate sobre ${nombre}`);
    btnUlt.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!gameState.esMiTurno) {
        UI.mostrarAlerta('¡No es tu turno! Espera a que el rival termine.');
        return;
      }
      UI.confirmarAccion(
        `¿Atacar a ${nombre}? Si fallas, pierdes el turno.`,
        () => socketManager.emitIntentarAdivinar(nombre)
      );
    });

    overlay.append(btnDesc, btnUlt);
    return overlay;
  },

  marcarSecreta(nombre) {
    const carta = document.getElementById('carta-' + nombre);
    if (carta) carta.classList.add('mi-secreto');
  },

  // -------------------------
  // TURNOS
  // -------------------------
  actualizarTurno(esMiTurno) {
    const barra  = this.barraTurno;
    const btnPas = this.btnPasarTurno;

    if (esMiTurno) {
      barra.textContent = '¡ES TU TURNO!';
      barra.className   = 'mi-turno';
      btnPas.disabled   = false;
      btnPas.classList.add('activo');
      btnPas.setAttribute('aria-disabled', 'false');
    } else {
      barra.textContent = 'TURNO DEL RIVAL';
      barra.className   = 'turno-rival';
      btnPas.disabled   = true;
      btnPas.classList.remove('activo');
      btnPas.setAttribute('aria-disabled', 'true');
    }
  },

  mostrarBarra(texto) {
    const barra = this.barraTurno;
    barra.style.display = 'block';
    barra.textContent   = texto;
  },

  // -------------------------
  // CHAT
  // -------------------------
  agregarMensaje(texto, cls) {
    const d = document.createElement('div');
    d.textContent = texto;
    if (cls) d.className = cls;
    const msgs = this.mensajes;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  },

  // -------------------------
  // FIN DE JUEGO
  // -------------------------
  mostrarFinJuego(data, miSocketId) {
    const modal  = this.overlayFin;
    const titulo = document.getElementById('titulo-final');
    const txt    = document.getElementById('mensaje-final');

    modal.classList.remove('oculto');

    if (data.ganador === miSocketId) {
      titulo.textContent           = 'VICTORIA';
      titulo.dataset.text          = 'VICTORIA';
      titulo.className             = 'titulo-fin victoria';
      txt.innerHTML                = `Campeón enemigo eliminado: <strong>${data.personaje}</strong>`;
    } else {
      titulo.textContent           = 'DERROTA';
      titulo.dataset.text          = 'DERROTA';
      titulo.className             = 'titulo-fin derrota';
      txt.textContent              = 'Te han descubierto.';
    }
  },

  // -------------------------
  // LOADING
  // -------------------------
  mostrarLoading(contenedor, texto = 'Cargando...') {
    const div = document.createElement('div');
    div.className      = 'loading-text';
    div.id             = 'loading-indicator';
    div.setAttribute('aria-live', 'polite');
    div.innerHTML      = `<div class="spinner" aria-hidden="true"></div><span>${texto}</span>`;
    contenedor.appendChild(div);
  },

  quitarLoading() {
    document.querySelectorAll('#loading-indicator').forEach(el => el.remove());
  },

  // -------------------------
  // FLUJO DE PANTALLAS
  // -------------------------
  mostrarMenuPersonaje() {
    this.pasoConexion.style.display = 'none';
    this.menuPersonaje.style.display = 'flex';
    this.mostrarBarra('ESPERANDO RIVAL...');
    this.mostrarLoading(
      document.getElementById('zona-seleccion'),
      'Esperando al rival...'
    );
  },

  bloquearSeleccion() {
    this.btnConfirmar.disabled         = true;
    this.selectPersonaje.disabled      = true;
    this.quitarLoading();
  },

  // -------------------------
  // UTILIDAD
  // -------------------------
  confirmarAccion(texto, onConfirm) {
    const prev = document.getElementById('dialogo-confirm');
    if (prev) prev.remove();

    const dialogo = document.createElement('div');
    dialogo.id = 'dialogo-confirm';
    dialogo.setAttribute('role', 'alertdialog');
    dialogo.setAttribute('aria-modal', 'true');
    dialogo.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      z-index:9998;background:var(--color-surface);
      border:1px solid var(--color-crimson);padding:24px 32px;text-align:center;
      min-width:280px;max-width:90vw;
      clip-path:polygon(0 8px,8px 0,calc(100% - 8px) 0,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0 calc(100% - 8px));
    `;

    const msg = document.createElement('p');
    msg.style.cssText = 'font-family:var(--font-body);font-size:var(--text-base);color:var(--color-text-primary);margin:0 0 20px;line-height:1.4';
    msg.textContent = texto;

    const fila = document.createElement('div');
    fila.style.cssText = 'display:flex;gap:12px;justify-content:center;';

    const btnSi = document.createElement('button');
    btnSi.textContent = 'ATACAR';
    btnSi.style.cssText = 'background:var(--color-crimson);border-color:var(--color-crimson);color:#fff;';
    btnSi.addEventListener('click', () => { dialogo.remove(); onConfirm(); });

    const btnNo = document.createElement('button');
    btnNo.textContent = 'CANCELAR';
    btnNo.addEventListener('click', () => dialogo.remove());

    fila.append(btnNo, btnSi);
    dialogo.append(msg, fila);
    document.body.appendChild(dialogo);
    btnSi.focus();
  },

  mostrarAlerta(texto) {
    // Alerta no bloqueante accesible
    const alerta = document.createElement('div');
    alerta.setAttribute('role', 'alert');
    alerta.setAttribute('aria-live', 'assertive');
    alerta.className   = 'loading-text';
    alerta.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;background:rgba(1,10,19,0.95);border:1px solid var(--hextech-red);padding:10px 20px;';
    alerta.textContent = texto;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3000);
  },

  sacudirTablero() {
    const t = this.tablero;
    t.classList.add('shake');
    t.addEventListener('animationend', () => t.classList.remove('shake'), { once: true });
  },
};
