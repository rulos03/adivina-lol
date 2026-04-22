# 💻 Ejemplos de Implementación - Frontend Refactor

Esta guía muestra **antes/después** para cada mejora, para que Sonnet tenga referencias claras.

---

## 1️⃣ Design Tokens (variables.css)

### ANTES (Inline en HTML)
```css
:root {
    --hextech-gold: #c8aa6e;
    --hextech-dark-blue: #010a13;
    --hextech-magic-blue: #0acbe6;
    --hextech-red: #ff4444;
    --overlay-bg: rgba(1, 10, 19, 0.85);
}
```

### DESPUÉS (Completo)
```css
/* styles/variables.css */

:root {
  /* ===== COLORS ===== */
  --hextech-gold: #c8aa6e;
  --hextech-dark-blue: #010a13;
  --hextech-magic-blue: #0acbe6;
  --hextech-red: #ff4444;
  --overlay-bg: rgba(1, 10, 19, 0.85);
  
  --text-primary: #f0f0f0;
  --text-secondary: #aaa;
  --text-muted: #777;
  
  --bg-primary: #010a13;
  --bg-secondary: rgba(0, 0, 0, 0.5);
  --bg-tertiary: rgba(0, 0, 0, 0.8);
  
  --border-primary: #444;
  --border-secondary: 1px solid var(--border-primary);

  /* ===== SPACING ===== */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* ===== TYPOGRAPHY ===== */
  --font-title: 'Cinzel', serif;
  --font-body: 'Roboto', sans-serif;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.5rem;
  --font-size-xl: 2rem;
  --font-size-2xl: 4rem;
  
  --font-weight-normal: 400;
  --font-weight-bold: 700;
  --font-weight-black: 900;

  /* ===== TRANSITIONS ===== */
  --transition-fast: 0.15s ease-in-out;
  --transition-normal: 0.3s ease-in-out;
  --transition-slow: 0.5s ease-in-out;

  /* ===== BREAKPOINTS (for reference) ===== */
  --bp-mobile: 480px;
  --bp-tablet: 768px;
  --bp-desktop: 1200px;

  /* ===== SHADOWS ===== */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.7);

  /* ===== FOCUS ===== */
  --focus-outline: 2px solid var(--hextech-magic-blue);
  --focus-outline-offset: 2px;
}
```

---

## 2️⃣ HTML Semántico + Accesibilidad

### ANTES (Sin labels, sin ARIA)
```html
<div id="paso-conexion">
    <input id="inputSala" placeholder="CÓDIGO DE SALA" />
    <button onclick="unirse()">CONECTAR</button>
</div>

<div id="menu-personaje">
    <label>TU CAMPEÓN:</label>
    <select id="selectPersonaje"></select>
    <button id="btnConfirmar" onclick="confirmarPersonaje()">FIJAR</button>
</div>
```

### DESPUÉS (Semántico + Accesible)
```html
<div id="paso-conexion" role="region" aria-label="Conexión a sala">
    <div class="form-group">
        <label for="inputSala">Código de Sala</label>
        <input 
            id="inputSala" 
            type="text"
            placeholder="Ej: ABC123"
            aria-describedby="sala-hint"
            maxlength="10"
        />
        <small id="sala-hint">Ingresa el código de 3-6 caracteres para unirte</small>
    </div>
    
    <button 
        id="btnUnirse" 
        onclick="unirse()"
        aria-label="Conectar a la sala"
    >
        CONECTAR
    </button>
</div>

<div id="menu-personaje" role="region" aria-label="Selección de campeón">
    <div class="form-group">
        <label for="selectPersonaje">Tu Campeón</label>
        <select 
            id="selectPersonaje"
            aria-label="Selecciona tu campeón secreto"
            aria-describedby="select-hint"
        ></select>
        <small id="select-hint">Este será tu campeón secreto. El rival tendrá que adivinarlo.</small>
    </div>
    
    <button 
        id="btnConfirmar" 
        onclick="confirmarPersonaje()"
        aria-label="Confirmar campeón seleccionado"
    >
        FIJAR
    </button>
</div>
```

---

## 3️⃣ Focus Indicators

### ANTES (Sin focus visible claro)
```css
button {
    cursor: pointer;
    padding: 12px 25px;
    background: #1e2328;
    color: var(--hextech-gold);
    border: 2px solid var(--hextech-gold);
    /* sin focus indicator */
}
```

### DESPUÉS (Focus accesible)
```css
/* styles/base.css */

button,
input,
select,
textarea {
    /* Reset focus por defecto */
    outline: none;
}

button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
    outline: var(--focus-outline);
    outline-offset: var(--focus-outline-offset);
}

/* Keyboard navigation visible */
*:focus-visible {
    box-shadow: inset 0 0 0 3px rgba(10, 203, 230, 0.3);
}
```

