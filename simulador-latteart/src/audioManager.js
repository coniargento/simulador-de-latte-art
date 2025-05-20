export class AudioManager {
  constructor() {
    this.sounds = {};
    this.volume = 0.2; // Volumen inicial bajo (20%)
    this.isMuted = false;
    this.audioContext = null;
    this.backgroundSource = null;
    this.gainNode = null;
    this.init();
  }

  async init() {
    try {
      // 1. Crear contexto de audio
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.audioContext.destination);

      // 2. Cargar sonidos
      await this.loadSounds({
        background: 'https://cdn.freesound.org/previews/457/457250_7724336-lq.mp3', // Café verificado
        pour: 'https://assets.mixkit.co/active_storage/sfx/1244/1244-preview.mp3',
        stir: 'https://assets.mixkit.co/active_storage/sfx/1240/1240-preview.mp3',
        suction: 'https://assets.mixkit.co/active_storage/sfx/1257/1257-preview.mp3'
      });

      // 3. Iniciar música de fondo automáticamente (en loop)
      this.playBackground();
      this.createControls();

      // 4. Manejar desbloqueo en móviles
      document.addEventListener('click', this.unlockAudio.bind(this), { once: true });
      document.addEventListener('touchstart', this.unlockAudio.bind(this), { once: true });

    } catch (error) {
      console.error('Audio error:', error);
      this.createFallback();
    }
  }

  async loadSounds(soundSources) {
    for (const [name, url] of Object.entries(soundSources)) {
      try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        this.sounds[name] = await this.audioContext.decodeAudioData(buffer);
      } catch (error) {
        console.warn(`Failed to load ${name}:`, error);
        // Crear buffer vacío como fallback
        this.sounds[name] = this.audioContext.createBuffer(1, 1, 22050);
      }
    }
  }

  unlockAudio() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playBackground() {
    if (this.backgroundSource) return;
    
    this.backgroundSource = this.audioContext.createBufferSource();
    this.backgroundSource.buffer = this.sounds.background;
    this.backgroundSource.loop = true;
    this.backgroundSource.connect(this.gainNode);
    this.backgroundSource.start(0);
  }

  stopBackground() {
    if (this.backgroundSource) {
      this.backgroundSource.stop();
      this.backgroundSource = null;
    }
  }

  playSound(name) {
    if (this.isMuted || !this.sounds[name]) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name];
    source.connect(this.gainNode);
    source.start(0);
    return source;
  }

  createControls() {
    const controls = document.createElement('div');
    controls.id = 'audio-controls';
    controls.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0,0,0,0.7);
      padding: 8px;
      border-radius: 8px;
      color: white;
      display: flex;
      gap: 8px;
      align-items: center;
      z-index: 1000;
    `;

    controls.innerHTML = `
      <button id="bg-toggle" style="background:none; border:none; color:white; cursor:pointer">
        ⏸️ Café
      </button>
      <button id="mute-toggle" style="background:none; border:none; color:white; cursor:pointer">
        ${this.isMuted ? '🔇' : '🔊'}
      </button>
      <input type="range" id="volume-control" min="0" max="1" step="0.05" value="${this.volume}" 
             style="width:80px; cursor:pointer">
      <span id="volume-value" style="font-size:12px">${Math.round(this.volume * 100)}%</span>
    `;

    document.body.appendChild(controls);

    // Control de música de fondo
    document.getElementById('bg-toggle').addEventListener('click', () => {
      if (this.backgroundSource) {
        this.stopBackground();
        document.getElementById('bg-toggle').innerHTML = '▶️ Café';
      } else {
        this.playBackground();
        document.getElementById('bg-toggle').innerHTML = '⏸️ Café';
      }
    });

    // Control de mute
    document.getElementById('mute-toggle').addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
      document.getElementById('mute-toggle').textContent = this.isMuted ? '🔇' : '🔊';
    });

    // Control de volumen
    document.getElementById('volume-control').addEventListener('input', (e) => {
      this.volume = parseFloat(e.target.value);
      if (!this.isMuted) {
        this.gainNode.gain.value = this.volume;
      }
      document.getElementById('volume-value').textContent = `${Math.round(this.volume * 100)}%`;
    });
  }

  createFallback() {
    const warning = document.createElement('div');
    warning.textContent = 'Audio no disponible';
    warning.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      color: white;
      background: red;
      padding: 5px;
      border-radius: 5px;
      z-index: 1000;
    `;
    document.body.appendChild(warning);
  }
}