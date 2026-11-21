// Audio Synthesizer & Hardware Mobile Haptic Engine
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

class AudioManager {
  private ctx: AudioContext | null = null;

  initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  unlockAudio() {
    this.initCtx();
  }

  // Soft click / tap feedback
  playTap() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Set completed chime
  playSetComplete() {
    this.triggerHaptic(ImpactStyle.Light);
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Personal Record (PR) celebratory fanfare
  playPRCelebration() {
    this.triggerHapticNotification(NotificationType.Success);
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = now + idx * 0.08;
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {}
  }

  // Rest timer finished alert bell
  playTimerComplete() {
    this.triggerHapticNotification(NotificationType.Warning);
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [880, 1174.66, 1760].forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
      });
    } catch {}
  }

  // Native Mobile Haptic Impact (iOS Taptic & Android Motor) with web fallback
  triggerHaptic(param: ImpactStyle | number | number[] = ImpactStyle.Medium) {
    let style: ImpactStyle = ImpactStyle.Medium;
    if (typeof param === 'string') {
      style = param;
    }
    try {
      Haptics.impact({ style }).catch(() => {});
    } catch {}
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(typeof param === 'number' || Array.isArray(param) ? param : 35);
      } catch {}
    }
  }

  // Native Mobile Haptic Notification (Success / Warning / Error)
  triggerHapticNotification(type: NotificationType = NotificationType.Success) {
    try {
      Haptics.notification({ type }).catch(() => {});
    } catch {}
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {}
    }
  }
}

export const soundFx = new AudioManager();

if (typeof window !== 'undefined') {
  const unlock = () => {
    soundFx.unlockAudio();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true, passive: true });
}
