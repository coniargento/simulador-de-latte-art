import { PatternGuide } from './patternGuide.js';

export class GameManager {
    constructor() {
        this.patterns = [
            {
                id: 1,
                name: "Corazón Simple",
                difficulty: "Principiante",
                description: "LOL",
                imageUrl: "assets/patterns/heart.avif",
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
                id: 2,
                name: "Roseta Básica",
                difficulty: "Intermedio",
                description: "Una hermosa roseta de múltiples capas",
                imageUrl: "assets/patterns/rosetta.jpg",
                steps: [
                    "Comienza vertiendo en el centro para crear la base",
                    "Mueve de lado a lado mientras retrocedes",
                    "Finaliza atravesando para crear el tallo"
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
                id: 3,
                name: "Cisne",
                difficulty: "Avanzado",
                description: "Un elegante cisne con cuello curvo",
                imageUrl: "assets/patterns/cisne.webp",
                steps: [
                    "Crea la base con movimientos circulares",
                    "Forma el cuerpo con movimientos ondulantes",
                    "Termina con una curva para el cuello del cisne"
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
        
        // Inicializar la guía de patrones
        const canvas = document.getElementById('myCanvas');
        this.patternGuide = new PatternGuide(canvas);
        
        this.setupUI();
        this.setupTimer();
        this.setupValidationOverlay();
        this.setupSimilarityDisplay();
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

    selectPattern(pattern) {
        this.currentPattern = pattern;
        this.patternGuide.setPattern(pattern);
        this.patternInfo.style.display = 'block';
        
        this.patternInfo.innerHTML = `
            <h3 style="margin: 0 0 10px 0; font-size: 1.1em;">${pattern.name}</h3>
            <p style="margin: 0 0 10px 0; font-size: 0.9em; opacity: 0.8;">${pattern.description}</p>
            <div style="font-size: 0.9em;">
                <strong>Pasos:</strong>
                <ol style="margin: 5px 0 0 20px; padding: 0;">
                    ${pattern.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
            <div style="margin-top: 15px;">
                <button id="startTutorial" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Iniciar Tutorial</button>
            </div>
        `;

        document.getElementById('startTutorial').addEventListener('click', () => this.startTutorial());
    }

    startTimer() {
        if (this.timer) return; // No iniciar si ya está corriendo
        
        document.getElementById('timer-container').style.display = 'block';
        this.timeRemaining = 10;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.endTime();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        document.getElementById('timer-container').style.display = 'none';
    }

    endTime() {
        this.stopTimer();
        
        // Crear overlay de tiempo terminado
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        const message = document.createElement('div');
        message.style.cssText = `
            background: white;
            padding: 20px 40px;
            border-radius: 10px;
            text-align: center;
        `;
        message.innerHTML = `
            <h2 style="margin: 0 0 10px 0;">¡Tiempo Terminado!</h2>
            <p style="margin: 0 0 15px 0;">Has alcanzado el límite de 1 minuto.</p>
            <button id="closeTimeUp" style="
                background: #333;
                color: white;
                border: none;
                padding: 8px 20px;
                border-radius: 5px;
                cursor: pointer;
            ">Cerrar</button>
        `;
        
        overlay.appendChild(message);
        document.body.appendChild(overlay);
        
        document.getElementById('closeTimeUp').addEventListener('click', () => {
            document.body.removeChild(overlay);
            this.resetPattern();
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
        if (!this.currentPattern) return;
        
        this.stopTimer();
        this.isTimerStarted = false;
        
        if (this.isInTutorial) {
            this.endTutorial();
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
            } else if (this.similarityScore > 50) {
                this.similarityDisplay.style.color = '#FFC107';
            } else {
                this.similarityDisplay.style.color = '#white';
            }
        }
    }

    handleInteraction(x, y) {
        // Iniciar el temporizador con la primera interacción si no está activo
        if (!this.isTimerStarted && !this.timer) {
            this.isTimerStarted = true;
            this.startTimer();
        }

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
        }
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
        this.score += timeBonus + similarityBonus;

        // Mostrar resultado final
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 2000;
        `;
        
        overlay.innerHTML = `
            <h2>¡Patrón Completado!</h2>
            <p>Puntuación Base: ${this.score - timeBonus - similarityBonus}</p>
            <p>Bonus por Tiempo: ${timeBonus}</p>
            <p>Bonus por Similitud: ${similarityBonus}</p>
            <p>Puntuación Total: ${this.score}</p>
            <p>Similitud con el Patrón: ${Math.round(this.similarityScore)}%</p>
            <button onclick="this.parentElement.remove(); location.reload();" style="
                background: white;
                color: black;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                margin-top: 10px;
                cursor: pointer;
            ">Intentar Otro Patrón</button>
        `;
        
        document.body.appendChild(overlay);
        this.stopTimer();
    }
} 