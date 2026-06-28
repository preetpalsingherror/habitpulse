/**
 * Web Audio API Sound Synthesizer for UPLIFE Solo Leveling Interface
 * Synthesizes gaming and alert effects on-the-fly without binary assets.
 */

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playSound = (type) => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'pop': {
        // Light checkbox tick pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }

      case 'level-up': {
        // Triumphant ascending major arpeggio
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major notes
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + index * 0.08);

          gain.gain.setValueAtTime(0.1, now + index * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.3);

          osc.start(now + index * 0.08);
          osc.stop(now + index * 0.08 + 0.35);
        });
        break;
      }

      case 'penalty': {
        // Pulse Sawtooth Alarm
        const duration = 2.0;
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now); // Low grinding alarm frequency

        // LFO to create a pulsing "wee-woo" frequency sweep
        lfo.frequency.setValueAtTime(2.5, now); // 2.5Hz pulses
        lfoGain.gain.setValueAtTime(35, now); // Sweep strength

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.15, now + duration - 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        lfo.start(now);
        osc.start(now);

        lfo.stop(now + duration);
        osc.stop(now + duration);
        break;
      }

      case 'arise': {
        // Deep cosmic sweep ending in a bright crystal chime
        // 1. Bass drone sweep
        const oscBass = ctx.createOscillator();
        const gainBass = ctx.createGain();
        oscBass.type = 'sawtooth';
        oscBass.frequency.setValueAtTime(60, now);
        oscBass.frequency.linearRampToValueAtTime(180, now + 1.2);
        oscBass.connect(gainBass);
        gainBass.connect(ctx.destination);
        gainBass.gain.setValueAtTime(0.15, now);
        gainBass.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

        // 2. Bright high bells at the peak
        const chimeNotes = [587.33, 698.46, 880.00, 1174.66]; // D minor chords
        chimeNotes.forEach((freq, index) => {
          const oscChime = ctx.createOscillator();
          const gainChime = ctx.createGain();
          oscChime.type = 'sine';
          oscChime.frequency.setValueAtTime(freq, now + 0.8 + index * 0.1);
          oscChime.connect(gainChime);
          gainChime.connect(ctx.destination);
          gainChime.gain.setValueAtTime(0.08, now + 0.8 + index * 0.1);
          gainChime.gain.exponentialRampToValueAtTime(0.005, now + 0.8 + index * 0.1 + 0.5);
          oscChime.start(now + 0.8 + index * 0.1);
          oscChime.stop(now + 0.8 + index * 0.1 + 0.6);
        });

        oscBass.start(now);
        oscBass.stop(now + 1.2);
        break;
      }

      case 'chest-fanfare': {
        // Sound for lootbox break opens
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
    }
  } catch (err) {
    console.warn("Web Audio failed to play:", err);
  }
};
