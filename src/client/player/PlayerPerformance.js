// Import Soundworks modules (client side)
import clientSide from 'soundworks/client';
const client = clientSide.client;

// Import Soundfield modules (client side)
import WhiteNoiseSynth from './WhiteNoiseSynth.js'

// PlayerPerformance class
export default class PlayerPerformance extends clientSide.Performance {
  constructor(options = {}) {
    super(options);

    /**
     * White noise synth.
     * @type {WhiteNoiseSynth}
     */
    this._synth = new WhiteNoiseSynth();

    // Add text to view
    this.setCenteredViewContent('Listen!');

    // Method bindings
    this._onPlay = this._onPlay.bind(this);
    this._onMute = this._onMute.bind(this);
  }

  start() {
    super.start();

    // Setup listeners for server messages
    client.receive('player:play', this._onPlay);
    client.receive('player:mute', this._onMute);
  }

  reset() {
    super.reset();

    // Remove listeners for server messages
    client.removeListener('player:play', this._onPlay);
    client.removeListener('player:mute', this._onMute);
  }

  _onPlay() {
    // Start synth
    this._synth.start();

    // Change background color
    this.view.classList.add('white');
    this.view.classList.remove('black');
  }

  _onMute() {
    // Stop synth
    this._synth.stop();

    // Change background color
    this.view.classList.add('black');
    this.view.classList.remove('white');
  }
}
