# 📋 Plan de Mejora Frontend - League of Guessing
**Versión:** 1.0  
**Objetivo:** Modernizar y mejorar la arquitectura, UX y performance del frontend  
**Audiencia:** Sonnet (implementación)

---

## 🎯 Resumen Ejecutivo

El proyecto tiene una **base sólida funcional** pero necesita:
1. **Refactorización arquitectónica** (separar archivos, modularizar)
2. **Mejoras UX/UI** (animaciones, feedback visual, accesibilidad)
3. **Optimizaciones de rendimiento** (modularización, design tokens)
4. **Mejora de accesibilidad** (ARIA, labels, keyboard nav)

**Beneficios esperados:**
- Código mantenible y escalable
- UX más pulida y accesible
- Mejor experiencia en móvil
- Rendimiento optimizado

---

## 📊 Auditoría Técnica Actual

### Estado Actual (Scores 0-4)

| Dimensión | Score | Estado | Prioridad |
|-----------|-------|--------|-----------|
| **Accesibilidad (a11y)** | 1/4 | Inputs sin labels, sin ARIA, sin focus indicators | P1 |
| **Performance** | 2/4 | Todo inline, sin lazy loading, sin modularización | P1 |
| **Estructura de Código** | 1/4 | Monolítico (HTML único), sin separación de concerns | P1 |
| **UX/Feedback Visual** | 2/4 | Funcional pero sin animaciones ni transiciones claras | P2 |
| **Design System** | 2/4 | Variables CSS básicas, tokens incompletos | P2 |
| **Responsive Design** | 3/4 | Mobile OK, pero touch targets pequeños, sin tablet | P2 |

**Puntuación Total: 11/24** → **ESTADO: Aceptable (requiere trabajo significativo)**

---

## 🔴 Problemas Críticos (P0-P1)

### [P1] Monolito HTML - Todo en un archivo
**Ubicación:** `index.html` (359 líneas)  
**Impacto:** Difícil de mantener, sin reutilización de componentes  
**Solución:** Refactorizar en estructura modular

```
index.html (solo estructura base)
├── styles/
│   ├── variables.css (design tokens)
│   ├── base.css (reset, tipografía)
│   └── components.css (componentes reutilizables)
├── js/
│   ├── socket-manager.js (gestión de Socket.io)
│   ├── ui.js (manipulación de DOM)
│   ├── game-logic.js (lógica del juego)
│   └── main.js (inicialización)
└── assets/
    └── icons/ (iconos SVG)
```

### [P1] Sin atributos de Accesibilidad
**Ubicación:** Inputs, botones en todo el HTML  
**Impacto:** Usuarios con screen readers no pueden navegar  
**Ejemplos a arreglar:**
- `<input id="inputSala" placeholder="CÓDIGO DE SALA" />` → Falta `<label>`
- `<button onclick="...">` → Sin `aria-label` descriptivo
- `.overlay-acciones` → Sin roles ARIA

**Solución:**
- Agregar `<label>` a todos los inputs
- Agregar `aria-label`, `aria-describedby` a botones
- Usar `<button>` en lugar de `<div>` clickeables
- Agregar focus indicators claros

### [P1] Imágenes sin lazy loading
**Ubicación:** `socket.on('iniciar_tablero')` - carga todas las 21 imágenes al iniciar  
**Impacto:** Ralentización inicial, especialmente en móvil  
**Solución:** Implementar lazy loading con IntersectionObserver

### [P1] Sin Control de Estado Centralizado
**Ubicación:** Lógica dispersa en event listeners de Socket.io  
**Impacto:** Difícil debuggear, sincronización frágil  
**Solución:** Crear `GameState` singleton para centralizar estado

---

## 🟡 Problemas Importantes (P2)

### [P2] Sin Animaciones/Transiciones
**Impacto:** UI se siente "dura", sin feedback visual suave  
**Ejemplos:**
- Cartas desaparecen sin transición
- Cambios de turno son instantáneos
- Modal de fin de juego aparece bruscamente

**Solución:**
- Agregar transiciones CSS (0.3s ease-in-out)
- Animaciones en carta.click (pulse, scale)
- Fade-in del modal

