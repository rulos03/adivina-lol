'use strict';

/**
 * Configuración visual de franquicias disponibles.
 * Para agregar un universo nuevo: añadir una entrada aquí
 * y la función de carga correspondiente en server.js.
 */
const FRANQUICIAS_CONFIG = [
  {
    id:        'lol',
    nombre:    'League of Legends',
    tagline:   'Campeones',
    tag:       'LoL',
    imagen:    'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg',
    imgFit:    'cover',
    imgPos:    '68% center',
    acento:    'oklch(70% 0.13 82)',
    acentoDim: 'oklch(70% 0.13 82 / 0.18)',
    bgPanel:   'oklch(9% 0.025 82)',
  },
  {
    id:        'valorant',
    nombre:    'Valorant',
    tagline:   'Agentes',
    tag:       'VAL',
    imagen:    'https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/fullportrait.png',
    imgFit:    'contain',
    imgPos:    'center bottom',
    acento:    'oklch(58% 0.22 25)',
    acentoDim: 'oklch(58% 0.22 25 / 0.18)',
    bgPanel:   'oklch(9% 0.045 25)',
  },
  {
    id:        'pokemon',
    nombre:    'Pokémon',
    tagline:   'Generación I',
    tag:       'PKM',
    imagen:    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    imgFit:    'contain',
    imgPos:    'center 20%',
    acento:    'oklch(82% 0.19 96)',
    acentoDim: 'oklch(82% 0.19 96 / 0.18)',
    bgPanel:   'oklch(10% 0.04 30)',
  },
];

/**
 * Renderiza el selector visual de franquicia en el contenedor dado.
 * Llama a esto desde DOMContentLoaded.
 */
function inicializarSelectorFranquicia() {
  const contenedor = document.getElementById('selector-franquicia');
  if (!contenedor) return;

  const frag = document.createDocumentFragment();

  FRANQUICIAS_CONFIG.forEach((f, i) => {
    const label = document.createElement('label');
    label.className  = 'franquicia-panel';
    label.htmlFor    = `radio-franquicia-${f.id}`;
    label.setAttribute('data-franquicia', f.id);
    label.setAttribute('data-tag', f.tag);
    label.style.cssText = `--acento:${f.acento};--acentoDim:${f.acentoDim};--bg-panel:${f.bgPanel};--animation-delay:${i * 80}ms`;

    // Radio oculto (accesible)
    const radio = document.createElement('input');
    radio.type    = 'radio';
    radio.name    = 'franquicia';
    radio.id      = `radio-franquicia-${f.id}`;
    radio.value   = f.id;
    radio.checked = i === 0;
    radio.className = 'visually-hidden';

    // Artwork
    const img = document.createElement('img');
    img.className = 'panel-img';
    img.src       = f.imagen;
    img.alt       = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.cssText = `object-fit:${f.imgFit};object-position:${f.imgPos}`;

    // Overlay de gradiente (legibilidad del texto)
    const overlay = document.createElement('div');
    overlay.className = 'panel-overlay';

    // Info inferior
    const info = document.createElement('div');
    info.className = 'panel-info';
    info.innerHTML = `
      <strong class="panel-nombre">${f.nombre}</strong>
      <span class="panel-tagline">${f.tagline}</span>
    `;

    // Indicador de selección (esquina superior derecha)
    const check = document.createElement('span');
    check.className = 'panel-check';
    check.setAttribute('aria-hidden', 'true');

    label.append(radio, img, overlay, info, check);
    frag.appendChild(label);
  });

  contenedor.appendChild(frag);
}

/**
 * Devuelve el id de la franquicia actualmente seleccionada.
 */
function getFranquicia() {
  const checked = document.querySelector('#selector-franquicia input[name="franquicia"]:checked');
  return checked ? checked.value : 'lol';
}

/**
 * Bloquea el selector (después de unirse a una sala).
 * Fuerza la franquicia recibida del servidor.
 */
function bloquearSelectorFranquicia(franquicia) {
  const contenedor = document.getElementById('selector-franquicia');
  if (!contenedor) return;

  const radio = contenedor.querySelector(`input[value="${franquicia}"]`);
  if (radio) radio.checked = true;
  contenedor.classList.add('bloqueado');
}
