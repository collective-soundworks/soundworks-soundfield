// Import Soundworks modules (client side)
import soundworks from 'soundworks/client';
const SpaceView = soundworks.display.SpaceView;

/**
 * Size of the finger visualization relative to the setup size.
 * @type {Number}
 */
const fingerRadius = 1;

/**
 * Length of the timeout (in seconds) after which the touch is automatically
 * removed (useful when a `'touchend'` or `'touchcancel'` message doesn't go
 * through).
 * @type {Number}
 */
const timeoutDuration = 8;

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
  /**
   * Create and instance of the class.
   * @param {Setup} setup Setup of the scenario.
   * @param {Space} space Space used to display the visualization.
   * @param {Object} [options={}] Options (as in the base class).
   */
  constructor(setup, space, options = {}) {
    super(options);

    // const dom = createSpaceDiv(this.view);

    /**
     * Setup of the scenario.
     * @type {Space}
     */
    // this._setup = setup;

    /**
     * Space used to display the visualization.
     * @type {Space}
     */
    // this._space = space;

    /**
     * `<div>` to represent the Space visualization.
     * @type {DOMElement}
     */
    // this._spaceDiv = dom.spaceDiv;

    /**
     * Touch surface.
     * @type {DOMElement}
     */
    // this._surface = dom.surface;

    // Method bindings
    // this._onWindowResize = this._onWindowResize.bind(this);
    // this._onTouch = this._onTouch.bind(this);
    // this._onPlayerAdd = this._onPlayerAdd.bind(this);
    // this._onPlayerList = this._onPlayerList.bind(this);
    // this._onPlayerRemove = this._onPlayerRemove.bind(this);
  }


  init() {
    /**
     * Dictionary of the DOM elements that represent a finger on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    this._fingerDivs = {};

    /**
     * Dictionary of the timeouts for each finger DOM element on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    this._fingerDivTimeouts = {};

    // this.viewCtor = SpaceView;
    // this.view = this.createView();
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
    console.log('start');

    if (!this.hasStarted)
      this.init();

    // request for area
    this.send('request');

    this.receive('area', (area) => {
      console.log(area);
      this.view = new SpaceView(area);
      this.show();
    });
    // Display the space visualization in the view and adapt the size
    // this._space.display(this._setup, this._spaceDiv);
    // this._onWindowResize();

    // Setup listeners for player connections / disconnections
    // client.receive('performance:playerList', this._onPlayerList);
    // client.receive('performance:playerAdd', this._onPlayerAdd);
    // client.receive('performance:playerRemove', this._onPlayerRemove);

    // // Setup window resize listener
    // window.addEventListener('resize', this._onWindowResize);

    // // Setup touch event listeners
    // this._surface.addEventListener('touchstart', this._onTouch);
    // this._surface.addEventListener('touchmove', this._onTouch);
    // this._surface.addEventListener('touchend', this._onTouch);
    // this._surface.addEventListener('touchcancel', this._onTouch);
  }

    /**
   * Display all the players from a list in the space visualization.
   * @param {Object[]} playerList List of players.
   */
  _onPlayerList(playerList) {
    this.view.displayPositions(playerList, 10);
  }

  /**
   * Add a player to the space visualization.
   * @param {Object} player Player.
   */
  _onPlayerAdd(player) {
    this.view.addPosition(player, 10);
  }

  /**
   * Remove a player from the space visualization.
   * @param {Object} player Player.
   */
  _onPlayerRemove(player) {
    this.view.removePosition(player);
  }

  /**
   * Touch event handler
   * @param {Object} e Touch event.
   */
  _onTouch(e) {
    // Prevent scrolling
    e.preventDefault();

    // A few constants
    const type = e.type;
    const changedTouches = e.changedTouches;

    // Iterate through the changedTouches array
    for (let i = 0; i < changedTouches.length; i++) {
      // Retrieve touch data
      let coordinates = [changedTouches[i].clientX, changedTouches[i].clientY];
      let identifier = changedTouches[i].identifier;

      // Calculate normalized touch position
      let x = (coordinates[0] -
               this._spaceDiv.offsetLeft -
               this._space.svgOffsetLeft ) / this._space.svgWidth;
      let y = (coordinates[1] -
               this._spaceDiv.offsetTop -
               this._space.svgOffsetTop) / this._space.svgHeight;

      // Touch information with normalized coordinates
      let touchNorm = { id: identifier, coordinates: [x, y] };

      // Depending on the event type…
      switch (type) {
        case 'touchstart':
          // Create a `<div>` under the finger
          this._createFingerDiv(identifier, coordinates);

          // Send message to the server
          client.send('soloist:touchstart', touchNorm);
          break;

        case 'touchmove': {
          // Move the `<div>` under the finger or create one if it doesn't exist
          // already (may happen if the finger slides from the edge of the
          // touchscreen)
          if (this._fingerDivs[identifier])
            this._moveFingerDiv(identifier, coordinates);
          else
            this._createFingerDiv(identifier, coordinates);

          // Send message to the server
          client.send('soloist:touchmove', touchNorm);
          break;
        }

        case 'touchend': {
          // Remove the finger div
          if (this._fingerDivs[identifier])
            this._removeFingerDiv(identifier);

          // Send a message to the server
          client.send('soloist:touchendorcancel', touchNorm);
          break;
        }

        case 'touchcancel': {
          // Remove the finger div
          if (this._fingerDivs[identifier])
            this._removeFingerDiv(identifier);

          // Send a message to the server
          client.send('soloist:touchendorcancel', touchNorm);
          break;
        }
      }
    }
  }

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
