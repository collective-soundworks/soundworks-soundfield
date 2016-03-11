import { audioContext } from 'soundworks/client';

/**
 * Create a white noise buffer.
 * @return {AudioBuffer} White noise buffer
 */
function createWhiteNoiseBuffer() {
  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  for (var i = 0; i < bufferSize; i++)
    output[i] = Math.random() * 2 - 1;

  return noiseBuffer;
}

/**
 * The `WhiteNoiseSynth` class creates a white noise synth.
 */
export default class WhiteNoiseSynth {
  constructor() {
    /**
     * Output gain node.
     * @type {GainNode}
     */
    this.output = audioContext.createGain();
    this.output.connect(audioContext.destination);
    this.output.gain.value = 0;
    // this.output.gain.setValueAtTime(0, audioContext.currentTime);

    /**
     * White noise buffer source node.
     * @type {AudioBufferSourceNode}
     */
    this.whiteNoise = audioContext.createBufferSource();
    this.whiteNoise.connect(this.output);
    this.whiteNoise.buffer = createWhiteNoiseBuffer();
    this.whiteNoise.loop = true;
    this.whiteNoise.start(0);
  }

  start() {
    const now = audioContext.currentTime;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.setValueAtTime(this.output.gain.value, now);
    this.output.gain.linearRampToValueAtTime(1, now + 1);
  }

  stop() {
    const now = audioContext.currentTime;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.setValueAtTime(this.output.gain.value, now);
    this.output.gain.linearRampToValueAtTime(0, now + 1);
  }
}
