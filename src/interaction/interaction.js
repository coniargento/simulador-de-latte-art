export class FluidInteraction {
  constructor(canvas, renderer) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.mouseDown = false;
    this.currentHandler = null; // Procesador de interacción actual

    this.setupEventListeners();
  }

  // Configurar el procesador de interacción actual
  setInteractionHandler(handler) {
    this.currentHandler = handler;
  }

  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener("mousedown", (event) => {
      this.startDrag(event.clientX, event.clientY);
    });

    this.canvas.addEventListener("mouseup", () => {
      this.endDrag();
    });

    this.canvas.addEventListener("mousemove", (event) => {
      this.drag(event.clientX, event.clientY);
    });

    // Touch events
    this.canvas.addEventListener("touchstart", (event) => {
      event.preventDefault();
      this.startDrag(event.touches[0].clientX, event.touches[0].clientY);
    });

    this.canvas.addEventListener("touchend", (event) => {
      event.preventDefault();
      this.endDrag();
    });

    this.canvas.addEventListener(
      "touchmove",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.drag(event.touches[0].clientX, event.touches[0].clientY);
      },
      { passive: false }
    );
  }

  startDrag(x, y) {
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
    if (this.mouseDown && this.currentHandler) {
      const bounds = this.canvas.getBoundingClientRect();
      const mx = x - bounds.left - this.canvas.clientLeft;
      const my = y - bounds.top - this.canvas.clientTop;
      const simX = mx / this.renderer.cScale;
      const simY = (this.canvas.height - my) / this.renderer.cScale;
      this.currentHandler.update(simX, simY);
    }
  }

  endDrag() {
    if (this.currentHandler) {
      this.currentHandler.end();
    }
    this.mouseDown = false;
  }
}
