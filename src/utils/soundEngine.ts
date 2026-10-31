/**
 * 100% Procedural Bio-Acoustic Wildlife Sound Engine (Web Audio API)
 * Synthesizes rainforest canopy wind, leaf rustling, porcupine quill rattles,
 * lion low-frequency rumbles, and wild dog calls with zero external audio files.
 */

class WildlifeSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private ambientGain: GainNode | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleAmbient(enable?: boolean): boolean {
    const nextState = enable !== undefined ? !enable : !this.isMuted;
    this.isMuted = nextState;

    if (!this.isMuted) {
      this.startAmbientCanopy();
    } else {
      this.stopAmbientCanopy();
    }
    return !this.isMuted;
  }

  public getIsPlaying(): boolean {
    return !this.isMuted;
  }

  private startAmbientCanopy() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.stopAmbientCanopy();

    // Create 4 seconds of filtered brown/pink canopy wind noise
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 0.25;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 340;
    filter.Q.value = 1.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 1.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    this.ambientSource = noise;
    this.ambientGain = gain;
  }

  private stopAmbientCanopy() {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      } catch {
        // Ignore if already stopped
      }
      this.ambientSource = null;
    }
  }

  public playLeafRustle() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const duration = 0.35;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * 0.18;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2800, ctx.currentTime + duration);
    filter.Q.value = 2.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  public playEncounterCue(type: 'porcupine' | 'dogs' | 'lion') {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'porcupine') {
      // Hollow keratin quill rattle: rapid percussive burst
      for (let i = 0; i < 6; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(920 + (i % 3) * 180, now + i * 0.045);
        osc.frequency.exponentialRampToValueAtTime(320, now + i * 0.045 + 0.035);

        gain.gain.setValueAtTime(0.05, now + i * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.045);
        osc.stop(now + i * 0.045 + 0.042);
      }
    } else if (type === 'lion') {
      // Deep resonant savanna chest rumble
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(68, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.75);

      sub.type = 'sine';
      sub.frequency.setValueAtTime(34, now);
      sub.frequency.exponentialRampToValueAtTime(24, now + 0.75);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(190, now);
      filter.frequency.exponentialRampToValueAtTime(85, now + 0.75);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(filter);
      sub.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      sub.start(now);
      osc.stop(now + 0.82);
      sub.stop(now + 0.82);
    } else if (type === 'dogs') {
      // African wild dog high-pitched contact "hoo-call"chirp
      for (let i = 0; i < 2; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + i * 0.16;
        osc.frequency.setValueAtTime(580, start);
        osc.frequency.exponentialRampToValueAtTime(890, start + 0.07);
        osc.frequency.exponentialRampToValueAtTime(640, start + 0.13);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.06, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.15);
      }
    }
  }
}

export const soundEngine = new WildlifeSoundEngine();
