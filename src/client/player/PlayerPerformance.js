// Import Soundworks modules (client side)
import clientSide from 'soundworks/client';
const client = clientSide.client;

// PlayerPerformance class
export default class PlayerPerformance extends clientSide.Performance {
  constructor(options = {}) {
    super(options);

    // TODO: add text

    // Method bindings
    this._onPlay = this._onPlay.bind(this);
    this._onMute = this._onMute.bind(this);
  }

  start() {
    super.start(); // don't forget this

    client.receive('player:play', this._onPlay);
    client.receive('player:mute', this._onMute);
  }

  reset() {
    client.removeListener('player:play', this._onPlay);
    client.removeListener('player:mute', this._onMute);
  }

  _onPlay() {
    console.log('play!');
  }

  _onMute() {
    console.log('mute!');
  }
}
