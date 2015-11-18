// Import Soundworks modules (client side)
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _soundworksClient = require('soundworks/client');

var _soundworksClient2 = _interopRequireDefault(_soundworksClient);

var client = _soundworksClient2['default'].client;

/**
 * Normalized value of radius of the finger graphical representation (a
 * translucent red circle).
 * A value of 1 correspond to a radius equal to the minimum of the height or
 * width of the space visualization.
 * @type {Number}
 */
var fingerRadius = 0.1;

/**
 * Length of the timeout (in seconds) after which the touch is automatically
 * removed (useful when a `'touchend'` or `'touchcancel'` message doesn't go
 * through).
 * @type {Number}
 */
var timeoutLength = 8;

/**
 * Create a `<div>` to display the `Space` and another `<div>` to listen to the
 * `'touchstart'`, `'touchmove'`, `'touchend'`, `'touchcancel'` events.
 * @param {DOMElement} view View of the module in which to display the `Space`.
 * @return {Object} `<div>` elements.
 * @property {DOMElement} spaceDiv `<div>` in which to display the `Space`.
 * @property {DOMElement} surface `<div>` to listen to the touch events.
 */
function createSpaceDiv(view) {
  var spaceDiv = document.createElement('div');
  spaceDiv.setAttribute('id', 'setup');

  var spaceTextDiv = document.createElement('div');
  spaceTextDiv.innerHTML = 'Move your finger on screen';
  spaceTextDiv.classList.add('centered-content');

  var surface = document.createElement('div');
  surface.setAttribute('id', 'touchsurface');
  surface.classList.add('touchsurface');

  spaceDiv.appendChild(surface);
  spaceDiv.appendChild(spaceTextDiv);
  view.appendChild(spaceDiv);

  return {
    spaceDiv: spaceDiv,
    surface: surface
  };
}

/**
 * `SoloistPerformance` class.
 * The `SoloistPerformance` is responsible for:
 * - displaying the positions on the players in the performance;
 * - tracking the soloist's finger(s) on screen and sending the touch
 *   coordinates to the server.
 */

