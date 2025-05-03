export const U_FIELD = 0;
export const V_FIELD = 1;
export const W_FIELD = 2;

import { DensityField } from "./densityField.js";

export class Fluid {
  constructor(density, numX, numY, h, viscosity) {
    this.density = density;
    this.numX = numX + 2;
    this.numY = numY + 2;
    this.numCells = this.numX * this.numY;
    this.h = h;
    this.viscosity = viscosity;
    this.velocityThreshold = 0.001;

  // Campos de velocidad
    this.u = new Float32Array(this.numCells);
    this.v = new Float32Array(this.numCells);
    this.w = new Float32Array(this.numCells); // Añade el campo de velocidad en la dirección Z
    this.newU = new Float32Array(this.numCells);
    this.newV = new Float32Array(this.numCells);
    this.newW = new Float32Array(this.numCells); // Añade newW
    this.p = new Float32Array(this.numCells);
    this.s = new Float32Array(this.numCells);

    // Crear el campo de densidad
    this.densityField = new DensityField(numX, numY);
  }

  // Acceso al campo de densidad para compatibilidad hacia atrás
  get m() {
    return this.densityField.m;
  }

  integrate(dt, gravity) {
    const n = this.numY;
    for (let i = 1; i < this.numX; i++) {
      for (let j = 1; j < this.numY - 1; j++) {
        if (this.s[i * n + j] != 0.0 && this.s[i * n + j - 1] != 0.0) {
          this.v[i * n + j] += gravity * dt;
        }
      }
    }
  }

  solveIncompressibility(numIters, dt, overRelaxation) {
    const n = this.numY;
    const cp = (this.density * this.h) / dt; // Coeficiente de presión

    for (let iter = 0; iter < numIters; iter++) {
      for (let i = 1; i < this.numX - 1; i++) {
        for (let j = 1; j < this.numY - 1; j++) {
          if (this.s[i * n + j] == 0.0) continue; // Omitir celdas sólidas

          const sx0 = this.s[(i - 1) * n + j];
          const sx1 = this.s[(i + 1) * n + j];
          const sy0 = this.s[i * n + j - 1];
          const sy1 = this.s[i * n + j + 1];
          const sum = sx0 + sx1 + sy0 + sy1;
          if (sum == 0.0) continue; // Sin celdas de fluido adyacentes

          // Calcular divergencia
          let div =
            this.u[(i + 1) * n + j] -
            this.u[i * n + j] +
            this.v[i * n + j + 1] -
            this.v[i * n + j];

          // Considerar la contribución en dirección Z - esta es la modificación clave
          // No hay una grilla real en Z, se usa el valor actual de w como una aproximación de ∂w/∂z
          // Valores positivos de w indican fluido entrando desde arriba, lo que incrementa la divergencia
          div -= this.w[i * n + j];

          let p = -div / sum; // Calcular corrección de presión
          p *= overRelaxation;
          this.p[i * n + j] += cp * p; // Actualizar campo de presión

          // Corregir campo de velocidad
          this.u[i * n + j] -= sx0 * p;
          this.u[(i + 1) * n + j] += sx1 * p;
          this.v[i * n + j] -= sy0 * p;
          this.v[i * n + j + 1] += sy1 * p;
        }
      }
    }
  }

  extrapolate() {
    const n = this.numY;
    // Manejo de bordes horizontales
    for (let i = 0; i < this.numX; i++) {
      this.u[i * n + 0] = this.u[i * n + 1];
      this.u[i * n + this.numY - 1] = this.u[i * n + this.numY - 2];
      this.v[i * n + 0] = this.v[i * n + 1];
      this.v[i * n + this.numY - 1] = this.v[i * n + this.numY - 2];
      this.w[i * n + 0] = this.w[i * n + 1];
      this.w[i * n + this.numY - 1] = this.w[i * n + this.numY - 2];
    }
    // Manejo de bordes verticales
    for (let j = 0; j < this.numY; j++) {
      this.u[0 * n + j] = this.u[1 * n + j];
      this.u[(this.numX - 1) * n + j] = this.u[(this.numX - 2) * n + j];
      this.v[0 * n + j] = this.v[1 * n + j];
      this.v[(this.numX - 1) * n + j] = this.v[(this.numX - 2) * n + j];
      this.w[0 * n + j] = this.w[1 * n + j];
      this.w[(this.numX - 1) * n + j] = this.w[(this.numX - 2) * n + j];
    }
  }

  // Muestra campo de velocidad
  sampleField(x, y, field) {
    const n = this.numY;
    const h = this.h;
    const h1 = 1.0 / h;
    const h2 = 0.5 * h;

    x = Math.max(Math.min(x, this.numX * h), h);
    y = Math.max(Math.min(y, this.numY * h), h);

    let dx = 0.0;
    let dy = 0.0;
    let f;

    // Selecciona datos y desplaza según el tipo de campo
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

  advectVel(dt) {
    this.newU.set(this.u);
    this.newV.set(this.v);
    this.newW.set(this.w);

    const n = this.numY;
    const h = this.h;
    const h2 = 0.5 * h;

    for (let i = 1; i < this.numX; i++) {
      for (let j = 1; j < this.numY; j++) {
        // u component
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
        // v component
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
        // w component
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

          // La desintegración del campo w a lo largo del tiempo (simulando la difusión en la dirección z)）
          this.newW[i * n + j] =
            Math.abs(w) < this.velocityThreshold ? 0 : w * this.viscosity * 1.0; // 0,95 es el factor de atenuación, que se puede ajustar
        }
      }
    }

    this.u.set(this.newU);
    this.v.set(this.newV);
    this.w.set(this.newW);
  }

