export class SuctionSimulator {
  constructor(fluid, config) {
    this.fluid = fluid;
    this.config = config;
    this.suctionX = 0.0;
    this.suctionY = 0.0;
    this.isActive = false;
    this.audioManager = null;
    this.suctionSound = null;
  }

  setAudioManager(audioManager) {
    this.audioManager = audioManager;
  }

  start(x, y) {
    this.suctionX = x;
    this.suctionY = y;
    this.isActive = true;
    
    // Iniciar el sonido de succión
    if (this.audioManager && !this.suctionSound) {
      this.suctionSound = this.audioManager.playSound('suction');
    }
    
    this.applySuction(x, y, true);
  }

  update(x, y) {
    if (!this.isActive) return;

    this.applySuction(x, y, false);
    this.suctionX = x;
    this.suctionY = y;
  }

  end() {
    this.isActive = false;
    
    // Detener el sonido cuando se deja de succionar
    if (this.suctionSound) {
      this.suctionSound.stop();
      this.suctionSound = null;
    }
  }

  applySuction(x, y, reset) {
    const { radius, strength } = this.config?.simulation?.suction ?? {
      radius: 0.15,
      strength: 2.0,
    };

    // Calcula la velocidad de movimiento
    let vx = 0.0;
    let vy = 0.0;

    if (!reset) {
      vx = (x - this.suctionX) / this.config.fluid.dt;
      vy = (y - this.suctionY) / this.config.fluid.dt;
    }

    const n = this.fluid.numY;

    // Dentro del rango de radio de absorción del líquido
    for (let i = 1; i < this.fluid.numX - 2; i++) {
      for (let j = 1; j < this.fluid.numY - 2; j++) {
        // Solo procesar celdas no sólidas
        if (this.fluid.s[i * n + j] !== 0.0) {
          const dx = (i + 0.5) * this.fluid.h - x;
          const dy = (j + 0.5) * this.fluid.h - y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < radius) {
            const factor = 1.0 - d / radius;

            // 1. Establecer la velocidad horizontal (afectada por el movimiento del punto de absorción)
            this.fluid.u[i * n + j] += vx * factor * 0.05;
            this.fluid.u[(i + 1) * n + j] += vx * factor * 0.05;
            this.fluid.v[i * n + j] += vy * factor * 0.05;
            this.fluid.v[i * n + j + 1] += vy * factor * 0.05;

            // 2. Establece la velocidad de absorción vertical (parte clave)
            // Un valor negativo indica absorción desde el plano XY hacia la dirección Z
            const suctionStrength = -strength * factor; // El signo negativo representa absorción
            this.fluid.w[i * n + j] = suctionStrength;

            // 3. Reducir directamente la densidad de la leche
            const currentMilk = this.fluid.densityField.getDensity(
              i,
              j,
              "milk"
            );
            // Reducir la densidad según la intensidad de absorción
            const reductionRate = factor * 0;
            const newDensity = Math.max(0, currentMilk - reductionRate);
            this.fluid.densityField.setDensity(i, j, "milk", newDensity);
          }
        }
      }
    }
  }
}
