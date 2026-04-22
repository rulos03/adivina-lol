# 🚀 BRIEFING PARA SONNET - Refactor Frontend

**Estado:** Listo para implementación  
**Urgencia:** Media  
**Complejidad:** Media-Alta  
**Duración estimada:** 8-10 horas (2 días de trabajo)

---

## 🎯 Tu Misión

Refactorizar el frontend de **League of Guessing** (juego multijugador de Adivina Quién con LoL) para:
1. Mejorar accesibilidad y UX
2. Modernizar la arquitectura (modular vs monolito)
3. Optimizar performance
4. Agregar animaciones y feedback visual

**Resultado esperado:** Código profesional, mantenible, y con UX pulida.

---

## 📍 Contexto Rápido

- **Tipo:** Juego multijugador en tiempo real (Socket.io)
- **Stack actual:** Node.js/Express backend, HTML/CSS/JS vanilla frontend
- **Problema principal:** Todo está en un único archivo HTML (359 líneas)
- **Objetivo:** Separar en módulos, mejorar a11y, agregar animaciones

---

## 🔴 Prioridades (En orden)

### 1. **Refactorización Base (P1 - BLOQUEANTE)**
Separar HTML monolítico en estructura modular:
```
styles/
  ├── variables.css     (design tokens)
  ├── base.css          (reset, global)
  ├── components.css    (componentes)
  └── animations.css    (transiciones)

js/
  ├── game-state.js     (state centralizado)
  ├── socket-manager.js (Socket.io abstraction)
  ├── ui.js             (DOM manipulation)
  ├── lazy-load.js      (lazy loading)
  └── main.js           (inicialización)
```

**Por qué:** Difícil mantener todo en un archivo. Sin reutilización de lógica.

### 2. **Accesibilidad (P1 - BLOQUEANTE)**
Agregar ARIA + keyboard nav:
- Labels para inputs
- `aria-label` en botones
- Focus indicators claros en todos lados
- Semantic HTML

**Por qué:** Screen readers no funcionan. Navegación por teclado limitada.

### 3. **Performance (P1 - BLOQUEANTE)**
Lazy loading + state management:
- Cargar imágenes solo cuando sean visibles
- Batch DOM updates
- Centralizar state

**Por qué:** Carga inicial lenta, especialmente móvil.

### 4. **UX Enhancements (P2 - MEJORAS)**
Animaciones y feedback visual:
- Transiciones suaves (0.3s)
- Hover effects
- Modal con animación
- Loading indicators

**Por qué:** UI se siente "dura", sin feedback claro.

### 5. **Polish (P3 - NICE TO HAVE)**
Design refinement:
- Micro-interacciones
- Tooltips
- Mejorar responsive (tablet)

**Por qué:** Detalles que hacen la diferencia.

---

## 📋 Tareas Específicas

```
[ ] FASE 1: Refactorización Base
  [ ] Crear estructura de carpetas (styles/, js/)
  [ ] Crear variables.css con todos los tokens
  [ ] Crear base.css con reset y globals
  [ ] Crear components.css con componentes
  [ ] Crear animations.css con transiciones
  [ ] Crear game-state.js (singleton de estado)
  [ ] Crear socket-manager.js (abstraction de Socket)
  [ ] Crear ui.js (DOM manipulation)
  [ ] Crear lazy-load.js (IntersectionObserver)
  [ ] Crear main.js (inicialización)
  [ ] Actualizar index.html (referencias a archivos)
  [ ] Verificar funcionalidad idéntica

[ ] FASE 2: Accesibilidad
  [ ] Agregar labels a inputs
  [ ] Agregar aria-label a botones
  [ ] Agregar focus indicators
  [ ] Agregar aria-describedby donde sea relevante
  [ ] Verificar contraste (4.5:1)
  [ ] Verificar con screen reader

[ ] FASE 3: Performance
  [ ] Implementar lazy loading de imágenes
  [ ] Batch DOM updates con DocumentFragment
  [ ] Verificar Network tab (sin bloqueadores)

[ ] FASE 4: UX Enhancements
  [ ] Agregar animaciones a cartas
  [ ] Agregar transición de turno
  [ ] Agregar modal con animación
  [ ] Agregar spinner de loading
  [ ] Agregar hover effects mejorados

[ ] FASE 5: Testing & Polish
  [ ] Probar en Chrome, Firefox, Safari
  [ ] Probar en móvil (iOS Safari, Chrome Android)
  [ ] Verificar responsive en 3 breakpoints
  [ ] Verificar con screen reader (NVDA/JAWS)
  [ ] Limpiar console.logs
  [ ] Optimizar assets
```

