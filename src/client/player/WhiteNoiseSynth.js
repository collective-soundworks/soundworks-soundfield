import { audioContext } from 'soundworks/client';

/**
 * Create a white noise buffer.
 * @return {AudioBuffer} White noise buffer
 */
function createWhiteNoiseBuffer() {
  const bufferSize = 2 * audioContext.sampleRate;
  let noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  let output = noiseBuffer.getChannelData(0);

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
    this._output = audioContext.createGain();
    this._output.connect(audioContext.destination);
    this._output.gain.value = 0;

    /**
     * White noise buffer source node.
     * @type {AudioBufferSourceNode}
     */
    this._whiteNoise = audioContext.createBufferSource();
    this._whiteNoise.connect(this._output);
    this._whiteNoise.buffer = createWhiteNoiseBuffer();
    this._whiteNoise.loop = true;
    this._whiteNoise.start(0);
  }

  start() {
    const now = audioContext.currentTime;
    this._output.gain.linearRampToValueAtTime(1, now + 0.5);
  }

  stop() {
    const now = audioContext.currentTime;
    this._output.gain.linearRampToValueAtTime(0, now + 0.5);
  }
}
