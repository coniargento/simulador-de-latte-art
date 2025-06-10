import { Fluid } from "./fluid/fluidCore.js";
import { FluidRenderer } from "./render.js";
import { FluidInteraction } from "./interaction/interaction.js";
import { MilkInjector } from "./fluid/pouring.js";
import { StirringSimulator } from "./fluid/stir.js";
import { SuctionSimulator } from "./fluid/suction.js";
import { Controls } from "./interaction/controlPanel.js";
import { config, SIMULATION_MODES } from "./config.js";
import { AudioManager } from './audioManager.js';
import { GameManager } from './gameManager.js';

// Configurar el canvas
const canvas = document.getElementById('myCanvas');
const cupSize = Math.min(window.innerWidth * 0.8, 560); // 560px es el tamaño máximo
canvas.width = cupSize;
canvas.height = cupSize;
canvas.style.width = `${cupSize}px`;
canvas.style.height = `${cupSize}px`;
document.documentElement.style.setProperty('--cup-size', `${cupSize}px`);
canvas.focus();
canvas.style.zIndex = "2";

// Inicializa el audio manager
const audioManager = new AudioManager();

// Inicializa el game manager
const gameManager = new GameManager(canvas);

// Estado de la simulación
let fluid;
let renderer;
let interaction;
let stirringSimulator;
let suctionSimulator;
let milkInjector;

// Configuración del panel de controles
const controlsPanel = document.querySelector('.controls');
const toggleControlsBtn = document.getElementById('toggleControls');

// Asegurarse de que el panel esté oculto al inicio
controlsPanel.classList.add('hidden');
controlsPanel.classList.remove('visible');

toggleControlsBtn.addEventListener('click', () => {
  controlsPanel.classList.toggle('hidden');
  controlsPanel.classList.toggle('visible');
});

// Configuración de botones para cambiar el modo de simulación
function setupModeButtons() {
  const pouringBtn = document.getElementById("pouringMode");
  const stirringBtn = document.getElementById("stirringMode");
  const suctionBtn = document.getElementById("suctionMode");

  pouringBtn.addEventListener("click", () => {
    console.log("Cambiando a modo vertido");
    config.simulation.currentMode = SIMULATION_MODES.POURING;
    pouringBtn.classList.add("active");
    stirringBtn.classList.remove("active");
    suctionBtn.classList.remove("active");
    interaction.setInteractionHandler(milkInjector);
    audioManager.playSound('pour');
  });

  stirringBtn.addEventListener("click", () => {
    console.log("Cambiando a modo revolver");
    config.simulation.currentMode = SIMULATION_MODES.STIRRING;
    stirringBtn.classList.add("active");
    pouringBtn.classList.remove("active");
    suctionBtn.classList.remove("active");
    interaction.setInteractionHandler(stirringSimulator);
    audioManager.playSound('stir');
  });

  suctionBtn.addEventListener("click", () => {
    console.log("Cambiando a modo succión");
    config.simulation.currentMode = SIMULATION_MODES.SUCTION;
    suctionBtn.classList.add("active");
    pouringBtn.classList.remove("active");
    stirringBtn.classList.remove("active");
    interaction.setInteractionHandler(suctionSimulator);
    audioManager.playSound('suction');
  });
}

// Manejo de cambios en parámetros
function handleParamChange(section, property) {
  if (section === "display" && property === "resolution") {
    init();
  }
  if (section === "fluid" && property === "viscosity") {
    fluid.viscosity = config.fluid.viscosity;
  }
}

// Inicializa los controles
const controls = new Controls(config, handleParamChange);

// Inicializa y empieza la simulación
function init() {
  console.log("Inicializando simulación");
  const domainHeight = 1.0;
  const domainWidth = domainHeight;
  const h = domainHeight / config.display.resolution;

  const numX = Math.floor(domainWidth / h);
  const numY = Math.floor(domainHeight / h);

  fluid = new Fluid(
    config.fluid.density,
    numX,
    numY,
    h,
    config.fluid.viscosity
  );

  setupCircularBoundary(fluid);

  if (!renderer) {
    renderer = new FluidRenderer(canvas, domainHeight);
  }

  if (!interaction) {
    interaction = new FluidInteraction(canvas, renderer);
    window.fluidInteraction = interaction;
  }

  milkInjector = new MilkInjector(fluid, config);
  stirringSimulator = new StirringSimulator(fluid, config);
  suctionSimulator = new SuctionSimulator(fluid, config);

  // Configurar el audio para todos los manejadores
  milkInjector.setAudioManager(audioManager);
  stirringSimulator.setAudioManager(audioManager);
  suctionSimulator.setAudioManager(audioManager);

  // Configurar los manejadores de interacción con el gameManager
  const wrapInteractionHandler = (handler) => {
    const originalStart = handler.start.bind(handler);
    const originalUpdate = handler.update.bind(handler);
    const originalEnd = handler.end.bind(handler);

    return {
      start: (x, y) => {
        gameManager.handleInteraction(x, y);
        originalStart(x, y);
      },
      update: originalUpdate,
      end: originalEnd
    };
  };

  // Envolver los manejadores existentes
  milkInjector = wrapInteractionHandler(milkInjector);
  stirringSimulator = wrapInteractionHandler(stirringSimulator);
  suctionSimulator = wrapInteractionHandler(suctionSimulator);

  // Configurar los botones de modo
  setupModeButtons();

  // Establecer el modo inicial
  interaction.setInteractionHandler(milkInjector);
}

// Botón de reinicio
document.getElementById("restartButton").addEventListener("click", () => {
  init();
  config.debug.frameNr = 0;
  gameManager.resetPattern();
});

// Configura el borde circular
function setupCircularBoundary(fluid) {
  const n = fluid.numY;
  const centerX = (fluid.numX - 3) / 2;
  const centerY = (fluid.numY - 3) / 2;
  const radius = Math.min(centerX, centerY) * 0.99;

  for (let i = 0; i < fluid.numX; i++) {
    for (let j = 0; j < fluid.numY; j++) {
      const dx = i - centerX;
      const dy = j - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      fluid.s[i * n + j] = dist > radius ? 0.0 : 1.0;
    }
  }
}

// Actualización de la simulación
function update() {
  if (!config.debug.paused) {
    fluid.simulate(
      config.fluid.dt,
      config.fluid.gravity,
      config.fluid.numIters,
      config.fluid.overRelaxation,
      config.fluid.viscosity
    );
    config.debug.frameNr++;
  }

  renderer.draw(fluid, {
    showSmoke: config.display.showSmoke,
    showStreamlines: config.display.showStreamlines,
  });

  requestAnimationFrame(update);
}

// Agregar event listener para el movimiento del mouse
canvas.addEventListener('mousemove', (e) => {
  if (gameManager.isInTutorialMode()) {
    gameManager.provideFeedback(e.clientX, e.clientY);
  }
});

// Detener la interacción cuando el mouse sale del canvas
canvas.addEventListener('mouseleave', () => {
  if (interaction && interaction.currentHandler) {
    interaction.currentHandler.end();
  }
});

// Ejecutar todo
setupModeButtons();
init();update();