---

## 4️⃣ Lazy Loading de Imágenes

### ANTES (Carga todas al iniciar)
```javascript
socket.on('iniciar_tablero', (lista) => {
    const tablero = document.getElementById('tablero');
    tablero.innerHTML = "";
    
    lista.forEach(nombre => {
        const carta = document.createElement('div');
        carta.className = 'carta';
        carta.id = 'carta-'+nombre;

        const img = document.createElement('img');
        img.src = `${RIOT_IMG_URL}${nombre}.png`;  // ← Se carga inmediatamente
        
        tablero.appendChild(carta);
    });
});
```

### DESPUÉS (Lazy Loading)
```javascript
// js/lazy-load.js
class LazyImageLoader {
    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        this.observer.unobserve(img);
                    }
                });
            },
            { rootMargin: '50px' }
        );
    }

    observe(img) {
        this.observer.observe(img);
    }
}

const lazyLoader = new LazyImageLoader();

socket.on('iniciar_tablero', (lista) => {
    const tablero = document.getElementById('tablero');
    tablero.innerHTML = "";
    
    lista.forEach(nombre => {
        const carta = document.createElement('div');
        carta.className = 'carta';

        const img = document.createElement('img');
        img.dataset.src = `${RIOT_IMG_URL}${nombre}.png`; // ← No se carga hasta que sea visible
        img.alt = nombre;
        img.loading = 'lazy';
        
        lazyLoader.observe(img);
        
        carta.appendChild(img);
        tablero.appendChild(carta);
    });
});
```

---

## 5️⃣ Centralización de State

### ANTES (State disperso)
```javascript
let salaActual = "";
let esMiTurno = false;
const RIOT_IMG_URL = "https://...";

socket.on('cambio_turno', (data) => {
    // Actualizar estado aquí
    esMiTurno = (data.turno === socket.id);
    actualizarInterfazTurno(data.turno);
});

socket.on('fin_juego', (data) => {
    // Lógica de fin de juego
});

// ... 20+ event listeners dispersos
```

### DESPUÉS (GameState centralizado)
```javascript
// js/game-state.js
class GameState {
    constructor() {
        this.sala = "";
        this.miId = null;
        this.miPersonaje = null;
        this.personaljeRival = null;
        this.esMiTurno = false;
        this.tablero = [];
        this.estado = 'conectando'; // conectando | esperando_rival | en_juego | fin_juego
        this.listeners = [];
    }

    actualizarState(updates) {
        const stateAnterior = { ...this };
        Object.assign(this, updates);
        
        // Notificar listeners que estado cambió
        this.listeners.forEach(fn => fn(stateAnterior, this));
    }

    subscribe(fn) {
        this.listeners.push(fn);
        return () => {
            this.listeners = this.listeners.filter(l => l !== fn);
        };
    }

    setTurno(turnoId) {
        this.actualizarState({
            esMiTurno: turnoId === this.miId,
            turnoActual: turnoId
        });
    }

    setEstado(nuevoEstado) {
        this.actualizarState({ estado: nuevoEstado });
    }

    reset() {
        this.sala = "";
        this.esMiTurno = false;
        this.tablero = [];
        this.estado = 'conectando';
    }
}

const gameState = Object.freeze(new GameState());

// js/main.js
gameState.subscribe((prevState, newState) => {
    if (prevState.esMiTurno !== newState.esMiTurno) {
        UI.actualizarInterfazTurno(newState.esMiTurno);
    }
    if (prevState.estado !== newState.estado) {
        UI.actualizarEstado(newState.estado);
    }
});

socket.on('cambio_turno', (data) => {
    gameState.setTurno(data.turno);
});
```

---

## 6️⃣ Animaciones y Transiciones

### ANTES (Sin transiciones)
```css
.carta {
    position: relative;
    aspect-ratio: 1 / 1;
    border: 2px solid #444;
    overflow: hidden;
}

.descartado {
    filter: grayscale(100%) brightness(20%);
}
```

