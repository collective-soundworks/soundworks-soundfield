// Import Soundworks modules (client side)
import clientSide from 'soundworks/client';
const client = clientSide.client;

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

// Helper functions
function createSpaceDiv(view) {
  let spaceDiv = document.createElement('div');
  spaceDiv.setAttribute('id', 'setup');

  let spaceTextDiv = document.createElement('div');
  spaceTextDiv.innerHTML = 'Move your finger on screen';
  spaceTextDiv.classList.add('centered-content');

  let surface = document.createElement('div');
  surface.setAttribute('id', 'touchsurface');
  surface.classList.add('touchsurface');

  spaceDiv.appendChild(surface);
  spaceDiv.appendChild(spaceTextDiv);
  view.appendChild(spaceDiv);

  return {
    spaceDiv: spaceDiv,
    surface: surface
  }
}

// SoloistPerformance class
export default class SoloistPerformance extends clientSide.Performance {
  constructor(setup, space, options = {}) {
    super(options);

    let dom = createSpaceDiv(this.view);

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

    /**
     * Setup.
     * @type {Space}
     */
    this._setup = setup;

    /**
     * Space.
     * @type {Space}
     */
    this._space = space;

    /**
     * `div` to represent the Space visualization.
     * @type {DOMElement}
     */
    this._spaceDiv = dom.spaceDiv;

    /**
     * Touch surface.
     * @type {DOMElement}
     */
    this._surface = dom.surface;

    /**
     * Dictionary of the current touches (fingers) on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    this._touches = {};

    // Method bindings
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onTouch = this._onTouch.bind(this);
    this._onPlayerAdd = this._onPlayerAdd.bind(this);
    this._onPlayerList = this._onPlayerList.bind(this);
    this._onPlayerRemove = this._onPlayerRemove.bind(this);
  }

  /**
   * Number by which we multiply the fingerRadius constant to get the radius
   * value in pixels.
   * @return {Number} Minimum of the space visualization height or width, in
   * pixels.
   */
  get _pxRatio() {
    return Math.min(this._spaceDiv.offsetHeight, this._spaceDiv.offsetWidth);
  }

  /**
   * Starts the module.
   *
   * Setup listeners for:
   * - the messages from the server;
   * - the window `'resize'` event;
   * - the touch events.
   * Display the space visualization.
   */
  start() {
    super.start();

    // Display the space visualization in the view and adapt the size
    this._space.display(this._setup, this._spaceDiv, { transform: 'rotate180' });
    this._onWindowResize();

    // Setup listeners for player connections / disconnections
    client.receive('performance:playerList', this._onPlayerList);
    client.receive('performance:playerAdd', this._onPlayer);
    client.receive('performance:playerRemove', this._onRemovePlayer);

    // Setup window resize listener
    window.addEventListener('resize', this._onWindowResize);

    // Setup touch event listeners
    this._surface.addEventListener('touchstart', this._onTouch);
    this._surface.addEventListener('touchmove', this._onTouch);
    this._surface.addEventListener('touchend', this._onTouch);
    this._surface.addEventListener('touchcancel', this._onTouch);
  }

  /**
   * Resets the module to its initial state.
   *
   * Remove listeners for:
   * - the messages from the server;
   * - the window `'resize'` event;
   * - the touch events.
   * Remove the space visualization.
   */
  reset() {
    super.reset();

    // Remove listeners for player connections / disconnections
    client.removeListener('performance:playerList', this._onPlayerList);
    client.removeListener('performance:playerAdd', this._onPlayerAdd);
    client.removeListener('performance:playerRemove', this._onPlayerRemove);

    // Remove window resize listener
    window.removeEventListener('resize', this._onWindowResize);

    // Remove touch event listeners
    this._surface.removeEventListener('touchstart', this._onTouch);
    this._surface.removeEventListener('touchmove', this._onTouch);
    this._surface.removeEventListener('touchend', this._onTouch);
    this._surface.removeEventListener('touchcancel', this._onTouch);

    // Remove the space visualization from the view
    this.view.innerHTML = '';
  }

  /**
   * Add a player to the space visualization.
   * @param {Object} player Player.
   */
  _onPlayerAdd(player) {
    this._space.addPosition(player, 10);
  }

  /**
   * Display all the players from a list in the space visualization.
   * @param {Object[]} playerList List of players.
   */
  _onPlayerList(playerList) {
    this._space.displayPositions(playerList, 10);
  }

  /**
   * Remove a player from the space visualization.
   * @param {Object} player Player.
   */
  _onPlayerRemove(player) {
    this._space.removePosition(player);
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
      let touch = { id: identifier, coordinates: coordinates };

      // Calculate normalized touch position in the surface's referential
      // (We multiply by -1 because the surface is rotated by 180° on the
      // soloist display)
      let x = -(coordinates[0] -
                this._spaceDiv.offsetLeft -
                this._setup.svgOffsetLeft ) / this._setup.svgWidth;
      let y = -(coordinates[1] -
                this._spaceDiv.offsetTop -
                this._setup.svgOffsetTop) / this._setup.svgHeight;

      // Depending on the event type…
      switch (type) {
        // `'touchstart'`:
        // - add the touch coordinates to the dictionary `this._touches`
        // - create a `div` under the finger
        case 'touchstart':
          this._touches[identifier] = [x, y];
          this._createFingerDiv(identifier, coordinates);
          client.send('soloist:performance:touchstart', touch);
          break;

        // `'touchmove'`:
        // - add or update the touch coordinates to the dictionary
        //     `this._touches`
        // - move the `div` under the finger or create one if it doesn't exist
        //   already (may happen if the finger slides from the edge of the
        //   touchscreen)
        case 'touchmove': {
          this._touches[identifier] = [x, y];
          if (this._fingerDivs[identifier])
            this._moveFingerDiv(identifier, coordinates);
          else
            this._createFingerDiv(identifier, coordinates);
          client.send('soloist:touchmove', touch);
          break;
        }

        // `'touchend'`:
        // - delete the touch in the dictionary `this._touches`
        // - remove the corresponding `div`
        case 'touchend': {
          delete this._touches[identifier];
          if (this._fingerDivs[identifier])
            this._removeFingerDiv(identifier);
          client.send('soloist:touchendorcancel', touch);
          break;
        }

        // `'touchcancel'`: similar to `'touchend'`
        case 'touchcancel': {
          delete this._touches[identifier];
          if (this._fingerDivs[identifier])
            this._removeFingerDiv(identifier);
          client.send('soloist:touchendorcancel', touch);
          break;
        }
      }
    }
  }

