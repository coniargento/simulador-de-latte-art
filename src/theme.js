// Definición de temas
export const themes = {
  /* Tema de Café */
  coffee: {
    // Sistema de colores
    colors: {
      // Colores base y de fondo
      background: "#b49461", // Fondo marrón oscuro
      primary: "#4A2925", // Color principal de los componentes
      secondary: "#8B5E3C", // Color secundario
      accent: "#D4B59E", // Color de acento
      text: "#FFFFFF", // Color del texto

      // Colores de líquidos
      fluids: {
        milk: "#b49461", // Color de la leche
        chocolate: { r: 65, g: 25, b: 0 }, // Color del chocolate
        caramel: { r: 193, g: 100, b: 32 }, // Color del caramelo
      },
    },

    // Estilos para los componentes UI
    components: {
      // Estilo de los botones
      button: {
        backgroundColor: "#4A2925",
        hoverColor: "#613832",
        textColor: "#FFFFFF",
        borderRadius: "4px",
      },
      // Estilo de los paneles
      panel: {
        backgroundColor: "#2C1810",
        borderColor: "#8B5E3C",
      },
      // Estilo del deslizador
      slider: {
        trackColor: "#8B5E3C",
        thumbColor: "#D4B59E",
      },
    },

    // Rutas de íconos
    icons: {
      milk: "/icons/milk-brown.svg",
      chocolate: "/icons/chocolate-brown.svg",
      caramel: "/icons/caramel-brown.svg",
      settings: "/icons/settings-light.svg",
    },
  },

  /* Tema de Matcha */
  matcha: {
    colors: {
      background: { r: 69, g: 91, b: 38 },
      primary: "#435A24",
      secondary: "#7C9F54",
      accent: "#E8F3D6",
      text: "#FFFFFF",

      fluids: {
        milk: { r: 255, g: 252, b: 245 },
        // Se pueden agregar más colores si hace falta
      },
    },
    // Las demás configuraciones son similares al tema de café
  },
};

// Tema actual
let currentTheme = "coffee";

/**
 * Obtener la configuración del tema actual
 * @returns {Object} Configuración completa del tema actual
 */
export function getCurrentTheme() {
  return themes[currentTheme];
}

/**
 * Cambiar el tema activo
 * @param {string} themeName - Nombre del tema ('coffee' o 'matcha')
 */
export function switchTheme(themeName) {
  if (themes[themeName]) {
    currentTheme = themeName;
    applyTheme(themes[themeName]);
  }
}

/**
 * Aplicar la configuración del tema a la UI
 * @param {Object} theme - Objeto de configuración del tema
 */
function applyTheme(theme) {
  /* 
    // 1. Actualizar variables CSS
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--${key}`, value);
      }
    });

    // 2. Emitir evento de cambio de tema
    document.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: theme 
    }));
    */
}

/**
 * Inicializar el tema
 * Puede leer la preferencia del usuario desde localStorage
 */
export function initTheme() {
  /*
    // Leer el tema guardado en localStorage
    const savedTheme = localStorage.getItem('preferredTheme');
    if (savedTheme && themes[savedTheme]) {
      switchTheme(savedTheme);
    } else {
      // Usar el tema por defecto
      switchTheme('coffee');
    }
    */
}

/**
 * Guardar la preferencia de tema del usuario
 * @param {string} themeName - Nombre del tema
 */
export function saveThemePreference(themeName) {
  /*
    localStorage.setItem('preferredTheme', themeName);
    */
}

// Funcionalidades futuras que se pueden implementar:
/*
  1. Cambio automático de tema (según la hora)
  export function enableAutoTheme() {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) {
      switchTheme('coffee');  // Tema oscuro de noche
    } else {
      switchTheme('matcha');  // Tema claro de día
    }
  }

  2. Seguir el tema del sistema operativo
  function followSystemTheme() {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addListener((e) => {
      switchTheme(e.matches ? 'coffee' : 'matcha');
    });
  }

  3. Crear un tema personalizado
  export function createCustomTheme(name, settings) {
    themes[name] = settings;
  }

  4. Vista previa de tema sin guardarlo
  export function previewTheme(themeName) {
    // Aplicar temporalmente el tema sin guardar
  }
*/

