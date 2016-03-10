import { ServerExperience } from 'soundworks/server';


/**
 * Normalized value of radius of the finger graphical representation (a
 * translucent red circle).
 * A value of 1 correspond to a radius equal to the minimum of the height or
 * width of the space visualization.
 * @type {Number}
 */
// const fingerRadius = 0.1;

/**
 * Length of the timeout (in seconds) after which the touch is automatically
 * removed (useful when a `'touchend'` or `'touchcancel'` message doesn't go
 * through).
 * @type {Number}
 */
// const timeoutLength = 8;

/**
 * Inverse of the squared finger radius normalized value, used for optimization
 * in the distances calculations.
 * @type {Number}
 */
// const rInv2 = 1 / (fingerRadius * fingerRadius);


/**
 * Get minimum value of an array.
 * @param {Array} array Array.
 * @return {Number} Minimum value of the array.
 */
// function getMinOfArray(array) {
//   if (array.length > 0)
//     return array.reduce((p, v) => (p < v) ? p : v);

//   return undefined;
// }

/**
 * Retrieve information (index and coordinates) about the client.
 * @param {Client} client Client.
 * @return {Object} Information about the client.
 * @property {Number} index Index of the client.
 * @property {Number[]} coordinates Coordinates of the client (`[x:Number,
 * y:Number]` array).
 */
function getInfo(client) {
  return { index: client.index, coordinates: client.coordinates };
}

/**
 * `SoloistPerformance` class.
 * The `SoloistPerformance` class makes the connection between the `'soloist'`
 * clients and the `'player'` clients. More specifically, the module listens for
 * the messages from the `'soloist'` clients (with the touch coordinates),
 * calculates the distances from the touch to every `'player'` client, and sends
 * a 'play' or 'mute' message to the relevant `'player'` clients.
 */
export default class SoloistExperience extends ServerExperience {
  /**
   * Create an instance of the class.
   * @param {Performance} playerPerformance `'player'` clients performance
   * module (server side).
   * @param {Setup} setup Setup of the scenario.
   * @param {Object} [options={}] Options (as in the base class).
   */
  constructor(players, setup, options = {}) {
    super(options);

    /**
     * Player performance module.
     * @type {Performance}
     */
    this._players = players;

    /**
     * Setup module.
     * @type {Setup}
     */
    this._setup = setup;

    /**
     * Dictionary of the current touches (fingers) on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    // this._touches = {};

    // // Method bindings
    // this._onTouchStart = this._onTouchStart.bind(this);
    // this._onTouchMove = this._onTouchMove.bind(this);
    // this._onTouchEndOrCancel = this._onTouchEndOrCancel.bind(this);
  }

  /**
   * Calculate the width / height ratio of the space.
   * @return {Number} Width / height ratio of the space.
   */
  // get _widthHeightRatio() {
  //   return this._setup.width / this._setup.height;
  // }

  /**
   * Calculate the width normalization factor (all the distance calculations
   * are made in a normalized space where height and width equal 1).
   * @return {Number} Width normalization factor.
   */
  // get _widthNormalisation() {
  //   if (this._widthHeightRatio > 1)
  //     return 1;
  //   return this._widthHeightRatio;
  // }

  /**
   * Calculate the height normalization factor (all the distance calculations
   * are made in a normalized space where height and width equal 1).
   * @return {Number} Height normalization factor.
   */
  // get _heightNormalisation() {
  //   if (this._widthHeightRatio > 1)
  //     return 1 / this._widthHeightRatio;
  //   return 1;
  // }

  /**
   * Called when a soloist starts the (soloist) performance.
   * The method sends the player list, and listens for touch messages.
   * @param {Client} soloist Soloist that enters the performance.
   */
  enter(client) {
    super.enter(client);

    this.receive(client, 'request', () => {
      this.send(client, 'area', this._setup);
    });

    // Send list of players to the client
    // const playerList = this._playerPerformance.clients.map((c) => getInfo(c));
    // client.send('performance:playerList', playerList);

    // // Setup client message listeners
    // client.receive('soloist:touchstart', this._onTouchStart);
    // client.receive('soloist:touchmove', this._onTouchMove);
    // client.receive('soloist:touchendorcancel', this._onTouchEndOrCancel);
  }

  /**
   * Calculate the squared distance between two points in a 2D space.
   * @param {Number[]} a Coordinates of the first point (`[x:Number,
   * y:Number]`).
   * @param {Number[]} b Coordinates of the second point (`[x:Number,
   * y:Number]`).
   * @return {Number} Squared distance between the two points.
   */
  _getDistance(a, b) {
    const x = (a[0] - b[0]) * this._widthNormalisation;
    const x2 = x * x;

    const y = (a[1] - b[1]) * this._heightNormalisation;
    const y2 = y * y;

    return (a === null) ? Infinity : Math.min(1, rInv2 * (x2 + y2));
  }

  /**
   * Calculate the distance of each player to the closest touch (finger on
   * screen) and sends messages to the `'player'` clients accordingly.
   */
  _updateDistances() {
    // If at least one finger is on screen
    if (Object.keys(this._touches).length > 0) {
      // For each player in the performance
      for (let player of this._playerPerformance.clients) {
        let distances = [];

        // Calculate the distance from the player to each touch (finger)
        for (let id in this._touches) {
          distances.push(this._getDistance(player.coordinates,
                                           this._touches[id].coordinates));
        }

        // Get minimum distance among all touches (fingers)
        let d = getMinOfArray(distances);

        // If the player is within range for playing sound
        if (d < 1 && !player.modules.performance.isPlaying) {
          // Send message to the player
          player.send('player:play');
          // Update the player status
          player.modules.performance.isPlaying = true;
        }
        // Otherwise, and if the player is currently playing sound
        else if (d === 1 && player.modules.performance.isPlaying) {
          // Send message to the player
          player.send('player:mute');
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
          player.send('player:mute');
          // Update the player status
          player.modules.performance.isPlaying = false;
        }
      }
    }
  }

  /**
   * `'soloist:touchstart'` event handler.
   * Add a new touch to the touches dictionary, and recalculate the distances.
   * @param {Object} touch Touch.
   */
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

  /**
   * `'soloist:touchmove'` event handler.
   * Update the touches dictionary, and recalculate the distances.
   * @param {Object} touch Touch.
   */
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

  /**
   * `'soloist:touchendorcancel'` event handler.
   * Delete a touch from the touches dictionary, and recalculate the distances.
   * @param {Object} touch Touch.
   */
  _onTouchEndOrCancel(touch) {
    delete this._touches[touch.id];
    this._updateDistances();
  }
}
