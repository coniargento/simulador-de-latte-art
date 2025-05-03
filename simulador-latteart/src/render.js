import { U_FIELD, V_FIELD } from "./fluid/fluidCore.js";

export class FluidRenderer {
  constructor(canvas, simHeight) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { willReadFrequently: true });
    this.simHeight = simHeight;
    this.cScale = canvas.height / simHeight;
    this.simWidth = Math.floor(canvas.width / this.cScale);

    // 1. DEFINICIÓN DE COLORES EN HEX
    this.colors = {
      background: "#326621",  // Verde fondo
      milk: "#FFFCF5",       // Blanco leche
      cup: "#FF0000"         // Rojo brillante (para prueba)
    };

    // 2. CONVERSIÓN INICIAL A RGB
    this.cupColor = this.hexToRgb(this.colors.cup);
    console.log("Color de taza (RGB):", this.cupColor); // Verificación
  }

  // Conversión HEX a RGB [r,g,b]
  hexToRgb(hex) {
    hex = hex.replace('#', '');
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    ];
  }

  getFluidColor(density, isSolid) {
    // 3. PRIORIDAD MÁXIMA A CELDAS SÓLIDAS
    if (isSolid) {
      console.log("Dibujando celda sólida"); // Debug
      return [...this.cupColor, 255]; // [r,g,b,a]
    }

    density = Math.min(Math.max(density, 0.0), 1.0);
    const bg = this.hexToRgb(this.colors.background);
    const milk = this.hexToRgb(this.colors.milk);
    
    return [
      Math.floor(bg[0] * (1 - density) + milk[0] * density),
      Math.floor(bg[1] * (1 - density) + milk[1] * density),
      Math.floor(bg[2] * (1 - density) + milk[2] * density),
      255
    ];
  }

  draw(fluid, options = {}) {
    console.log("Iniciando dibujo..."); // Debug
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const id = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const h = fluid.h;
    let solidCells = 0;

    // 4. VERIFICACIÓN DE DATOS DE SIMULACIÓN
    console.log("Dimensiones simulación:", fluid.numX, fluid.numY);
    console.log("Muestra de celdas sólidas:", 
      fluid.s.slice(0, 10), "..."); // Primeras 10 celdas

    for (let i = 0; i < fluid.numX; i++) {
      for (let j = 0; j < fluid.numY; j++) {
        const index = i * fluid.numY + j;
        const isSolid = fluid.s[index] === 0.0;
        
        if (isSolid) {
          solidCells++;
          // 5. DIBUJADO SÓLIDO CON COLOR FIJO
          const [r, g, b] = this.cupColor;
          const x = Math.floor(this.cX(i * h));
          const y = Math.floor(this.cY((j + 1) * h));
          const size = Math.floor(this.cScale * h) + 1;

          for (let yi = y; yi > y - size && yi >= 0; yi--) {
            let p = 4 * (yi * this.canvas.width + x);
            for (let xi = 0; xi < size && x + xi < this.canvas.width; xi++) {
              id.data[p++] = r;
              id.data[p++] = g;
              id.data[p++] = b;
              id.data[p++] = 255;
            }
          }
        }
      }
    }

    console.log(`Celdas sólidas dibujadas: ${solidCells}`);
    this.ctx.putImageData(id, 0, 0);

    // 6. DIBUJADO ADICIONAL PARA VERIFICACIÓN
    if (solidCells === 0) {
      console.warn("¡No se detectaron celdas sólidas!");
      this.ctx.fillStyle = this.colors.cup;
      this.ctx.fillRect(10, 10, 50, 50); // Cuadrado rojo de prueba
    }
  }

  // ... (otros métodos permanecen igual)
}