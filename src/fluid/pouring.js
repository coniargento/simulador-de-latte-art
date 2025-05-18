export class MilkInjector {
  constructor(fluid, config) {
    this.fluid = fluid;
    this.config = config;
    this.injectX = 0.0;
    this.injectY = 0.0;
    this.isActive = false;
    this.audioManager = null;
    this.pourSound = null;
  }

  setAudioManager(audioManager) {
    this.audioManager = audioManager;
  }

  start(x, y) {
    this.injectX = x;
    this.injectY = y;
    this.isActive = true;
    
    // Iniciar el sonido de vertido
    if (this.audioManager && !this.pourSound) {
      this.pourSound = this.audioManager.playSound('pour');
    }
    
    this.applyInjection(x, y, true);
  }

  update(x, y) {
    if (!this.isActive) return;

    this.applyInjection(x, y, false);
    this.injectX = x;
    this.injectY = y;
  }

  end() {
    this.isActive = false;
    
    // Detener el sonido cuando se deja de verter
    if (this.pourSound) {
      this.pourSound.stop();
      this.pourSound = null;
    }
  }

  applyInjection(x, y, reset) {
    const { radius, strength } = this.config?.simulation?.pouring ?? {
      radius: 0.3,
      strength: 2.0,
    };

    // Calcula la velocidad de movimiento
    let vx = 0.0;
    let vy = 0.0;

    if (!reset) {
      vx = (x - this.injectX) / this.config.fluid.dt;
      vy = (y - this.injectY) / this.config.fluid.dt;
    }

    const n = this.fluid.numY;

    // Dentro del rango de radio de inyección de leche
    for (let i = 1; i < this.fluid.numX - 2; i++) {
      for (let j = 1; j < this.fluid.numY - 2; j++) {
        // Solo procesar celdas no sólidas (es decir, celdas donde s no es igual a 0.0)
        if (this.fluid.s[i * n + j] !== 0.0) {
          const dx = (i + 0.5) * this.fluid.h - x;
          const dy = (j + 0.5) * this.fluid.h - y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < radius) {
            const factor = 1.0 - d / radius;

            // 1. Establece la velocidad horizontal (afectada por el movimiento del punto de inyección)
            this.fluid.u[i * n + j] += vx * factor * 0.5;
            this.fluid.u[(i + 1) * n + j] += vx * factor * 0.5;
            this.fluid.v[i * n + j] += vy * factor * 0.5;
            this.fluid.v[i * n + j + 1] += vy * factor * 0.5;

            // 2. Establece la velocidad de inyección vertical (parte clave)
            // Un valor positivo indica inyección desde la dirección Z hacia el plano XY
            const injectionStrength = strength * factor;
            this.fluid.w[i * n + j] = injectionStrength;

            // 3. Establece directamente la densidad de la leche
            this.fluid.densityField.setDensity(i, j, "milk", 1.0);
          }
        }
      }
    }
  }
}