var SoloistPerformance = (function (_clientSide$Performance) {
  _inherits(SoloistPerformance, _clientSide$Performance);

  /**
   * Create and instance of the class.
   * @param {Setup} setup Setup of the scenario.
   * @param {Space} space Space used to display the visualization.
   * @param {Object} [options={}] Options (as in the base class).
   */

  function SoloistPerformance(setup, space) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, SoloistPerformance);

    _get(Object.getPrototypeOf(SoloistPerformance.prototype), 'constructor', this).call(this, options);

    var dom = createSpaceDiv(this.view);

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
     * Setup of the scenario.
     * @type {Space}
     */
    this._setup = setup;

    /**
     * Space used to display the visualization.
     * @type {Space}
     */
    this._space = space;

    /**
     * `<div>` to represent the Space visualization.
     * @type {DOMElement}
     */
    this._spaceDiv = dom.spaceDiv;

    /**
     * Touch surface.
     * @type {DOMElement}
     */
    this._surface = dom.surface;

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

  _createClass(SoloistPerformance, [{
    key: 'start',

    /**
     * Start the module.
     *
     * Setup listeners for:
     * - the messages from the server;
     * - the window `'resize'` event;
     * - the touch events.
     * Display the space visualization.
     */
    value: function start() {
      _get(Object.getPrototypeOf(SoloistPerformance.prototype), 'start', this).call(this);

      // Display the space visualization in the view and adapt the size
      this._space.display(this._setup, this._spaceDiv);
      this._onWindowResize();

      // Setup listeners for player connections / disconnections
      client.receive('performance:playerList', this._onPlayerList);
      client.receive('performance:playerAdd', this._onPlayerAdd);
      client.receive('performance:playerRemove', this._onPlayerRemove);

      // Setup window resize listener
      window.addEventListener('resize', this._onWindowResize);

      // Setup touch event listeners
      this._surface.addEventListener('touchstart', this._onTouch);
      this._surface.addEventListener('touchmove', this._onTouch);
      this._surface.addEventListener('touchend', this._onTouch);
      this._surface.addEventListener('touchcancel', this._onTouch);
    }

    /**
     * Reset the module to its initial state.
     *
     * Remove listeners for:
     * - the messages from the server;
     * - the window `'resize'` event;
     * - the touch events.
     * Remove the space visualization.
     */
  }, {
    key: 'reset',
    value: function reset() {
      _get(Object.getPrototypeOf(SoloistPerformance.prototype), 'reset', this).call(this);

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
  }, {
    key: '_onPlayerAdd',
    value: function _onPlayerAdd(player) {
      this._space.addPosition(player, 10);
    }

    /**
     * Display all the players from a list in the space visualization.
     * @param {Object[]} playerList List of players.
     */
  }, {
    key: '_onPlayerList',
    value: function _onPlayerList(playerList) {
      this._space.displayPositions(playerList, 10);
    }

    /**
     * Remove a player from the space visualization.
     * @param {Object} player Player.
     */
  }, {
    key: '_onPlayerRemove',
    value: function _onPlayerRemove(player) {
      this._space.removePosition(player);
    }

    /**
     * Touch event handler
     * @param {Object} e Touch event.
     */
  }, {
    key: '_onTouch',
    value: function _onTouch(e) {
      // Prevent scrolling
      e.preventDefault();

      // A few constants
      var type = e.type;
      var changedTouches = e.changedTouches;

      // Iterate through the changedTouches array
      for (var i = 0; i < changedTouches.length; i++) {
        // Retrieve touch data
        var coordinates = [changedTouches[i].clientX, changedTouches[i].clientY];
        var identifier = changedTouches[i].identifier;

        // Calculate normalized touch position
        var x = (coordinates[0] - this._spaceDiv.offsetLeft - this._space.svgOffsetLeft) / this._space.svgWidth;
        var y = (coordinates[1] - this._spaceDiv.offsetTop - this._space.svgOffsetTop) / this._space.svgHeight;

        // Touch information with normalized coordinates
        var touchNorm = { id: identifier, coordinates: [x, y] };

        // Depending on the event type…
        switch (type) {
          case 'touchstart':
            // Create a `<div>` under the finger
            this._createFingerDiv(identifier, coordinates);

            // Send message to the server
            client.send('soloist:touchstart', touchNorm);
            break;

          case 'touchmove':
            {
              // Move the `<div>` under the finger or create one if it doesn't exist
              // already (may happen if the finger slides from the edge of the
              // touchscreen)
              if (this._fingerDivs[identifier]) this._moveFingerDiv(identifier, coordinates);else this._createFingerDiv(identifier, coordinates);

              // Send message to the server
              client.send('soloist:touchmove', touchNorm);
              break;
            }

          case 'touchend':
            {
              // Remove the finger div
              if (this._fingerDivs[identifier]) this._removeFingerDiv(identifier);

              // Send a message to the server
              client.send('soloist:touchendorcancel', touchNorm);
              break;
            }

          case 'touchcancel':
            {
              // Remove the finger div
              if (this._fingerDivs[identifier]) this._removeFingerDiv(identifier);

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
  }, {
    key: '_onWindowResize',
    value: function _onWindowResize() {
      var height = window.innerHeight;
      var width = window.innerWidth;

      if (width > height) {
        this._spaceDiv.style.height = height + 'px';
        this._spaceDiv.style.width = height + 'px';
      } else {
        this._spaceDiv.style.height = width + 'px';
        this._spaceDiv.style.width = width + 'px';
      }

      this._space.resize();
    }

    /**
     * Create a finger `<div>` and append it to the DOM (as a child of the
     * `view`).
     * @param {Number} id Identifier of the `<div>` (comes from the touch
     * identifier).
     * @param {Number[]} coordinates Coordinates of the `<div>` (comes from the
     * touch coordinates, as a `[x:Number, y:Number]` array).
     */
  }, {
    key: '_createFingerDiv',
    value: function _createFingerDiv(id, coordinates) {
      var _this = this;

      // Calculate the radius in pixels
      var radius = fingerRadius * this._pxRatio;

      // Calculate the coordinates of the finger `<div>`
      var xOffset = coordinates[0] - radius;
      var yOffset = coordinates[1] - radius;

      // Create the HTML element
      var fingerDiv = document.createElement('div');
      fingerDiv.classList.add('finger');
      fingerDiv.style.height = 2 * radius + 'px';
      fingerDiv.style.width = 2 * radius + 'px';
      fingerDiv.style.left = xOffset + 'px';
      fingerDiv.style.top = yOffset + 'px';

      this._fingerDivs[id] = fingerDiv;
      this.view.appendChild(fingerDiv);
      // this._spaceDiv.insertBefore(fingerDiv, this._spaceDiv.firstChild.nextSibling);

      // Timeout
      this._fingerDivTimeouts[id] = setTimeout(function () {
        _this._removeFingerDiv(id);
      }, timeoutLength * 1000);
    }

    /**
     * Move a finger `<div>`.
     * @param {Number} id Identifier of the `<div>`.
     * @param {Number[]} coordinates Coordinates of the `<div>` (as a `[x:Number,
     * y:Number]` array).
     */
  }, {
    key: '_moveFingerDiv',
    value: function _moveFingerDiv(id, coordinates) {
      var _this2 = this;

      // Calculate the radius in pixels
      var radius = fingerRadius * this._pxRatio;

      // Calculate the coordinates of the finger `<div>`
      var xOffset = coordinates[0] - radius;
      var yOffset = coordinates[1] - radius;

      // Move the finger `<div>`
      var fingerDiv = this._fingerDivs[id];
      fingerDiv.style.left = xOffset + 'px';
      fingerDiv.style.top = yOffset + 'px';

      // Timeout
      clearTimeout(this._fingerDivTimeouts[id]);
      this._fingerDivTimeouts[id] = setTimeout(function () {
        _this2._removeFingerDiv(id);
      }, timeoutLength * 1000);
    }

    /**
     * Deletes a finger div from the DOM.
     * @param {Number} id Identifier of the `<div>`.
     */
  }, {
    key: '_removeFingerDiv',
    value: function _removeFingerDiv(id) {
      // Remove the finger `div from the DOM and the dictionary
      // this._spaceDiv.removeChild(this._fingerDivs[id]);
      this.view.removeChild(this._fingerDivs[id]);
      delete this._fingerDivs[id];

      // Timeout
      clearTimeout(this._fingerDivTimeouts[id]);
      delete this._fingerDivTimeouts[id];
    }
  }, {
    key: '_pxRatio',
    get: function get() {
      return Math.min(this._spaceDiv.offsetHeight, this._spaceDiv.offsetWidth);
    }
  }]);

  return SoloistPerformance;
})(_soundworksClient2['default'].Performance);

exports['default'] = SoloistPerformance;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvc29sb2lzdC9Tb2xvaXN0UGVyZm9ybWFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBQ3VCLG1CQUFtQjs7OztBQUMxQyxJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7Ozs7Ozs7OztBQVNqQyxJQUFNLFlBQVksR0FBRyxHQUFHLENBQUM7Ozs7Ozs7O0FBUXpCLElBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQzs7Ozs7Ozs7OztBQVV4QixTQUFTLGNBQWMsQ0FBQyxJQUFJLEVBQUU7QUFDNUIsTUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QyxVQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFckMsTUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqRCxjQUFZLENBQUMsU0FBUyxHQUFHLDRCQUE0QixDQUFDO0FBQ3RELGNBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7O0FBRS9DLE1BQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUMsU0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDM0MsU0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRXRDLFVBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUIsVUFBUSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNuQyxNQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUUzQixTQUFPO0FBQ0wsWUFBUSxFQUFF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QztLQUMxRTs7O1NBbEVrQixrQkFBa0I7R0FBUyw4QkFBVyxXQUFXOztxQkFBakQsa0JBQWtCIiwiZmlsZSI6Ii9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvc29sb2lzdC9Tb2xvaXN0UGVyZm9ybWFuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbXBvcnQgU291bmR3b3JrcyBtb2R1bGVzIChjbGllbnQgc2lkZSlcbmltcG9ydCBjbGllbnRTaWRlIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmNvbnN0IGNsaWVudCA9IGNsaWVudFNpZGUuY2xpZW50O1xuXG4vKipcbiAqIE5vcm1hbGl6ZWQgdmFsdWUgb2YgcmFkaXVzIG9mIHRoZSBmaW5nZXIgZ3JhcGhpY2FsIHJlcHJlc2VudGF0aW9uIChhXG4gKiB0cmFuc2x1Y2VudCByZWQgY2lyY2xlKS5cbiAqIEEgdmFsdWUgb2YgMSBjb3JyZXNwb25kIHRvIGEgcmFkaXVzIGVxdWFsIHRvIHRoZSBtaW5pbXVtIG9mIHRoZSBoZWlnaHQgb3JcbiAqIHdpZHRoIG9mIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uLlxuICogQHR5cGUge051bWJlcn1cbiAqL1xuY29uc3QgZmluZ2VyUmFkaXVzID0gMC4xO1xuXG4vKipcbiAqIExlbmd0aCBvZiB0aGUgdGltZW91dCAoaW4gc2Vjb25kcykgYWZ0ZXIgd2hpY2ggdGhlIHRvdWNoIGlzIGF1dG9tYXRpY2FsbHlcbiAqIHJlbW92ZWQgKHVzZWZ1bCB3aGVuIGEgYCd0b3VjaGVuZCdgIG9yIGAndG91Y2hjYW5jZWwnYCBtZXNzYWdlIGRvZXNuJ3QgZ29cbiAqIHRocm91Z2gpLlxuICogQHR5cGUge051bWJlcn1cbiAqL1xuY29uc3QgdGltZW91dExlbmd0aCA9IDg7XG5cbi8qKlxuICogQ3JlYXRlIGEgYDxkaXY+YCB0byBkaXNwbGF5IHRoZSBgU3BhY2VgIGFuZCBhbm90aGVyIGA8ZGl2PmAgdG8gbGlzdGVuIHRvIHRoZVxuICogYCd0b3VjaHN0YXJ0J2AsIGAndG91Y2htb3ZlJ2AsIGAndG91Y2hlbmQnYCwgYCd0b3VjaGNhbmNlbCdgIGV2ZW50cy5cbiAqIEBwYXJhbSB7RE9NRWxlbWVudH0gdmlldyBWaWV3IG9mIHRoZSBtb2R1bGUgaW4gd2hpY2ggdG8gZGlzcGxheSB0aGUgYFNwYWNlYC5cbiAqIEByZXR1cm4ge09iamVjdH0gYDxkaXY+YCBlbGVtZW50cy5cbiAqIEBwcm9wZXJ0eSB7RE9NRWxlbWVudH0gc3BhY2VEaXYgYDxkaXY+YCBpbiB3aGljaCB0byBkaXNwbGF5IHRoZSBgU3BhY2VgLlxuICogQHByb3BlcnR5IHtET01FbGVtZW50fSBzdXJmYWNlIGA8ZGl2PmAgdG8gbGlzdGVuIHRvIHRoZSB0b3VjaCBldmVudHMuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVNwYWNlRGl2KHZpZXcpIHtcbiAgbGV0IHNwYWNlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHNwYWNlRGl2LnNldEF0dHJpYnV0ZSgnaWQnLCAnc2V0dXAnKTtcblxuICBsZXQgc3BhY2VUZXh0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHNwYWNlVGV4dERpdi5pbm5lckhUTUwgPSAnTW92ZSB5b3VyIGZpbmdlciBvbiBzY3JlZW4nO1xuICBzcGFjZVRleHREaXYuY2xhc3NMaXN0LmFkZCgnY2VudGVyZWQtY29udGVudCcpO1xuXG4gIGxldCBzdXJmYWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHN1cmZhY2Uuc2V0QXR0cmlidXRlKCdpZCcsICd0b3VjaHN1cmZhY2UnKTtcbiAgc3VyZmFjZS5jbGFzc0xpc3QuYWRkKCd0b3VjaHN1cmZhY2UnKTtcblxuICBzcGFjZURpdi5hcHBlbmRDaGlsZChzdXJmYWNlKTtcbiAgc3BhY2VEaXYuYXBwZW5kQ2hpbGQoc3BhY2VUZXh0RGl2KTtcbiAgdmlldy5hcHBlbmRDaGlsZChzcGFjZURpdik7XG5cbiAgcmV0dXJuIHtcbiAgICBzcGFjZURpdjogc3BhY2VEaXYsXG4gICAgc3VyZmFjZTogc3VyZmFjZVxuICB9XG59XG5cbi8qKlxuICogYFNvbG9pc3RQZXJmb3JtYW5jZWAgY2xhc3MuXG4gKiBUaGUgYFNvbG9pc3RQZXJmb3JtYW5jZWAgaXMgcmVzcG9uc2libGUgZm9yOlxuICogLSBkaXNwbGF5aW5nIHRoZSBwb3NpdGlvbnMgb24gdGhlIHBsYXllcnMgaW4gdGhlIHBlcmZvcm1hbmNlO1xuICogLSB0cmFja2luZyB0aGUgc29sb2lzdCdzIGZpbmdlcihzKSBvbiBzY3JlZW4gYW5kIHNlbmRpbmcgdGhlIHRvdWNoXG4gKiAgIGNvb3JkaW5hdGVzIHRvIHRoZSBzZXJ2ZXIuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvbG9pc3RQZXJmb3JtYW5jZSBleHRlbmRzIGNsaWVudFNpZGUuUGVyZm9ybWFuY2Uge1xuICAvKipcbiAgICogQ3JlYXRlIGFuZCBpbnN0YW5jZSBvZiB0aGUgY2xhc3MuXG4gICAqIEBwYXJhbSB7U2V0dXB9IHNldHVwIFNldHVwIG9mIHRoZSBzY2VuYXJpby5cbiAgICogQHBhcmFtIHtTcGFjZX0gc3BhY2UgU3BhY2UgdXNlZCB0byBkaXNwbGF5IHRoZSB2aXN1YWxpemF0aW9uLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIE9wdGlvbnMgKGFzIGluIHRoZSBiYXNlIGNsYXNzKS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHNldHVwLCBzcGFjZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucyk7XG5cbiAgICBjb25zdCBkb20gPSBjcmVhdGVTcGFjZURpdih0aGlzLnZpZXcpO1xuXG4gICAgLyoqXG4gICAgICogRGljdGlvbmFyeSBvZiB0aGUgRE9NIGVsZW1lbnRzIHRoYXQgcmVwcmVzZW50IGEgZmluZ2VyIG9uIHNjcmVlbi5cbiAgICAgKiBLZXlzIGFyZSB0aGUgdG91Y2ggaWRlbnRpZmllcnMgcmV0cml2ZWQgaW4gdGhlIHRvdWNoIGV2ZW50cy5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuX2ZpbmdlckRpdnMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIERpY3Rpb25hcnkgb2YgdGhlIHRpbWVvdXRzIGZvciBlYWNoIGZpbmdlciBET00gZWxlbWVudCBvbiBzY3JlZW4uXG4gICAgICogS2V5cyBhcmUgdGhlIHRvdWNoIGlkZW50aWZpZXJzIHJldHJpdmVkIGluIHRoZSB0b3VjaCBldmVudHMuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB0aGlzLl9maW5nZXJEaXZUaW1lb3V0cyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogU2V0dXAgb2YgdGhlIHNjZW5hcmlvLlxuICAgICAqIEB0eXBlIHtTcGFjZX1cbiAgICAgKi9cbiAgICB0aGlzLl9zZXR1cCA9IHNldHVwO1xuXG4gICAgLyoqXG4gICAgICogU3BhY2UgdXNlZCB0byBkaXNwbGF5IHRoZSB2aXN1YWxpemF0aW9uLlxuICAgICAqIEB0eXBlIHtTcGFjZX1cbiAgICAgKi9cbiAgICB0aGlzLl9zcGFjZSA9IHNwYWNlO1xuXG4gICAgLyoqXG4gICAgICogYDxkaXY+YCB0byByZXByZXNlbnQgdGhlIFNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAgICogQHR5cGUge0RPTUVsZW1lbnR9XG4gICAgICovXG4gICAgdGhpcy5fc3BhY2VEaXYgPSBkb20uc3BhY2VEaXY7XG5cbiAgICAvKipcbiAgICAgKiBUb3VjaCBzdXJmYWNlLlxuICAgICAqIEB0eXBlIHtET01FbGVtZW50fVxuICAgICAqL1xuICAgIHRoaXMuX3N1cmZhY2UgPSBkb20uc3VyZmFjZTtcblxuICAgIC8vIE1ldGhvZCBiaW5kaW5nc1xuICAgIHRoaXMuX29uV2luZG93UmVzaXplID0gdGhpcy5fb25XaW5kb3dSZXNpemUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblRvdWNoID0gdGhpcy5fb25Ub3VjaC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uUGxheWVyQWRkID0gdGhpcy5fb25QbGF5ZXJBZGQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblBsYXllckxpc3QgPSB0aGlzLl9vblBsYXllckxpc3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblBsYXllclJlbW92ZSA9IHRoaXMuX29uUGxheWVyUmVtb3ZlLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogTnVtYmVyIGJ5IHdoaWNoIHdlIG11bHRpcGx5IHRoZSBmaW5nZXJSYWRpdXMgY29uc3RhbnQgdG8gZ2V0IHRoZSByYWRpdXNcbiAgICogdmFsdWUgaW4gcGl4ZWxzLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IE1pbmltdW0gb2YgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24gaGVpZ2h0IG9yIHdpZHRoLCBpblxuICAgKiBwaXhlbHMuXG4gICAqL1xuICBnZXQgX3B4UmF0aW8oKSB7XG4gICAgcmV0dXJuIE1hdGgubWluKHRoaXMuX3NwYWNlRGl2Lm9mZnNldEhlaWdodCwgdGhpcy5fc3BhY2VEaXYub2Zmc2V0V2lkdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIFNldHVwIGxpc3RlbmVycyBmb3I6XG4gICAqIC0gdGhlIG1lc3NhZ2VzIGZyb20gdGhlIHNlcnZlcjtcbiAgICogLSB0aGUgd2luZG93IGAncmVzaXplJ2AgZXZlbnQ7XG4gICAqIC0gdGhlIHRvdWNoIGV2ZW50cy5cbiAgICogRGlzcGxheSB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbi5cbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICAvLyBEaXNwbGF5IHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uIGluIHRoZSB2aWV3IGFuZCBhZGFwdCB0aGUgc2l6ZVxuICAgIHRoaXMuX3NwYWNlLmRpc3BsYXkodGhpcy5fc2V0dXAsIHRoaXMuX3NwYWNlRGl2KTtcbiAgICB0aGlzLl9vbldpbmRvd1Jlc2l6ZSgpO1xuXG4gICAgLy8gU2V0dXAgbGlzdGVuZXJzIGZvciBwbGF5ZXIgY29ubmVjdGlvbnMgLyBkaXNjb25uZWN0aW9uc1xuICAgIGNsaWVudC5yZWNlaXZlKCdwZXJmb3JtYW5jZTpwbGF5ZXJMaXN0JywgdGhpcy5fb25QbGF5ZXJMaXN0KTtcbiAgICBjbGllbnQucmVjZWl2ZSgncGVyZm9ybWFuY2U6cGxheWVyQWRkJywgdGhpcy5fb25QbGF5ZXJBZGQpO1xuICAgIGNsaWVudC5yZWNlaXZlKCdwZXJmb3JtYW5jZTpwbGF5ZXJSZW1vdmUnLCB0aGlzLl9vblBsYXllclJlbW92ZSk7XG5cbiAgICAvLyBTZXR1cCB3aW5kb3cgcmVzaXplIGxpc3RlbmVyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX29uV2luZG93UmVzaXplKTtcblxuICAgIC8vIFNldHVwIHRvdWNoIGV2ZW50IGxpc3RlbmVyc1xuICAgIHRoaXMuX3N1cmZhY2UuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLl9vblRvdWNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCB0aGUgbW9kdWxlIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuICAgKlxuICAgKiBSZW1vdmUgbGlzdGVuZXJzIGZvcjpcbiAgICogLSB0aGUgbWVzc2FnZXMgZnJvbSB0aGUgc2VydmVyO1xuICAgKiAtIHRoZSB3aW5kb3cgYCdyZXNpemUnYCBldmVudDtcbiAgICogLSB0aGUgdG91Y2ggZXZlbnRzLlxuICAgKiBSZW1vdmUgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqL1xuICByZXNldCgpIHtcbiAgICBzdXBlci5yZXNldCgpO1xuXG4gICAgLy8gUmVtb3ZlIGxpc3RlbmVycyBmb3IgcGxheWVyIGNvbm5lY3Rpb25zIC8gZGlzY29ubmVjdGlvbnNcbiAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoJ3BlcmZvcm1hbmNlOnBsYXllckxpc3QnLCB0aGlzLl9vblBsYXllckxpc3QpO1xuICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcigncGVyZm9ybWFuY2U6cGxheWVyQWRkJywgdGhpcy5fb25QbGF5ZXJBZGQpO1xuICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcigncGVyZm9ybWFuY2U6cGxheWVyUmVtb3ZlJywgdGhpcy5fb25QbGF5ZXJSZW1vdmUpO1xuXG4gICAgLy8gUmVtb3ZlIHdpbmRvdyByZXNpemUgbGlzdGVuZXJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fb25XaW5kb3dSZXNpemUpO1xuXG4gICAgLy8gUmVtb3ZlIHRvdWNoIGV2ZW50IGxpc3RlbmVyc1xuICAgIHRoaXMuX3N1cmZhY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLl9vblRvdWNoKTtcblxuICAgIC8vIFJlbW92ZSB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbiBmcm9tIHRoZSB2aWV3XG4gICAgdGhpcy52aWV3LmlubmVySFRNTCA9ICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHBsYXllciB0byB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsYXllciBQbGF5ZXIuXG4gICAqL1xuICBfb25QbGF5ZXJBZGQocGxheWVyKSB7XG4gICAgdGhpcy5fc3BhY2UuYWRkUG9zaXRpb24ocGxheWVyLCAxMCk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheSBhbGwgdGhlIHBsYXllcnMgZnJvbSBhIGxpc3QgaW4gdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0W119IHBsYXllckxpc3QgTGlzdCBvZiBwbGF5ZXJzLlxuICAgKi9cbiAgX29uUGxheWVyTGlzdChwbGF5ZXJMaXN0KSB7XG4gICAgdGhpcy5fc3BhY2UuZGlzcGxheVBvc2l0aW9ucyhwbGF5ZXJMaXN0LCAxMCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgcGxheWVyIGZyb20gdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbGF5ZXIgUGxheWVyLlxuICAgKi9cbiAgX29uUGxheWVyUmVtb3ZlKHBsYXllcikge1xuICAgIHRoaXMuX3NwYWNlLnJlbW92ZVBvc2l0aW9uKHBsYXllcik7XG4gIH1cblxuICAvKipcbiAgICogVG91Y2ggZXZlbnQgaGFuZGxlclxuICAgKiBAcGFyYW0ge09iamVjdH0gZSBUb3VjaCBldmVudC5cbiAgICovXG4gIF9vblRvdWNoKGUpIHtcbiAgICAvLyBQcmV2ZW50IHNjcm9sbGluZ1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIEEgZmV3IGNvbnN0YW50c1xuICAgIGNvbnN0IHR5cGUgPSBlLnR5cGU7XG4gICAgY29uc3QgY2hhbmdlZFRvdWNoZXMgPSBlLmNoYW5nZWRUb3VjaGVzO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBjaGFuZ2VkVG91Y2hlcyBhcnJheVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIFJldHJpZXZlIHRvdWNoIGRhdGFcbiAgICAgIGxldCBjb29yZGluYXRlcyA9IFtjaGFuZ2VkVG91Y2hlc1tpXS5jbGllbnRYLCBjaGFuZ2VkVG91Y2hlc1tpXS5jbGllbnRZXTtcbiAgICAgIGxldCBpZGVudGlmaWVyID0gY2hhbmdlZFRvdWNoZXNbaV0uaWRlbnRpZmllcjtcblxuICAgICAgLy8gQ2FsY3VsYXRlIG5vcm1hbGl6ZWQgdG91Y2ggcG9zaXRpb25cbiAgICAgIGxldCB4ID0gKGNvb3JkaW5hdGVzWzBdIC1cbiAgICAgICAgICAgICAgIHRoaXMuX3NwYWNlRGl2Lm9mZnNldExlZnQgLVxuICAgICAgICAgICAgICAgdGhpcy5fc3BhY2Uuc3ZnT2Zmc2V0TGVmdCApIC8gdGhpcy5fc3BhY2Uuc3ZnV2lkdGg7XG4gICAgICBsZXQgeSA9IChjb29yZGluYXRlc1sxXSAtXG4gICAgICAgICAgICAgICB0aGlzLl9zcGFjZURpdi5vZmZzZXRUb3AgLVxuICAgICAgICAgICAgICAgdGhpcy5fc3BhY2Uuc3ZnT2Zmc2V0VG9wKSAvIHRoaXMuX3NwYWNlLnN2Z0hlaWdodDtcblxuICAgICAgLy8gVG91Y2ggaW5mb3JtYXRpb24gd2l0aCBub3JtYWxpemVkIGNvb3JkaW5hdGVzXG4gICAgICBsZXQgdG91Y2hOb3JtID0geyBpZDogaWRlbnRpZmllciwgY29vcmRpbmF0ZXM6IFt4LCB5XSB9O1xuXG4gICAgICAvLyBEZXBlbmRpbmcgb24gdGhlIGV2ZW50IHR5cGXigKZcbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICd0b3VjaHN0YXJ0JzpcbiAgICAgICAgICAvLyBDcmVhdGUgYSBgPGRpdj5gIHVuZGVyIHRoZSBmaW5nZXJcbiAgICAgICAgICB0aGlzLl9jcmVhdGVGaW5nZXJEaXYoaWRlbnRpZmllciwgY29vcmRpbmF0ZXMpO1xuXG4gICAgICAgICAgLy8gU2VuZCBtZXNzYWdlIHRvIHRoZSBzZXJ2ZXJcbiAgICAgICAgICBjbGllbnQuc2VuZCgnc29sb2lzdDp0b3VjaHN0YXJ0JywgdG91Y2hOb3JtKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd0b3VjaG1vdmUnOiB7XG4gICAgICAgICAgLy8gTW92ZSB0aGUgYDxkaXY+YCB1bmRlciB0aGUgZmluZ2VyIG9yIGNyZWF0ZSBvbmUgaWYgaXQgZG9lc24ndCBleGlzdFxuICAgICAgICAgIC8vIGFscmVhZHkgKG1heSBoYXBwZW4gaWYgdGhlIGZpbmdlciBzbGlkZXMgZnJvbSB0aGUgZWRnZSBvZiB0aGVcbiAgICAgICAgICAvLyB0b3VjaHNjcmVlbilcbiAgICAgICAgICBpZiAodGhpcy5fZmluZ2VyRGl2c1tpZGVudGlmaWVyXSlcbiAgICAgICAgICAgIHRoaXMuX21vdmVGaW5nZXJEaXYoaWRlbnRpZmllciwgY29vcmRpbmF0ZXMpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZpbmdlckRpdihpZGVudGlmaWVyLCBjb29yZGluYXRlcyk7XG5cbiAgICAgICAgICAvLyBTZW5kIG1lc3NhZ2UgdG8gdGhlIHNlcnZlclxuICAgICAgICAgIGNsaWVudC5zZW5kKCdzb2xvaXN0OnRvdWNobW92ZScsIHRvdWNoTm9ybSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlICd0b3VjaGVuZCc6IHtcbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIGZpbmdlciBkaXZcbiAgICAgICAgICBpZiAodGhpcy5fZmluZ2VyRGl2c1tpZGVudGlmaWVyXSlcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUZpbmdlckRpdihpZGVudGlmaWVyKTtcblxuICAgICAgICAgIC8vIFNlbmQgYSBtZXNzYWdlIHRvIHRoZSBzZXJ2ZXJcbiAgICAgICAgICBjbGllbnQuc2VuZCgnc29sb2lzdDp0b3VjaGVuZG9yY2FuY2VsJywgdG91Y2hOb3JtKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgJ3RvdWNoY2FuY2VsJzoge1xuICAgICAgICAgIC8vIFJlbW92ZSB0aGUgZmluZ2VyIGRpdlxuICAgICAgICAgIGlmICh0aGlzLl9maW5nZXJEaXZzW2lkZW50aWZpZXJdKVxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRmluZ2VyRGl2KGlkZW50aWZpZXIpO1xuXG4gICAgICAgICAgLy8gU2VuZCBhIG1lc3NhZ2UgdG8gdGhlIHNlcnZlclxuICAgICAgICAgIGNsaWVudC5zZW5kKCdzb2xvaXN0OnRvdWNoZW5kb3JjYW5jZWwnLCB0b3VjaE5vcm0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZHJhdyB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbiB0byBmaXQgdGhlIHdpbmRvdyBvciBzY3JlZW4gc2l6ZS5cbiAgICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXG4gICAqL1xuICBfb25XaW5kb3dSZXNpemUoKSB7XG4gICAgY29uc3QgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIGNvbnN0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG5cbiAgICBpZiAod2lkdGggPiBoZWlnaHQpIHtcbiAgICAgIHRoaXMuX3NwYWNlRGl2LnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG4gICAgICB0aGlzLl9zcGFjZURpdi5zdHlsZS53aWR0aCA9IGAke2hlaWdodH1weGA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NwYWNlRGl2LnN0eWxlLmhlaWdodCA9IGAke3dpZHRofXB4YDtcbiAgICAgIHRoaXMuX3NwYWNlRGl2LnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICAgIH1cblxuICAgIHRoaXMuX3NwYWNlLnJlc2l6ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGZpbmdlciBgPGRpdj5gIGFuZCBhcHBlbmQgaXQgdG8gdGhlIERPTSAoYXMgYSBjaGlsZCBvZiB0aGVcbiAgICogYHZpZXdgKS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkIElkZW50aWZpZXIgb2YgdGhlIGA8ZGl2PmAgKGNvbWVzIGZyb20gdGhlIHRvdWNoXG4gICAqIGlkZW50aWZpZXIpLlxuICAgKiBAcGFyYW0ge051bWJlcltdfSBjb29yZGluYXRlcyBDb29yZGluYXRlcyBvZiB0aGUgYDxkaXY+YCAoY29tZXMgZnJvbSB0aGVcbiAgICogdG91Y2ggY29vcmRpbmF0ZXMsIGFzIGEgYFt4Ok51bWJlciwgeTpOdW1iZXJdYCBhcnJheSkuXG4gICAqL1xuICBfY3JlYXRlRmluZ2VyRGl2KGlkLCBjb29yZGluYXRlcykge1xuICAgIC8vIENhbGN1bGF0ZSB0aGUgcmFkaXVzIGluIHBpeGVsc1xuICAgIGNvbnN0IHJhZGl1cyA9IGZpbmdlclJhZGl1cyAqIHRoaXMuX3B4UmF0aW87XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBmaW5nZXIgYDxkaXY+YFxuICAgIGNvbnN0IHhPZmZzZXQgPSBjb29yZGluYXRlc1swXSAtIHJhZGl1cztcbiAgICBjb25zdCB5T2Zmc2V0ID0gY29vcmRpbmF0ZXNbMV0gLSByYWRpdXM7XG5cbiAgICAvLyBDcmVhdGUgdGhlIEhUTUwgZWxlbWVudFxuICAgIGxldCBmaW5nZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBmaW5nZXJEaXYuY2xhc3NMaXN0LmFkZCgnZmluZ2VyJyk7XG4gICAgZmluZ2VyRGl2LnN0eWxlLmhlaWdodCA9IGAkezIgKiByYWRpdXN9cHhgO1xuICAgIGZpbmdlckRpdi5zdHlsZS53aWR0aCA9IGAkezIgKiByYWRpdXN9cHhgO1xuICAgIGZpbmdlckRpdi5zdHlsZS5sZWZ0ID0gYCR7eE9mZnNldH1weGA7XG4gICAgZmluZ2VyRGl2LnN0eWxlLnRvcCA9IGAke3lPZmZzZXR9cHhgO1xuXG4gICAgdGhpcy5fZmluZ2VyRGl2c1tpZF0gPSBmaW5nZXJEaXY7XG4gICAgdGhpcy52aWV3LmFwcGVuZENoaWxkKGZpbmdlckRpdik7XG4gICAgLy8gdGhpcy5fc3BhY2VEaXYuaW5zZXJ0QmVmb3JlKGZpbmdlckRpdiwgdGhpcy5fc3BhY2VEaXYuZmlyc3RDaGlsZC5uZXh0U2libGluZyk7XG5cbiAgICAvLyBUaW1lb3V0XG4gICAgdGhpcy5fZmluZ2VyRGl2VGltZW91dHNbaWRdID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9yZW1vdmVGaW5nZXJEaXYoaWQpO1xuICAgIH0sIHRpbWVvdXRMZW5ndGggKiAxMDAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIGEgZmluZ2VyIGA8ZGl2PmAuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZCBJZGVudGlmaWVyIG9mIHRoZSBgPGRpdj5gLlxuICAgKiBAcGFyYW0ge051bWJlcltdfSBjb29yZGluYXRlcyBDb29yZGluYXRlcyBvZiB0aGUgYDxkaXY+YCAoYXMgYSBgW3g6TnVtYmVyLFxuICAgKiB5Ok51bWJlcl1gIGFycmF5KS5cbiAgICovXG4gIF9tb3ZlRmluZ2VyRGl2KGlkLCBjb29yZGluYXRlcykge1xuICAgIC8vIENhbGN1bGF0ZSB0aGUgcmFkaXVzIGluIHBpeGVsc1xuICAgIGNvbnN0IHJhZGl1cyA9IGZpbmdlclJhZGl1cyAqIHRoaXMuX3B4UmF0aW87XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBmaW5nZXIgYDxkaXY+YFxuICAgIGNvbnN0IHhPZmZzZXQgPSBjb29yZGluYXRlc1swXSAtIHJhZGl1cztcbiAgICBjb25zdCB5T2Zmc2V0ID0gY29vcmRpbmF0ZXNbMV0gLSByYWRpdXM7XG5cbiAgICAvLyBNb3ZlIHRoZSBmaW5nZXIgYDxkaXY+YFxuICAgIGxldCBmaW5nZXJEaXYgPSB0aGlzLl9maW5nZXJEaXZzW2lkXTtcbiAgICBmaW5nZXJEaXYuc3R5bGUubGVmdCA9IGAke3hPZmZzZXR9cHhgO1xuICAgIGZpbmdlckRpdi5zdHlsZS50b3AgPSBgJHt5T2Zmc2V0fXB4YDtcblxuICAgIC8vIFRpbWVvdXRcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fZmluZ2VyRGl2VGltZW91dHNbaWRdKTtcbiAgICB0aGlzLl9maW5nZXJEaXZUaW1lb3V0c1tpZF0gPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3JlbW92ZUZpbmdlckRpdihpZCk7XG4gICAgfSwgdGltZW91dExlbmd0aCAqIDEwMDApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZXMgYSBmaW5nZXIgZGl2IGZyb20gdGhlIERPTS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkIElkZW50aWZpZXIgb2YgdGhlIGA8ZGl2PmAuXG4gICAqL1xuICBfcmVtb3ZlRmluZ2VyRGl2KGlkKSB7XG4gICAgLy8gUmVtb3ZlIHRoZSBmaW5nZXIgYGRpdiBmcm9tIHRoZSBET00gYW5kIHRoZSBkaWN0aW9uYXJ5XG4gICAgLy8gdGhpcy5fc3BhY2VEaXYucmVtb3ZlQ2hpbGQodGhpcy5fZmluZ2VyRGl2c1tpZF0pO1xuICAgIHRoaXMudmlldy5yZW1vdmVDaGlsZCh0aGlzLl9maW5nZXJEaXZzW2lkXSk7XG4gICAgZGVsZXRlIHRoaXMuX2ZpbmdlckRpdnNbaWRdO1xuXG4gICAgLy8gVGltZW91dFxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9maW5nZXJEaXZUaW1lb3V0c1tpZF0pO1xuICAgIGRlbGV0ZSB0aGlzLl9maW5nZXJEaXZUaW1lb3V0c1tpZF07XG4gIH1cbn1cbiJdfQ==