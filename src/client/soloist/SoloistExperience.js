// Import Soundworks modules (client side)
import * as soundworks from 'soundworks/client';
const SpaceView = soundworks.SpaceView;
const TouchSurface = soundworks.TouchSurface;

/**
 * Size of the finger visualization relative to the setup size.
 * @type {Number}
 */
// const radius = 1;

/**
 * Length of the timeout (in seconds) after which the touch is automatically
 * removed (useful when a `'touchend'` or `'touchcancel'` message doesn't go
 * through).
 * @type {Number}
 */
// const timeoutDuration = 8;

/**
 * Create a `<div>` to display the `Space` and another `<div>` to listen to the
 * `'touchstart'`, `'touchmove'`, `'touchend'`, `'touchcancel'` events.
 * @param {DOMElement} view View of the module in which to display the `Space`.
 * @return {Object} `<div>` elements.
 * @property {DOMElement} spaceDiv `<div>` in which to display the `Space`.
 * @property {DOMElement} surface `<div>` to listen to the touch events.
 */
// function createSpaceDiv(view) {
//   let spaceDiv = document.createElement('div');
//   spaceDiv.setAttribute('id', 'setup');

//   let spaceTextDiv = document.createElement('div');
//   spaceTextDiv.innerHTML = 'Move your finger on screen';
//   spaceTextDiv.classList.add('centered-content');

//   let surface = document.createElement('div');
//   surface.setAttribute('id', 'touchsurface');
//   surface.classList.add('touchsurface');

//   spaceDiv.appendChild(surface);
//   spaceDiv.appendChild(spaceTextDiv);
//   view.appendChild(spaceDiv);

//   return {
//     spaceDiv: spaceDiv,
//     surface: surface
//   }
// }

/**
 * `SoloistPerformance` class.
 * The `SoloistPerformance` is responsible for:
 * - displaying the positions on the players in the performance;
 * - tracking the soloist's finger(s) on screen and sending the touch
 *   coordinates to the server.
 */
export default class SoloistPerformance extends soundworks.Experience {
  constructor() {
    super();

    // require usefull services
    this._welcome = this.require('welcome');
    this._sharedConfig = this.require('shared-config');

    /**
     * Setup of the scenario.
     * @type {Object}
     */
    this.setup = null;

    /**
     * Width of the exited zone relative to the setup area definition
     * @type {Number}
     */
    this.radius = 1;

    this.touches = {};
    this.timeouts = {};

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this.onPlayerList = this.onPlayerList.bind(this);
    this.onPlayerAdd = this.onPlayerAdd.bind(this);
    this.onPlayerRemove = this.onPlayerRemove.bind(this);
  }