### [P2] Design Tokens Incompletos
**Ubicación:** `:root` en `<style>`  
**Problema:** Faltan tokens para espaciado, tipografía, breakpoints  
**Solución:** Expandir CSS variables

```css
:root {
  /* Colors */
  --hextech-gold: #c8aa6e;
  /* ... existentes ... */
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* Typography */
  --font-title: 'Cinzel', serif;
  --font-body: 'Roboto', sans-serif;
  --font-size-lg: 1.5rem;
  --font-size-base: 1rem;
  
  /* Breakpoints */
  --bp-mobile: 480px;
  --bp-tablet: 768px;
  --bp-desktop: 1200px;
}
```

### [P2] Focus Indicators No Claros
**Impacto:** Navegación por teclado confusa  
**Solución:** Agregar focus ring visible en todos los interactivos

```css
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid var(--hextech-magic-blue);
  outline-offset: 2px;
}
```

### [P2] Responsive Design Incompleto
**Problema:** Solo media query para móvil (<768px), falta tablet  
**Solución:** Agregar breakpoint para tablet (768px - 1200px)

```css
/* Tablet: 768px - 1200px */
@media (min-width: 768px) and (max-width: 1199px) {
  #tablero { grid-template-columns: repeat(5, 1fr); }
}

/* Desktop: 1200px+ */
@media (min-width: 1200px) {
  #tablero { grid-template-columns: repeat(7, 1fr); }
}
```

### [P2] Sin Indicadores de Loading
**Impacto:** Usuario no sabe si algo está pasando  
**Solución:** Agregar spinner/skeleton al conectarse, esperar rival

---

## 🟢 Lo que está Bien (Mantener)

✅ **Tema Hextech consistente** - Variables CSS bien implementadas  
✅ **Socket.io funcionando correctamente** - Comunicación en tiempo real sólida  
✅ **Diseño responsivo funcional** - Mobile experience trabajable  
✅ **Lógica de juego correcta** - Turnos, adivinar, chat funcionan  
✅ **Integración con Riot API** - Imágenes dinámicas de campeones  

---

## 📝 Plan de Implementación (Fases)

### **FASE 1: Refactorización Base (P1 - Bloqueante)**
Duración estimada: 3-4 horas

1. **Separar archivos**
   - Crear `styles/` con CSS modular
   - Crear `js/` con módulos JavaScript
   - Mantener estructura simple (sin bundler)

2. **Crear design tokens completos**
   - Expandir CSS variables
   - Documentar sistema de espaciado
   - Definir tokens para colores, tipografía, breakpoints

3. **Mejorar HTML semántico**
   - Agregar `<label>` a inputs
   - Usar `<button>` en lugar de `<div>` clickeables
   - Agregar atributos ARIA mínimos

4. **Centralizar state**
   - Crear `GameState` para sincronizar estado
   - Refactorizar event listeners

### **FASE 2: Accesibilidad (P1 - Bloqueante)**
Duración estimada: 2 horas

1. **ARIA + Keyboard Navigation**
   - `aria-label` en botones
   - `aria-describedby` en campos
   - Focus indicators claros
   - Tab order lógico

2. **Contraste y Readability**
   - Verificar contraste 4.5:1 (normal), 7:1 (ideal)
   - Asegurar textos legibles en todos los temas

### **FASE 3: Performance (P1 - Bloqueante)**
Duración estimada: 2 horas

1. **Lazy Loading de Imágenes**
   - Usar `IntersectionObserver`
   - Cargar imágenes solo cuando sean visibles

2. **Optimizar DOM**
   - Batch DOM updates
   - Usar DocumentFragment para múltiples inserciones

### **FASE 4: UX Enhancements (P2 - Mejoras)**
Duración estimada: 3-4 horas

1. **Animaciones y Transiciones**
   - Fade-in para cartas
   - Scale/pulse en hover
   - Transición de turno
   - Modal de fin de juego con slide-in

2. **Indicadores de Estado**
   - Loading spinner al conectarse
   - "Esperando rival..." más visible
   - Estados de error claros

3. **Feedback Visual**
   - Sonidos visuales más claros
   - Hover states mejorados
   - Estados disabled más evidentes

### **FASE 5: Polish (P3 - Pulido)**
Duración estimada: 2 horas

1. **Micro-interacciones**
   - Ripple effect en clicks
   - Tooltip en hover de cartas
   - Confirmación visual de descartes

