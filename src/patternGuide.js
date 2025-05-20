export class PatternGuide {
    constructor(canvas) {
        this.canvas = canvas;
        this.setupGuideCanvas();
        this.currentPattern = null;
        this.opacity = 0.3;
        this.guideImage = new Image();
        this.opacityControl = null;
    }

    setupGuideCanvas() {
        // Crear un nuevo canvas para la guía
        this.guideCanvas = document.createElement('canvas');
        this.guideCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            opacity: ${this.opacity};
            z-index: 1;
            width: ${this.canvas.width}px;
            height: ${this.canvas.height}px;
            outline: none;
            border: none;
        `;
        this.guideCanvas.width = this.canvas.width;
        this.guideCanvas.height = this.canvas.height;
        
        // Insertar el canvas de guía dentro del contenedor del canvas principal
        this.canvas.parentElement.insertBefore(this.guideCanvas, this.canvas);
        
        // Crear el control de opacidad pero no mostrarlo aún
        this.createOpacityControl();
    }

    createOpacityControl() {
        this.opacityControl = document.createElement('div');
        this.opacityControl.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            background: rgba(0,0,0,0.7);
            padding: 10px;
            border-radius: 5px;
            color: white;
            z-index: 1000;
            display: none;
            border: 2px solid rgba(255,255,255,0.3);
        `;
        
        this.opacityControl.innerHTML = `
            <label style="display: block; margin-bottom: 5px; text-align: center;">Opacidad</label>
            <input type="range" min="0" max="100" value="${this.opacity * 100}" 
                   style="width: 150px;" id="guideOpacity">
            <span style="display: block; text-align: center; margin-top: 5px;" id="opacityValue">${Math.round(this.opacity * 100)}%</span>
        `;
        
        document.body.appendChild(this.opacityControl);
        
        const opacitySlider = document.getElementById('guideOpacity');
        const opacityValue = document.getElementById('opacityValue');
        
        opacitySlider.addEventListener('input', (e) => {
            this.opacity = e.target.value / 100;
            this.guideCanvas.style.opacity = this.opacity;
            opacityValue.textContent = `${Math.round(this.opacity * 100)}%`;
        });
    }

    setPattern(pattern) {
        this.currentPattern = pattern;
        if (pattern && pattern.imageUrl) {
            this.guideImage.src = pattern.imageUrl;
            this.guideImage.onload = () => this.drawGuide();
            // Mostrar el control de opacidad cuando se selecciona un patrón
            if (this.opacityControl) {
                this.opacityControl.style.display = 'block';
            }
        } else {
            this.clearGuide();
            // Ocultar el control de opacidad cuando no hay patrón
            if (this.opacityControl) {
                this.opacityControl.style.display = 'none';
            }
        }
    }

    drawGuide() {
        const ctx = this.guideCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.guideCanvas.width, this.guideCanvas.height);
        
        if (this.currentPattern && this.guideImage.complete) {
            ctx.save();
            // Limpiar cualquier transformación previa
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, this.guideCanvas.width, this.guideCanvas.height);
            
            // Calcular dimensiones para mantener la proporción
            const scale = Math.min(
                this.guideCanvas.width / this.guideImage.width,
                this.guideCanvas.height / this.guideImage.height
            ) * 0.8; // Reducir un poco el tamaño para que quepa dentro de la taza
            
            const width = this.guideImage.width * scale;
            const height = this.guideImage.height * scale;
            const x = (this.guideCanvas.width - width) / 2;
            const y = (this.guideCanvas.height - height) / 2;
            
            ctx.drawImage(this.guideImage, x, y, width, height);
            ctx.restore();
        }
    }

    clearGuide() {
        const ctx = this.guideCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.guideCanvas.width, this.guideCanvas.height);
    }

    // Método para comparar el patrón actual con la guía
    compareWithGuide(currentCanvas) {
        if (!this.currentPattern) return 0;

        const ctx = this.guideCanvas.getContext('2d');
        const currentCtx = currentCanvas.getContext('2d');
        
        // Obtener datos de píxeles de ambos canvas
        const guideData = ctx.getImageData(0, 0, this.guideCanvas.width, this.guideCanvas.height).data;
        const currentData = currentCtx.getImageData(0, 0, currentCanvas.width, currentCanvas.height).data;
        
        let matchingPixels = 0;
        let totalPixels = 0;
        
        // Comparar píxeles
        for (let i = 0; i < guideData.length; i += 4) {
            if (guideData[i + 3] > 0) { // Si el píxel de la guía no es transparente
                totalPixels++;
                
                // Comparar con cierta tolerancia
                const similar = this.comparePixels(
                    [guideData[i], guideData[i + 1], guideData[i + 2]],
                    [currentData[i], currentData[i + 1], currentData[i + 2]]
                );
                
                if (similar) matchingPixels++;
            }
        }
        
        return totalPixels > 0 ? (matchingPixels / totalPixels) * 100 : 0;
    }

    comparePixels(pixel1, pixel2, tolerance = 50) {
        return Math.abs(pixel1[0] - pixel2[0]) < tolerance &&
               Math.abs(pixel1[1] - pixel2[1]) < tolerance &&
               Math.abs(pixel1[2] - pixel2[2]) < tolerance;
    }
} 