const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const axios = require('axios');

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// VARIABLES GLOBALES
let TODOS_LOS_CAMPEONES = []; 
const estadoSalas = {}; 
const eleccionesJugadores = {};

// Carga de Datos Riot
async function cargarCampeonesDeRiot() {
    try {
        console.log("Conectando con Riot Games...");
        const url = "https://ddragon.leagueoflegends.com/cdn/14.1.1/data/es_ES/champion.json";
        const respuesta = await axios.get(url);
        TODOS_LOS_CAMPEONES = Object.keys(respuesta.data.data);
        console.log(`¡Éxito! Se cargaron ${TODOS_LOS_CAMPEONES.length} campeones.`);
    } catch (error) {
        console.error("Error cargando campeones:", error.message);
        TODOS_LOS_CAMPEONES = ["Aatrox", "Ahri", "Garen", "Teemo", "Yasuo", "Zed", "Lux", "Jinx", "Vi", "Caitlyn", "Darius", "Draven", "Ekko", "Fizz", "Graves", "Irelia", "Jax", "Jhin", "Karma", "Kayn", "LeeSin"]; 
    }
}
cargarCampeonesDeRiot();

function obtenerTableroAleatorio() {
    const mezcla = [...TODOS_LOS_CAMPEONES];
    for (let i = mezcla.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mezcla[i], mezcla[j]] = [mezcla[j], mezcla[i]];
    }
    return mezcla.slice(0, 21);
}

// LÓGICA SOCKETS
io.on('connection', (socket) => {
    
    socket.on('entrar_sala', (codigoSala) => {
        socket.join(codigoSala);
        
        if (!estadoSalas[codigoSala]) {
            estadoSalas[codigoSala] = {
                listos: 0,
                personajes: obtenerTableroAleatorio(),
                turno: null, // Guardaremos el ID del socket que tiene el turno
                jugadores: [] // Lista de IDs para saber a quién le toca
            };
        }
        
        // Registrar jugador en la sala (si no está ya)
        if(!estadoSalas[codigoSala].jugadores.includes(socket.id)){
             estadoSalas[codigoSala].jugadores.push(socket.id);
        }

        io.to(codigoSala).emit('iniciar_tablero', estadoSalas[codigoSala].personajes);
    });

    socket.on('jugador_listo', (data) => {
        const { sala, personaje } = data;
        eleccionesJugadores[socket.id] = personaje;
        
        if(estadoSalas[sala]) {
            estadoSalas[sala].listos += 1;
            socket.to(sala).emit('notificacion', '¡Tu rival ha elegido personaje!');

            if (estadoSalas[sala].listos >= 2) {
                // ELEGIR QUIEN PARTE (Random)
                const jugadores = estadoSalas[sala].jugadores;
                const primerJugador = jugadores[Math.floor(Math.random() * jugadores.length)];
                estadoSalas[sala].turno = primerJugador;

                // Avisar a todos que empieza y de quién es el turno
                io.to(sala).emit('inicio_partida', { turno: primerJugador });
                estadoSalas[sala].listos = 0; 
            }
        }
    });

    // --- NUEVO: CAMBIAR TURNO ---
    socket.on('pasar_turno', (sala) => {
        const estado = estadoSalas[sala];
        if(!estado) return;

        // Verificar que sea el turno de quien lo pide (seguridad básica)
        if(estado.turno !== socket.id) return;

        // Buscar al otro jugador
        const jugadores = estado.jugadores;
        const siguienteJugador = jugadores.find(id => id !== socket.id);
        
        if(siguienteJugador) {
            estado.turno = siguienteJugador;
            io.to(sala).emit('cambio_turno', { turno: siguienteJugador });
        }
    });

    socket.on('intentar_adivinar', (data) => {
        const { sala, personajeAdivinado } = data;
        const estado = estadoSalas[sala];
        
        // VALIDACIÓN: Solo permitir si es su turno
        if (estado.turno !== socket.id) {
            // Opcional: Avisar que no es su turno
            return; 
        }

        // Lógica normal de adivinar...
        const socketsEnSala = io.sockets.adapter.rooms.get(sala);
        let rivalSocketId = null;
        if(socketsEnSala){
            for (const id of socketsEnSala) {
                if (id !== socket.id) {
                    rivalSocketId = id;
                    break;
                }
            }
        }

        if (rivalSocketId) {
            const personajeRealDelRival = eleccionesJugadores[rivalSocketId];
            if (personajeAdivinado === personajeRealDelRival) {
                io.to(sala).emit('fin_juego', { ganador: socket.id, personaje: personajeRealDelRival });
            } else {
                io.to(sala).emit('intento_fallido', { culpable: socket.id, personaje: personajeAdivinado });
                // IMPORTANTE: Si fallas al adivinar, ¿pierdes el turno automáticamente?
                // En el juego de mesa sí. Vamos a pasar el turno automáticamente si falla.
                
                const jugadores = estado.jugadores;
                const siguienteJugador = jugadores.find(id => id !== socket.id);
                estado.turno = siguienteJugador;
                io.to(sala).emit('cambio_turno', { turno: siguienteJugador });
            }
        }
    });

    socket.on('mensaje_chat', (data) => {
        socket.to(data.sala).emit('recibir_mensaje', data.texto);
    });
});

const PORT = process.env.PORT || 3000; 

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});