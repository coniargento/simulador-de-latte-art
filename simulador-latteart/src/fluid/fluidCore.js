export const U_FIELD = 0;  // Campo de velocidad horizontal
export const V_FIELD = 1;  // Campo de velocidad vertical
export const W_FIELD = 2;  // Campo de velocidad en profundidad (nuevo)

import { DensityField } from "./densityField.js";

export class Fluid {
  constructor(density, numX, numY, h, viscosity) {
    this.density = density;
    this.numX = numX + 2;  // Añade bordes
    this.numY = numY + 2;  // Añade bordes
    this.numCells = this.numX * this.numY;
    this.h = h;  // Tamaño de la celda
    this.viscosity = viscosity;
    this.velocityThreshold = 0.001;  // Umbral para considerar velocidad cero

    // Campos de velocidad
    this.u = new Float32Array(this.numCells);  // Velocidad horizontal
    this.v = new Float32Array(this.numCells);  // Velocidad vertical
    this.w = new Float32Array(this.numCells);  // Velocidad en profundidad (nuevo)
    this.newU = new Float32Array(this.numCells);  // Buffer para nuevo estado
    this.newV = new Float32Array(this.numCells);
    this.newW = new Float32Array(this.numCells);
    this.p = new Float32Array(this.numCells);  // Presión
    this.s = new Float32Array(this.numCells);  // Estado (sólido/fluido)

    // Campo de densidad para diferentes fluidos
    this.densityField = new DensityField(numX, numY);
  }

  // Método de compatibilidad para acceder a densidad
  get m() {
    return this.densityField.m;
  }

  // Aplica gravedad al fluido
  integrate(dt, gravity) {
    const n = this.numY;
    for (let i = 1; i < this.numX; i++) {
      for (let j = 1; j < this.numY - 1; j++) {
        // Solo aplica gravedad a celdas fluidas
        if (this.s[i * n + j] != 0.0 && this.s[i * n + j - 1] != 0.0) {
          this.v[i * n + j] += gravity * dt;
        }
      }
    }
  }

  // Resuelve la incompresibilidad del fluido
  solveIncompressibility(numIters, dt, overRelaxation) {
    const n = this.numY;
    const cp = (this.density * this.h) / dt;  // Coeficiente de presión

    for (let iter = 0; iter < numIters; iter++) {
      for (let i = 1; i < this.numX - 1; i++) {
        for (let j = 1; j < this.numY - 1; j++) {
          if (this.s[i * n + j] == 0.0) continue;  // Salta celdas sólidas

          // Verifica celdas vecinas
          const sx0 = this.s[(i - 1) * n + j];
          const sx1 = this.s[(i + 1) * n + j];
          const sy0 = this.s[i * n + j - 1];
          const sy1 = this.s[i * n + j + 1];
          const sum = sx0 + sx1 + sy0 + sy1;
          if (sum == 0.0) continue;  // No hay celdas fluidas vecinas

          // Calcula divergencia
          let div =
            this.u[(i + 1) * n + j] -
            this.u[i * n + j] +
            this.v[i * n + j + 1] -
            this.v[i * n + j];

          // Ajuste por velocidad en profundidad (simplificado)
          div -= this.w[i * n + j];

          // Calcula corrección de presión
          let p = -div / sum;
          p *= overRelaxation;
          this.p[i * n + j] += cp * p;

          // Ajusta velocidades
          this.u[i * n + j] -= sx0 * p;
          this.u[(i + 1) * n + j] += sx1 * p;
          this.v[i * n + j] -= sy0 * p;
          this.v[i * n + j + 1] += sy1 * p;
        }
      }
    }
  }

  // Extrapola velocidades a los bordes
  extrapolate() {
    const n = this.numY;
    // Bordes horizontales
    for (let i = 0; i < this.numX; i++) {
      this.u[i * n + 0] = this.u[i * n + 1];
      this.u[i * n + this.numY - 1] = this.u[i * n + this.numY - 2];
      this.v[i * n + 0] = this.v[i * n + 1];
      this.v[i * n + this.numY - 1] = this.v[i * n + this.numY - 2];
      this.w[i * n + 0] = this.w[i * n + 1];
      this.w[i * n + this.numY - 1] = this.w[i * n + this.numY - 2];
    }
    // Bordes verticales
    for (let j = 0; j < this.numY; j++) {
      this.u[0 * n + j] = this.u[1 * n + j];
      this.u[(this.numX - 1) * n + j] = this.u[(this.numX - 2) * n + j];
      this.v[0 * n + j] = this.v[1 * n + j];
      this.v[(this.numX - 1) * n + j] = this.v[(this.numX - 2) * n + j];
      this.w[0 * n + j] = this.w[1 * n + j];
      this.w[(this.numX - 1) * n + j] = this.w[(this.numX - 2) * n + j];
    }
  }

