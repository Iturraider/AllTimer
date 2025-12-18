
class AudioService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, duration: number, volume: number = 0.1) {
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playCountdown() {
    this.playTone(440, 0.2); // A4
  }

  playStart() {
    this.playTone(880, 0.5); // A5
  }

  playEnd() {
    this.playTone(220, 0.5); // A3
  }

  playBoxingBell() {
    // Mimic a bell with multiple oscillators
    this.init();
    if (!this.ctx) return;
    [600, 800, 1200].forEach(f => this.playTone(f, 1.5, 0.05));
  }

  vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }
}

export const audioService = new AudioService();
