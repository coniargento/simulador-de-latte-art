import { PatternGuide } from './patternGuide.js';

export class GameManager {
    constructor(canvas) {
        this.patterns = [
            {
                id: 'heart',
                name: 'Corazón Simple',
                difficulty: 'Principiante',
                description: 'Un corazón básico perfecto para principiantes',
                imageUrl: 'assets/patterns/corazon.png',
                steps: [
                    'Crea la base del corazón con un vertido suave',
                    'Forma los lóbulos superiores con movimientos circulares',
                    'Une los lóbulos en la parte inferior',
                    'Añade detalles finales para dar profundidad'
                ],
                checkpoints: [
                    { message: '¡Comencemos! Dibuja la base del corazón.', position: { x: 0.5, y: 0.5 } },
                    { message: '¡Bien! Ahora forma los lóbulos superiores.', position: { x: 0.3, y: 0.3 } },
                    { message: '¡Excelente! Une los lóbulos en la parte inferior.', position: { x: 0.5, y: 0.7 } },
                    { message: '¡Perfecto! Añade los detalles finales.', position: { x: 0.5, y: 0.5 } }
                ],
                tutorial: [
                    { x: 0.5, y: 0.5 }, // Centro
                    { x: 0.3, y: 0.3 }, // Lóbulo izquierdo
                    { x: 0.7, y: 0.3 }, // Lóbulo derecho
                    { x: 0.5, y: 0.7 }  // Base
                ]
            },
            {
                id: 'rosetta',
                name: 'Roseta',
                difficulty: 'Intermedio',
                description: 'Una elegante roseta con pétalos detallados',
                imageUrl: 'assets/patterns/rosetta.png',
                steps: [
                    'Crea el centro de la roseta con un vertido suave',
                    'Forma los pétalos exteriores con movimientos fluidos',
                    'Añade detalles a los pétalos para dar profundidad',
                    'Finaliza con toques finales para dar brillo'
                ],
                checkpoints: [
                    { message: '¡Comencemos! Dibuja el centro de la roseta.', position: { x: 0.5, y: 0.5 } },
                    { message: '¡Bien! Ahora forma los pétalos exteriores.', position: { x: 0.3, y: 0.3 } },
                    { message: '¡Excelente! Añade detalles a los pétalos.', position: { x: 0.7, y: 0.7 } },
                    { message: '¡Perfecto! Añade los toques finales.', position: { x: 0.5, y: 0.5 } }
                ],
                tutorial: [
                    { x: 0.5, y: 0.5 }, // Centro
                    { x: 0.3, y: 0.3 }, // Pétalo superior izquierdo
                    { x: 0.7, y: 0.3 }, // Pétalo superior derecho
                    { x: 0.7, y: 0.7 }, // Pétalo inferior derecho
                    { x: 0.3, y: 0.7 }  // Pétalo inferior izquierdo
                ]
            },
            {
                id: 'bear',
                name: 'Oso',
                difficulty: 'Avanzado',
                description: 'Un adorable oso con detalles suaves y redondeados',
                imageUrl: 'assets/patterns/oso.png',
                steps: [
                    'Crea la base circular para la cara del oso',
                    'Añade las orejas redondeadas en la parte superior',
                    'Forma el hocico y la nariz con detalles suaves',
                    'Finaliza con los ojos y la boca'
                ],
                checkpoints: [
                    { message: '¡Comencemos! Dibuja la base de la cara.', position: { x: 0.5, y: 0.5 } },
                    { message: '¡Bien! Ahora añade las orejas.', position: { x: 0.3, y: 0.3 } },
                    { message: '¡Excelente! Forma el hocico y la nariz.', position: { x: 0.5, y: 0.6 } },
                    { message: '¡Perfecto! Añade los detalles finales.', position: { x: 0.5, y: 0.5 } }
                ],
                tutorial: [
                    { x: 0.5, y: 0.5 }, // Centro de la cara
                    { x: 0.3, y: 0.3 }, // Oreja izquierda
                    { x: 0.7, y: 0.3 }, // Oreja derecha
                    { x: 0.5, y: 0.6 }, // Hocico
                    { x: 0.4, y: 0.5 }, // Ojo izquierdo
                    { x: 0.6, y: 0.5 }  // Ojo derecho
                ]
            }
        ];
        
        this.currentPattern = null;
        this.timer = null;
        this.timeRemaining = 60;
        this.isTimerStarted = false;
        this.isInTutorial = false;
        this.currentTutorialStep = 0;
        this.currentCheckpoint = 0;
        this.score = 0;
        this.checkpointsReached = [];
        this.lastPosition = null;
        this.trajectoryPoints = [];
        this.similarityScore = 0;
        this.canvasEnabled = false;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.canSelectPattern = true;
        
        // Guardar referencia al canvas
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Deshabilitar el canvas al inicio
        this.canvas.style.pointerEvents = 'none';
        
        // Inicializar la guía de patrones
        this.patternGuide = new PatternGuide(canvas);
        
        // Inicializar el panel de información
        this.patternInfoPanel = document.querySelector('.pattern-info-panel');
        this.patternTitle = this.patternInfoPanel.querySelector('.pattern-title');
        this.patternDifficulty = this.patternInfoPanel.querySelector('.pattern-difficulty');
        this.patternDescription = this.patternInfoPanel.querySelector('.pattern-description');
        this.stepsList = this.patternInfoPanel.querySelector('.steps-list');
        this.patternImage = this.patternInfoPanel.querySelector('.pattern-image img');
        this.startPatternBtn = this.patternInfoPanel.querySelector('.start-pattern-btn');
        
        // Deshabilitar los botones de modo al inicio
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
        
        this.setupPatternButtons();
        this.setupTimer();
        this.setupValidationOverlay();
        this.setupSimilarityDisplay();
        this.setupExportButton();

        // Crear el canvas para los puntos de control
        this.controlPointsCanvas = document.createElement('canvas');
        this.controlPointsCanvas.width = this.canvas.width;
        this.controlPointsCanvas.height = this.canvas.height;
        this.controlPointsCanvas.style.position = 'absolute';
        this.controlPointsCanvas.style.top = '0';
        this.controlPointsCanvas.style.left = '0';
        this.controlPointsCanvas.style.pointerEvents = 'none';
        this.canvas.parentElement.appendChild(this.controlPointsCanvas);

        // Inicializar elementos del tutorial
        this.tutorialOverlay = document.createElement('div');
        this.tutorialOverlay.className = 'tutorial-overlay';
        this.tutorialOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none;
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(this.tutorialOverlay);
    }