  // Muestrea un campo de velocidad en una posición
  sampleField(x, y, field) {
    const n = this.numY;
    const h = this.h;
    const h1 = 1.0 / h;
    const h2 = 0.5 * h;

    // Limita coordenadas dentro del dominio
    x = Math.max(Math.min(x, this.numX * h), h);
    y = Math.max(Math.min(y, this.numY * h), h);

    let dx = 0.0;
    let dy = 0.0;
    let f;

    // Selecciona campo a muestrear
    switch (field) {
      case U_FIELD:
        f = this.u;
        dy = h2;
        break;
      case V_FIELD:
        f = this.v;
        dx = h2;
        break;
      case W_FIELD:
        f = this.w;
        dx = h2;
        dy = h2;
        break;
      default:
        return 0.0;
    }

    // Calcula interpolación bilineal
    const x0 = Math.min(Math.floor((x - dx) * h1), this.numX - 1);
    const tx = (x - dx - x0 * h) * h1;
    const x1 = Math.min(x0 + 1, this.numX - 1);

    const y0 = Math.min(Math.floor((y - dy) * h1), this.numY - 1);
    const ty = (y - dy - y0 * h) * h1;
    const y1 = Math.min(y0 + 1, this.numY - 1);

    const sx = 1.0 - tx;
    const sy = 1.0 - ty;

    return (
      sx * sy * f[x0 * n + y0] +
      tx * sy * f[x1 * n + y0] +
      tx * ty * f[x1 * n + y1] +
      sx * ty * f[x0 * n + y1]
    );
  }

  // Calcula velocidad horizontal promedio
  avgU(i, j) {
    const n = this.numY;
    return (
      (this.u[i * n + j - 1] +
        this.u[i * n + j] +
        this.u[(i + 1) * n + j - 1] +
        this.u[(i + 1) * n + j]) *
      0.25
    );
  }

  // Calcula velocidad vertical promedio
  avgV(i, j) {
    const n = this.numY;
    return (
      (this.v[(i - 1) * n + j] +
        this.v[i * n + j] +
        this.v[(i - 1) * n + j + 1] +
        this.v[i * n + j + 1]) *
      0.25
    );
  }

  // Calcula velocidad en profundidad promedio
  avgW(i, j) {
    const n = this.numY;
    return (
      (this.w[(i - 1) * n + j] +
        this.w[i * n + j] +
        this.w[(i - 1) * n + j + 1] +
        this.w[i * n + j + 1]) *
      0.25
    );
  }

  // Advección de velocidades
  advectVel(dt) {
    this.newU.set(this.u);
    this.newV.set(this.v);
    this.newW.set(this.w);

    const n = this.numY;
    const h = this.h;
    const h2 = 0.5 * h;

    for (let i = 1; i < this.numX; i++) {
      for (let j = 1; j < this.numY; j++) {
        // Componente horizontal
        if (
          this.s[i * n + j] != 0.0 &&
          this.s[(i - 1) * n + j] != 0.0 &&
          j < this.numY - 1
        ) {
          let x = i * h;
          let y = j * h + h2;
          let u = this.u[i * n + j];
          let v = this.avgV(i, j);
          x = x - dt * u;
          y = y - dt * v;
          u = this.sampleField(x, y, U_FIELD);
          this.newU[i * n + j] =
            Math.abs(u) < this.velocityThreshold ? 0 : u * this.viscosity;
        }
        // Componente vertical
        if (
          this.s[i * n + j] != 0.0 &&
          this.s[i * n + j - 1] != 0.0 &&
          i < this.numX - 1
        ) {
          let x = i * h + h2;
          let y = j * h;
          let u = this.avgU(i, j);
          let v = this.v[i * n + j];
          x = x - dt * u;
          y = y - dt * v;
          v = this.sampleField(x, y, V_FIELD);
          this.newV[i * n + j] =
            Math.abs(v) < this.velocityThreshold ? 0 : v * this.viscosity;
        }
        // Componente de profundidad
        if (
          this.s[i * n + j] != 0.0 &&
          i < this.numX - 1 &&
          j < this.numY - 1
        ) {
          let x = i * h + h2;
          let y = j * h + h2;
          let u = this.avgU(i, j);
          let v = this.avgV(i, j);
          let w = this.w[i * n + j];
          x = x - dt * u;
          y = y - dt * v;
          w = this.sampleField(x, y, W_FIELD);

          // Aplica viscosidad y umbral
          this.newW[i * n + j] =
            Math.abs(w) < this.velocityThreshold ? 0 : w * this.viscosity * 1.0;
        }
      }
    }

    // Actualiza velocidades
    this.u.set(this.newU);
    this.v.set(this.newV);
    this.w.set(this.newW);
  }

