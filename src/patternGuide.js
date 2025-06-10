export class PatternGuide {
    constructor(canvas) {
        this.canvas = canvas;
        this.guideCanvas = null;
        this.guideImage = null;
        this.currentPattern = null;
        this.opacity = 0.2;
        this.opacityControl = null;
        this.setupGuideCanvas();
    }

    setupGuideCanvas() {
        // Crear un nuevo canvas para la guía
        this.guideCanvas = document.createElement('canvas');
        this.guideCanvas.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: var(--cup-size);
            height: var(--cup-size);
            pointer-events: none;
            opacity: ${this.opacity};
            z-index: 2;
            border-radius: 50%;
            background: transparent;
        `;
        
        // Asegurarnos de que el canvas de guía tenga el mismo tamaño que el canvas principal
        this.guideCanvas.width = this.canvas.width;
        this.guideCanvas.height = this.canvas.height;
        
        // Insertar el canvas de guía dentro del contenedor del canvas principal
        const container = this.canvas.parentElement;
        container.style.position = 'relative';
        
        // Asegurarnos de que el canvas principal tenga z-index menor
        this.canvas.style.zIndex = '1';
        
        // Insertar la guía después del canvas principal para que esté por encima
        container.appendChild(this.guideCanvas);
        
        // Crear el control de opacidad pero no mostrarlo aún
        this.createOpacityControl();
    }

    createOpacityControl() {
        if (this.opacityControl) {
            this.opacityControl.remove();
        }

        this.opacityControl = document.createElement('div');
        this.opacityControl.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            display: none;
        `;

        const label = document.createElement('label');
        label.textContent = 'Opacidad de la guía: ';
        label.style.marginRight = '10px';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = this.opacity * 100;
        slider.style.width = '100px';

        slider.oninput = (e) => {
            this.opacity = e.target.value / 100;
            if (this.guideCanvas) {
                this.guideCanvas.style.opacity = this.opacity;
            }
        };

        this.opacityControl.appendChild(label);
        this.opacityControl.appendChild(slider);
        document.body.appendChild(this.opacityControl);
    }

    setPattern(pattern) {
        console.log('Estableciendo patrón:', pattern);
        this.currentPattern = pattern;
        
        // Limpiar la guía actual
        this.clearGuide();
        
        // Cargar la nueva imagen
        this.guideImage = new Image();
        this.guideImage.crossOrigin = 'anonymous';
        
        console.log('Cargando imagen:', pattern.imageUrl);
        
        this.guideImage.onload = () => {
            console.log('Imagen cargada exitosamente:', {
                width: this.guideImage.width,
                height: this.guideImage.height,
                src: this.guideImage.src
            });
            this.drawGuide();
        };
        
        this.guideImage.onerror = (error) => {
            console.error('Error al cargar la imagen:', {
                error: error,
                src: pattern.imageUrl,
                pattern: pattern.name
            });
        };
        
        // Establecer la fuente de la imagen
        this.guideImage.src = pattern.imageUrl;
        
        // Forzar un redibujado inmediato
        if (this.guideImage.complete) {
            console.log('Imagen ya estaba cargada, dibujando inmediatamente');
            this.drawGuide();
        }
    }

    drawGuide() {
        console.log('Dibujando guía');
        const ctx = this.guideCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.guideCanvas.width, this.guideCanvas.height);
        
        if (this.currentPattern && this.guideImage.complete) {
            console.log('Dibujando imagen:', {
                pattern: this.currentPattern.name,
                imageWidth: this.guideImage.width,
                imageHeight: this.guideImage.height,
                canvasWidth: this.guideCanvas.width,
                canvasHeight: this.guideCanvas.height
            });
            
            ctx.save();
            // Limpiar cualquier transformación previa
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, this.guideCanvas.width, this.guideCanvas.height);
            
            // Calcular dimensiones para mantener la proporción
            const scale = Math.min(
                this.guideCanvas.width / this.guideImage.width,
                this.guideCanvas.height / this.guideImage.height
            );
            
            const width = this.guideImage.width * scale;
            const height = this.guideImage.height * scale;
            
            // Centrar la imagen en el canvas
            const x = (this.guideCanvas.width - width) / 2;
            const y = (this.guideCanvas.height - height) / 2;
            
            // Dibujar la imagen
            ctx.drawImage(this.guideImage, x, y, width, height);
            ctx.restore();
            
            console.log('Guía dibujada correctamente', {
                pattern: this.currentPattern.name,
                canvasWidth: this.guideCanvas.width,
                canvasHeight: this.guideCanvas.height,
                imageWidth: width,
                imageHeight: height,
                x: x,
                y: y,
                scale: scale
            });
        } else {
            console.log('No se pudo dibujar la guía:', {
                pattern: this.currentPattern?.name,
                imageComplete: this.guideImage?.complete,
                hasPattern: !!this.currentPattern,
                hasImage: !!this.guideImage
            });
        }
    }

    clearGuide() {
        console.log('Limpiando guía');
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