  // Cálculo de la advección del campo de densidad
  advectDensities(dt) {
    const n = this.numY;
    const h = this.h;
    const h2 = 0.5 * h;

    // // Crea campo de densidad temporal
    const tempDensities = this.densityField.createTemp();

    // Calcular para cada celda de la grilla
    for (let i = 1; i < this.numX - 1; i++) {
      for (let j = 1; j < this.numY - 1; j++) {
        if (this.s[i * n + j] !== 0.0) {
          // velocidad de cálculo
          const u = (this.u[i * n + j] + this.u[(i + 1) * n + j]) * 0.5;
          const v = (this.v[i * n + j] + this.v[i * n + j + 1]) * 0.5;

          // punto de retroceso
          const x = i * h + h2 - dt * u;
          const y = j * h + h2 - dt * v;

          // Muestra la densidad de todos los fluidos desde la posición de retroceso
          const sampledDensities = this.sampleDensities(x, y);

          // Considerar el impacto del campo w sobre la densidad (efecto de inyección)
          const w = this.w[i * n + j];
          if (w > 0) {
            // Un w positivo indica que hay líquido inyectado desde la dirección z
            for (const fluidType in sampledDensities) {
              if (fluidType === "milk") {
                // Suponer que el líquido inyectado es leche
                // Aumentar la densidad según el valor de w
                const addedDensity = w * dt * 0.5; // El coeficiente es ajustable
                sampledDensities[fluidType] += addedDensity;
                // Asegurarse de que la densidad no supere 1.0
                sampledDensities[fluidType] = Math.min(
                  sampledDensities[fluidType],
                  1.0
                );
              }
            }
          }

          // Almacenar los resultados de la muestra en un campo de densidad temporal
          tempDensities[i * n + j] = sampledDensities;
        }
      }
    }

    // Actualiza el campo de densidad
    this.densityField.updateFromTemp(tempDensities);
  }

  // Muestra el campo de densidad
  sampleDensities(x, y) {
    const n = this.numY;
    const h = this.h;
    const h1 = 1.0 / h;
    const h2 = 0.5 * h;

    x = Math.max(Math.min(x, this.numX * h), h);
    y = Math.max(Math.min(y, this.numY * h), h);

    const dx = h2;
    const dy = h2;

    const x0 = Math.min(Math.floor((x - dx) * h1), this.numX - 1);
    const tx = (x - dx - x0 * h) * h1;
    const x1 = Math.min(x0 + 1, this.numX - 1);

    const y0 = Math.min(Math.floor((y - dy) * h1), this.numY - 1);
    const ty = (y - dy - y0 * h) * h1;
    const y1 = Math.min(y0 + 1, this.numY - 1);

    const sx = 1.0 - tx;
    const sy = 1.0 - ty;

    // Obtener los valores de densidad en las cuatro esquinas
    const d00 = this.densityField.getDensities(x0, y0);
    const d10 = this.densityField.getDensities(x1, y0);
    const d11 = this.densityField.getDensities(x1, y1);
    const d01 = this.densityField.getDensities(x0, y1);

    // Realiza una interpolación bilineal para cada tipo de fluido
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

  // Añadir un nuevo método en la clase Fluid
  clearBoundaryVelocities() {
    const n = this.numY;

    for (let i = 0; i < this.numX; i++) {
      for (let j = 0; j < this.numY; j++) {
        // Verificar si es una celda sólida
        if (this.s[i * n + j] === 0.0) {
          // Establecer la velocidad de la celda sólida en 0.
          this.u[i * n + j] = 0;
          this.v[i * n + j] = 0;
          this.w[i * n + j] = 0;

          // Eliminar la velocidad 'u' en el borde derecho de la celda sólida
          if (i < this.numX - 1) {
            this.u[(i + 1) * n + j] = 0;
          }

          // Eliminar la velocidad 'v' en el borde superior de la celda sólida
          if (j < this.numY - 1) {
            this.v[i * n + j + 1] = 0;
          }
        }
      }
    }
  }

  simulate(dt, gravity, numIters, overRelaxation, viscosity) {
    this.viscosity = viscosity;

    this.integrate(dt, gravity);
    this.p.fill(0.0);
    this.solveIncompressibility(numIters, dt, overRelaxation);
    this.extrapolate();
    this.advectVel(dt);
    this.advectDensities(dt);
    // Eliminar la velocidad en los bordes al final de cada paso de simulación
    this.clearBoundaryVelocities();
  }
}