  // Advección de densidades
  advectDensities(dt) {
    const n = this.numY;
    const h = this.h;
    const h2 = 0.5 * h;

    // Crea campo temporal para densidades
    const tempDensities = this.densityField.createTemp();

    for (let i = 1; i < this.numX - 1; i++) {
      for (let j = 1; j < this.numY - 1; j++) {
        if (this.s[i * n + j] !== 0.0) {
          // Calcula velocidad promedio
          const u = (this.u[i * n + j] + this.u[(i + 1) * n + j]) * 0.5;
          const v = (this.v[i * n + j] + this.v[i * n + j + 1]) * 0.5;

          // Calcula posición de origen
          const x = i * h + h2 - dt * u;
          const y = j * h + h2 - dt * v;

          // Muestrea densidades en posición de origen
          const sampledDensities = this.sampleDensities(x, y);

          // Efecto de inyección desde profundidad
          const w = this.w[i * n + j];
          if (w > 0) {
            if ("milk" in sampledDensities) {
              const addedDensity = w * dt * 0.5;
              sampledDensities["milk"] += addedDensity;
              sampledDensities["milk"] = Math.min(sampledDensities["milk"], 1.0);
            }
          }

          // Almacena en campo temporal
          tempDensities[i * n + j] = sampledDensities;
        }
      }
    }

    // Actualiza campo de densidad
    this.densityField.updateFromTemp(tempDensities);
  }

  // Muestrea densidades en una posición
  sampleDensities(x, y) {
    const n = this.numY;
    const h = this.h;
    const h1 = 1.0 / h;
    const h2 = 0.5 * h;

    // Limita coordenadas
    x = Math.max(Math.min(x, this.numX * h), h);
    y = Math.max(Math.min(y, this.numY * h), h);

    const dx = h2;
    const dy = h2;

    // Calcula índices para interpolación
    const x0 = Math.min(Math.floor((x - dx) * h1), this.numX - 1);
    const tx = (x - dx - x0 * h) * h1;
    const x1 = Math.min(x0 + 1, this.numX - 1);

    const y0 = Math.min(Math.floor((y - dy) * h1), this.numY - 1);
    const ty = (y - dy - y0 * h) * h1;
    const y1 = Math.min(y0 + 1, this.numY - 1);

    const sx = 1.0 - tx;
    const sy = 1.0 - ty;

    // Obtiene densidades en los 4 puntos cercanos
    const d00 = this.densityField.getDensities(x0, y0);
    const d10 = this.densityField.getDensities(x1, y0);
    const d11 = this.densityField.getDensities(x1, y1);
    const d01 = this.densityField.getDensities(x0, y1);

    // Interpola para cada tipo de fluido
    const result = {};
    for (const fluidType in d00) {
      result[fluidType] =
        sx * sy * d00[fluidType] +
        tx * sy * d10[fluidType] +
        tx * ty * d11[fluidType] +
        sx * ty * d01[fluidType];
    }

    return result;
  }

  // Limpia velocidades en bordes sólidos
  clearBoundaryVelocities() {
    const n = this.numY;

    for (let i = 0; i < this.numX; i++) {
      for (let j = 0; j < this.numY; j++) {
        if (this.s[i * n + j] === 0.0) {  // Si es sólido
          this.u[i * n + j] = 0;
          this.v[i * n + j] = 0;
          this.w[i * n + j] = 0;

          // Limpia velocidades en bordes adyacentes
          if (i < this.numX - 1) this.u[(i + 1) * n + j] = 0;
          if (j < this.numY - 1) this.v[i * n + j + 1] = 0;
        }
      }
    }
  }

  // Ejecuta un paso completo de simulación
  simulate(dt, gravity, numIters, overRelaxation, viscosity) {
    this.viscosity = viscosity;
    this.integrate(dt, gravity);
    this.p.fill(0.0);
    this.solveIncompressibility(numIters, dt, overRelaxation);
    this.extrapolate();
    this.advectVel(dt);
    this.advectDensities(dt);
    this.clearBoundaryVelocities();
  }
}