export class StirringSimulator {
  constructor(fluid, config) {
    this.fluid = fluid;
    this.config = config;
    this.stirX = 0.0;
    this.stirY = 0.0;
    this.audioManager = null;
    this.stirSound = null;
  }

  setAudioManager(audioManager) {
    this.audioManager = audioManager;
  }

  start(x, y) {
    this.stirX = x;
    this.stirY = y;
    
    // Iniciar el sonido de revolver
    if (this.audioManager && !this.stirSound) {
      this.stirSound = this.audioManager.playSound('stir');
    }
    
    this.applyStirring(x, y, true);
  }

  update(x, y) {
    this.applyStirring(x, y, false);
    this.stirX = x;
    this.stirY = y;
  }

  end() {
    // Detener el sonido cuando se deja de revolver
    if (this.stirSound) {
      this.stirSound.stop();
      this.stirSound = null;
    }
  }

  applyStirring(x, y, reset) {
    const { radius, strength } = this.config?.simulation?.stirring ?? {
      radius: 0.1,
      strength: 1.0,
    };
    let vx = 0.0;
    let vy = 0.0;

    if (!reset) {
      vx = (x - this.stirX) / this.config.fluid.dt;
      vy = (y - this.stirY) / this.config.fluid.dt;
    }

    const n = this.fluid.numY;

    for (let i = 1; i < this.fluid.numX - 2; i++) {
      for (let j = 1; j < this.fluid.numY - 2; j++) {
        // Solo procesar celdas no sólidas
        if (this.fluid.s[i * n + j] !== 0.0) {
          const dx = (i + 0.5) * this.fluid.h - x;
          const dy = (j + 0.5) * this.fluid.h - y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < radius) {
            const factor = 1.0 - d / radius;
 
            // Afecta el campo de velocidad para que el fluido fluya
            this.fluid.u[i * n + j] = vx * strength * factor;
            this.fluid.u[(i + 1) * n + j] = vx * strength * factor;
            this.fluid.v[i * n + j] = vy * strength * factor;
            this.fluid.v[i * n + j + 1] = vy * strength * factor;
          }
        }
      }
    }
  }
}
