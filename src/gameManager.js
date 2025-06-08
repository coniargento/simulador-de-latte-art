import { PatternGuide } from './patternGuide.js';

export class GameManager {
    constructor(canvas) {
        this.patterns = [
            {
                id: "heart",
                name: "Corazón Simple",
                difficulty: "Principiante",
                description: "Un corazón básico perfecto para principiantes",
                imageUrl: "assets/patterns/patron1-corazon.png",
                steps: [
                    "Vierte la leche en el centro hasta llenar 2/3 de la taza",
                    "Mueve suavemente de lado a lado para crear la base",
                    "Al final, atraviesa el diseño para crear la punta del corazón"
                ],
                checkpoints: [
                    { x: 0.5, y: 0.8, radius: 0.1, message: "¡Buen comienzo!" },
                    { x: 0.4, y: 0.6, radius: 0.1, message: "Forma el lado izquierdo" },
                    { x: 0.6, y: 0.6, radius: 0.1, message: "Forma el lado derecho" },
                    { x: 0.5, y: 0.3, radius: 0.1, message: "¡Perfecto, terminaste la punta!" }
                ],
                tutorial: {
                    initialPosition: { x: 0.5, y: 0.8 },
                    path: [
                        { x: 0.5, y: 0.7, instruction: "Comienza en el centro" },
                        { x: 0.4, y: 0.6, instruction: "Mueve a la izquierda" },
                        { x: 0.6, y: 0.5, instruction: "Luego a la derecha" },
                        { x: 0.5, y: 0.2, instruction: "Finaliza con el tallo" }
                    ]
                }
            },
            {
                id: "rosetta",
                name: "Roseta",
                difficulty: "Intermedio",
                description: "Una roseta clásica con múltiples capas",
                imageUrl: "assets/patterns/rosetta.jpg",
                steps: [
                    "Comienza con un vertido suave en el centro",
                    "Mueve la jarra de lado a lado creando capas",
                    "Finaliza con un movimiento rápido hacia adelante"
                ],
                checkpoints: [
                    { x: 0.5, y: 0.8, radius: 0.1, message: "¡Buen comienzo!" },
                    { x: 0.4, y: 0.7, radius: 0.1, message: "Primera capa" },
                    { x: 0.6, y: 0.6, radius: 0.1, message: "Segunda capa" },
                    { x: 0.5, y: 0.3, radius: 0.1, message: "¡Perfecto, terminaste el tallo!" }
                ],
                tutorial: {
                    initialPosition: { x: 0.5, y: 0.8 },
                    path: [
                        { x: 0.5, y: 0.7, instruction: "Comienza en el centro" },
                        { x: 0.4, y: 0.6, instruction: "Mueve a la izquierda" },
                        { x: 0.6, y: 0.5, instruction: "Luego a la derecha" },
                        { x: 0.4, y: 0.4, instruction: "Continúa el patrón" },
                        { x: 0.5, y: 0.2, instruction: "Finaliza con el tallo" }
                    ]
                }
            },
            {
                id: "swan",
                name: "Cisne",
                difficulty: "Avanzado",
                description: "Un elegante cisne con detalles finos",
                imageUrl: "assets/patterns/cisne.webp",
                steps: [
                    "Crea la base del cisne con un vertido suave",
                    "Forma el cuello con movimientos precisos",
                    "Añade los detalles finales del pico y las alas"
                ],
                checkpoints: [
                    { x: 0.5, y: 0.8, radius: 0.1, message: "¡Buen comienzo!" },
                    { x: 0.4, y: 0.6, radius: 0.1, message: "Forma el cuerpo" },
                    { x: 0.6, y: 0.5, radius: 0.1, message: "Crea las alas" },
                    { x: 0.7, y: 0.3, radius: 0.1, message: "¡Perfecto, terminaste el cuello!" }
                ],
                tutorial: {
                    initialPosition: { x: 0.5, y: 0.8 },
                    path: [
                        { x: 0.5, y: 0.6, instruction: "Comienza con la base" },
                        { x: 0.4, y: 0.5, instruction: "Forma el cuerpo" },
                        { x: 0.6, y: 0.4, instruction: "Crea las alas" },
                        { x: 0.7, y: 0.3, instruction: "Dibuja el cuello" },
                        { x: 0.8, y: 0.2, instruction: "Termina con la cabeza" }
                    ]
                }
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
        
        // Obtener referencia al botón de reiniciar y ocultarlo al inicio
        this.restartButton = document.getElementById('restartButton');
        if (this.restartButton) {
            this.restartButton.classList.add('hidden');
            // Configurar el evento click del botón de reiniciar
            this.restartButton.addEventListener('click', () => {
                console.log('Botón reiniciar presionado');
                this.clearCanvas();
                this.startTutorial();
                this.patternGuide.setPattern(this.currentPattern);
                // Asegurarnos de que el botón permanezca visible
                this.restartButton.classList.remove('hidden');
            });
        }
        
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
                
                const pattern = this.patterns.find(p => p.id === patternId);
                console.log('Patrón encontrado:', pattern);
                
                if (pattern) {
                    // Reproducir sonido de selección
                    const audio = new Audio('assets/sounds/select.mp3');
                    audio.volume = 0.3;
                    audio.play();
                    
                    // Deshabilitar los botones de modo
                    const modeButtons = document.querySelectorAll('.mode-btn');
                    modeButtons.forEach(btn => {
                        btn.disabled = true;
                        btn.style.opacity = '0.5';
                        btn.style.cursor = 'not-allowed';
                    });
                    
                    // Mostrar el panel de información con una animación suave
                    this.selectPattern(pattern);
                }
            });
        });
    }

    setupTimer() {
        // Timer container
        const timerContainer = document.createElement('div');
        timerContainer.id = 'timer-container';
        timerContainer.style.cssText = `
            position: fixed;
            right: 20px;
            top: 20px;
            background: rgba(0,0,0,0.8);
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-size: 2em;
            font-family: monospace;
            display: none;
            z-index: 1000;
            border: 2px solid rgba(255,255,255,0.3);
        `;
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.textContent = '01:00';
        timerContainer.appendChild(this.timerDisplay);
        document.body.appendChild(timerContainer);
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
                this.selectPattern(pattern);
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

        // Tutorial overlay
        this.tutorialOverlay = document.createElement('div');
        this.tutorialOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: none;
            z-index: 1000;
        `;

        this.tutorialHint = document.createElement('div');
        this.tutorialHint.style.cssText = `
            position: absolute;
            background: rgba(255,255,255,0.9);
            color: black;
            padding: 10px;
            border-radius: 5px;
            font-size: 14px;
            pointer-events: none;
            transition: all 0.3s ease;
        `;

        this.tutorialOverlay.appendChild(this.tutorialHint);
        document.body.appendChild(this.tutorialOverlay);

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
        // Limpiar el canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Limpiar la trayectoria
        this.trajectoryPoints = [];
        // Limpiar el último checkpoint
        this.currentCheckpoint = 0;
        // Limpiar los checkpoints alcanzados
        this.checkpointsReached = [];
        // Limpiar el último punto
        this.lastPosition = null;
        // Limpiar el puntaje de similitud
        this.similarityScore = 0;
        // Actualizar el display de similitud
        const similarityDisplay = document.querySelector('.similarity-display');
        if (similarityDisplay) {
            similarityDisplay.textContent = 'Similitud: 0%';
        }
    }

    selectPattern(pattern) {
        console.log('Seleccionando patrón:', pattern.name);
        
        // Deshabilitar el canvas
        this.canvasEnabled = false;
        this.canvas.style.pointerEvents = 'none';
        console.log('Canvas deshabilitado, canvasEnabled:', this.canvasEnabled);
        
        // Limpiar el canvas
        this.clearCanvas();
        
        // Actualizar el patrón actual
        this.currentPattern = pattern;
        
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

        // Habilitar el botón de comenzar
        this.startPatternBtn.disabled = false;
        this.startPatternBtn.style.opacity = '1';
        this.startPatternBtn.style.cursor = 'pointer';
        
        // Configurar el botón de comenzar
        this.startPatternBtn.onclick = () => {
            console.log('Botón comenzar presionado');
            
            // Habilitar el canvas inmediatamente
            this.canvasEnabled = true;
            this.canvas.style.pointerEvents = 'auto';
            console.log('Canvas habilitado, canvasEnabled:', this.canvasEnabled);
            
            // Mostrar el botón de reiniciar
            if (this.restartButton) {
                this.restartButton.classList.remove('hidden');
            }
            
            // Ocultar el panel de información
            console.log('Ocultando panel de información');
            this.patternInfoPanel.style.opacity = '0';
            setTimeout(() => {
                this.patternInfoPanel.classList.remove('visible');
                this.patternInfoPanel.classList.add('hidden');
                this.patternInfoPanel.style.display = 'none';
                console.log('Panel de información oculto');
            }, 300);
            
            // Habilitar los botones de modo
            const modeButtons = document.querySelectorAll('.mode-btn');
            modeButtons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            });
            
            // Iniciar el tutorial y mostrar la guía
            this.startTutorial();
            this.patternGuide.setPattern(pattern);
        };
    }

    startTimer() {
        // Asegurarse de que no haya un temporizador activo
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Mostrar el contenedor del temporizador
        const timerContainer = document.getElementById('timer-container');
        if (timerContainer) {
            timerContainer.style.display = 'block';
        }
        
        // Reiniciar el tiempo
        this.timeRemaining = 10;
        this.isTimerStarted = true;
        this.updateTimerDisplay();
        
        // Iniciar el nuevo temporizador
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.timer);
                this.timer = null;
                this.isTimerStarted = false;
                document.getElementById('exportButton').style.display = 'block';
                this.endTime();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isTimerStarted = false;
        document.getElementById('timer-container').style.display = 'none';
    }

    endTime() {
        // Detener el temporizador
        this.stopTimer();
        
        // Deshabilitar la interacción con el canvas
        const canvas = document.getElementById('myCanvas');
        canvas.style.pointerEvents = 'none';
        
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
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        const similarityScore = this.patternGuide.compareWithGuide(canvas);
        
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
        
        // Agregar eventos a los botones
        document.getElementById('downloadImage').addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'latte-art-' + new Date().toISOString().slice(0, 10) + '.jpg';
            link.href = dataURL;
            link.click();
        });
        
        document.getElementById('closeOverlay').addEventListener('click', () => {
            document.body.removeChild(overlay);
            // Habilitar la interacción con el canvas nuevamente
            canvas.style.pointerEvents = 'auto';
            // Habilitar los botones de modo
            document.getElementById('pouringMode').disabled = false;
            document.getElementById('stirringMode').disabled = false;
            document.getElementById('suctionMode').disabled = false;
            // Habilitar la interacción fluida
            if (window.fluidInteraction) {
                window.fluidInteraction.enableInteraction();
            }
        });
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Cambiar color cuando quede poco tiempo
        if (this.timeRemaining <= 10) {
            this.timerDisplay.style.color = '#ff4444';
        } else {
            this.timerDisplay.style.color = 'white';
        }
    }

    startTutorial() {
        if (!this.currentPattern) return;
        
        this.isInTutorial = true;
        this.currentTutorialStep = 0;
        this.tutorialOverlay.style.display = 'block';
        this.tutorialOverlay.style.pointerEvents = 'none'; // Permitir interacción con el canvas
        this.showTutorialStep();
    }

    showTutorialStep() {
        if (!this.isInTutorial || !this.currentPattern) return;

        const step = this.currentPattern.tutorial.path[this.currentTutorialStep];
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
        if (this.currentTutorialStep >= this.currentPattern.tutorial.path.length) {
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
        
        // Ocultar el botón de reiniciar
        if (this.restartButton) {
            this.restartButton.classList.add('hidden');
        }
        
        // Limpiar el canvas
        this.clearCanvas();
        
        // Reiniciar variables
        this.trajectoryPoints = [];
        this.currentCheckpoint = 0;
        this.checkpointsReached = [];
        this.lastPosition = null;
        this.similarityScore = 0;
        
        // Reiniciar el timer
        this.stopTimer();
        this.timeRemaining = 60;
        this.updateTimerDisplay();
        
        // Reiniciar el tutorial si está activo
        if (this.isInTutorial) {
            this.currentTutorialStep = 0;
            this.showTutorialStep();
        }
        
        // Habilitar el canvas
        this.canvasEnabled = true;
        this.canvas.style.pointerEvents = 'auto';
        
        // Iniciar el timer
        this.startTimer();
    }

    getCurrentPattern() {
        return this.currentPattern;
    }

    isInTutorialMode() {
        return this.isInTutorial;
    }

    getTutorialStep() {
        if (!this.isInTutorial || !this.currentPattern) return null;
        return this.currentPattern.tutorial.path[this.currentTutorialStep];
    }

    provideFeedback(mouseX, mouseY) {
        if (!this.isInTutorial || !this.currentPattern) return;

        const currentStep = this.currentPattern.tutorial.path[this.currentTutorialStep];
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
} 