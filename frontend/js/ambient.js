/**
 * Ambient Noise Module (Procedural) - Web Audio API
 * - White Noise
 * - Rain (synthetic approximation)
 * - Coffee Shop (synthetic approximation)
 *
 * No external audio files required.
 */

const DEFAULTS = {
    type: 'white', // white | rain | coffee | waves
    volume: 0.35,  // 0..1
    fadeMs: 250
};

/**
 * Shared audio engine instance (persists while page is open).
 * The UI window can be opened/closed without losing audio state.
 */
class AmbientEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.currentType = DEFAULTS.type;
        this.volume = DEFAULTS.volume;

        // Active nodes graph root
        this.sourceNodes = [];
        this._uiSubscribers = new Set();
    }

    subscribe(cb) {
        this._uiSubscribers.add(cb);
        cb(this.getState());
        return () => this._uiSubscribers.delete(cb);
    }

    _notify() {
        const state = this.getState();
        this._uiSubscribers.forEach(cb => {
            try { cb(state); } catch { /* ignore */ }
        });
    }

    getState() {
        return {
            isPlaying: this.isPlaying,
            type: this.currentType,
            volume: this.volume
        };
    }

    async _ensureContext() {
        if (this.ctx) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0;
        this.masterGain.connect(this.ctx.destination);
    }

    _clearGraph() {
        // Disconnect and drop all nodes except ctx/masterGain
        this.sourceNodes.forEach(n => {
            try { n.disconnect(); } catch { /* ignore */ }
        });
        this.sourceNodes = [];
    }

    _fadeTo(target, ms = DEFAULTS.fadeMs) {
        if (!this.masterGain || !this.ctx) return;
        const now = this.ctx.currentTime;
        const gain = this.masterGain.gain;
        gain.cancelScheduledValues(now);
        // Smooth ramp from current value
        gain.setValueAtTime(gain.value, now);
        gain.linearRampToValueAtTime(target, now + ms / 1000);
    }

    setVolume(v) {
        const vol = Math.max(0, Math.min(1, v));
        this.volume = vol;
        if (this.isPlaying) {
            this._fadeTo(this.volume, 80);
        }
        this._notify();
    }

    async setType(type) {
        const next = (type || 'white').toLowerCase();
        if (!['white', 'rain', 'coffee', 'waves'].includes(next)) return;
        this.currentType = next;
        if (this.isPlaying) {
            // Rebuild graph smoothly
            await this._ensureContext();
            this._fadeTo(0, DEFAULTS.fadeMs);
            // Allow fade down before rebuild
            setTimeout(() => {
                this._buildGraph(next);
                this._fadeTo(this.volume, DEFAULTS.fadeMs);
            }, DEFAULTS.fadeMs);
        }
        this._notify();
    }

    async play() {
        await this._ensureContext();
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        if (!this.isPlaying) {
            this._buildGraph(this.currentType);
            this.isPlaying = true;
            this._fadeTo(this.volume, DEFAULTS.fadeMs);
            this._notify();
        }
    }

    async pause() {
        if (!this.ctx) return;
        if (!this.isPlaying) return;
        this._fadeTo(0, DEFAULTS.fadeMs);
        setTimeout(() => {
            this._clearGraph();
            this.isPlaying = false;
            this._notify();
        }, DEFAULTS.fadeMs);
    }

    async stopAndCloseContext() {
        if (!this.ctx) return;
        await this.pause();
        try {
            await this.ctx.close();
        } catch {
            // ignore
        }
        this.ctx = null;
        this.masterGain = null;
    }

    _buildGraph(type) {
        if (!this.ctx || !this.masterGain) return;
        this._clearGraph();

        if (type === 'white') {
            this._buildWhite();
        } else if (type === 'rain') {
            this._buildRain();
        } else if (type === 'coffee') {
            this._buildCoffeeShop();
        } else if (type === 'waves') {
            this._buildWaves();
        } else {
            this._buildWhite();
        }
    }

    _makeNoiseSource() {
        // ScriptProcessorNode is deprecated but widely supported and fine for this app.
        // It avoids the need for external worklet files.
        const bufferSize = 4096;
        const node = this.ctx.createScriptProcessor(bufferSize, 1, 1);
        node.onaudioprocess = (e) => {
            const out = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < out.length; i++) {
                out[i] = Math.random() * 2 - 1;
            }
        };
        return node;
    }

    _buildWhite() {
        const noise = this._makeNoiseSource();
        const gain = this.ctx.createGain();
        gain.gain.value = 0.9;
        noise.connect(gain);
        gain.connect(this.masterGain);
        this.sourceNodes.push(noise, gain);
    }

    _buildRain() {
        // Rain approximation:
        // - broadband noise -> highpass/bandpass -> subtle amplitude flutter
        // - occasional "droplets" via random impulse envelope
        const noise = this._makeNoiseSource();

        const highpass = this.ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 800;

        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 2500;
        bandpass.Q.value = 0.7;

        const rainGain = this.ctx.createGain();
        rainGain.gain.value = 0.22;

        // Slow flutter LFO
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.35;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 0.08;
        lfo.connect(lfoGain);
        lfoGain.connect(rainGain.gain);

        // Droplets: random short bursts on top
        const dropletGain = this.ctx.createGain();
        dropletGain.gain.value = 0.0;

        // Create a timer using a silent oscillator + JS scheduling for droplets
        const dropletTicker = this.ctx.createOscillator();
        dropletTicker.frequency.value = 1; // placeholder; not audible
        const dropletSilence = this.ctx.createGain();
        dropletSilence.gain.value = 0;
        dropletTicker.connect(dropletSilence);
        dropletSilence.connect(this.masterGain);

        // Chain
        noise.connect(highpass);
        highpass.connect(bandpass);
        bandpass.connect(rainGain);
        rainGain.connect(this.masterGain);

        // Droplets from same noise but more focused band
        const dropletBand = this.ctx.createBiquadFilter();
        dropletBand.type = 'bandpass';
        dropletBand.frequency.value = 4200;
        dropletBand.Q.value = 6;
        noise.connect(dropletBand);
        dropletBand.connect(dropletGain);
        dropletGain.connect(this.masterGain);

        // Start oscillators
        lfo.start();
        dropletTicker.start();

        // Schedule droplets
        const scheduleDroplet = () => {
            if (!this.ctx || !this.isPlaying || this.currentType !== 'rain') return;
            const now = this.ctx.currentTime;
            const intensity = 0.06 + Math.random() * 0.14;
            const dur = 0.03 + Math.random() * 0.07;
            dropletGain.gain.cancelScheduledValues(now);
            dropletGain.gain.setValueAtTime(0.0, now);
            dropletGain.gain.linearRampToValueAtTime(intensity, now + 0.005);
            dropletGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

            const nextMs = 70 + Math.random() * 260;
            setTimeout(scheduleDroplet, nextMs);
        };
        setTimeout(scheduleDroplet, 120);

        this.sourceNodes.push(noise, highpass, bandpass, rainGain, lfo, lfoGain, dropletBand, dropletGain, dropletTicker, dropletSilence);
    }

    _buildCoffeeShop() {
        // Coffee shop approximation:
        // - low "room" noise (pink-ish via filtering)
        // - mid "murmur" bandpass
        // - occasional clink blips
        const noise = this._makeNoiseSource();

        // Room tone: lowpass noise
        const roomLP = this.ctx.createBiquadFilter();
        roomLP.type = 'lowpass';
        roomLP.frequency.value = 600;

        const roomGain = this.ctx.createGain();
        roomGain.gain.value = 0.18;

        // Murmur: bandpass noise
        const murmurBP = this.ctx.createBiquadFilter();
        murmurBP.type = 'bandpass';
        murmurBP.frequency.value = 900;
        murmurBP.Q.value = 0.9;

        const murmurGain = this.ctx.createGain();
        murmurGain.gain.value = 0.12;

        // Gentle amplitude movement for murmur
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.12;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 0.05;
        lfo.connect(lfoGain);
        lfoGain.connect(murmurGain.gain);

        // Clinks: short sine blips
        const clinkGain = this.ctx.createGain();
        clinkGain.gain.value = 0.0;
        clinkGain.connect(this.masterGain);

        noise.connect(roomLP);
        roomLP.connect(roomGain);
        roomGain.connect(this.masterGain);

        noise.connect(murmurBP);
        murmurBP.connect(murmurGain);
        murmurGain.connect(this.masterGain);

        lfo.start();

        const scheduleClink = () => {
            if (!this.ctx || !this.isPlaying || this.currentType !== 'coffee') return;
            if (Math.random() < 0.35) {
                const osc = this.ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.value = 1200 + Math.random() * 1800;
                osc.connect(clinkGain);
                const now = this.ctx.currentTime;
                const amp = 0.02 + Math.random() * 0.05;
                const dur = 0.03 + Math.random() * 0.05;
                clinkGain.gain.cancelScheduledValues(now);
                clinkGain.gain.setValueAtTime(0.0, now);
                clinkGain.gain.linearRampToValueAtTime(amp, now + 0.004);
                clinkGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
                osc.start(now);
                osc.stop(now + dur + 0.02);
                // Cleanup
                osc.onended = () => {
                    try { osc.disconnect(); } catch { /* ignore */ }
                };
                this.sourceNodes.push(osc);
            }
            const nextMs = 800 + Math.random() * 2400;
            setTimeout(scheduleClink, nextMs);
        };
        setTimeout(scheduleClink, 600);

        this.sourceNodes.push(noise, roomLP, roomGain, murmurBP, murmurGain, lfo, lfoGain, clinkGain);
    }

    _buildWaves() {
        // Ocean waves approximation:
        // - pink-ish low noise (lowpass) as the "sea bed"
        // - slow swell envelope controlling amplitude
        // - gentle filter sweep for motion
        const noise = this._makeNoiseSource();

        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 700;

        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 220;
        bandpass.Q.value = 0.8;

        const waveGain = this.ctx.createGain();
        waveGain.gain.value = 0.18;

        // Swell LFO (slow)
        const swell = this.ctx.createOscillator();
        swell.type = 'sine';
        swell.frequency.value = 0.08; // ~12.5s cycle
        const swellDepth = this.ctx.createGain();
        swellDepth.gain.value = 0.12;
        swell.connect(swellDepth);
        swellDepth.connect(waveGain.gain);

        // Filter motion
        const sweep = this.ctx.createOscillator();
        sweep.type = 'sine';
        sweep.frequency.value = 0.03;
        const sweepDepth = this.ctx.createGain();
        sweepDepth.gain.value = 120;
        sweep.connect(sweepDepth);
        sweepDepth.connect(bandpass.frequency);

        noise.connect(lowpass);
        lowpass.connect(bandpass);
        bandpass.connect(waveGain);
        waveGain.connect(this.masterGain);

        swell.start();
        sweep.start();

        this.sourceNodes.push(noise, lowpass, bandpass, waveGain, swell, swellDepth, sweep, sweepDepth);
    }
}

