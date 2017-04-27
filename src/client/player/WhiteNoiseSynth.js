import { audioContext } from 'soundworks/client';

/**
 * Populate a mono `AudioBuffer` with random values and returns it.
 * @return {AudioBuffer}
 */
function createWhiteNoiseBuffer() {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = 2 * sampleRate; // 2 sec
  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  for (var i = 0; i < bufferSize; i++)
    data[i] = Math.random() * 2 - 1;

  return buffer;
}

/**
 * Simple synthesizer producing white noise.
 */
export default class WhiteNoiseSynth {
  constructor() {
    /**
     * Output gain node.
     * @type {GainNode}
     */
    this.output = audioContext.createGain();
    this.output.gain.value = 0;

    /**
     * White noise buffer source node.
     * @type {AudioBufferSourceNode}
     */
    this.bufferSource = audioContext.createBufferSource();
    this.bufferSource.connect(this.output);
    this.bufferSource.buffer = createWhiteNoiseBuffer();
    this.bufferSource.loop = true;
    this.bufferSource.start(0);
  }

  connect(destination) {
    this.output.connect(audioContext.destination);
  }

  start() {
    const now = audioContext.currentTime;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.setValueAtTime(this.output.gain.value, now);
    this.output.gain.linearRampToValueAtTime(1, now + 0.75);
  }

  stop() {
    const now = audioContext.currentTime;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.setValueAtTime(this.output.gain.value, now);
    this.output.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
  }
}