    setupPatternButtons() {
        const patternButtons = document.querySelectorAll('.pattern-nav-btn');
        console.log('Botones de patrón encontrados:', patternButtons.length);
        
        patternButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('Botón de patrón clickeado');
                
                // Remover la clase active de todos los botones
                patternButtons.forEach(btn => btn.classList.remove('active'));
                // Agregar la clase active al botón clickeado
                button.classList.add('active');
                
                const patternId = button.getAttribute('data-pattern');
                console.log('ID del patrón seleccionado:', patternId);
                
                // Intentar reproducir sonido de selección
                try {
                    const audio = new Audio('assets/sounds/select.mp3');
                    audio.volume = 0.3;
                    audio.play().catch(error => {
                        console.log('No se pudo reproducir el sonido:', error);
                    });
                } catch (error) {
                    console.log('Error al cargar el sonido:', error);
                }
                
                // Deshabilitar los botones de modo
                const modeButtons = document.querySelectorAll('.mode-btn');
                modeButtons.forEach(btn => {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                });
                
                // Mostrar el panel de información con una animación suave
                this.selectPattern(patternId);
            });
        });
    }

    setupTimer() {
        // Crear el contenedor del temporizador si no existe
        if (!document.getElementById('timer-container')) {
            const timerContainer = document.createElement('div');
            timerContainer.id = 'timer-container';
            timerContainer.className = 'timer-container hidden';
            
            // Agregar icono de café
            const coffeeIcon = document.createElement('span');
            coffeeIcon.innerHTML = '☕';
            coffeeIcon.style.fontSize = '0.9em';
            timerContainer.appendChild(coffeeIcon);
            
            this.timerDisplay = document.createElement('div');
            this.timerDisplay.id = 'timer-display';
            this.timerDisplay.textContent = '3';
            timerContainer.appendChild(this.timerDisplay);
            
            document.body.appendChild(timerContainer);
            this.timerContainer = timerContainer;
        } else {
            this.timerContainer = document.getElementById('timer-container');
            this.timerDisplay = document.getElementById('timer-display');
        }
    }

    setupUI() {
        // Crear el contenedor principal
        const gameContainer = document.createElement('div');
        gameContainer.id = 'game-container';
        gameContainer.style.cssText = `
            position: fixed;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.8);
            padding: 20px;
            border-radius: 10px;
            color: white;
            width: 280px;
        `;

        // Título
        const title = document.createElement('h2');
        title.textContent = 'Patrones de Latte Art';
        title.style.cssText = `
            margin: 0 0 15px 0;
            font-size: 1.2em;
            text-align: center;
        `;

        // Contenedor de patrones
        const patternsContainer = document.createElement('div');
        patternsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 15px;
        `;

        // Crear botones para cada patrón
        this.patterns.forEach(pattern => {
            const patternButton = document.createElement('button');
            patternButton.className = 'pattern-button';
            patternButton.style.cssText = `
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.3);
                padding: 10px;
                border-radius: 5px;
                color: white;
                cursor: pointer;
                text-align: left;
                transition: all 0.3s ease;
            `;
            
            patternButton.innerHTML = `
                <strong>${pattern.name}</strong>
                <br>
                <small style="opacity: 0.8">Dificultad: ${pattern.difficulty}</small>
            `;

            patternButton.addEventListener('mouseover', () => {
                patternButton.style.background = 'rgba(255,255,255,0.2)';
            });

            patternButton.addEventListener('mouseout', () => {
                patternButton.style.background = 'rgba(255,255,255,0.1)';
            });

            patternButton.addEventListener('click', () => {
                this.selectPattern(pattern.id);
                // Resaltar el botón seleccionado
                document.querySelectorAll('.pattern-button').forEach(btn => {
                    btn.style.border = '1px solid rgba(255,255,255,0.3)';
                });
                patternButton.style.border = '1px solid rgba(255,255,255,0.8)';
            });

            patternsContainer.appendChild(patternButton);
        });

        // Información del patrón seleccionado
        this.patternInfo = document.createElement('div');
        this.patternInfo.style.cssText = `
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.2);
            display: none;
        `;

        // Similarity display
        this.similarityDisplay = document.createElement('div');
        this.similarityDisplay.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 1.2em;
            display: none;
        `;
        document.body.appendChild(this.similarityDisplay);

        // Ensamblar todo
        gameContainer.appendChild(title);
        gameContainer.appendChild(patternsContainer);
        gameContainer.appendChild(this.patternInfo);
        document.body.appendChild(gameContainer);
    }

    clearCanvas() {
        // Guardar el estado actual
        this.ctx.save();
        
        // Resetear la matriz de transformación
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Limpiar todo el canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Rellenar con color blanco
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Restaurar el estado anterior
        this.ctx.restore();
        
        // Reiniciar variables de dibujo
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.checkpointsReached = [];
        this.similarityScore = 0;
    }

    selectPattern(patternId) {
        // Verificar si se puede seleccionar un patrón
        if (!this.canSelectPattern) {
            console.log('No se puede seleccionar un patrón mientras el juego está activo');
            return;
        }

        console.log('ID del patrón seleccionado:', patternId);
        
        // Encontrar el patrón seleccionado
        const pattern = this.patterns.find(p => p.id === patternId);
        if (!pattern) {
            console.error('Patrón no encontrado:', patternId);
            return;
        }
        
        console.log('Seleccionando patrón:', pattern.name);
        
        // Detener el juego actual si está activo
        if (this.isGameActive || this.timerInterval) {
            console.log('Deteniendo juego actual...');
            this.stopCurrentGame();
        }
        
        // Limpiar el canvas
        console.log('Limpiando canvas...');
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reinicializar la simulación de fluidos
        if (typeof init === 'function') {
            console.log('Reinicializando simulación de fluidos...');
            init();
        }
        
        // Deshabilitar el canvas temporalmente
        this.canvasEnabled = false;
        this.canvas.style.pointerEvents = 'none';
        console.log('Canvas deshabilitado temporalmente');
        
        // Actualizar el patrón actual
        this.currentPattern = pattern;
        
        // Ocultar la imagen del panel de información
        this.patternImage.style.display = 'none';
        
        // Usar el sistema de guía de patrones
        this.patternGuide.setPattern(pattern);
        
        // Verificar que el panel existe
        console.log('Panel de información:', this.patternInfoPanel);
        
        // Actualizar el panel de información
        this.patternTitle.textContent = pattern.name;
        this.patternDifficulty.textContent = pattern.difficulty;
        this.patternDescription.textContent = pattern.description;
        
        // Limpiar y llenar la lista de pasos
        this.stepsList.innerHTML = '';
        pattern.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            this.stepsList.appendChild(li);
        });
        
        // Mostrar el panel con una animación suave
        console.log('Mostrando panel de información');
        this.patternInfoPanel.classList.remove('hidden');
        this.patternInfoPanel.style.display = 'block';
        this.patternInfoPanel.style.opacity = '0';
        
        // Forzar un reflow
        this.patternInfoPanel.offsetHeight;
        
        // Agregar la clase visible y establecer la opacidad
        this.patternInfoPanel.classList.add('visible');
        this.patternInfoPanel.style.opacity = '1';
        
        console.log('Panel de información mostrado');

        // Habilitar el botón de comenzar
        this.startPatternBtn.disabled = false;
        this.startPatternBtn.style.opacity = '1';
        this.startPatternBtn.style.cursor = 'pointer';
        
        // Configurar el botón de comenzar
        this.startPatternBtn.onclick = () => {
            console.log('Botón comenzar presionado');
            // Limpiar la guía cuando se inicia el patrón
            this.patternGuide.clearGuide();
            this.startPattern();
        };
    }

    startPattern() {
        console.log('Iniciando patrón...');
        
        // Deshabilitar la selección de patrones
        this.canSelectPattern = false;
        const patternButtons = document.querySelectorAll('.pattern-nav-btn');
        patternButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        });
        
        // Ocultar el panel de información
        console.log('Ocultando panel de información');
        this.patternInfoPanel.style.opacity = '0';
        setTimeout(() => {
            this.patternInfoPanel.classList.remove('visible');
            this.patternInfoPanel.classList.add('hidden');
            this.patternInfoPanel.style.display = 'none';
            console.log('Panel de información oculto');
        }, 300);
        
        // Habilitar el canvas
        this.canvasEnabled = true;
        this.canvas.style.pointerEvents = 'auto';
        this.isGameActive = true;
        console.log('Canvas habilitado, canvasEnabled:', this.canvasEnabled);
        
        // Habilitar los botones de modo
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
        
        // Iniciar el tutorial y mostrar la guía
        this.startTutorial();
        this.patternGuide.setPattern(this.currentPattern);
        
        // Iniciar el temporizador
        console.log('Iniciando temporizador...');
        this.startTimer();
    }

    stopCurrentGame() {
        console.log('Deteniendo juego actual');
        
        // Habilitar la selección de patrones nuevamente
        this.canSelectPattern = true;
        const patternButtons = document.querySelectorAll('.pattern-nav-btn');
        patternButtons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        });
        
        // Detener el temporizador
        if (this.timerInterval) {
            console.log('Deteniendo temporizador...');
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.timeRemaining = 10; // Resetear el tiempo
        }
        
        // Eliminar el temporizador si existe
        if (this.timerContainer && this.timerContainer.parentNode) {
            console.log('Eliminando contenedor del temporizador...');
            this.timerContainer.parentNode.removeChild(this.timerContainer);
            this.timerContainer = null;
            this.timerDisplay = null;
        }
        
        // Limpiar el canvas
        console.log('Limpiando canvas...');
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reiniciar variables
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.checkpointsReached = [];
        this.similarityScore = 0;
        
        // Ocultar el botón de exportar
        const exportButton = document.getElementById('exportButton');
        if (exportButton) {
            exportButton.style.display = 'none';
        }

        // Ocultar el análisis si está visible
        const analysisOverlay = document.querySelector('.analysis-overlay');
        if (analysisOverlay) {
            analysisOverlay.style.display = 'none';
        }
        
        // Deshabilitar los botones de modo
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    }

    startTimer() {
        console.log('Iniciando temporizador');
        
        // Reiniciar el tiempo a 10 segundos
        this.timeRemaining = 10;
        
        // Asegurar que el temporizador sea visible
        if (this.timerContainer) {
            this.timerContainer.style.display = 'flex';
            this.timerContainer.classList.remove('hidden', 'warning', 'success');
        }
        
        // Actualizar la visualización inicial
        if (this.timerDisplay) {
            this.timerDisplay.textContent = this.timeRemaining;
            console.log('Tiempo inicial:', this.timeRemaining);
        }
        
        // Limpiar cualquier intervalo existente
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Iniciar el temporizador
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            console.log('Tiempo restante:', this.timeRemaining);
            
            if (this.timerDisplay) {
                this.timerDisplay.textContent = this.timeRemaining;
                
                // Cambiar color cuando quede poco tiempo
                if (this.timeRemaining <= 3) {
                    this.timerContainer.classList.add('warning');
                } else {
                    this.timerContainer.classList.remove('warning');
                }
            }
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                if (this.timerDisplay) {
                    this.timerDisplay.textContent = '¡Listo!';
                }
                if (this.timerContainer) {
                    this.timerContainer.classList.remove('warning');
                    this.timerContainer.classList.add('success');
                    this.timerContainer.classList.add('hidden');
                }
                
                // Habilitar los botones de patrones
                this.canSelectPattern = true;
                const patternButtons = document.querySelectorAll('.pattern-nav-btn');
                patternButtons.forEach(button => {
                    button.disabled = false;
                    button.style.opacity = '1';
                    button.style.cursor = 'pointer';
                });
                
                this.endTime();
            }
        }, 1000);
    }

    endTime() {
        // Detener el temporizador
        this.stopTimer();
        
        // Deshabilitar la interacción con el canvas
        this.canvasEnabled = false;
        this.canvas.style.pointerEvents = 'none';
        
        // Detener cualquier interacción fluida activa
        if (window.fluidInteraction) {
            window.fluidInteraction.disableInteraction();
        }
        
        // Deshabilitar los botones de modo
        document.getElementById('pouringMode').disabled = true;
        document.getElementById('stirringMode').disabled = true;
        document.getElementById('suctionMode').disabled = true;
        
        // Mostrar el botón de exportación
        document.getElementById('exportButton').style.display = 'block';
        
        // Obtener el canvas y calcular la similitud
        const dataURL = this.canvas.toDataURL('image/jpeg', 0.8);
        const similarityScore = this.patternGuide.compareWithGuide(this.canvas);
        
        // Crear overlay para mostrar los resultados
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            z-index: 2000;
            min-width: 300px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        `;
        
        // Determinar el mensaje y color según la similitud
        let message, color;
        if (similarityScore > 80) {
            message = "¡Excelente trabajo!";
            color = "#4CAF50";
        } else if (similarityScore > 50) {
            message = "¡Buen intento!";
            color = "#FFC107";
        } else {
            message = "Sigue practicando";
            color = "#FF4444";
        }
        
        overlay.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: ${color};">${message}</h2>
            <div style="margin-bottom: 20px;">
                <p style="margin: 10px 0; font-size: 1.1em;">Similitud con el patrón: ${Math.round(similarityScore)}%</p>
                <div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">
                    <div>
                        <p style="margin: 0 0 10px 0;">Tu dibujo:</p>
                        <img src="${dataURL}" style="max-width: 200px; border-radius: 8px;">
                    </div>
                    <div>
                        <p style="margin: 0 0 10px 0;">Patrón original:</p>
                        <img src="${this.currentPattern.imageUrl}" style="max-width: 200px; border-radius: 8px;">
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="downloadImage" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    font-size: 1.1em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Descargar Imagen</button>
                <button id="closeOverlay" style="
                    background: #666;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    font-size: 1.1em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Cerrar</button>
            </div>
        `;
        
        document.body.appendChild(overlay);

        // Agregar evento para el botón de cerrar
        document.getElementById('closeOverlay').addEventListener('click', () => {
            overlay.remove();
            // Limpiar el canvas para el siguiente patrón
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        });

        // Agregar evento para el botón de descargar
        document.getElementById('downloadImage').addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'mi-dibujo.jpg';
            link.href = dataURL;
            link.click();
        });
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.isTimerStarted = false;
        if (this.timerContainer) {
            this.timerContainer.classList.add('hidden');
        }
    }

    startTutorial() {
        console.log('Iniciando tutorial...');
        
        // Configurar el tutorial con driver.js
        const driver = window.driver;
        if (!driver) {
            console.error('Driver.js no está disponible');
            return;
        }
        
        const driverObj = driver.driver;
        const steps = [
            {
                element: '#myCanvas',
                popover: {
                    title: '¡Bienvenido al Tutorial!',
                    description: 'Aquí es donde dibujarás tu patrón de latte art.',
                    position: 'center'
                }
            },
            {
                element: '.mode-selector',
                popover: {
                    title: 'Modos de Interacción',
                    description: 'Elige entre verter leche, revolver o succionar el patrón.',
                    position: 'bottom'
                }
            }
        ];
        
        const driverInstance = driverObj({
            showProgress: true,
            steps: steps,
            animate: true,
            smoothScroll: true,
            allowClose: true,
            stageBackground: 'transparent',
            overlayColor: 'transparent'
        });
        
        driverInstance.drive();
    }

    showTutorialStep() {
        if (!this.isInTutorial || !this.currentPattern) return;

        const step = this.currentPattern.tutorial[this.currentTutorialStep];
        const canvas = document.getElementById('myCanvas');
        const rect = canvas.getBoundingClientRect();

        // Posicionar el hint relativo al canvas
        const x = rect.left + (step.x * rect.width);
        const y = rect.top + (step.y * rect.height);

        this.tutorialHint.style.left = `${x}px`;
        this.tutorialHint.style.top = `${y}px`;
        this.tutorialHint.textContent = step.instruction;

        // Agregar punto de referencia visual
        this.tutorialHint.style.transform = 'translate(-50%, -50%)';
        this.tutorialHint.style.boxShadow = '0 0 0 4px rgba(255,255,255,0.5)';
    }

    nextTutorialStep() {
        if (!this.isInTutorial || !this.currentPattern) return;

        this.currentTutorialStep++;
        if (this.currentTutorialStep >= this.currentPattern.tutorial.length) {
            this.endTutorial();
        } else {
            this.showTutorialStep();
        }
    }

    endTutorial() {
        this.isInTutorial = false;
        this.tutorialOverlay.style.display = 'none';
    }

    resetPattern() {
        console.log('Reiniciando patrón');
        this.resetGame();
    }

    resetGame() {
        console.log('Reiniciando juego');
        
        // Limpiar el canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reiniciar variables
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.checkpointsReached = [];
        this.similarityScore = 0;
        this.isGameActive = true;
        this.canvasEnabled = true;
        this.canvas.style.pointerEvents = 'auto';
        
        // Ocultar el botón de exportar
        const exportButton = document.getElementById('exportButton');
        if (exportButton) {
            exportButton.style.display = 'none';
        }
        
        // Si no existe el temporizador, crearlo
        if (!this.timerContainer) {
            this.timerContainer = document.createElement('div');
            this.timerContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #8B4513 0%, #654321 100%);
                padding: 15px 25px;
                border-radius: 10px;
                color: #FFE4C4;
                font-family: 'Arial', sans-serif;
                font-size: 24px;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                border: 2px solid #DAA520;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: all 0.3s ease;
            `;
            
            // Agregar icono de café
            const coffeeIcon = document.createElement('span');
            coffeeIcon.innerHTML = '☕';
            coffeeIcon.style.fontSize = '24px';
            this.timerContainer.appendChild(coffeeIcon);
            
            // Crear display del temporizador
            this.timerDisplay = document.createElement('span');
            this.timerDisplay.textContent = '10';
            this.timerContainer.appendChild(this.timerDisplay);
            
            // Agregar al documento
            document.body.appendChild(this.timerContainer);
        }
        
        // Iniciar el temporizador
        this.startTimer();
        
        // Reiniciar el patrón actual
        if (this.currentPattern) {
            this.loadPattern(this.currentPattern);
        }
    }

    getCurrentPattern() {
        return this.currentPattern;
    }

    isInTutorialMode() {
        return this.isInTutorial;
    }

    getTutorialStep() {
        if (!this.isInTutorial || !this.currentPattern) return null;
        return this.currentPattern.tutorial[this.currentTutorialStep];
    }

    provideFeedback(mouseX, mouseY) {
        if (!this.isInTutorial || !this.currentPattern) return;

        const currentStep = this.currentPattern.tutorial[this.currentTutorialStep];
        const canvas = document.getElementById('myCanvas');
        const rect = canvas.getBoundingClientRect();

        // Convertir coordenadas del mouse a relativas al canvas
        const relativeX = (mouseX - rect.left) / rect.width;
        const relativeY = (mouseY - rect.top) / rect.height;

        // Calcular distancia al punto objetivo
        const distance = Math.sqrt(
            Math.pow(relativeX - currentStep.x, 2) + 
            Math.pow(relativeY - currentStep.y, 2)
        );

        // Si está lo suficientemente cerca del punto objetivo
        if (distance < 0.1) {
            this.nextTutorialStep();
        }
    }

    setupValidationOverlay() {
        // Crear overlay para feedback
        this.validationOverlay = document.createElement('div');
        this.validationOverlay.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 1.2em;
            display: none;
            z-index: 1000;
        `;
        document.body.appendChild(this.validationOverlay);

        // Crear indicador de progreso
        this.progressIndicator = document.createElement('div');
        this.progressIndicator.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 1em;
            display: none;
            z-index: 1000;
        `;
        document.body.appendChild(this.progressIndicator);
    }

    setupSimilarityDisplay() {
        this.similarityDisplay = document.createElement('div');
        this.similarityDisplay.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 1.2em;
            display: none;
        `;
        document.body.appendChild(this.similarityDisplay);
    }

    updateSimilarity() {
        const canvas = document.getElementById('myCanvas');
        this.similarityScore = this.patternGuide.compareWithGuide(canvas);
        
        if (this.similarityDisplay) {
            this.similarityDisplay.style.display = 'block';
            this.similarityDisplay.textContent = `Similitud: ${Math.round(this.similarityScore)}%`;
            
            // Cambiar color según la similitud
            if (this.similarityScore > 80) {
                this.similarityDisplay.style.color = '#4CAF50';
                this.showFeedback("¡Excelente similitud!", 'success');
            } else if (this.similarityScore > 50) {
                this.similarityDisplay.style.color = '#FFC107';
                this.showFeedback("Buen intento, sigue practicando", 'info');
            } else {
                this.similarityDisplay.style.color = 'white';
                this.showFeedback("Intenta seguir más de cerca el patrón", 'info');
            }
        }
    }

    handleInteraction(x, y) {
        // Guardar la posición para el tracking
        const currentPosition = { x, y };
        this.trajectoryPoints.push(currentPosition);

        // Validar checkpoints si hay un patrón seleccionado
        if (this.currentPattern && !this.isInTutorial) {
            this.validateCheckpoint(x, y);
            // Actualizar la similitud cada vez que el usuario interactúa
            this.updateSimilarity();
        }

        // Procesar feedback del tutorial si está activo
        if (this.isInTutorial) {
            this.provideFeedback(x, y);
        }

        this.lastPosition = currentPosition;
    }

    validateCheckpoint(x, y) {
        if (!this.currentPattern || this.currentCheckpoint >= this.currentPattern.checkpoints.length) return;

        const checkpoint = this.currentPattern.checkpoints[this.currentCheckpoint];
        const distance = Math.sqrt(
            Math.pow(x - checkpoint.x, 2) + 
            Math.pow(y - checkpoint.y, 2)
        );

        // Mostrar indicador visual del checkpoint actual
        this.showCheckpointIndicator(checkpoint);

        if (distance < checkpoint.radius) {
            // Checkpoint alcanzado
            if (!this.checkpointsReached.includes(this.currentCheckpoint)) {
                this.checkpointsReached.push(this.currentCheckpoint);
                this.score += 25; // 25 puntos por checkpoint
                this.showFeedback(checkpoint.message, 'success');
                this.updateProgress();
                this.currentCheckpoint++;

                // Si es el último checkpoint
                if (this.currentCheckpoint === this.currentPattern.checkpoints.length) {
                    this.patternCompleted();
                }
            }
        } else if (distance < checkpoint.radius * 2) {
            // Está cerca pero no lo suficiente
            this.showFeedback("¡Casi! Ajusta un poco más", 'info');
        }
    }

    showCheckpointIndicator(checkpoint) {
        // Crear o actualizar el indicador visual del checkpoint
        if (!this.checkpointIndicator) {
            this.checkpointIndicator = document.createElement('div');
            this.checkpointIndicator.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid rgba(255,255,255,0.8);
                pointer-events: none;
                z-index: 1000;
                transform: translate(-50%, -50%);
                transition: all 0.3s ease;
                display: none;
            `;
            document.body.appendChild(this.checkpointIndicator);
        }

        const canvas = document.getElementById('myCanvas');
        const rect = canvas.getBoundingClientRect();
        
        // Convertir coordenadas relativas a píxeles
        const pixelX = rect.left + (checkpoint.x * rect.width);
        const pixelY = rect.top + (checkpoint.y * rect.height);

        this.checkpointIndicator.style.left = `${pixelX}px`;
        this.checkpointIndicator.style.top = `${pixelY}px`;
        this.checkpointIndicator.style.display = 'block';
    }

    showFeedback(message, type = 'info') {
        this.validationOverlay.textContent = message;
        this.validationOverlay.style.display = 'block';
        this.validationOverlay.style.backgroundColor = type === 'success' ? 'rgba(0,128,0,0.8)' : 'rgba(0,0,0,0.8)';
        
        setTimeout(() => {
            this.validationOverlay.style.display = 'none';
        }, 2000);
    }

    updateProgress() {
        const total = this.currentPattern.checkpoints.length;
        const completed = this.checkpointsReached.length;
        this.progressIndicator.textContent = `Progreso: ${completed}/${total} puntos de control`;
        this.progressIndicator.style.display = 'block';
    }

    patternCompleted() {
        // Calcular puntuación final incluyendo la similitud
        const timeBonus = Math.max(0, this.timeRemaining);
        const similarityBonus = Math.round(this.similarityScore);
        const finalScore = this.score + timeBonus + similarityBonus;

        // Mostrar resultado final
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            z-index: 2000;
            min-width: 300px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        `;
        
        overlay.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #4CAF50;">¡Patrón Completado!</h2>
            <div style="margin-bottom: 20px;">
                <p style="margin: 10px 0; font-size: 1.1em;">Puntuación Base: ${this.score}</p>
                <p style="margin: 10px 0; font-size: 1.1em;">Bonus por Tiempo: +${timeBonus}</p>
                <p style="margin: 10px 0; font-size: 1.1em;">Bonus por Similitud: +${similarityBonus}</p>
                <p style="margin: 15px 0; font-size: 1.3em; color: #4CAF50;">Puntuación Total: ${finalScore}</p>
                <p style="margin: 10px 0; font-size: 1.1em;">Similitud con el Patrón: ${Math.round(this.similarityScore)}%</p>
            </div>
            <button onclick="this.parentElement.remove(); location.reload();" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 8px;
                font-size: 1.1em;
                cursor: pointer;
                transition: all 0.3s ease;
            ">Intentar Otro Patrón</button>
        `;
        
        document.body.appendChild(overlay);
        this.stopTimer();
    }

    setupExportButton() {
        const exportButton = document.getElementById('exportButton');
        exportButton.addEventListener('click', () => {
            const canvas = document.getElementById('myCanvas');
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            
            // Calcular la similitud antes de exportar
            const similarityScore = this.patternGuide.compareWithGuide(canvas);
            
            // Crear un overlay para mostrar los resultados
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                z-index: 2000;
                min-width: 300px;
                box-shadow: 0 0 20px rgba(0,0,0,0.5);
            `;
            
            // Determinar el mensaje y color según la similitud
            let message, color;
            if (similarityScore > 80) {
                message = "¡Excelente trabajo!";
                color = "#4CAF50";
            } else if (similarityScore > 50) {
                message = "¡Buen intento!";
                color = "#FFC107";
            } else {
                message = "Sigue practicando";
                color = "#FF4444";
            }
            
            overlay.innerHTML = `
                <h2 style="margin: 0 0 20px 0; color: ${color};">${message}</h2>
                <div style="margin-bottom: 20px;">
                    <p style="margin: 10px 0; font-size: 1.1em;">Similitud con el patrón: ${Math.round(similarityScore)}%</p>
                    <div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">
                        <div>
                            <p style="margin: 0 0 10px 0;">Tu dibujo:</p>
                            <img src="${dataURL}" style="max-width: 200px; border-radius: 8px;">
                        </div>
                        <div>
                            <p style="margin: 0 0 10px 0;">Patrón original:</p>
                            <img src="${this.currentPattern.imageUrl}" style="max-width: 200px; border-radius: 8px;">
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="downloadImage" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 8px;
                        font-size: 1.1em;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">Descargar Imagen</button>
                    <button id="closeOverlay" style="
                        background: #666;
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 8px;
                        font-size: 1.1em;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">Cerrar</button>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Agregar eventos a los botones
            document.getElementById('downloadImage').addEventListener('click', () => {
                const link = document.createElement('a');
                link.download = 'latte-art-' + new Date().toISOString().slice(0, 10) + '.jpg';
                link.href = dataURL;
                link.click();
            });
            
            document.getElementById('closeOverlay').addEventListener('click', () => {
                document.body.removeChild(overlay);
            });
        });
    }

    validatePattern() {
        console.log('Validando patrón');
        if (!this.currentPattern || this.trajectoryPoints.length === 0) {
            console.log('No hay patrón o trayectoria para validar');
            return;
        }

        // Calcular similitud
        const similarity = this.calculateSimilarity(this.trajectoryPoints, this.currentPattern.points);
        this.similarityScore = similarity;

        // Actualizar display de similitud
        const similarityDisplay = document.querySelector('.similarity-display');
        if (similarityDisplay) {
            similarityDisplay.textContent = `Similitud: ${Math.round(similarity * 100)}%`;
        }

        // Mostrar resultado
        const validationOverlay = document.querySelector('.validation-overlay');
        if (validationOverlay) {
            validationOverlay.classList.remove('hidden');
            setTimeout(() => {
                validationOverlay.classList.add('visible');
            }, 10);
        }

        // Mostrar el botón de reiniciar
        if (this.restartButton) {
            this.restartButton.classList.remove('hidden');
        }

        // Ocultar resultado después de 3 segundos
        setTimeout(() => {
            if (validationOverlay) {
                validationOverlay.classList.remove('visible');
                setTimeout(() => {
                    validationOverlay.classList.add('hidden');
                }, 300);
            }
        }, 3000);
    }

    endGame() {
        console.log('Finalizando juego');
        this.isGameActive = false;
        this.canvasEnabled = false;
        this.canvas.style.pointerEvents = 'none';
        
        // Mostrar el botón de exportar
        const exportButton = document.getElementById('exportButton');
        if (exportButton) {
            exportButton.style.display = 'block';
        }
        
        // Mostrar el análisis
        this.showAnalysisPopup();
    }

    showAnalysisPopup() {
        console.log('Mostrando análisis');
        
        // Verificar que tenemos un patrón actual
        if (!this.currentPattern) {
            console.error('No hay patrón actual');
            return;
        }

        // Crear el panel de análisis
        const analysisPanel = document.createElement('div');
        analysisPanel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #2c3e50 0%, #1a1a1a 100%);
            padding: 30px;
            border-radius: 15px;
            color: white;
            z-index: 2000;
            width: 800px;
            box-shadow: 0 0 30px rgba(0,0,0,0.5);
            border: 2px solid rgba(255,255,255,0.1);
            font-family: 'Arial', sans-serif;
            transition: all 0.3s ease;
        `;

        // Calcular estadísticas
        const totalCheckpoints = this.currentPattern.checkpoints.length;
        const completedCheckpoints = this.checkpointsReached.length;
        const checkpointPercentage = (completedCheckpoints / totalCheckpoints) * 100;
        const similarityScore = Math.round(this.similarityScore);

        // Obtener las imágenes para comparación
        const originalImage = this.currentPattern.imageUrl;
        const userDrawing = this.canvas.toDataURL();

        // Crear el contenido del panel
        analysisPanel.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 25px;">
                <div style="text-align: center; position: relative;">
                    <h2 style="margin: 0; color: #fff; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Análisis</h2>
                    <div style="width: 50px; height: 2px; background: #3498db; margin: 12px auto;"></div>
                    <button id="closeAnalysis" style="
                        position: absolute;
                        top: 0;
                        right: 0;
                        background: none;
                        border: none;
                        color: #95a5a6;
                        font-size: 24px;
                        cursor: pointer;
                        padding: 5px;
                        transition: color 0.3s ease;
                        &:hover {
                            color: #fff;
                        }
                    ">×</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="
                        background: rgba(255,255,255,0.03);
                        padding: 20px;
                        border-radius: 12px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        border: 1px solid rgba(255,255,255,0.05);
                    ">
                        <h3 style="margin: 0 0 15px 0; color: #3498db; font-size: 18px; font-weight: 500;">Patrón Original</h3>
                        <img src="${originalImage}" style="
                            width: 100%;
                            border-radius: 8px;
                            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                        ">
                    </div>
                    
                    <div style="
                        background: rgba(255,255,255,0.03);
                        padding: 20px;
                        border-radius: 12px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        border: 1px solid rgba(255,255,255,0.05);
                    ">
                        <h3 style="margin: 0 0 15px 0; color: #3498db; font-size: 18px; font-weight: 500;">Tu Versión</h3>
                        <img src="${userDrawing}" style="
                            width: 100%;
                            border-radius: 8px;
                            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                        ">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="
                        background: rgba(255,255,255,0.03);
                        padding: 20px;
                        border-radius: 12px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        border: 1px solid rgba(255,255,255,0.05);
                    ">
                        <h3 style="margin: 0 0 15px 0; color: #3498db; font-size: 18px; font-weight: 500;">Similitud</h3>
                        <div style="
                            font-size: 42px;
                            text-align: center;
                            margin: 15px 0;
                            color: ${this.getSimilarityColor(similarityScore)};
                            font-weight: 300;
                        ">
                            ${similarityScore}%
                        </div>
                        <div style="
                            text-align: center;
                            color: #95a5a6;
                            font-size: 14px;
                            margin-top: 5px;
                            font-weight: 300;
                        ">
                            ${this.getSimilarityMessage(similarityScore)}
                        </div>
                    </div>

                    <div style="
                        background: rgba(255,255,255,0.03);
                        padding: 20px;
                        border-radius: 12px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        border: 1px solid rgba(255,255,255,0.05);
                    ">
                        <h3 style="margin: 0 0 15px 0; color: #3498db; font-size: 18px; font-weight: 500;">Puntos de Control</h3>
                        <div style="
                            font-size: 42px;
                            text-align: center;
                            margin: 15px 0;
                            color: ${this.getCheckpointColor(checkpointPercentage)};
                            font-weight: 300;
                        ">
                            ${completedCheckpoints}/${totalCheckpoints}
                        </div>
                        <div style="
                            text-align: center;
                            color: #95a5a6;
                            font-size: 14px;
                            margin-top: 5px;
                            font-weight: 300;
                        ">
                            ${this.getCheckpointMessage(checkpointPercentage)}
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: center; gap: 20px; margin-top: 10px;">
                    <button id="exportDrawing" style="
                        padding: 12px 30px;
                        border: none;
                        border-radius: 8px;
                        background: #3498db;
                        color: white;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-size: 16px;
                        font-weight: 500;
                        letter-spacing: 1px;
                        &:hover {
                            background: #2980b9;
                        }
                    ">Exportar Dibujo</button>
                </div>
            </div>
        `;

        // Agregar el panel al documento
        document.body.appendChild(analysisPanel);

        // Manejar eventos de los botones
        document.getElementById('exportDrawing').addEventListener('click', () => {
            this.exportDrawing();
        });

        document.getElementById('closeAnalysis').addEventListener('click', () => {
            document.body.removeChild(analysisPanel);
        });
    }

    getSimilarityColor(score) {
        if (score >= 80) return '#4CAF50';
        if (score >= 50) return '#FFC107';
        return '#FF5252';
    }

    getSimilarityMessage(score) {
        if (score >= 80) return '¡Excelente trabajo! 🎨';
        if (score >= 50) return '¡Buen intento! 💪';
        return '¡Sigue practicando! ✨';
    }

    getCheckpointColor(percentage) {
        if (percentage >= 80) return '#4CAF50';
        if (percentage >= 50) return '#FFC107';
        return '#FF5252';
    }

    getCheckpointMessage(percentage) {
        if (percentage >= 80) return '¡Completaste casi todos los puntos! 🎯';
        if (percentage >= 50) return '¡Más de la mitad completada! 🎯';
        return '¡Intenta completar más puntos! 🎯';
    }

    exportDrawing() {
        // Crear un enlace temporal para descargar el dibujo
        const link = document.createElement('a');
        link.download = 'mi-dibujo.png';
        link.href = this.canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    updateTimerDisplay() {
        if (this.timerDisplay) {
            this.timerDisplay.textContent = this.timeRemaining;
            
            // Cambiar color cuando quede poco tiempo
            if (this.timeRemaining <= 3) {
                this.timerContainer.classList.add('warning');
            } else {
                this.timerContainer.classList.remove('warning');
            }
        }
    }

    loadPattern(pattern) {
        console.log('Cargando patrón:', pattern.name);
        
        // Detener el juego actual
        this.stopCurrentGame();
        
        // Limpiar el canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reiniciar variables
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.checkpointsReached = [];
        this.similarityScore = 0;
        this.isGameActive = false;
        this.canvasEnabled = false;
        this.canvas.style.pointerEvents = 'none';
        
        this.currentPattern = pattern;
        
        // Cargar la imagen del patrón
        const patternImage = new Image();
        patternImage.onload = () => {
            // Calcular las dimensiones para mantener la proporción
            const maxWidth = this.canvas.width * 0.8;
            const maxHeight = this.canvas.height * 0.8;
            const scale = Math.min(maxWidth / patternImage.width, maxHeight / patternImage.height);
            
            this.patternWidth = patternImage.width * scale;
            this.patternHeight = patternImage.height * scale;
            
            // Calcular la posición centrada
            this.patternX = (this.canvas.width - this.patternWidth) / 2;
            this.patternY = (this.canvas.height - this.patternHeight) / 2;
            
            // Dibujar el patrón
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(patternImage, this.patternX, this.patternY, this.patternWidth, this.patternHeight);
            
            // Dibujar los puntos de control
            this.drawCheckpoints();
        };
        patternImage.src = pattern.imageUrl;
        
        // Actualizar el título
        const patternTitle = document.getElementById('patternTitle');
        if (patternTitle) {
            patternTitle.textContent = pattern.name;
        }
        
        // Mostrar el botón de comenzar
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.style.display = 'block';
        }
        
        // Ocultar el botón de exportar
        const exportButton = document.getElementById('exportButton');
        if (exportButton) {
            exportButton.style.display = 'none';
        }
    }

    showPatternInfo(pattern) {
        console.log('Mostrando información del patrón:', pattern.name);
        
        // Actualizar el panel de información
        this.patternTitle.textContent = pattern.name;
        this.patternDifficulty.textContent = pattern.difficulty;
        this.patternDescription.textContent = pattern.description;
        
        // Limpiar y llenar la lista de pasos
        this.stepsList.innerHTML = '';
        pattern.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            this.stepsList.appendChild(li);
        });
        
        // Actualizar la imagen
        this.patternImage.src = pattern.imageUrl;
        this.patternImage.alt = `Patrón ${pattern.name}`;
        
        // Mostrar el panel con una animación suave
        console.log('Mostrando panel de información');
        this.patternInfoPanel.classList.remove('hidden');
        this.patternInfoPanel.style.display = 'block';
        this.patternInfoPanel.style.opacity = '0';
        
        // Forzar un reflow
        this.patternInfoPanel.offsetHeight;
        
        // Agregar la clase visible y establecer la opacidad
        this.patternInfoPanel.classList.add('visible');
        this.patternInfoPanel.style.opacity = '1';
        
        console.log('Panel de información mostrado');
    }
}