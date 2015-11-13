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

// Helper functions
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

// SoloistPerformance class

var SoloistPerformance = (function (_clientSide$Performance) {
  _inherits(SoloistPerformance, _clientSide$Performance);

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
     * Starts the module.
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
      this._space.display(this._setup, this._spaceDiv, { transform: 'rotate180' });
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
     * Resets the module to its initial state.
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
        console.log(this._spaceDiv.offsetLeft, this._space.svgOffsetLeft, this._space.svgWidth);
        // Retrieve touch data
        var coordinates = [changedTouches[i].clientX, changedTouches[i].clientY];
        var identifier = changedTouches[i].identifier;

        // Calculate normalized touch position in the space visualization's
        // referential (we substract to 1 because the surface is rotated by 180°
        // on the soloist display)
        var x = 1 - (coordinates[0] - this._spaceDiv.offsetLeft - this._space.svgOffsetLeft) / this._space.svgWidth;
        var y = 1 - (coordinates[1] - this._spaceDiv.offsetTop - this._space.svgOffsetTop) / this._space.svgHeight;

        // Touch information with normalized coordinates
        var touchNorm = { id: identifier, coordinates: [x, y] };

        // Depending on the event type…
        switch (type) {
          case 'touchstart':
            // Create a `div` under the finger
            this._createFingerDiv(identifier, coordinates);

            // Send message to the server
            client.send('soloist:touchstart', touchNorm);
            break;

          case 'touchmove':
            {
              // Move the `div` under the finger or create one if it doesn't exist
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
     * Window resize handler.
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
     * Create a finger `div` and append it to the DOM (as a child of the `view`).
     * @param {Number} id Identifier of the `div` (comes from the touch
     * identifier).
     * @param {Number[]} coordinates Coordinates of the `div` (comes from the
     * touch coordinates, as a `[x:Number, y:Number]` array).
     */
  }, {
    key: '_createFingerDiv',
    value: function _createFingerDiv(id, coordinates) {
      var _this = this;

      // Calculate the radius in pixels
      var radius = fingerRadius * this._pxRatio;

      // Calculate the coordinates of the finger `div`
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
     * Move a finger `div`.
     * @param {Number} id Identifier of the `div`.
     * @param {Number[]} coordinates Coordinates of the `div` (as a `[x:Number,
     * y:Number]` array).
     */
  }, {
    key: '_moveFingerDiv',
    value: function _moveFingerDiv(id, coordinates) {
      var _this2 = this;

      // Calculate the radius in pixels
      var radius = fingerRadius * this._pxRatio;

      // Calculate the coordinates of the finger `div`
      var xOffset = coordinates[0] - radius;
      var yOffset = coordinates[1] - radius;

      // Move the finger `div`
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
     * @param {Number} id Identifier of the `div`.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvc29sb2lzdC9Tb2xvaXN0UGVyZm9ybWFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBQ3VCLG1CQUFtQjs7OztBQUMxQyxJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7Ozs7Ozs7OztBQVNqQyxJQUFNLFlBQVksR0FBRyxHQUFHLENBQUM7Ozs7Ozs7O0FBUXpCLElBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQzs7O0FBR3hCLFNBQVMsY0FBYyxDQUFDLElBQUksRUFBRTtBQUM1QixNQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdDLFVBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUVyQyxNQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pELGNBQVksQ0FBQyxTQUFTLEdBQUcsNEJBQTRCLENBQUM7QUFDdEQsY0FBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7QUFFL0MsTUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QyxTQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztBQUMzQyxTQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFdEMsVUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QixVQUFRLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ25DLE1BQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTNCLFNBQU87QUFDTCxZQUFRLEVBQUUsUUFBUTtBQUNsQixXQUFPLEVBQUUsT0FBTztHQUNqQixDQUFBO0NBQ0Y7Ozs7SUFHb0Isa0JBQWtCO1lBQWxCLGtCQUFrQjs7QUFDMUIsV0FEUSxrQkFBa0IsQ0FDekIsS0FBSyxFQUFFLEtBQUssRUFBZ0I7UUFBZCxPQUFPLHlEQUFHLEVBQUU7OzBCQURuQixrQkFBa0I7O0FBRW5DLCtCQUZpQixrQkFBa0IsNkNBRTdCLE9BQU8sRUFBRTs7QUFFZixRQUFJLEdBQUcsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOzs7Ozs7O0FBT3BDLFFBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOzs7Ozs7O0FBT3RCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7Ozs7OztBQU03QixRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQzs7Ozs7O0FBTXBCLFFBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDOzs7Ozs7QUFNcEIsUUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDOzs7Ozs7QUFNOUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDOzs7QUFHNUIsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2RCxRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pDLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakQsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRCxRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3hEOzs7Ozs7Ozs7ZUFsRGtCLGtCQUFrQjs7Ozs7Ozs7Ozs7O1dBdUVoQyxpQkFBRztBQUNOLGlDQXhFaUIsa0JBQWtCLHVDQXdFckI7OztBQUdkLFVBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQzdFLFVBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7O0FBR3ZCLFlBQU0sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzdELFlBQU0sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNELFlBQU0sQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDOzs7QUFHakUsWUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7OztBQUd4RCxVQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzNELFVBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxRCxVQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDOUQ7Ozs7Ozs7Ozs7Ozs7V0FXSSxpQkFBRztBQUNOLGlDQXZHaUIsa0JBQWtCLHVDQXVHckI7OztBQUdkLFlBQU0sQ0FBQyxjQUFjLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3BFLFlBQU0sQ0FBQyxjQUFjLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2xFLFlBQU0sQ0FBQyxjQUFjLENBQUMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDOzs7QUFHeEUsWUFBTSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7OztBQUczRCxVQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlELFVBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3RCxVQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUdoRSxVQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7S0FDMUI7Ozs7Ozs7O1dBTVcsc0JBQUMsTUFBTSxFQUFFO0FBQ25CLFVBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNyQzs7Ozs7Ozs7V0FNWSx1QkFBQyxVQUFVLEVBQUU7QUFDeEIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDOUM7Ozs7Ozs7O1dBTWMseUJBQUMsTUFBTSxFQUFFO0FBQ3RCLFVBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3BDOzs7Ozs7OztXQU1PLGtCQUFDLENBQUMsRUFBRTs7QUFFVixPQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7OztBQUduQixVQUFNLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3BCLFVBQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUM7OztBQUd4QyxXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM5QyxlQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRXhGLFlBQUksV0FBVyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekUsWUFBSSxVQUFVLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQzs7Ozs7QUFLOUMsWUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQSxHQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2hFLFlBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FDZCxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUEsR0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQzs7O0FBRy9ELFlBQUksU0FBUyxHQUFHLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7O0FBR3hELGdCQUFRLElBQUk7QUFDVixlQUFLLFlBQVk7O0FBRWYsZ0JBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7OztBQUcvQyxrQkFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUM3QyxrQkFBTTs7QUFBQSxBQUVSLGVBQUssV0FBVztBQUFFOzs7O0FBSWhCLGtCQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQzlCLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEtBRTdDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7OztBQUdqRCxvQkFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUM1QyxvQkFBTTthQUNQOztBQUFBLEFBRUQsZUFBSyxVQUFVO0FBQUU7O0FBRWYsa0JBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFDOUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDOzs7QUFHcEMsb0JBQU0sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbkQsb0JBQU07YUFDUDs7QUFBQSxBQUVELGVBQUssYUFBYTtBQUFFOztBQUVsQixrQkFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUM5QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7OztBQUdwQyxvQkFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNuRCxvQkFBTTthQUNQO0FBQUEsU0FDRjtPQUNGO0tBQ0Y7Ozs7Ozs7OztXQU9jLDJCQUFHO0FBQ2hCLFVBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDbEMsVUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQzs7QUFFaEMsVUFBSSxLQUFLLEdBQUcsTUFBTSxFQUFFO0FBQ2xCLFlBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBTSxNQUFNLE9BQUksQ0FBQztBQUM1QyxZQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQU0sTUFBTSxPQUFJLENBQUM7T0FDNUMsTUFBTTtBQUNMLFlBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBTSxLQUFLLE9BQUksQ0FBQztBQUMzQyxZQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQU0sS0FBSyxPQUFJLENBQUM7T0FDM0M7O0FBRUQsVUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUN0Qjs7Ozs7Ozs7Ozs7V0FTZSwwQkFBQyxFQUFFLEVBQUUsV0FBVyxFQUFFOzs7O0FBRWhDLFVBQU0sTUFBTSxHQUFHLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDOzs7QUFHNUMsVUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztBQUN4QyxVQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDOzs7QUFHeEMsVUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM5QyxlQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNsQyxlQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBTSxDQUFDLEdBQUcsTUFBTSxPQUFJLENBQUM7QUFDM0MsZUFBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQU0sQ0FBQyxHQUFHLE1BQU0sT0FBSSxDQUFDO0FBQzFDLGVBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFNLE9BQU8sT0FBSSxDQUFDO0FBQ3RDLGVBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFNLE9BQU8sT0FBSSxDQUFDOztBQUVyQyxVQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUNqQyxVQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7OztBQUlqQyxVQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLFlBQU07QUFDN0MsY0FBSyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztPQUMzQixFQUFFLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUMxQjs7Ozs7Ozs7OztXQVFhLHdCQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUU7Ozs7QUFFOUIsVUFBTSxNQUFNLEdBQUcsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7OztBQUc1QyxVQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO0FBQ3hDLFVBQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7OztBQUd4QyxVQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3JDLGVBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFNLE9BQU8sT0FBSSxDQUFDO0FBQ3RDLGVBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFNLE9BQU8sT0FBSSxDQUFDOzs7QUFHckMsa0JBQVksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLFlBQU07QUFDN0MsZUFBSyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztPQUMzQixFQUFFLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUMxQjs7Ozs7Ozs7V0FNZSwwQkFBQyxFQUFFLEVBQUU7OztBQUduQixVQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDNUMsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDOzs7QUFHNUIsa0JBQVksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxQyxhQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNwQzs7O1NBcFFXLGVBQUc7QUFDYixhQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMxRTs7O1NBNURrQixrQkFBa0I7R0FBUyw4QkFBVyxXQUFXOztxQkFBakQsa0JBQWtCIiwiZmlsZSI6Ii9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvc29sb2lzdC9Tb2xvaXN0UGVyZm9ybWFuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbXBvcnQgU291bmR3b3JrcyBtb2R1bGVzIChjbGllbnQgc2lkZSlcbmltcG9ydCBjbGllbnRTaWRlIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmNvbnN0IGNsaWVudCA9IGNsaWVudFNpZGUuY2xpZW50O1xuXG4vKipcbiAqIE5vcm1hbGl6ZWQgdmFsdWUgb2YgcmFkaXVzIG9mIHRoZSBmaW5nZXIgZ3JhcGhpY2FsIHJlcHJlc2VudGF0aW9uIChhXG4gKiB0cmFuc2x1Y2VudCByZWQgY2lyY2xlKS5cbiAqIEEgdmFsdWUgb2YgMSBjb3JyZXNwb25kIHRvIGEgcmFkaXVzIGVxdWFsIHRvIHRoZSBtaW5pbXVtIG9mIHRoZSBoZWlnaHQgb3JcbiAqIHdpZHRoIG9mIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uLlxuICogQHR5cGUge051bWJlcn1cbiAqL1xuY29uc3QgZmluZ2VyUmFkaXVzID0gMC4xO1xuXG4vKipcbiAqIExlbmd0aCBvZiB0aGUgdGltZW91dCAoaW4gc2Vjb25kcykgYWZ0ZXIgd2hpY2ggdGhlIHRvdWNoIGlzIGF1dG9tYXRpY2FsbHlcbiAqIHJlbW92ZWQgKHVzZWZ1bCB3aGVuIGEgYCd0b3VjaGVuZCdgIG9yIGAndG91Y2hjYW5jZWwnYCBtZXNzYWdlIGRvZXNuJ3QgZ29cbiAqIHRocm91Z2gpLlxuICogQHR5cGUge051bWJlcn1cbiAqL1xuY29uc3QgdGltZW91dExlbmd0aCA9IDg7XG5cbi8vIEhlbHBlciBmdW5jdGlvbnNcbmZ1bmN0aW9uIGNyZWF0ZVNwYWNlRGl2KHZpZXcpIHtcbiAgbGV0IHNwYWNlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHNwYWNlRGl2LnNldEF0dHJpYnV0ZSgnaWQnLCAnc2V0dXAnKTtcblxuICBsZXQgc3BhY2VUZXh0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHNwYWNlVGV4dERpdi5pbm5lckhUTUwgPSAnTW92ZSB5b3VyIGZpbmdlciBvbiBzY3JlZW4nO1xuICBzcGFjZVRleHREaXYuY2xhc3NMaXN0LmFkZCgnY2VudGVyZWQtY29udGVudCcpO1xuXG4gIGxldCBzdXJmYWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHN1cmZhY2Uuc2V0QXR0cmlidXRlKCdpZCcsICd0b3VjaHN1cmZhY2UnKTtcbiAgc3VyZmFjZS5jbGFzc0xpc3QuYWRkKCd0b3VjaHN1cmZhY2UnKTtcblxuICBzcGFjZURpdi5hcHBlbmRDaGlsZChzdXJmYWNlKTtcbiAgc3BhY2VEaXYuYXBwZW5kQ2hpbGQoc3BhY2VUZXh0RGl2KTtcbiAgdmlldy5hcHBlbmRDaGlsZChzcGFjZURpdik7XG5cbiAgcmV0dXJuIHtcbiAgICBzcGFjZURpdjogc3BhY2VEaXYsXG4gICAgc3VyZmFjZTogc3VyZmFjZVxuICB9XG59XG5cbi8vIFNvbG9pc3RQZXJmb3JtYW5jZSBjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU29sb2lzdFBlcmZvcm1hbmNlIGV4dGVuZHMgY2xpZW50U2lkZS5QZXJmb3JtYW5jZSB7XG4gIGNvbnN0cnVjdG9yKHNldHVwLCBzcGFjZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucyk7XG5cbiAgICBsZXQgZG9tID0gY3JlYXRlU3BhY2VEaXYodGhpcy52aWV3KTtcblxuICAgIC8qKlxuICAgICAqIERpY3Rpb25hcnkgb2YgdGhlIERPTSBlbGVtZW50cyB0aGF0IHJlcHJlc2VudCBhIGZpbmdlciBvbiBzY3JlZW4uXG4gICAgICogS2V5cyBhcmUgdGhlIHRvdWNoIGlkZW50aWZpZXJzIHJldHJpdmVkIGluIHRoZSB0b3VjaCBldmVudHMuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB0aGlzLl9maW5nZXJEaXZzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBEaWN0aW9uYXJ5IG9mIHRoZSB0aW1lb3V0cyBmb3IgZWFjaCBmaW5nZXIgRE9NIGVsZW1lbnQgb24gc2NyZWVuLlxuICAgICAqIEtleXMgYXJlIHRoZSB0b3VjaCBpZGVudGlmaWVycyByZXRyaXZlZCBpbiB0aGUgdG91Y2ggZXZlbnRzLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5fZmluZ2VyRGl2VGltZW91dHMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIFNldHVwLlxuICAgICAqIEB0eXBlIHtTcGFjZX1cbiAgICAgKi9cbiAgICB0aGlzLl9zZXR1cCA9IHNldHVwO1xuXG4gICAgLyoqXG4gICAgICogU3BhY2UuXG4gICAgICogQHR5cGUge1NwYWNlfVxuICAgICAqL1xuICAgIHRoaXMuX3NwYWNlID0gc3BhY2U7XG5cbiAgICAvKipcbiAgICAgKiBgZGl2YCB0byByZXByZXNlbnQgdGhlIFNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAgICogQHR5cGUge0RPTUVsZW1lbnR9XG4gICAgICovXG4gICAgdGhpcy5fc3BhY2VEaXYgPSBkb20uc3BhY2VEaXY7XG5cbiAgICAvKipcbiAgICAgKiBUb3VjaCBzdXJmYWNlLlxuICAgICAqIEB0eXBlIHtET01FbGVtZW50fVxuICAgICAqL1xuICAgIHRoaXMuX3N1cmZhY2UgPSBkb20uc3VyZmFjZTtcblxuICAgIC8vIE1ldGhvZCBiaW5kaW5nc1xuICAgIHRoaXMuX29uV2luZG93UmVzaXplID0gdGhpcy5fb25XaW5kb3dSZXNpemUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblRvdWNoID0gdGhpcy5fb25Ub3VjaC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uUGxheWVyQWRkID0gdGhpcy5fb25QbGF5ZXJBZGQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblBsYXllckxpc3QgPSB0aGlzLl9vblBsYXllckxpc3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblBsYXllclJlbW92ZSA9IHRoaXMuX29uUGxheWVyUmVtb3ZlLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogTnVtYmVyIGJ5IHdoaWNoIHdlIG11bHRpcGx5IHRoZSBmaW5nZXJSYWRpdXMgY29uc3RhbnQgdG8gZ2V0IHRoZSByYWRpdXNcbiAgICogdmFsdWUgaW4gcGl4ZWxzLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IE1pbmltdW0gb2YgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24gaGVpZ2h0IG9yIHdpZHRoLCBpblxuICAgKiBwaXhlbHMuXG4gICAqL1xuICBnZXQgX3B4UmF0aW8oKSB7XG4gICAgcmV0dXJuIE1hdGgubWluKHRoaXMuX3NwYWNlRGl2Lm9mZnNldEhlaWdodCwgdGhpcy5fc3BhY2VEaXYub2Zmc2V0V2lkdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgbW9kdWxlLlxuICAgKlxuICAgKiBTZXR1cCBsaXN0ZW5lcnMgZm9yOlxuICAgKiAtIHRoZSBtZXNzYWdlcyBmcm9tIHRoZSBzZXJ2ZXI7XG4gICAqIC0gdGhlIHdpbmRvdyBgJ3Jlc2l6ZSdgIGV2ZW50O1xuICAgKiAtIHRoZSB0b3VjaCBldmVudHMuXG4gICAqIERpc3BsYXkgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqL1xuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgLy8gRGlzcGxheSB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbiBpbiB0aGUgdmlldyBhbmQgYWRhcHQgdGhlIHNpemVcbiAgICB0aGlzLl9zcGFjZS5kaXNwbGF5KHRoaXMuX3NldHVwLCB0aGlzLl9zcGFjZURpdiwgeyB0cmFuc2Zvcm06ICdyb3RhdGUxODAnIH0pO1xuICAgIHRoaXMuX29uV2luZG93UmVzaXplKCk7XG5cbiAgICAvLyBTZXR1cCBsaXN0ZW5lcnMgZm9yIHBsYXllciBjb25uZWN0aW9ucyAvIGRpc2Nvbm5lY3Rpb25zXG4gICAgY2xpZW50LnJlY2VpdmUoJ3BlcmZvcm1hbmNlOnBsYXllckxpc3QnLCB0aGlzLl9vblBsYXllckxpc3QpO1xuICAgIGNsaWVudC5yZWNlaXZlKCdwZXJmb3JtYW5jZTpwbGF5ZXJBZGQnLCB0aGlzLl9vblBsYXllckFkZCk7XG4gICAgY2xpZW50LnJlY2VpdmUoJ3BlcmZvcm1hbmNlOnBsYXllclJlbW92ZScsIHRoaXMuX29uUGxheWVyUmVtb3ZlKTtcblxuICAgIC8vIFNldHVwIHdpbmRvdyByZXNpemUgbGlzdGVuZXJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fb25XaW5kb3dSZXNpemUpO1xuXG4gICAgLy8gU2V0dXAgdG91Y2ggZXZlbnQgbGlzdGVuZXJzXG4gICAgdGhpcy5fc3VyZmFjZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9vblRvdWNoKTtcbiAgICB0aGlzLl9zdXJmYWNlLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMuX29uVG91Y2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgbW9kdWxlIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuICAgKlxuICAgKiBSZW1vdmUgbGlzdGVuZXJzIGZvcjpcbiAgICogLSB0aGUgbWVzc2FnZXMgZnJvbSB0aGUgc2VydmVyO1xuICAgKiAtIHRoZSB3aW5kb3cgYCdyZXNpemUnYCBldmVudDtcbiAgICogLSB0aGUgdG91Y2ggZXZlbnRzLlxuICAgKiBSZW1vdmUgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqL1xuICByZXNldCgpIHtcbiAgICBzdXBlci5yZXNldCgpO1xuXG4gICAgLy8gUmVtb3ZlIGxpc3RlbmVycyBmb3IgcGxheWVyIGNvbm5lY3Rpb25zIC8gZGlzY29ubmVjdGlvbnNcbiAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoJ3BlcmZvcm1hbmNlOnBsYXllckxpc3QnLCB0aGlzLl9vblBsYXllckxpc3QpO1xuICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcigncGVyZm9ybWFuY2U6cGxheWVyQWRkJywgdGhpcy5fb25QbGF5ZXJBZGQpO1xuICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcigncGVyZm9ybWFuY2U6cGxheWVyUmVtb3ZlJywgdGhpcy5fb25QbGF5ZXJSZW1vdmUpO1xuXG4gICAgLy8gUmVtb3ZlIHdpbmRvdyByZXNpemUgbGlzdGVuZXJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fb25XaW5kb3dSZXNpemUpO1xuXG4gICAgLy8gUmVtb3ZlIHRvdWNoIGV2ZW50IGxpc3RlbmVyc1xuICAgIHRoaXMuX3N1cmZhY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLl9vblRvdWNoKTtcblxuICAgIC8vIFJlbW92ZSB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbiBmcm9tIHRoZSB2aWV3XG4gICAgdGhpcy52aWV3LmlubmVySFRNTCA9ICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHBsYXllciB0byB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsYXllciBQbGF5ZXIuXG4gICAqL1xuICBfb25QbGF5ZXJBZGQocGxheWVyKSB7XG4gICAgdGhpcy5fc3BhY2UuYWRkUG9zaXRpb24ocGxheWVyLCAxMCk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheSBhbGwgdGhlIHBsYXllcnMgZnJvbSBhIGxpc3QgaW4gdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0W119IHBsYXllckxpc3QgTGlzdCBvZiBwbGF5ZXJzLlxuICAgKi9cbiAgX29uUGxheWVyTGlzdChwbGF5ZXJMaXN0KSB7XG4gICAgdGhpcy5fc3BhY2UuZGlzcGxheVBvc2l0aW9ucyhwbGF5ZXJMaXN0LCAxMCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgcGxheWVyIGZyb20gdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbGF5ZXIgUGxheWVyLlxuICAgKi9cbiAgX29uUGxheWVyUmVtb3ZlKHBsYXllcikge1xuICAgIHRoaXMuX3NwYWNlLnJlbW92ZVBvc2l0aW9uKHBsYXllcik7XG4gIH1cblxuICAvKipcbiAgICogVG91Y2ggZXZlbnQgaGFuZGxlclxuICAgKiBAcGFyYW0ge09iamVjdH0gZSBUb3VjaCBldmVudC5cbiAgICovXG4gIF9vblRvdWNoKGUpIHtcbiAgICAvLyBQcmV2ZW50IHNjcm9sbGluZ1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIEEgZmV3IGNvbnN0YW50c1xuICAgIGNvbnN0IHR5cGUgPSBlLnR5cGU7XG4gICAgY29uc3QgY2hhbmdlZFRvdWNoZXMgPSBlLmNoYW5nZWRUb3VjaGVzO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBjaGFuZ2VkVG91Y2hlcyBhcnJheVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuX3NwYWNlRGl2Lm9mZnNldExlZnQsIHRoaXMuX3NwYWNlLnN2Z09mZnNldExlZnQsIHRoaXMuX3NwYWNlLnN2Z1dpZHRoKTtcbiAgICAgIC8vIFJldHJpZXZlIHRvdWNoIGRhdGFcbiAgICAgIGxldCBjb29yZGluYXRlcyA9IFtjaGFuZ2VkVG91Y2hlc1tpXS5jbGllbnRYLCBjaGFuZ2VkVG91Y2hlc1tpXS5jbGllbnRZXTtcbiAgICAgIGxldCBpZGVudGlmaWVyID0gY2hhbmdlZFRvdWNoZXNbaV0uaWRlbnRpZmllcjtcblxuICAgICAgLy8gQ2FsY3VsYXRlIG5vcm1hbGl6ZWQgdG91Y2ggcG9zaXRpb24gaW4gdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24nc1xuICAgICAgLy8gcmVmZXJlbnRpYWwgKHdlIHN1YnN0cmFjdCB0byAxIGJlY2F1c2UgdGhlIHN1cmZhY2UgaXMgcm90YXRlZCBieSAxODDCsFxuICAgICAgLy8gb24gdGhlIHNvbG9pc3QgZGlzcGxheSlcbiAgICAgIGxldCB4ID0gMSAtIChjb29yZGluYXRlc1swXSAtXG4gICAgICAgICAgICAgICAgICAgdGhpcy5fc3BhY2VEaXYub2Zmc2V0TGVmdCAtXG4gICAgICAgICAgICAgICAgICAgdGhpcy5fc3BhY2Uuc3ZnT2Zmc2V0TGVmdCApIC8gdGhpcy5fc3BhY2Uuc3ZnV2lkdGg7XG4gICAgICBsZXQgeSA9IDEgLSAoY29vcmRpbmF0ZXNbMV0gLVxuICAgICAgICAgICAgICAgICAgIHRoaXMuX3NwYWNlRGl2Lm9mZnNldFRvcCAtXG4gICAgICAgICAgICAgICAgICAgdGhpcy5fc3BhY2Uuc3ZnT2Zmc2V0VG9wKSAvIHRoaXMuX3NwYWNlLnN2Z0hlaWdodDtcblxuICAgICAgLy8gVG91Y2ggaW5mb3JtYXRpb24gd2l0aCBub3JtYWxpemVkIGNvb3JkaW5hdGVzXG4gICAgICBsZXQgdG91Y2hOb3JtID0geyBpZDogaWRlbnRpZmllciwgY29vcmRpbmF0ZXM6IFt4LCB5XSB9O1xuXG4gICAgICAvLyBEZXBlbmRpbmcgb24gdGhlIGV2ZW50IHR5cGXigKZcbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICd0b3VjaHN0YXJ0JzpcbiAgICAgICAgICAvLyBDcmVhdGUgYSBgZGl2YCB1bmRlciB0aGUgZmluZ2VyXG4gICAgICAgICAgdGhpcy5fY3JlYXRlRmluZ2VyRGl2KGlkZW50aWZpZXIsIGNvb3JkaW5hdGVzKTtcblxuICAgICAgICAgIC8vIFNlbmQgbWVzc2FnZSB0byB0aGUgc2VydmVyXG4gICAgICAgICAgY2xpZW50LnNlbmQoJ3NvbG9pc3Q6dG91Y2hzdGFydCcsIHRvdWNoTm9ybSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndG91Y2htb3ZlJzoge1xuICAgICAgICAgIC8vIE1vdmUgdGhlIGBkaXZgIHVuZGVyIHRoZSBmaW5nZXIgb3IgY3JlYXRlIG9uZSBpZiBpdCBkb2Vzbid0IGV4aXN0XG4gICAgICAgICAgLy8gYWxyZWFkeSAobWF5IGhhcHBlbiBpZiB0aGUgZmluZ2VyIHNsaWRlcyBmcm9tIHRoZSBlZGdlIG9mIHRoZVxuICAgICAgICAgIC8vIHRvdWNoc2NyZWVuKVxuICAgICAgICAgIGlmICh0aGlzLl9maW5nZXJEaXZzW2lkZW50aWZpZXJdKVxuICAgICAgICAgICAgdGhpcy5fbW92ZUZpbmdlckRpdihpZGVudGlmaWVyLCBjb29yZGluYXRlcyk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5fY3JlYXRlRmluZ2VyRGl2KGlkZW50aWZpZXIsIGNvb3JkaW5hdGVzKTtcblxuICAgICAgICAgIC8vIFNlbmQgbWVzc2FnZSB0byB0aGUgc2VydmVyXG4gICAgICAgICAgY2xpZW50LnNlbmQoJ3NvbG9pc3Q6dG91Y2htb3ZlJywgdG91Y2hOb3JtKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgJ3RvdWNoZW5kJzoge1xuICAgICAgICAgIC8vIFJlbW92ZSB0aGUgZmluZ2VyIGRpdlxuICAgICAgICAgIGlmICh0aGlzLl9maW5nZXJEaXZzW2lkZW50aWZpZXJdKVxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRmluZ2VyRGl2KGlkZW50aWZpZXIpO1xuXG4gICAgICAgICAgLy8gU2VuZCBhIG1lc3NhZ2UgdG8gdGhlIHNlcnZlclxuICAgICAgICAgIGNsaWVudC5zZW5kKCdzb2xvaXN0OnRvdWNoZW5kb3JjYW5jZWwnLCB0b3VjaE5vcm0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FzZSAndG91Y2hjYW5jZWwnOiB7XG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZSBmaW5nZXIgZGl2XG4gICAgICAgICAgaWYgKHRoaXMuX2ZpbmdlckRpdnNbaWRlbnRpZmllcl0pXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVGaW5nZXJEaXYoaWRlbnRpZmllcik7XG5cbiAgICAgICAgICAvLyBTZW5kIGEgbWVzc2FnZSB0byB0aGUgc2VydmVyXG4gICAgICAgICAgY2xpZW50LnNlbmQoJ3NvbG9pc3Q6dG91Y2hlbmRvcmNhbmNlbCcsIHRvdWNoTm9ybSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2luZG93IHJlc2l6ZSBoYW5kbGVyLlxuICAgKiBSZWRyYXcgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24gdG8gZml0IHRoZSB3aW5kb3cgb3Igc2NyZWVuIHNpemUuXG4gICAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxuICAgKi9cbiAgX29uV2luZG93UmVzaXplKCkge1xuICAgIGNvbnN0IGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBjb25zdCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXG4gICAgaWYgKHdpZHRoID4gaGVpZ2h0KSB7XG4gICAgICB0aGlzLl9zcGFjZURpdi5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuICAgICAgdGhpcy5fc3BhY2VEaXYuc3R5bGUud2lkdGggPSBgJHtoZWlnaHR9cHhgO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zcGFjZURpdi5zdHlsZS5oZWlnaHQgPSBgJHt3aWR0aH1weGA7XG4gICAgICB0aGlzLl9zcGFjZURpdi5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICB9XG5cbiAgICB0aGlzLl9zcGFjZS5yZXNpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBmaW5nZXIgYGRpdmAgYW5kIGFwcGVuZCBpdCB0byB0aGUgRE9NIChhcyBhIGNoaWxkIG9mIHRoZSBgdmlld2ApLlxuICAgKiBAcGFyYW0ge051bWJlcn0gaWQgSWRlbnRpZmllciBvZiB0aGUgYGRpdmAgKGNvbWVzIGZyb20gdGhlIHRvdWNoXG4gICAqIGlkZW50aWZpZXIpLlxuICAgKiBAcGFyYW0ge051bWJlcltdfSBjb29yZGluYXRlcyBDb29yZGluYXRlcyBvZiB0aGUgYGRpdmAgKGNvbWVzIGZyb20gdGhlXG4gICAqIHRvdWNoIGNvb3JkaW5hdGVzLCBhcyBhIGBbeDpOdW1iZXIsIHk6TnVtYmVyXWAgYXJyYXkpLlxuICAgKi9cbiAgX2NyZWF0ZUZpbmdlckRpdihpZCwgY29vcmRpbmF0ZXMpIHtcbiAgICAvLyBDYWxjdWxhdGUgdGhlIHJhZGl1cyBpbiBwaXhlbHNcbiAgICBjb25zdCByYWRpdXMgPSBmaW5nZXJSYWRpdXMgKiB0aGlzLl9weFJhdGlvO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBjb29yZGluYXRlcyBvZiB0aGUgZmluZ2VyIGBkaXZgXG4gICAgY29uc3QgeE9mZnNldCA9IGNvb3JkaW5hdGVzWzBdIC0gcmFkaXVzO1xuICAgIGNvbnN0IHlPZmZzZXQgPSBjb29yZGluYXRlc1sxXSAtIHJhZGl1cztcblxuICAgIC8vIENyZWF0ZSB0aGUgSFRNTCBlbGVtZW50XG4gICAgbGV0IGZpbmdlckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGZpbmdlckRpdi5jbGFzc0xpc3QuYWRkKCdmaW5nZXInKTtcbiAgICBmaW5nZXJEaXYuc3R5bGUuaGVpZ2h0ID0gYCR7MiAqIHJhZGl1c31weGA7XG4gICAgZmluZ2VyRGl2LnN0eWxlLndpZHRoID0gYCR7MiAqIHJhZGl1c31weGA7XG4gICAgZmluZ2VyRGl2LnN0eWxlLmxlZnQgPSBgJHt4T2Zmc2V0fXB4YDtcbiAgICBmaW5nZXJEaXYuc3R5bGUudG9wID0gYCR7eU9mZnNldH1weGA7XG5cbiAgICB0aGlzLl9maW5nZXJEaXZzW2lkXSA9IGZpbmdlckRpdjtcbiAgICB0aGlzLnZpZXcuYXBwZW5kQ2hpbGQoZmluZ2VyRGl2KTtcbiAgICAvLyB0aGlzLl9zcGFjZURpdi5pbnNlcnRCZWZvcmUoZmluZ2VyRGl2LCB0aGlzLl9zcGFjZURpdi5maXJzdENoaWxkLm5leHRTaWJsaW5nKTtcblxuICAgIC8vIFRpbWVvdXRcbiAgICB0aGlzLl9maW5nZXJEaXZUaW1lb3V0c1tpZF0gPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3JlbW92ZUZpbmdlckRpdihpZCk7XG4gICAgfSwgdGltZW91dExlbmd0aCAqIDEwMDApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgYSBmaW5nZXIgYGRpdmAuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZCBJZGVudGlmaWVyIG9mIHRoZSBgZGl2YC5cbiAgICogQHBhcmFtIHtOdW1iZXJbXX0gY29vcmRpbmF0ZXMgQ29vcmRpbmF0ZXMgb2YgdGhlIGBkaXZgIChhcyBhIGBbeDpOdW1iZXIsXG4gICAqIHk6TnVtYmVyXWAgYXJyYXkpLlxuICAgKi9cbiAgX21vdmVGaW5nZXJEaXYoaWQsIGNvb3JkaW5hdGVzKSB7XG4gICAgLy8gQ2FsY3VsYXRlIHRoZSByYWRpdXMgaW4gcGl4ZWxzXG4gICAgY29uc3QgcmFkaXVzID0gZmluZ2VyUmFkaXVzICogdGhpcy5fcHhSYXRpbztcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgY29vcmRpbmF0ZXMgb2YgdGhlIGZpbmdlciBgZGl2YFxuICAgIGNvbnN0IHhPZmZzZXQgPSBjb29yZGluYXRlc1swXSAtIHJhZGl1cztcbiAgICBjb25zdCB5T2Zmc2V0ID0gY29vcmRpbmF0ZXNbMV0gLSByYWRpdXM7XG5cbiAgICAvLyBNb3ZlIHRoZSBmaW5nZXIgYGRpdmBcbiAgICBsZXQgZmluZ2VyRGl2ID0gdGhpcy5fZmluZ2VyRGl2c1tpZF07XG4gICAgZmluZ2VyRGl2LnN0eWxlLmxlZnQgPSBgJHt4T2Zmc2V0fXB4YDtcbiAgICBmaW5nZXJEaXYuc3R5bGUudG9wID0gYCR7eU9mZnNldH1weGA7XG5cbiAgICAvLyBUaW1lb3V0XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2ZpbmdlckRpdlRpbWVvdXRzW2lkXSk7XG4gICAgdGhpcy5fZmluZ2VyRGl2VGltZW91dHNbaWRdID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9yZW1vdmVGaW5nZXJEaXYoaWQpO1xuICAgIH0sIHRpbWVvdXRMZW5ndGggKiAxMDAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGVzIGEgZmluZ2VyIGRpdiBmcm9tIHRoZSBET00uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZCBJZGVudGlmaWVyIG9mIHRoZSBgZGl2YC5cbiAgICovXG4gIF9yZW1vdmVGaW5nZXJEaXYoaWQpIHtcbiAgICAvLyBSZW1vdmUgdGhlIGZpbmdlciBgZGl2IGZyb20gdGhlIERPTSBhbmQgdGhlIGRpY3Rpb25hcnlcbiAgICAvLyB0aGlzLl9zcGFjZURpdi5yZW1vdmVDaGlsZCh0aGlzLl9maW5nZXJEaXZzW2lkXSk7XG4gICAgdGhpcy52aWV3LnJlbW92ZUNoaWxkKHRoaXMuX2ZpbmdlckRpdnNbaWRdKTtcbiAgICBkZWxldGUgdGhpcy5fZmluZ2VyRGl2c1tpZF07XG5cbiAgICAvLyBUaW1lb3V0XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2ZpbmdlckRpdlRpbWVvdXRzW2lkXSk7XG4gICAgZGVsZXRlIHRoaXMuX2ZpbmdlckRpdlRpbWVvdXRzW2lkXTtcbiAgfVxufVxuIl19