  /**
   * Window resize handler.
   * Redraw the space visualization to fit the window or screen size.
   * @return {[type]} [description]
   */
  _onWindowResize() {
    const height = window.innerHeight;
    const width = window.innerWidth;

    if (width > height) {
      this._spaceDiv.style.height = `${height}px`;
      this._spaceDiv.style.width = `${height}px`;
    } else {
      this._spaceDiv.style.height = `${width}px`;
      this._spaceDiv.style.width = `${width}px`;
    }

    this._space.resize();
  }

  /**
   * Create a finger `div` and append it to the DOM (as a child of the `view`).
   * @param {Number} id Identifier of the `div` (comes from the touch
   * identifier).
   * @param {Number[]} coordinates Coordinates of the `div` (comes from the
   * touch coordinates, as a `[x:Number, y:Number]` array).
   */
  _createFingerDiv(id, coordinates) {
    // Calculate the radius in pixels
    const radius = fingerRadius * this._pxRatio;

    // Calculate the coordinates of the finger `div`
    const xOffset = coordinates[0] - radius;
    const yOffset = coordinates[1] - radius;

    // Create the HTML element
    let fingerDiv = document.createElement('div');
    fingerDiv.classList.add('finger');
    fingerDiv.style.height = `${2 * radius}px`;
    fingerDiv.style.width = `${2 * radius}px`;
    fingerDiv.style.left = `${xOffset}px`;
    fingerDiv.style.top = `${yOffset}px`;

    this._fingerDivs[id] = fingerDiv;
    this._spaceDiv.insertBefore(fingerDiv, this._spaceDiv.firstChild.nextSibling);

    // Timeout
    this._fingerDivTimeouts[id] = setTimeout(() => {
      this._removeFingerDiv(id);
    }, timeoutLength * 1000);
  }

  /**
   * Move a finger `div`.
   * @param {Number} id Identifier of the `div`.
   * @param {Number[]} coordinates Coordinates of the `div` (as a `[x:Number,
   * y:Number]` array).
   */
  _moveFingerDiv(id, coordinates) {
    // Calculate the radius in pixels
    const radius = fingerRadius * this._pxRatio;

    // Calculate the coordinates of the finger `div`
    const xOffset = coordinates[0] - radius;
    const yOffset = coordinates[1] - radius;

    // Move the finger `div`
    let fingerDiv = this._fingerDivs[id];
    fingerDiv.style.left = `${xOffset}px`;
    fingerDiv.style.top = `${yOffset}px`;

    // Timeout
    clearTimeout(this._fingerDivTimeouts[id]);
    this._fingerDivTimeouts[id] = setTimeout(() => {
      this._removeFingerDiv(id);
    }, timeoutLength * 1000);
  }

  /**
   * Deletes a finger div from the DOM.
   * @param {Number} id Identifier of the `div`.
   */
  _removeFingerDiv(id) {
    // Remove the finger `div from the DOM and the dictionary
    this._spaceDiv.removeChild(this._fingerDivs[id]);
    delete this._fingerDivs[id];

    // Timeout
    clearTimeout(this._fingerDivTimeouts[id]);
    delete this._fingerDivTimeouts[id];
  }
}
