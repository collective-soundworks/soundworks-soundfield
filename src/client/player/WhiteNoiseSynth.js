// Import Soundworks modules (client side)
import clientSide from 'soundworks/client';
const audioContext = clientSide.audioContext;

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
 * `WhiteNoiseSynth` class.
 * The `WhiteNoiseSynth` class creates a white noise synth.
 */
export default class WhiteNoiseSynth {
  /**
   * Create a new instance of the class.
   */
  constructor() {
    /**
     * White noise buffer source node.
     * @type {AudioBufferSourceNode}
     */
    this._whiteNoise = audioContext.createBufferSource();
    this._whiteNoise.buffer = createWhiteNoiseBuffer();
    this._whiteNoise.loop = true;
    this._whiteNoise.start(0);

    /**
     * Output gain node.
     * @type {GainNode}
     */
    this._output = audioContext.createGain();
    this._output.gain.value = 0;

    // Connect nodes
    this._whiteNoise.connect(this._output);
    this._output.connect(audioContext.destination);
  }

  /**
   * Start the synth.
   */
  start() {
    this._output.gain.linearRampToValueAtTime(1,
                                              audioContext.currentTime + 0.5);
  }

  /**
   * Stop de synth.
   */
  stop() {
    this._output.gain.linearRampToValueAtTime(0,
                                              audioContext.currentTime + 0.5);
  }
}
