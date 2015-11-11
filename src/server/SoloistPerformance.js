// Import Soundworks library (server side)
const serverSide = require('soundworks')('server');
const server = serverSide.server;

/**
 * Normalized value of radius of the finger graphical representation (a
 * translucent red circle).
 * A value of 1 correspond to a radius equal to the minimum of the height or
 * width of the space visualization.
 * @type {Number}
 */
const fingerRadius = 0.1;

/**
 * Length of the timeout (in seconds) after which the touch is automatically
 * removed (useful when a `'touchend'` or `'touchcancel'` message doesn't go
 * through).
 * @type {Number}
 */
const timeoutLength = 8;

/**
 * Inverse of the squared finger radius normalized value, used for optimization
 * in the distances calculations.
 * @type {Number}
 */
const rInv2 = 1 / (fingerRadius * fingerRadius);


// Helper functions
function getMinOfArray(array) {
  if (array.length > 0)
    return array.reduce((p, v) => (p < v) ? p : v);

  return undefined;
}

function getInfo(client) {
  return { index: client.index, coordinates: client.coordinates };
}

// SoloistPerformance class
export default class SoloistPerformance extends serverSide.Performance {
  constructor(playerPerformance, options = {}) {
    super(options);

    /**
     * Player performance module.
     * @type {Performance}
     */
    this._playerPerformance = playerPerformance;

    /**
     * Dictionary of the current touches (fingers) on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    this._touches = {};

    // Method bindings
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEndOrCancel = this._onTouchEndOrCancel.bind(this);
  }

  /**
   * Calculate the width / height ratio of the space.
   * @return {Number} Width / height ratio of the space.
   */
  get _widthHeightRatio() {
    return this._space.width / this._space.height;
  }

  /**
   * Calculate the width normalization factor (all the distance calculations
   * are made in a normalized space where height and width equal 1).
   * @return {Number} Width normalization factor.
   */
  get _widthNormalisation() {
    if (this._widthHeightRatio > 1)
      return 1;
    return this._widthHeightRatio;
  }

  /**
   * Calculate the height normalization factor (all the distance calculations
   * are made in a normalized space where height and width equal 1).
   * @return {Number} Height normalization factor.
   */
  get _heightNormalisation() {
    if (this._widthHeightRatio > 1)
      return 1 / this._widthHeightRatio;
    return 1;
  }

  enter(soloist) {
    super.enter(soloist);

    // Send list of players to the soloist
    const playerList = this._playerPerformance.clients.map((c) => this._getInfo(c));
    soloist.send('performance:playerList', playerList);

    // Setup client message listeners
    soloist.receive('soloist:touchstart', this._onTouchStart);
    soloist.receive('soloist:touchmove', this._onTouchMove);
    soloist.receive('soloist:touchendorcancel', this._onTouchEndOrCancel);
  }

  exit(soloist) {
    super.enter(soloist);

    // Remove client message listeners
    soloist.removeListener('soloist:touchstart', this._onTouchStart);
    soloist.removeListener('soloist:touchmove', this._onTouchMove);
    soloist.removeListener('soloist:touchendorcancel',
                           this._onTouchEndOrCancel);
  }

  _calculateDistance() {
    const x = (a[0] - b[0]) * this._widthNormalisation;
    const x2 = x * x;

    const y = (a[1] - b[1]) * this._heightNormalisation;
    const y2 = y * y;

    return (a === null) ? Infinity : Math.min(1, rInv2 * (x2 + y2));
  }

  _updateDistances() {
    // If at least one finger is on screen
    if (Object.keys(this._touches).length > 0) {
      // For each player in the performance
      for (let player of this._playerPerformance.clients) {
        let playerCoordinates = player.coordinates;
        let distances = [];

        // Calculate the distance from the player to each touch (finger)
        for (let id in this._touches) {
          distances.push(this._calculateDistance(playerCoordinates,
                                                 this._touches[id].coordinates));
        }

        // Get minimum distance among all touches (fingers)
        let d = getMinOfArray(distances);

        // If the player is within range for playing sound
        if (d < 1 && !player.modules.performance.playing[soloistIndex]) {
          // Send message to the player
          player.send('player:play', true);
          // Update the player status
          player.modules.performance.isPlaying = true;
        }
        // Otherwise, and if the player is currently playing sound
        else if (d === 1 && player.modules.performance.playing) {
          // Send message to the player
          player.send('player:play', false);
          // Update the player status
          player.modules.performance.isPlaying = false;
        }
      }
    }
    // Otherwise, mute everyone
    else {
      // For each player in the performance
      for (let player of this._playerPerformance.clients) {
        // If the player is currently playing sound
        if (player.modules.performance.isPlaying) {
          // Send message to the player
          player.send('player:play', false);
          // Update the player status
          player.modules.performance.isPlaying = false;
        }
      }
    }
  }

  _onTouchStart(touch) {
    // Create touch in the dictionary
    this._touches[touch.id] = {};
    this._touches[touch.id].id = touch.id;
    this._touches[touch.id].coordinates = touch.coordinates;
    this._touches[touch.id].timeout = setTimeout(() => {
      delete this._touches[touch.id];
    }, timeoutLength * 1000);

    // Make the distances calculations
    this._updateDistances();
  }

  _onTouchMove(touch) {
    // If the touch is not in the dictionary already (may happen if the finger
    // slides from the edge of the touchscreen)
    if (!this._touches[touch.id]) {
      this._touches[touch.id] = {};
      this._touches[touch.id].id = touch.id;
    }
    // Otherwise, clear timeout
    else {
      clearTimeout(this._touches[touch.id].timeout);
    }

    // Update the coordinates and timeout
    this._touches[touch.id].coordinates = touch.coordinates;
    this._touches[touch.id].timeout = setTimeout(() => {
      delete this._touches[touch.id];
    }, timeoutLength * 1000);

    // Make the distances calculations
    this._updateDistances();
  }

  _onTouchEndOrCancel(touch) {
    delete this._touches[touch.id];
    this._updateDistances();
  }

  _deleteTouch(id) {
    delete this._touches[id];
  }
}
