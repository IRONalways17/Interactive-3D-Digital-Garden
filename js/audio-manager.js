class AudioManager {
    constructor() {
        this.sounds = {};
        this.audioContext = null;
        this.masterGain = null;
        this.initialized = false;
        this.muted = false;
        
        // Sound definitions with relative paths
        this.soundDefinitions = {
            ambientGarden: { url: 'sounds/ambient_garden.mp3', loop: true, volume: 0.3 },
            plantSeed: { url: 'sounds/plant_seed.mp3', loop: false, volume: 0.6 },
            waterPlants: { url: 'sounds/water_plants.mp3', loop: false, volume: 0.5 },
            sunlightAdd: { url: 'sounds/sunlight.mp3', loop: false, volume: 0.4 },
            plantGrow: { url: 'sounds/plant_grow.mp3', loop: false, volume: 0.5 },
            uiClick: { url: 'sounds/ui_click.mp3', loop: false, volume: 0.3 },
            mysteryPlantSpawn: { url: 'sounds/mystery_plant.mp3', loop: false, volume: 0.7 },
        };
    }
    
    init() {
        // Initialize only when user interacts to comply with autoplay policies
        if (this.initialized) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            try {
                // Create audio context
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Create master gain
                this.masterGain = this.audioContext.createGain();
                this.masterGain.gain.value = 1;
                this.masterGain.connect(this.audioContext.destination);
                
                // Load sounds
                const loadPromises = Object.keys(this.soundDefinitions).map(key => {
                    return this.loadSound(key, this.soundDefinitions[key]);
                });
                
                Promise.all(loadPromises).then(() => {
                    console.log('All sounds loaded successfully');
                    this.initialized = true;
                    
                    // Start ambient sounds
                    this.play('ambientGarden');
                    
                    resolve();
                }).catch(error => {
                    console.warn('Failed to load some sounds:', error);
                    // Continue anyway as this is not critical
                    this.initialized = true;
                    resolve();
                });
            } catch (error) {
                console.error('Audio initialization failed:', error);
                // Continue anyway as audio is not critical
                resolve();
            }
        });
    }
    
    loadSound(id, definition) {
        return new Promise((resolve, reject) => {
            // Skip if we're in an environment without audio support
            if (!this.audioContext) {
                resolve();
                return;
            }
            
            fetch(definition.url)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    this.sounds[id] = {
                        buffer: audioBuffer,
                        loop: !!definition.loop,
                        volume: definition.volume || 1,
                        source: null
                    };
                    resolve();
                })
                .catch(error => {
                    console.warn(`Failed to load sound ${id}:`, error);
                    reject(error);
                });
        });
    }
    
    play(id, options = {}) {
        // Skip if not initialized or muted
        if (!this.initialized || this.muted || !this.audioContext) return;
        
        const sound = this.sounds[id];
        if (!sound) return;
        
        // Stop previous playback if needed
        this.stop(id);
        
        // Create source
        const source = this.audioContext.createBufferSource();
        source.buffer = sound.buffer;
        source.loop = options.loop !== undefined ? options.loop : sound.loop;
        
        // Create gain node for this sound
        const gain = this.audioContext.createGain();
        gain.gain.value = options.volume !== undefined ? options.volume : sound.volume;
        
        // Connect nodes
        source.connect(gain);
        gain.connect(this.masterGain);
        
        // Start playback
        source.start(0);
        
        // Store source for later control
        sound.source = source;
        sound.gain = gain;
        
        // Return a control object
        return {
            stop: () => this.stop(id),
            setVolume: (volume) => {
                if (sound.gain) {
                    sound.gain.gain.value = volume;
                }
            }
        };
    }
    
    stop(id) {
        const sound = this.sounds[id];
        if (sound && sound.source) {
            try {
                sound.source.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
            sound.source = null;
        }
    }
    
    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
    
    toggleMute() {
        this.muted = !this.muted;
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : 1;
        }
        
        return this.muted;
    }
    
    playUISound(id = 'uiClick') {
        this.play(id, { volume: 0.2 });
    }
}

// Create global instance
window.audioManager = new AudioManager();