---

## 📚 Documentación de Referencia

1. **PLAN_MEJORA_FRONTEND.md** ← Lee esto primero (visión general)
2. **EJEMPLOS_IMPLEMENTACION.md** ← Usa estos para implementar cada parte

---

## 🎨 Lo Que NO Cambiar

✅ Funcionamiento del juego (Socket.io, turnos, chat)  
✅ Lógica de servidor (server.js)  
✅ Integración con Riot API  
✅ Despliegue en Render  

---

## 🛠️ Restricciones

- ❌ NO usar frameworks (React, Vue, etc.)
- ❌ NO usar build step (Webpack, etc.)
- ❌ NO usar CSS preprocessor (SASS, etc.)
- ❌ Mantener HTML/CSS/JS vanilla
- ✅ Puedes agregar librerías si las justificas (probablemente no sea necesario)

---

## ✅ Criterios de Éxito

```
ANTES HACER PR:
[ ] Código compila sin errores
[ ] Funcionalidad idéntica al original
[ ] Puntuación a11y ≥ 3/4
[ ] Puntuación performance ≥ 3/4
[ ] Focus indicators visibles
[ ] Responsive en mobile/tablet/desktop
[ ] Sin console errors/warnings
[ ] Animaciones sin jank (60fps)
```

---

## 🔗 Cómo Empezar

1. **Lee PLAN_MEJORA_FRONTEND.md** (5 min) - Entiende el objetivo
2. **Lee EJEMPLOS_IMPLEMENTACION.md** (15 min) - Ve los patrones
3. **Empieza por FASE 1** (estructura base)
4. **Luego FASES 2-4** en orden
5. **Prueba exhaustivamente**
6. **Haz PR a main**

---

## 🚀 Estado Actual vs. Objetivo

| Aspecto | Antes | Después |
|---------|-------|---------|
| Archivos | 1 HTML monolítico | 10+ archivos modular |
| CSS | Inline en `<style>` | 4 archivos CSS modular |
| JS | 359 líneas en 1 `<script>` | 5 módulos separados |
| a11y | Nula (1/4) | Buena (3/4) |
| Performance | Mediocre (2/4) | Buena (3/4) |
| UX Feedback | Mínimo | Animaciones + indicadores |

---

## 💬 Preguntas Frecuentes

**P: ¿Cambio el backend?**  
R: No, solo frontend.

**P: ¿Tengo que preservar el DOM exactamente igual?**  
R: No, solo que funcione igual. Puedes mejorar HTML semántico.

**P: ¿Qué pasa si encuentro bugs en el original?**  
R: Repórtalo, pero no lo fixes sin avisar.

**P: ¿Puedo usar TypeScript?**  
R: Mejor no, mantén vanilla JS para no complicar.

**P: ¿Tiempo limite?**  
R: 8-10 horas estimadas. Si tomas más, probablemente entras en perfeccionismo.

---

## 📞 Contacto

Si tienes preguntas durante la implementación:
- Revisa los ejemplos en EJEMPLOS_IMPLEMENTACION.md
- Consulta PLAN_MEJORA_FRONTEND.md sección "Tareas Específicas"
- Si algo no está claro, déjalo documentado en el PR

---

**Listo para empezar? Abre PLAN_MEJORA_FRONTEND.md y comienza por FASE 1.** 🎮
