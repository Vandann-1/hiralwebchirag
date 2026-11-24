export class WeddingAudioManager {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private synthContext: AudioContext | null = null;
  private synthActive = false;
  private onStateChange?: (playing: boolean) => void;

  constructor(audioElement?: HTMLAudioElement | null, onStateChange?: (playing: boolean) => void) {
    if (audioElement) {
      this.audio = audioElement;
      this.audio.volume = 0.65;
    }
    this.onStateChange = onStateChange;
  }

  setAudioElement(el: HTMLAudioElement | null) {
    this.audio = el;
    if (this.audio) {
      this.audio.volume = 0.65;
    }
  }

  start() {
    if (this.isPlaying) return;

    if (this.audio) {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.setPlayingState(true);
          })
          .catch((err) => {
            console.warn('Native audio play error, starting Web Audio ambient fallback:', err);
            this.startAmbientSynth();
            this.setPlayingState(true);
          });
      }
    } else {
      this.startAmbientSynth();
      this.setPlayingState(true);
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.synthActive) {
      if (this.synthContext && this.synthContext.state === 'suspended') {
        this.synthContext.resume();
      }
      this.setPlayingState(true);
      return;
    }

    if (this.audio) {
      this.audio.play()
        .then(() => this.setPlayingState(true))
        .catch(() => {
          this.startAmbientSynth();
          this.setPlayingState(true);
        });
    } else {
      this.startAmbientSynth();
      this.setPlayingState(true);
    }
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
    }
    if (this.synthContext && this.synthContext.state === 'running') {
      this.synthContext.suspend();
    }
    this.setPlayingState(false);
  }

  private setPlayingState(playing: boolean) {
    this.isPlaying = playing;
    if (this.onStateChange) {
      this.onStateChange(playing);
    }
  }

  private startAmbientSynth() {
    if (this.synthActive) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.synthContext = new AudioCtx();
      this.synthActive = true;

      const masterGain = this.synthContext.createGain();
      masterGain.gain.setValueAtTime(0.18, this.synthContext.currentTime);
      masterGain.connect(this.synthContext.destination);

      // Indian Tanpura/Sitar Root Chord: D3, A3, D4, F#4, A4
      const notes = [146.83, 220.00, 293.66, 369.99, 440.00];

      notes.forEach((freq, idx) => {
        if (!this.synthContext) return;
        const osc = this.synthContext.createOscillator();
        const gain = this.synthContext.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.synthContext.currentTime);
        osc.detune.setValueAtTime((idx - 2) * 5, this.synthContext.currentTime);

        const lfo = this.synthContext.createOscillator();
        const lfoGain = this.synthContext.createGain();
        lfo.frequency.setValueAtTime(0.2 + idx * 0.1, this.synthContext.currentTime);
        lfoGain.gain.setValueAtTime(2.5, this.synthContext.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        gain.gain.setValueAtTime(0.15 / (idx + 1), this.synthContext.currentTime);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
      });
    } catch (e) {
      console.warn('Web Audio Synth failed:', e);
    }
  }
}
