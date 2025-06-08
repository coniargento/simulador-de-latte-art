export class FluidInteraction {
  constructor(canvas, renderer) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.mouseDown = false;
    this.currentHandler = null; // Procesador de interacción actual
    this.isEnabled = true;

    this.setupEventListeners();
  }

  // Configurar el procesador de interacción actual
  setInteractionHandler(handler) {
    this.currentHandler = handler;
  }

  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener("mousedown", (event) => {
      if (!this.isEnabled) return;
      this.startDrag(event.clientX, event.clientY);
    });

    this.canvas.addEventListener("mouseup", () => {
      if (!this.isEnabled) return;
      this.endDrag();
    });

    this.canvas.addEventListener("mousemove", (event) => {
      if (!this.isEnabled) return;
      this.drag(event.clientX, event.clientY);
    });

    // Detener la interacción cuando el mouse sale del canvas
    this.canvas.addEventListener("mouseleave", () => {
      if (!this.isEnabled) return;
      if (this.mouseDown) {
        this.endDrag();
      }
    });

    // Touch events
    this.canvas.addEventListener("touchstart", (event) => {
      if (!this.isEnabled) return;
      event.preventDefault();
      this.startDrag(event.touches[0].clientX, event.touches[0].clientY);
    });

    this.canvas.addEventListener("touchend", (event) => {
      if (!this.isEnabled) return;
      event.preventDefault();
      this.endDrag();
    });

    this.canvas.addEventListener(
      "touchmove",
      (event) => {
        if (!this.isEnabled) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        this.drag(event.touches[0].clientX, event.touches[0].clientY);
      },
      { passive: false }
    );
  }

  disableInteraction() {
    this.isEnabled = false;
    if (this.mouseDown) {
      this.endDrag();
    }
    if (this.currentHandler) {
      this.currentHandler.end();
    }
  }

  enableInteraction() {
    this.isEnabled = true;
  }

  startDrag(x, y) {
    if (!this.isEnabled) return;
    const bounds = this.canvas.getBoundingClientRect();
    const mx = x - bounds.left - this.canvas.clientLeft;
    const my = y - bounds.top - this.canvas.clientTop;
    this.mouseDown = true;

    if (this.currentHandler) {
      const simX = mx / this.renderer.cScale;
      const simY = (this.canvas.height - my) / this.renderer.cScale;
      this.currentHandler.start(simX, simY);
    }
  }

  drag(x, y) {
    if (!this.isEnabled || !this.mouseDown || !this.currentHandler) return;
    const bounds = this.canvas.getBoundingClientRect();
    const mx = x - bounds.left - this.canvas.clientLeft;
    const my = y - bounds.top - this.canvas.clientTop;
    const simX = mx / this.renderer.cScale;
    const simY = (this.canvas.height - my) / this.renderer.cScale;
    this.currentHandler.update(simX, simY);
  }

  endDrag() {
    if (!this.isEnabled) return;
    if (this.currentHandler) {
      this.currentHandler.end();
    }
    this.mouseDown = false;
  }
}
