export class Controls {
  constructor(config, onParamChange) {
    this.config = config;
    this.onParamChange = onParamChange;
    this.setupControls();
  }

  setupControls() {
    // Parámetros de simulación de fluidos
    this.setupRangeControl("viscosity", "fluid", 0.9, 1.0, 0.005);
    this.setupRangeControl("gravity", "fluid", -5, 5, 0.5);
    this.setupRangeControl("numIters", "fluid", 1, 50, 1);
    this.setupRangeControl("overRelaxation", "fluid", 1, 2, 0.1);

    // Configuración de visualización
    this.setupRangeControl("resolution", "display", 120, 240, 20);
    this.setupCheckboxControl("showSmoke", "display");
    this.setupCheckboxControl("showStreamlines", "display");

    // Selección del modo de simulación
    this.setupModeControl("currentMode", "simulation");

    // Parámetros de inyección de leche
    this.setupRangeControl(
      "pourRadius",
      "simulation",
      0.01,
      0.1,
      0.01,
      "pouring",
      "radius"
    );
    this.setupRangeControl(
      "pourStrength",
      "simulation",
      0.01,
      0.1,
      0.01,
      "pouring",
      "strength"
    );

    // Parámetros de mezcla
    this.setupRangeControl(
      "stirRadius",
      "simulation",
      0.01,
      0.05,
      0.005,
      "stirring",
      "radius"
    );
    this.setupRangeControl(
      "stirStrength",
      "simulation",
      0.5,
      5,
      0.5,
      "stirring",
      "strength"
    );
    // Parámetros de absorción
    this.setupRangeControl(
      "suctionRadius",
      "simulation",
      0.01,
      0.2,
      0.01,
      "suction",
      "radius"
    );
    this.setupRangeControl(
      "suctionStrength",
      "simulation",
      0.01,
      0.2,
      0.01,
      "suction",
      "strength"
    );
  }

  setupRangeControl(
    id,
    section,
    min,
    max,
    step,
    subProperty = id,
    nestedProperty = null
  ) {
    const input = document.getElementById(id);
    const value = document.getElementById(`${id}-value`);

    if (!input || !value) return;

    let paramValue = nestedProperty
      ? this.config[section][subProperty][nestedProperty]
      : this.config[section][subProperty];
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = paramValue;
    value.textContent = paramValue.toFixed(3);

    input.addEventListener("input", (e) => {
      if (nestedProperty) {
        this.config[section][subProperty][nestedProperty] = Number(
          e.target.value
        );
      } else {
        this.config[section][subProperty] = Number(e.target.value);
      }
      value.textContent = Number(e.target.value).toFixed(3);
      this.onParamChange(section, subProperty, nestedProperty);
    });
  }

  setupCheckboxControl(id, section, subProperty = id) {
    const input = document.getElementById(id);
    if (!input) return;

    input.checked = this.config[section][subProperty];
    input.addEventListener("change", (e) => {
      this.config[section][subProperty] = e.target.checked;
      this.onParamChange(section, subProperty);
    });
  }

  setupModeControl(id, section) {
    const input = document.getElementById(id);
    if (!input) return;

    input.value = this.config[section][id];
    input.addEventListener("change", (e) => {
      this.config[section][id] = e.target.value;
      this.onParamChange(section, id);
    });
  }
}