### DESPUÉS (Con animaciones suaves)
```css
/* styles/animations.css */

.carta {
    position: relative;
    aspect-ratio: 1 / 1;
    border: 2px solid #444;
    overflow: hidden;
    
    /* Animación de entrada */
    animation: fadeInScale 0.4s ease-out;
    
    /* Transición para cambios de estado */
    transition: transform var(--transition-normal),
                filter var(--transition-normal),
                box-shadow var(--transition-normal);
}

.carta:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(10, 203, 230, 0.4);
}

.carta.descartado {
    filter: grayscale(100%) brightness(20%);
    opacity: 0.6;
    pointer-events: none;
}

.carta.mi-secreto {
    border: 3px solid var(--hextech-magic-blue);
    animation: glow 2s ease-in-out infinite;
}

@keyframes fadeInScale {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes glow {
    0%, 100% {
        box-shadow: 0 0 15px var(--hextech-magic-blue);
    }
    50% {
        box-shadow: 0 0 30px var(--hextech-magic-blue);
    }
}

/* Transición de turno */
#barra-turno {
    transition: all var(--transition-normal);
}

#barra-turno.mi-turno {
    animation: pulse-border 0.6s ease-in-out;
}

@keyframes pulse-border {
    0%, 100% {
        box-shadow: 0 0 20px rgba(10, 203, 230, 0.3);
    }
    50% {
        box-shadow: 0 0 30px rgba(10, 203, 230, 0.6);
    }
}

/* Modal de fin de juego */
.modal-contenido {
    animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-50px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
```

**JavaScript para triggear animaciones:**
```javascript
// js/ui.js
function descartar(nombre) {
    const carta = document.getElementById('carta-' + nombre);
    carta.classList.add('descartado');
    // CSS animation manejada por clase
}

function mostrarFinJuego(ganador) {
    const modal = document.getElementById('overlay-fin-juego');
    modal.classList.remove('oculto');
    // Animation triggered por CSS class
}
```

---

## 7️⃣ Modularización de JavaScript

### ANTES (Todo mezclado en `<script>` del HTML)
```javascript
// 359 líneas en un único bloque <script>
const socket = io();
let salaActual = "";
let esMiTurno = false;
const RIOT_IMG_URL = "...";

function unirse() { ... }
function confirmarPersonaje() { ... }
function pasarTurno() { ... }
// ... 20+ funciones más

socket.on('iniciar_tablero', (lista) => { ... });
socket.on('cambio_turno', (data) => { ... });
// ... 10+ listeners
```

### DESPUÉS (Modular)
```html
<!-- index.html -->
<script src="/socket.io/socket.io.js"></script>
<script src="js/game-state.js"></script>
<script src="js/socket-manager.js"></script>
<script src="js/ui.js"></script>
<script src="js/lazy-load.js"></script>
<script src="js/main.js"></script>
```

**js/socket-manager.js**
```javascript
class SocketManager {
    constructor(gameState, ui) {
        this.socket = io();
        this.gameState = gameState;
        this.ui = ui;
        this.setupListeners();
    }

    setupListeners() {
        this.socket.on('iniciar_tablero', (lista) => this.onInitTablero(lista));
        this.socket.on('cambio_turno', (data) => this.onCambioTurno(data));
        this.socket.on('fin_juego', (data) => this.onFinJuego(data));
    }

    onInitTablero(lista) {
        this.gameState.actualizarState({ tablero: lista });
        this.ui.renderTablero(lista);
    }

    onCambioTurno(data) {
        this.gameState.setTurno(data.turno);
    }

    onFinJuego(data) {
        this.gameState.setEstado('fin_juego');
        this.ui.mostrarFinJuego(data);
    }

    emitEntrarSala(sala) {
        this.socket.emit('entrar_sala', sala);
    }
}
```

**js/ui.js**
```javascript
class UI {
    constructor() {
        this.tablero = document.getElementById('tablero');
        this.inputSala = document.getElementById('inputSala');
        this.selectPersonaje = document.getElementById('selectPersonaje');
    }

    renderTablero(lista) {
        this.tablero.innerHTML = "";
        lista.forEach(nombre => {
            const carta = this.crearCarta(nombre);
            this.tablero.appendChild(carta);
        });
    }

    crearCarta(nombre) {
        const carta = document.createElement('div');
        carta.className = 'carta';
        carta.id = 'carta-' + nombre;
        
        const img = document.createElement('img');
        img.dataset.src = `${RIOT_IMG_URL}${nombre}.png`;
        img.alt = nombre;
        
        carta.appendChild(img);
        return carta;
    }

    mostrarFinJuego(data) {
        const modal = document.getElementById('overlay-fin-juego');
        const titulo = document.getElementById('titulo-final');
        
        if (data.ganador === SocketManager.socket.id) {
            titulo.innerText = "VICTORIA";
            titulo.className = "titulo-fin victoria";
        } else {
            titulo.innerText = "DERROTA";
            titulo.className = "titulo-fin derrota";
        }
        
        modal.classList.remove('oculto');
    }

    actualizarInterfazTurno(esMiTurno) {
        const barra = document.getElementById('barra-turno');
        if (esMiTurno) {
            barra.innerText = "¡ES TU TURNO!";
            barra.className = "mi-turno";
        } else {
            barra.innerText = "TURNO DEL RIVAL";
            barra.className = "turno-rival";
        }
    }
}
```

