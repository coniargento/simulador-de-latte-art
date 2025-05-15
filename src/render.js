import { U_FIELD, V_FIELD } from "./fluid/fluidCore.js";

export class FluidRenderer {
  constructor(canvas, simHeight) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { willReadFrequently: true });
    this.simHeight = simHeight;
    this.cScale = canvas.height / simHeight;
    this.simWidth = canvas.width / this.cScale;

    // Definición de colores en HEX
    this.backgroundColor = "#b49461"; // Marrón oscuro como fondo (RGB: 180, 148, 97)
    this.milkColor = "#FFFCF5";      // Blanco cálido como leche (RGB: 255, 252, 245)
    this.solidColor = "#1E64C8";     // Azul para sólidos (RGB: 30, 100, 200)
  }

  // Método para convertir HEX a RGB
  hexToRgb(hex) {
    hex = hex.replace('#', '');
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    ];
  }

  // Método para mezclar colores HEX
  mixHexColors(hex1, hex2, ratio) {
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);
    
    return [
      Math.floor(rgb1[0] * (1 - ratio) + rgb2[0] * ratio),
      Math.floor(rgb1[1] * (1 - ratio) + rgb2[1] * ratio),
      Math.floor(rgb1[2] * (1 - ratio) + rgb2[2] * ratio),
      255 // Alpha fijo
    ];
  }

  cX(x) {
    return x * this.cScale;
  }

  cY(y) {
    return this.canvas.height - y * this.cScale;
  }

  getFluidColor(density, isSolid = false) {
    if (isSolid) {
      return [30, 100, 200, 255]; // Azul para sólidos
    }
    
    density = Math.min(Math.max(density, 0.0), 1.0);
    
    return [
      Math.floor(180 * (1 - density) + 255 * density), // R
      Math.floor(148 * (1 - density) + 252 * density), // G
      Math.floor(97 * (1 - density) + 245 * density),  // B
      255
    ];
  }

  draw(fluid, options = {}) {
    const { showStreamlines = false } = options;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const n = fluid.numY;
    const cellScale = 1.1;
    const h = fluid.h;

    const id = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    // Dibujo del fluido
    for (let i = 0; i < fluid.numX; i++) {
      for (let j = 0; j < fluid.numY; j++) {
        // Verifica si es una celda sólida
        const isSolid = fluid.s[i * n + j] === 0.0;

        // Obtiene la densidad de la leche
        const density = fluid.densityField.getDensity(i, j, "milk");
        const color = this.getFluidColor(density, isSolid);

        const x = Math.floor(this.cX(i * h));
        const y = Math.floor(this.cY((j + 1) * h));
        const cx = Math.floor(this.cScale * cellScale * h) + 1;
        const cy = Math.floor(this.cScale * cellScale * h) + 1;

        for (let yi = y; yi < y + cy; yi++) {
          let p = 4 * (yi * this.canvas.width + x);
          for (let xi = 0; xi < cx; xi++) {
            id.data[p++] = color[0];
            id.data[p++] = color[1];
            id.data[p++] = color[2];
            id.data[p++] = color[3];
          }
        }
      }
    }

    this.ctx.putImageData(id, 0, 0);
    if (showStreamlines) {
      this.drawStreamlines(fluid);
    }
  }

  drawStreamlines(fluid) {
    const numSegs = 30;
    this.ctx.strokeStyle = "#4F04FF80"; // HEX con opacidad (equivalente a rgba(79, 4, 255, 0.5))
    this.ctx.lineWidth = 1;

    for (let i = 1; i < fluid.numX - 1; i += 3) {
      for (let j = 1; j < fluid.numY - 1; j += 3) {
        let x = (i + 0.5) * fluid.h;
        let y = (j + 0.5) * fluid.h;

        this.ctx.beginPath();
        this.ctx.moveTo(this.cX(x), this.cY(y));

        for (let n = 0; n < numSegs; n++) {
          const u = fluid.sampleField(x, y, U_FIELD);
          const v = fluid.sampleField(x, y, V_FIELD);
          x += u * 0.015;
          y += v * 0.015;
          if (x > fluid.numX * fluid.h || x < 0 || y > fluid.numY * fluid.h || y < 0) {
            break;
          }
          this.ctx.lineTo(this.cX(x), this.cY(y));
        }
        this.ctx.stroke();
      }
    }
  }
}