const engine = new AmbientEngine();

export class Ambient {
    static init(windowElement) {
        if (!windowElement) return;

        // Make it a mini window
        try {
            windowElement.style.width = '340px';
            windowElement.style.height = '240px';
        } catch {
            // ignore
        }

        const playBtn = windowElement.querySelector('#ambient-play');
        const typeSelect = windowElement.querySelector('#ambient-type');
        const volumeSlider = windowElement.querySelector('#ambient-volume');
        const statusEl = windowElement.querySelector('#ambient-status');

        // Close button stops audio (minimize keeps playing)
        const closeBtn = windowElement.querySelector('.mac-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                // Stop only if this was the last control surface open is unclear;
                // keep it simple: stop when window closes.
                engine.pause();
            });
        }

        const unsub = engine.subscribe((state) => {
            if (statusEl) {
                statusEl.textContent = state.isPlaying ? `Playing: ${state.type}` : 'Paused';
            }
            if (playBtn) {
                playBtn.textContent = state.isPlaying ? 'Pause' : 'Play';
            }
            if (typeSelect && typeSelect.value !== state.type) {
                typeSelect.value = state.type;
            }
            if (volumeSlider) {
                const v = Math.round(state.volume * 100);
                if (parseInt(volumeSlider.value, 10) !== v) {
                    volumeSlider.value = String(v);
                }
            }
        });

        // Clean subscription if the window element is removed
        const obs = new MutationObserver(() => {
            if (!document.body.contains(windowElement)) {
                unsub();
                obs.disconnect();
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });

        if (typeSelect) {
            typeSelect.addEventListener('change', () => {
                engine.setType(typeSelect.value);
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', () => {
                const v = Math.max(0, Math.min(100, parseInt(volumeSlider.value, 10) || 0));
                engine.setVolume(v / 100);
            });
        }

        if (playBtn) {
            playBtn.addEventListener('click', async () => {
                if (engine.getState().isPlaying) {
                    await engine.pause();
                } else {
                    await engine.play();
                }
            });
        }
    }
}