**js/main.js**
```javascript
// Inicialización
const ui = new UI();
const socketManager = new SocketManager(gameState, ui);

// Event listeners de usuario
document.getElementById('btnUnirse').addEventListener('click', () => {
    const sala = ui.inputSala.value;
    if (!sala) {
        alert('Ingresa código de sala');
        return;
    }
    gameState.actualizarState({ sala });
    socketManager.emitEntrarSala(sala);
});

// Subscripciones a cambios de estado
gameState.subscribe((prevState, newState) => {
    if (prevState.esMiTurno !== newState.esMiTurno) {
        ui.actualizarInterfazTurno(newState.esMiTurno);
    }
});
```

---

## 8️⃣ Responsive Design Mejorado

### ANTES (Solo móvil)
```css
@media (max-width: 768px) {
    #tablero { grid-template-columns: repeat(3, 1fr); }
}
```

### DESPUÉS (Mobile-first + Tablet + Desktop)
```css
/* Mobile: default (< 480px) */
#tablero {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

/* Tablet: 480px - 1199px */
@media (min-width: 480px) {
    #tablero {
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
    }
}

/* Desktop: 1200px + */
@media (min-width: 1200px) {
    #tablero {
        grid-template-columns: repeat(7, 1fr);
        gap: 10px;
        max-width: 1000px;
    }
}
```

---

## 9️⃣ Spinner/Loading State

### ANTES (Sin indicador de loading)
```javascript
function confirmarPersonaje() {
    const pj = document.getElementById('selectPersonaje').value;
    socket.emit('jugador_listo', { sala: salaActual, personaje: pj });
    // Usuario no sabe si algo está pasando...
}
```

### DESPUÉS (Con loading visual)
```css
/* styles/components.css */
.spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(10, 203, 230, 0.3);
    border-top: 3px solid var(--hextech-magic-blue);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.loading-text {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
}
```

```javascript
class UI {
    mostrarLoading(mensaje = "Conectando...") {
        const div = document.createElement('div');
        div.className = 'loading-text';
        div.innerHTML = `
            <div class="spinner"></div>
            <span>${mensaje}</span>
        `;
        return div;
    }

    limpiarLoading() {
        const loaders = document.querySelectorAll('.loading-text');
        loaders.forEach(el => el.remove());
    }
}

// Uso
function confirmarPersonaje() {
    const pj = document.getElementById('selectPersonaje').value;
    ui.mostrarLoading("Esperando rival...");
    socket.emit('jugador_listo', { sala: gameState.sala, personaje: pj });
}

socket.on('inicio_partida', () => {
    ui.limpiarLoading();
    // Game starts
});
```

---

## 🔟 Batch DOM Updates

### ANTES (Muchos reflows)
```javascript
socket.on('iniciar_tablero', (lista) => {
    lista.forEach(nombre => {
        const carta = createCarta(nombre);
        tablero.appendChild(carta);  // ← Reflow cada vez
    });
});
```

### DESPUÉS (Un solo reflow)
```javascript
socket.on('iniciar_tablero', (lista) => {
    const fragment = document.createDocumentFragment();
    
    lista.forEach(nombre => {
        const carta = createCarta(nombre);
        fragment.appendChild(carta);  // ← No causa reflow
    });
    
    tablero.appendChild(fragment);  // ← Un solo reflow aquí
});
```

---

## 📋 Checklist de Implementación

Use esto para verificar que todo está hecho:

- [ ] `styles/variables.css` creado con todos los tokens
- [ ] `styles/base.css` con reset y focus indicators
- [ ] `styles/components.css` con componentes reutilizables
- [ ] `styles/animations.css` con transiciones suaves
- [ ] `js/game-state.js` - State centralizado
- [ ] `js/socket-manager.js` - Listeners organizados
- [ ] `js/ui.js` - DOM manipulation
- [ ] `js/lazy-load.js` - Lazy loading de imágenes
- [ ] `js/main.js` - Inicialización
- [ ] `index.html` actualizado con semántica y ARIA
- [ ] Focus indicators visibles en todos los inputs/botones
- [ ] Lazy loading funcionando (verificar Network tab)
- [ ] Animaciones suaves sin jank
- [ ] Responsive en 3 breakpoints (mobile/tablet/desktop)
- [ ] Tests manuales en Chrome, Firefox, Safari
- [ ] Tests manuales en móvil
- [ ] Screen reader test (NVDA/JAWS)
- [ ] Funcionalidad idéntica al original

---

**Nota para Sonnet:** Estos ejemplos son referencias de patrones. La implementación específica puede variar según necesidad, pero la estructura general debería mantener la filosofía de cada sección.
