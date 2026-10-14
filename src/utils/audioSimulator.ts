/**
 * Simulateur audio Web Audio API pour les alertes vocales WhatsApp en wolof
 * Ne nécessite aucun appel réseau ni fichier externe.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  /**
   * Joue un carillon d'alerte météo puis une modulation sonore douce simulant la voix
   */
  public playAlertChime(toneType: 'warning' | 'informative' = 'warning', durationSec: number = 42, onProgress?: (sec: number) => void, onEnd?: () => void) {
    this.stop();
    this.initContext();
    this.isPlaying = true;

    let currentSec = 0;
    this.timerId = window.setInterval(() => {
      currentSec++;
      if (onProgress) onProgress(currentSec);
      if (currentSec >= durationSec) {
        this.stop();
        if (onEnd) onEnd();
      }
    }, 1000);

    if (!this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // 1. Chime d'ouverture (2 bips d'officialité type Radio Sénégal / météo)
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(toneType === 'warning' ? 587.33 : 523.25, now); // D5 or C5
      osc1.frequency.setValueAtTime(toneType === 'warning' ? 880.0 : 659.25, now + 0.15); // A5 or E5

      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // 2. Ondulations harmoniques douces simulant le débit vocal régulier (100 Hz à 260 Hz)
      const speechOsc = this.ctx.createOscillator();
      const speechGain = this.ctx.createGain();
      const speechFilter = this.ctx.createBiquadFilter();

      speechOsc.type = 'triangle';
      speechOsc.frequency.setValueAtTime(140, now + 0.6);

      speechFilter.type = 'bandpass';
      speechFilter.frequency.setValueAtTime(650, now + 0.6);
      speechFilter.Q.setValueAtTime(3.0, now + 0.6);

      // Modulation d'amplitude rythmée évoquant la prosodie du wolof
      speechGain.gain.setValueAtTime(0.001, now + 0.6);
      for (let t = 0.6; t < Math.min(durationSec, 8); t += 0.28) {
        speechGain.gain.setValueAtTime(0.04, now + t);
        speechGain.gain.setValueAtTime(0.01, now + t + 0.2);
      }
      speechGain.gain.linearRampToValueAtTime(0.001, now + Math.min(durationSec, 8));

      speechOsc.connect(speechFilter);
      speechFilter.connect(speechGain);
      speechGain.connect(this.ctx.destination);

      speechOsc.start(now + 0.6);
      speechOsc.stop(now + Math.min(durationSec, 8));
    } catch {
      // AudioContext autoplay bloqué ou non supporté : le timer visuel suffit
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.suspend();
      } catch {
        // ignore
      }
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioSimulator = new AudioSynthesizer();
