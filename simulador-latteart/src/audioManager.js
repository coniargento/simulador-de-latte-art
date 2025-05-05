// audioManager.js
export class AudioManager {
    constructor() {
      this.sounds = {
        background: new Audio('assets/sounds/cafe-ambient.mp3'),
        pour: new Audio('assets/sounds/milk-pour.mp3'),
        stir: new Audio('assets/sounds/stirring.mp3'),
        suction: new Audio('assets/sounds/suction.mp3')
      };
  
      this.volume = 0.4;
      this.init();
    }
  
    init() {
      // Configuración inicial
      this.sounds.background.loop = true;
      this.sounds.background.volume = this.volume * 0.7; // Un poco más bajo que los efectos
      
      // Ajusta volumen de efectos
      Object.keys(this.sounds).forEach(key => {
        if (key !== 'background') {
          this.sounds[key].volume = this.volume;
        }
      });
  
      // Solución para autoplay en navegadores
      document.addEventListener('click', this.unlockAudio.bind(this), { once: true });
    }
  
    unlockAudio() {
      // Inicia el audio de fondo cuando el usuario interactúa por primera vez
      this.playBackground();
      this.createAudioControls();
    }
  
    playBackground() {
      this.sounds.background.play().catch(e => console.log("Autoplay bloqueado:", e));
    }
  
    playSound(soundName) {
      if (this.sounds[soundName]) {
        this.sounds[soundName].currentTime = 0; // Rebobina si ya está sonando
        this.sounds[soundName].play();
      }
    }
  
    setVolume(volume) {
      this.volume = volume;
      Object.values(this.sounds).forEach(sound => {
        sound.volume = sound === this.sounds.background ? volume * 0.7 : volume;
      });
    }
  
    createAudioControls() {
      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'audio-controls';
      controlsDiv.innerHTML = `
        <button id="audio-toggle">🔊 Sonido</button>
        <input type="range" id="audio-volume" min="0" max="1" step="0.1" value="${this.volume}">
      `;
      
      document.body.appendChild(controlsDiv);
  
      document.getElementById('audio-toggle').addEventListener('click', () => {
        this.sounds.background.paused ? this.playBackground() : this.sounds.background.pause();
      });
  
      document.getElementById('audio-volume').addEventListener('input', (e) => {
        this.setVolume(parseFloat(e.target.value));
      });
    }
  }