// Import Soundworks modules (client side)
import clientSide from 'soundworks/client';
const audioContext = clientSide.audioContext;

// Helper function
function createWhiteNoiseBuffer() {
  const bufferSize = 2 * audioContext.sampleRate;
  let noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  let output = noiseBuffer.getChannelData(0);

  for (var i = 0; i < bufferSize; i++)
    output[i] = Math.random() * 2 - 1;

  return noiseBuffer;
}

// WhiteNoiseSynth class
export default class WhiteNoiseSynth {
  constructor() {
    const noiseBuffer = createWhiteNoiseBuffer();

    // Buffer source node
    let whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.start(0);
    this._whiteNoise = whiteNoise;

    // Output gain node
    let outputGain = audioContext.createGain();
    outputGain.gain.value = 0;
    this._out = outputGain;

    // Connect nodes
    this._whiteNoise.connect(this._out);
    this._out.connect(audioContext.destination);
  }

  start() {
    this._out.gain.value = 1;
  }

  stop() {
    this._out.gain.value = 0;
  }
}
