# 🏆 League of Guessing (LoLdle Multiplayer)

![Estado del Proyecto](https://img.shields.io/badge/Estado-Terminado-green)
![Licencia](https://img.shields.io/badge/Licencia-MIT-blue)

**Juego multijugador en tiempo real** inspirado en "Adivina Quién" (Guess Who?) pero con la temática de League of Legends. Los jugadores se conectan a una sala privada, seleccionan un campeón y deben descartar opciones hasta adivinar el personaje secreto del rival.

🔗 **[JUEGA AHORA (Live Demo en Render)](https://lol-adivina-quien.onrender.com/)**


---

## 🚀 Tecnologías Usadas

Este proyecto es una aplicación Full Stack construida con:

* **Backend:** Node.js, Express.
* **Real-Time Communication:** Socket.io (WebSockets) para salas, chat y sincronización de estado.
* **External API:** Integración con **Riot Games Data Dragon API** para obtener datos e imágenes actualizadas de los +160 campeones automáticamente.
* **Frontend:** HTML5, CSS3 (Diseño Responsivo & Tema Hextech), Vanilla JavaScript.
* **Deployment:** Render (PaaS).

---

## ✨ Características Principales

* **Sistema de Salas:** Creación dinámica de lobbies mediante códigos únicos.
* **Sincronización Total:** El tablero se genera aleatoriamente en el servidor (Backend-authoritative) asegurando que ambos jugadores vean los mismos 21 campeones.
* **Mecánicas de Juego:**
    * Sistema de turnos validado por servidor.
    * Chat en tiempo real.
    * Lógica de descarte y "Ultimate" (Intento de adivinar con condición de victoria/derrota).
* **UI/UX Inmersiva:** Interfaz temática basada en el cliente oficial de LoL, con overlays, efectos de sonido visuales y feedback de estado.
* **Adaptabilidad:** Diseño 100% responsivo para jugar desde PC o Celular.

---

## 🔧 Instalación y Uso Local

Si quieres correr este proyecto en tu propia máquina:

1.  **Clonar el repositorio**
    ```bash
    git clone [https://github.com/TU_USUARIO/adivina-lol.git](https://github.com/TU_USUARIO/adivina-lol.git)
    cd adivina-lol
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Iniciar el servidor**
    ```bash
    npm start
    ```

4.  **Jugar**
    Abre tu navegador en `http://localhost:3000`.

---

## 💡 Aprendizajes

Este proyecto fue desarrollado para practicar la arquitectura **Cliente-Servidor** en tiempo real. Los mayores desafíos resueltos fueron:
* Manejo de estado compartido entre múltiples clientes mediante Sockets.
* Implementación de diseño responsivo (Grid Layout) para mantener la jugabilidad en móviles.
* Consumo asíncrono de APIs externas al iniciar el servidor.

---

Hecho por Vicente Vásquez