  init() {
    this.setup = this._sharedConfig.get('setup');

    /**
     * Dictionary of the DOM elements that represent a finger on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    // this._fingerDivs = {};

    /**
     * Dictionary of the timeouts for each finger DOM element on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    // this._fingerDivTimeouts = {};

    // init the view
    this.viewCtor = SpaceView;
    this.view = this.createView();
    this.view.setArea(this.setup.area);
  }

  /**
   * Number by which we multiply the fingerRadius constant to get the radius
   * value in pixels.
   * @return {Number} Minimum of the space visualization height or width, in
   * pixels.
   */
  // get _pxRatio() {
  //   return Math.min(this._spaceDiv.offsetHeight, this._spaceDiv.offsetWidth);
  // }

  /**
   * Start the module.
   *
   * Setup listeners for:
   * - the messages from the server;
   * - the window `'resize'` event;
   * - the touch events.
   * Display the space visualization.
   */
  start() {
    super.start();

    if (!this.hasStarted)
      this.init();

    this.show();

    // Setup listeners for player connections / disconnections
    this.receive('player:list', this.onPlayerList);
    this.receive('player:add', this.onPlayerAdd);
    this.receive('player:remove', this.onPlayerRemove);

    // add a TouchSurface on the area svg
    const surface = new TouchSurface(this.view.$svg);

    surface.addListener('touchstart', this.onTouchStart);
    surface.addListener('touchmove', this.onTouchMove);
    surface.addListener('touchend', this.onTouchEnd);
  }

  /**
   * Display all the players from a list in the space visualization.
   * @param {Object[]} playerList List of players.
   */

  // @todo - fix broken
  onPlayerList(playerList) {
    this.view.addPoints(playerList);
  }

  /**
   * Add a player to the space visualization.
   * @param {Object} player Player.
   */
  onPlayerAdd(playerInfos) {
    this.view.addPoint(playerInfos);
  }

  /**
   * Remove a player from the space visualization.
   * @param {Object} player Player.
   */
  onPlayerRemove(playerInfos) {
    this.view.deletePoint(playerInfos.id);
  }

  onTouchStart(id, x, y) {
    const area = this.setup.area;
    x = x * area.width;
    y = y * area.height;

    this.touches[id] = [x, y];
    // timeout if the `touchend` does not trigger
    clearTimeout(this.timeouts[id]);
    this.timeouts[id] = setTimeout(() => { this.onTouchEnd(id); }, 8000);

    this.sendCoordinates();
  }

  onTouchMove(id, x, y) {
    const area = this.setup.area;
    const touch = this.touches[id];
    touch[0] = x * area.width;
    touch[1] = y * area.height;

    // timeout if the `touchend` does not trigger
    clearTimeout(this.timeouts[id]);
    this.timeouts[id] = setTimeout(() => { this.onTouchEnd(id); }, 8000);

    this.sendCoordinates();
  }

  onTouchEnd(id) {
    delete this.touches[id];
    this.sendCoordinates();
  }

  sendCoordinates() {
    this.send('input:change', this.radius, this.touches);
  }

  /**
   * Touch event handler
   * @param {Object} e Touch event.
   */
  // _onTouch(e) {
  //   // Prevent scrolling
  //   e.preventDefault();

  //   // A few constants
  //   const type = e.type;
  //   const changedTouches = e.changedTouches;

  //   // Iterate through the changedTouches array
  //   for (let i = 0; i < changedTouches.length; i++) {
  //     // Retrieve touch data
  //     let coordinates = [changedTouches[i].clientX, changedTouches[i].clientY];
  //     let identifier = changedTouches[i].identifier;

  //     // Calculate normalized touch position
  //     let x = (coordinates[0] -
  //              this._spaceDiv.offsetLeft -
  //              this._space.svgOffsetLeft ) / this._space.svgWidth;
  //     let y = (coordinates[1] -
  //              this._spaceDiv.offsetTop -
  //              this._space.svgOffsetTop) / this._space.svgHeight;

  //     // Touch information with normalized coordinates
  //     let touchNorm = { id: identifier, coordinates: [x, y] };

  //     // Depending on the event type…
  //     switch (type) {
  //       case 'touchstart':
  //         // Create a `<div>` under the finger
  //         this._createFingerDiv(identifier, coordinates);

  //         // Send message to the server
  //         client.send('soloist:touchstart', touchNorm);
  //         break;

  //       case 'touchmove': {
  //         // Move the `<div>` under the finger or create one if it doesn't exist
  //         // already (may happen if the finger slides from the edge of the
  //         // touchscreen)
  //         if (this._fingerDivs[identifier])
  //           this._moveFingerDiv(identifier, coordinates);
  //         else
  //           this._createFingerDiv(identifier, coordinates);

  //         // Send message to the server
  //         client.send('soloist:touchmove', touchNorm);
  //         break;
  //       }

  //       case 'touchend': {
  //         // Remove the finger div
  //         if (this._fingerDivs[identifier])
  //           this._removeFingerDiv(identifier);

  //         // Send a message to the server
  //         client.send('soloist:touchendorcancel', touchNorm);
  //         break;
  //       }

  //       case 'touchcancel': {
  //         // Remove the finger div
  //         if (this._fingerDivs[identifier])
  //           this._removeFingerDiv(identifier);

  //         // Send a message to the server
  //         client.send('soloist:touchendorcancel', touchNorm);
  //         break;
  //       }
  //     }
  //   }
  // }

  /**
   * Redraw the space visualization to fit the window or screen size.
   * @return {[type]} [description]
   */
  // _onWindowResize() {
  //   const height = window.innerHeight;
  //   const width = window.innerWidth;

  //   if (width > height) {
  //     this._spaceDiv.style.height = `${height}px`;
  //     this._spaceDiv.style.width = `${height}px`;
  //   } else {
  //     this._spaceDiv.style.height = `${width}px`;
  //     this._spaceDiv.style.width = `${width}px`;
  //   }

  //   this._space.resize();
  // }

  /**
   * Create a finger `<div>` and append it to the DOM (as a child of the
   * `view`).
   * @param {Number} id Identifier of the `<div>` (comes from the touch
   * identifier).
   * @param {Number[]} coordinates Coordinates of the `<div>` (comes from the
   * touch coordinates, as a `[x:Number, y:Number]` array).
   */
  // _createFingerDiv(id, coordinates) {
  //   // Calculate the radius in pixels
  //   const radius = fingerRadius * this._pxRatio;

  //   // Calculate the coordinates of the finger `<div>`
  //   const xOffset = coordinates[0] - radius;
  //   const yOffset = coordinates[1] - radius;

  //   // Create the HTML element
  //   let fingerDiv = document.createElement('div');
  //   fingerDiv.classList.add('finger');
  //   fingerDiv.style.height = `${2 * radius}px`;
  //   fingerDiv.style.width = `${2 * radius}px`;
  //   fingerDiv.style.left = `${xOffset}px`;
  //   fingerDiv.style.top = `${yOffset}px`;

  //   this._fingerDivs[id] = fingerDiv;
  //   this.view.appendChild(fingerDiv);
  //   // this._spaceDiv.insertBefore(fingerDiv, this._spaceDiv.firstChild.nextSibling);

  //   // Timeout
  //   this._fingerDivTimeouts[id] = setTimeout(() => {
  //     this._removeFingerDiv(id);
  //   }, timeoutDuration * 1000);
  // }

  /**
   * Move a finger `<div>`.
   * @param {Number} id Identifier of the `<div>`.
   * @param {Number[]} coordinates Coordinates of the `<div>` (as a `[x:Number,
   * y:Number]` array).
   */
  // _moveFingerDiv(id, coordinates) {
  //   // Calculate the radius in pixels
  //   const radius = fingerRadius * this._pxRatio;

  //   // Calculate the coordinates of the finger `<div>`
  //   const xOffset = coordinates[0] - radius;
  //   const yOffset = coordinates[1] - radius;

  //   // Move the finger `<div>`
  //   let fingerDiv = this._fingerDivs[id];
  //   fingerDiv.style.left = `${xOffset}px`;
  //   fingerDiv.style.top = `${yOffset}px`;

  //   // Timeout
  //   clearTimeout(this._fingerDivTimeouts[id]);
  //   this._fingerDivTimeouts[id] = setTimeout(() => {
  //     this._removeFingerDiv(id);
  //   }, timeoutDuration * 1000);
  // }

  /**
   * Deletes a finger div from the DOM.
   * @param {Number} id Identifier of the `<div>`.
   */
  // _removeFingerDiv(id) {
  //   // Remove the finger `div from the DOM and the dictionary
  //   // this._spaceDiv.removeChild(this._fingerDivs[id]);
  //   this.view.removeChild(this._fingerDivs[id]);
  //   delete this._fingerDivs[id];

  //   // Timeout
  //   clearTimeout(this._fingerDivTimeouts[id]);
  //   delete this._fingerDivTimeouts[id];
  // }
}
