const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const axios = require('axios');

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// VARIABLES GLOBALES
const PERSONAJES = { lol: [], valorant: [], pokemon: [] };
const estadoSalas = {};
const eleccionesJugadores = {};

// Utilidades
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// Carga de Datos — múltiples franquicias
async function cargarLoL() {
    try {
        console.log("Cargando League of Legends...");
        const url = "https://ddragon.leagueoflegends.com/cdn/14.1.1/data/es_ES/champion.json";
        const respuesta = await axios.get(url);
        PERSONAJES.lol = Object.keys(respuesta.data.data).map(nombre => ({
            nombre,
            imagen: `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${nombre}.png`
        }));
        console.log(`✓ LoL: ${PERSONAJES.lol.length} campeones cargados`);
    } catch (error) {
        console.error("✗ Error cargando LoL:", error.message);
        PERSONAJES.lol = [];
    }
}

async function cargarValorant() {
    try {
        console.log("Cargando Valorant...");
        const url = "https://valorant-api.com/v1/agents?isPlayableCharacter=true";
        const respuesta = await axios.get(url);
        PERSONAJES.valorant = respuesta.data.data.map(agente => ({
            nombre: agente.displayName,
            imagen: agente.displayIcon
        }));
        console.log(`✓ Valorant: ${PERSONAJES.valorant.length} agentes cargados`);
    } catch (error) {
        console.error("✗ Error cargando Valorant:", error.message);
        PERSONAJES.valorant = [];
    }
}

async function cargarPokemon() {
    try {
        console.log("Cargando Pokémon...");
        const url = "https://pokeapi.co/api/v2/pokemon?limit=151";
        const respuesta = await axios.get(url);
        PERSONAJES.pokemon = respuesta.data.results.map((poke, index) => ({
            nombre: capitalize(poke.name),
            imagen: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index + 1}.png`
        }));
        console.log(`✓ Pokémon: ${PERSONAJES.pokemon.length} pokémon cargados`);
    } catch (error) {
        console.error("✗ Error cargando Pokémon:", error.message);
        PERSONAJES.pokemon = [];
    }
}

// Inicializar todas las franquicias en paralelo
Promise.allSettled([cargarLoL(), cargarValorant(), cargarPokemon()])
    .then(() => {
        console.log(`\n📊 Universos cargados: LoL=${PERSONAJES.lol.length}, Valorant=${PERSONAJES.valorant.length}, Pokemon=${PERSONAJES.pokemon.length}\n`);
    });

function obtenerTableroAleatorio(franquicia) {
    const pool = PERSONAJES[franquicia] || [];
    if (pool.length === 0) return null;

    const mezcla = [...pool];
    for (let i = mezcla.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mezcla[i], mezcla[j]] = [mezcla[j], mezcla[i]];
    }
    return mezcla.slice(0, 21);
}

// LÓGICA SOCKETS
io.on('connection', (socket) => {

    socket.on('entrar_sala', (data) => {
        const codigoSala = data.sala || data; // Compatibilidad backward (puede llegar string o objeto)
        const franquiciaDeseada = typeof data === 'string' ? 'lol' : (data.franquicia || 'lol');

        socket.join(codigoSala);

        if (!estadoSalas[codigoSala]) {
            // Primera conexión: crear sala con la franquicia elegida
            if (!['lol', 'valorant', 'pokemon'].includes(franquiciaDeseada)) {
                socket.emit('error_franquicia', { mensaje: 'Universo no válido' });
                return;
            }

            const personajes = obtenerTableroAleatorio(franquiciaDeseada);
            if (!personajes) {
                socket.emit('error_franquicia', { mensaje: 'Universo no disponible temporalmente' });
                return;
            }

            estadoSalas[codigoSala] = {
                listos: 0,
                franquicia: franquiciaDeseada,
                personajes: personajes,
                turno: null,
                jugadores: []
            };
        }

        // Registrar jugador en la sala
        if(!estadoSalas[codigoSala].jugadores.includes(socket.id)){
             estadoSalas[codigoSala].jugadores.push(socket.id);
        }

        // Enviar tablero con la franquicia actual (puede diferir de la que el usuario eligió)
        io.to(codigoSala).emit('iniciar_tablero', {
            personajes: estadoSalas[codigoSala].personajes,
            franquicia: estadoSalas[codigoSala].franquicia
        });
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