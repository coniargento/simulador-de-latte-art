export class AudioManager {
  constructor() {
    this.sounds = {};
    this.volume = 0.3;
    this.isMuted = false;
    this.audioContext = null;
    this.backgroundSource = null;
    this.gainNode = null;
    this.currentSound = null;
    this.init();
  }

  async init() {
    try {
      console.log('Iniciando AudioManager...');
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (!this.audioContext) {
        throw new Error('No se pudo crear el contexto de audio');
      }

      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.audioContext.destination);

      const soundUrls = {
        background: 'assets/sounds/cafe-ambiente.mp3',
        pour: 'assets/sounds/verterleche.wav',
        stir: 'assets/sounds/revolver.wav',
        suction: 'assets/sounds/succionarpatron.flac'
      };

      const possiblePaths = [
        '', // Try as is
        'src/', // Try with src/ prefix
        '/src/', // Try with absolute /src/ prefix
        '../' // Try going up one directory
      ];

      // Intentar cargar los sonidos uno por uno
      for (const [name, baseUrl] of Object.entries(soundUrls)) {
        let loaded = false;
        
        for (const prefix of possiblePaths) {
          if (loaded) break;
          
          const url = prefix + baseUrl;
          try {
            console.log(`Intentando cargar sonido: ${name} desde ${url}`);
            const response = await fetch(url);
            
            if (!response.ok) {
              console.log(`Ruta ${url} no funcionó, probando siguiente...`);
              continue;
            }
            
            const arrayBuffer = await response.arrayBuffer();
            console.log(`Buffer obtenido para ${name}, decodificando...`);
            this.sounds[name] = await this.audioContext.decodeAudioData(arrayBuffer);
            console.log(`Sonido ${name} cargado y decodificado correctamente desde ${url}`);
            loaded = true;
          } catch (error) {
            console.log(`Error intentando ${url}:`, error.message);
          }
        }

        if (!loaded) {
          console.error(`No se pudo cargar el sonido ${name} desde ninguna ruta intentada`);
        }
      }

      // Verificar qué sonidos se cargaron
      console.log('Sonidos cargados:', Object.keys(this.sounds));
      
      if (Object.keys(this.sounds).length === 0) {
        throw new Error('No se pudo cargar ningún sonido');
      }

      this.createControls();

      // Intentar reproducir el sonido de fondo si está disponible
      if (this.sounds.background) {
        console.log('Iniciando reproducción de sonido de fondo...');
        this.playBackground();
      } else {
        console.warn('Sonido de fondo no disponible');
      }

    } catch (error) {
      console.error('Error inicializando audio:', error);
      this.createFallback();
    }
  }

  playBackground() {
    if (this.backgroundSource) return;
    
    try {
      this.backgroundSource = this.audioContext.createBufferSource();
      this.backgroundSource.buffer = this.sounds.background;
      this.backgroundSource.loop = true;
      this.backgroundSource.connect(this.gainNode);
      this.backgroundSource.start(0);
      console.log('Sonido de fondo iniciado correctamente');
    } catch (error) {
      console.error('Error reproduciendo sonido de fondo:', error);
    }
  }

  stopBackground() {
    if (this.backgroundSource) {
      this.backgroundSource.stop();
      this.backgroundSource = null;
    }
  }

  playSound(name) {
    try {
      if (!this.audioContext || !this.sounds[name]) {
        return null;
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      if (this.currentSound) {
        try {
          this.currentSound.stop();
          this.currentSound.disconnect();
        } catch (e) {
          console.warn('Error deteniendo sonido actual:', e);
        }
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds[name];
      source.connect(this.gainNode);
      source.start(0);
      this.currentSound = source;
      return source;
    } catch (error) {
      console.error('Error reproduciendo sonido:', error);
      return null;
    }
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

    document.getElementById('bg-toggle').addEventListener('click', () => {
      if (this.backgroundSource) {
        this.stopBackground();
        document.getElementById('bg-toggle').innerHTML = '▶️ Café';
      } else {
        this.playBackground();
        document.getElementById('bg-toggle').innerHTML = '⏸️ Café';
      }
    });

    document.getElementById('mute-toggle').addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
      document.getElementById('mute-toggle').textContent = this.isMuted ? '🔇' : '🔊';
    });

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