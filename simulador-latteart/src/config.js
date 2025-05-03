// config.js
// Definición de modos de simulación
export const SIMULATION_MODES = {
  STIRRING: "STIRRING",
  POURING: "POURING",
  SUCTION: "SUCTION", // Modo de succión agregado
};

export const config = {
  // Parámetros de simulación de fluidos
  fluid: {
    density: 1000.0,          // Densidad del fluido
    gravity: 0.0,             // Gravedad (sin efecto por defecto)
    dt: 1.0 / 60.0,           // Delta de tiempo por frame
    numIters: 20,             // Iteraciones por paso
    overRelaxation: 1.9,      // Factor de relajación
    viscosity: 0.95,          // 🔹 Viscosidad del fluido (recomendado entre 0.9 - 1.0)
  },

  // Configuración de visualización
  display: {
    resolution: 200,          // Resolución de la cuadrícula
    showStreamlines: false,   // Mostrar líneas de flujo
  },

  // Configuración de modos de simulación
  simulation: {
    currentMode: SIMULATION_MODES.POURING, // Modo por defecto: vertido

    // Parámetros del modo de agitación
    stirring: {
      radius: 0.02,      // Radio del agitador
      strength: 2.5,     // Fuerza de agitación
    },

    // Parámetros del modo de vertido
    pouring: {
      radius: 0.05,      // Radio del punto de vertido
      strength: 0.05,    // Intensidad del vertido
    },

    // Parámetros del modo de succión
    suction: {
      radius: 0.1,       // Área de succión
      strength: 0.1,     // Fuerza de succión
    },
  },

  // Configuración de depuración
  debug: {
    paused: false,       // Simulación en pausa
    frameNr: 0,          // Número de frame actual
  },
};

