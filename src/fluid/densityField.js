export class DensityField {
  constructor(numX, numY) {
    this.numX = numX + 2;
    this.numY = numY + 2;
    this.numCells = this.numX * this.numY;

    // Inicializar el arreglo del campo de densidad
    this.densities = new Array(this.numCells);
    for (let i = 0; i < this.numCells; i++) {
      this.densities[i] = {
        milk: 0.0, // Inicializar sin leche
        // Otros fluidos que se agregarán posteriormente, como:
        // chocolate: 0.0,
        // caramelo: 0.0,
      };
    }
  }

  getDensities(i, j) {
    return this.densities[i * this.numY + j];
  }

  setDensity(i, j, fluidType, value) {
    this.densities[i * this.numY + j][fluidType] = value;
  }

  getDensity(i, j, fluidType) {
    return this.densities[i * this.numY + j][fluidType];
  }

  // Método createTemp corregido
  createTemp() {
    const temp = new Array(this.numCells);
    for (let i = 0; i < this.numCells; i++) {
      temp[i] = {
        coffee: 0.0,
        milk: 0.0,
      };
    }
    return temp;
  }

  // Actualiza el campo de densidad actual desde el arreglo temporal
  updateFromTemp(temp) {
    this.densities = temp;
  }

  // Compatible hacia atrás
  get m() {
    const coffeeArray = new Float32Array(this.numCells);
    for (let i = 0; i < this.numCells; i++) {
      coffeeArray[i] = this.densities[i].coffee;
    }
    return coffeeArray;
  }
}