2. **Mobile Refinement**
   - Touch feedback mejorado
   - Bottom sheet para options en móvil (opcional)

---

## 🔧 Tareas Específicas para Sonnet

### **Archivo 1: `styles/variables.css`**
- [ ] Definir tokens de color (actual + hover + disabled)
- [ ] Definir tokens de spacing (xs/sm/md/lg/xl)
- [ ] Definir tokens de tipografía (sizes, weights, families)
- [ ] Definir tokens de breakpoints
- [ ] Definir tokens de transiciones y timing

### **Archivo 2: `styles/base.css`**
- [ ] Reset CSS
- [ ] Tipografía base
- [ ] Focus indicators globales
- [ ] Clases utilitarias (`.oculto`, `.activo`, `.mi-turno`, etc.)

### **Archivo 3: `styles/components.css`**
- [ ] Botones (variantes: primary, secondary, danger)
- [ ] Inputs y selects
- [ ] Cartas/grid
- [ ] Paneles hextech
- [ ] Chat
- [ ] Modal

### **Archivo 4: `js/socket-manager.js`**
- [ ] Abstracción de Socket.io
- [ ] Listeners centralizados
- [ ] Manejo de errores

### **Archivo 5: `js/game-state.js`**
- [ ] Singleton de estado
- [ ] Métodos para actualizar estado
- [ ] Validación de estados

### **Archivo 6: `js/ui.js`**
- [ ] Funciones de manipulación de DOM
- [ ] Render de tablero
- [ ] Actualizaciones de UI
- [ ] Animaciones

### **Archivo 7: `js/main.js`**
- [ ] Inicialización
- [ ] Eventos del usuario
- [ ] Orquestación

### **Actualizar: `index.html`**
- [ ] Agregar semántica HTML
- [ ] Agregar labels y ARIA
- [ ] Referencias a archivos CSS/JS modular
- [ ] Meta tags para accesibilidad

---

## 📐 Estructura Final Esperada

```
adivina-lol/
├── index.html (estructura, min 100 líneas menos)
├── styles/
│   ├── variables.css (tokens)
│   ├── base.css (reset + global)
│   ├── components.css (componentes)
│   └── animations.css (transiciones)
├── js/
│   ├── socket-manager.js
│   ├── game-state.js
│   ├── ui.js
│   ├── lazy-load.js
│   └── main.js
├── server.js
├── package.json
└── README.md
```

---

## ✅ Criterios de Éxito

- [ ] Código separado en archivos modulares
- [ ] Puntuación de accesibilidad ≥ 3/4
- [ ] Puntuación de performance ≥ 3/4
- [ ] Imágenes cargadas con lazy loading
- [ ] Animaciones suaves sin layout thrashing
- [ ] Focus indicators visibles en todos los botones
- [ ] Funcionalidad idéntica al original
- [ ] Responsive en mobile/tablet/desktop

---

## 🎨 Cambios Visuales Esperados

**Antes:**
- UI "plana", sin transiciones
- Estados poco claros
- Acceso a teclado limitado

**Después:**
- Transiciones suaves (0.3s)
- Estados claramente diferenciados
- Totalmente navegable por teclado
- Mejor feedback visual en cada interacción
- Consistent design system con tokens

---

## 📚 Referencias para Implementación

**Técnicas a usar:**
- CSS Grid + Flexbox (ya usado, mantener)
- CSS Custom Properties (expandir)
- IntersectionObserver (lazy loading)
- Event Delegation (optimización de listeners)
- Object.freeze para inmutabilidad de state
- DocumentFragment para batch DOM updates

**No usar:**
- Framework (mantener vanilla JS)
- Build step (mantener simple)
- Preprocessor (mantener CSS vanilla)

---

## 🚀 Próximos Pasos

1. **Sonnet implementa Plan (Fases 1-5)**
2. **Testing manual:**
   - Probar en Chrome, Firefox, Safari
   - Probar en iOS Safari, Chrome Android
   - Usar screen reader (NVDA/JAWS en Windows)
3. **Merge a main**
4. **Deploy a Render**

---

**Elaborado:** 21 de Abril, 2026  
**Status:** Listo para implementación  
**Responsable Implementación:** Sonnet 4.6
