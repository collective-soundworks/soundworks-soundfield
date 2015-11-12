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

        // Calculate normalized touch position in the surface's referential
        // (We substract to 1 because the surface is rotated by 180° on the
        // soloist display)
        var x = 1 - (coordinates[0] - this._spaceDiv.offsetLeft - this._space.svgOffsetLeft) / this._space.svgWidth;
        var y = 1 - (coordinates[1] - this._spaceDiv.offsetTop - this._space.svgOffsetTop) / this._space.svgHeight;

        var touchNorm = { id: identifier, coordinates: [x, y] };

        // Depending on the event type…
        switch (type) {
          // `'touchstart'`:
          // - add the touch coordinates to the dictionary `this._touches`
          // - create a `div` under the finger
          case 'touchstart':
            this._touches[identifier] = [x, y];
            this._createFingerDiv(identifier, coordinates);
            client.send('soloist:performance:touchstart', touchNorm);
            break;

          // `'touchmove'`:
          // - add or update the touch coordinates to the dictionary
          //     `this._touches`
          // - move the `div` under the finger or create one if it doesn't exist
          //   already (may happen if the finger slides from the edge of the
          //   touchscreen)
          case 'touchmove':
            {
              this._touches[identifier] = [x, y];
              if (this._fingerDivs[identifier]) this._moveFingerDiv(identifier, coordinates);else this._createFingerDiv(identifier, coordinates);
              client.send('soloist:touchmove', touchNorm);
              break;
            }

          // `'touchend'`:
          // - delete the touch in the dictionary `this._touches`
          // - remove the corresponding `div`
          case 'touchend':
            {
              delete this._touches[identifier];
              if (this._fingerDivs[identifier]) this._removeFingerDiv(identifier);
              client.send('soloist:touchendorcancel', touchNorm);
              break;
            }

          // `'touchcancel'`: similar to `'touchend'`
          case 'touchcancel':
            {
              delete this._touches[identifier];
              if (this._fingerDivs[identifier]) this._removeFingerDiv(identifier);
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
      this._spaceDiv.insertBefore(fingerDiv, this._spaceDiv.firstChild.nextSibling);

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
      this._spaceDiv.removeChild(this._fingerDivs[id]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvc29sb2lzdC9Tb2xvaXN0UGVyZm9ybWFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBQ3VCLG1CQUFtQjs7OztBQUMxQyxJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7Ozs7Ozs7OztBQVNqQyxJQUFNLFlBQVksR0FBRyxHQUFHLENBQUM7Ozs7Ozs7O0FBUXpCLElBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQzs7O0FBR3hCLFNBQVMsY0FBYyxDQUFDLElBQUksRUFBRTtBQUM1QixNQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdDLFVBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUVyQyxNQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pELGNBQVksQ0FBQyxTQUFTLEdBQUcsNEJBQTRCLENBQUM7QUFDdEQsY0FBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7QUFFL0MsTUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QyxTQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztBQUMzQyxTQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFdEMsVUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QixVQUFRLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ25DLE1BQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTNCLFNBQU87QUFDTCxZQUFRLEVBQUUsUUFBUTtBQUNsQixXQUFPLEVBQUUsT0FBTztHQUNqQixDQUFBO0NBQ0Y7Ozs7SUFHb0Isa0JBQWtCO1lBQWxC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LEVBQUUsYUFBYSxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQzFCOzs7Ozs7OztXQU1lLDBCQUFDLEVBQUUsRUFBRTs7QUFFbkIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7O0FBRzVCLGtCQUFZLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUMsYUFBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDcEM7OztTQXBRVyxlQUFHO0FBQ2IsYUFBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDMUU7OztTQW5Fa0Isa0JBQWtCO0dBQVMsOEJBQVcsV0FBVzs7cUJBQWpELGtCQUFrQiIsImZpbGUiOiJzcmMvY2xpZW50L3NvbG9pc3QvU29sb2lzdFBlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW1wb3J0IFNvdW5kd29ya3MgbW9kdWxlcyAoY2xpZW50IHNpZGUpXG5pbXBvcnQgY2xpZW50U2lkZSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5jb25zdCBjbGllbnQgPSBjbGllbnRTaWRlLmNsaWVudDtcblxuLyoqXG4gKiBOb3JtYWxpemVkIHZhbHVlIG9mIHJhZGl1cyBvZiB0aGUgZmluZ2VyIGdyYXBoaWNhbCByZXByZXNlbnRhdGlvbiAoYVxuICogdHJhbnNsdWNlbnQgcmVkIGNpcmNsZSkuXG4gKiBBIHZhbHVlIG9mIDEgY29ycmVzcG9uZCB0byBhIHJhZGl1cyBlcXVhbCB0byB0aGUgbWluaW11bSBvZiB0aGUgaGVpZ2h0IG9yXG4gKiB3aWR0aCBvZiB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbi5cbiAqIEB0eXBlIHtOdW1iZXJ9XG4gKi9cbmNvbnN0IGZpbmdlclJhZGl1cyA9IDAuMTtcblxuLyoqXG4gKiBMZW5ndGggb2YgdGhlIHRpbWVvdXQgKGluIHNlY29uZHMpIGFmdGVyIHdoaWNoIHRoZSB0b3VjaCBpcyBhdXRvbWF0aWNhbGx5XG4gKiByZW1vdmVkICh1c2VmdWwgd2hlbiBhIGAndG91Y2hlbmQnYCBvciBgJ3RvdWNoY2FuY2VsJ2AgbWVzc2FnZSBkb2Vzbid0IGdvXG4gKiB0aHJvdWdoKS5cbiAqIEB0eXBlIHtOdW1iZXJ9XG4gKi9cbmNvbnN0IHRpbWVvdXRMZW5ndGggPSA4O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5mdW5jdGlvbiBjcmVhdGVTcGFjZURpdih2aWV3KSB7XG4gIGxldCBzcGFjZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBzcGFjZURpdi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3NldHVwJyk7XG5cbiAgbGV0IHNwYWNlVGV4dERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBzcGFjZVRleHREaXYuaW5uZXJIVE1MID0gJ01vdmUgeW91ciBmaW5nZXIgb24gc2NyZWVuJztcbiAgc3BhY2VUZXh0RGl2LmNsYXNzTGlzdC5hZGQoJ2NlbnRlcmVkLWNvbnRlbnQnKTtcblxuICBsZXQgc3VyZmFjZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBzdXJmYWNlLnNldEF0dHJpYnV0ZSgnaWQnLCAndG91Y2hzdXJmYWNlJyk7XG4gIHN1cmZhY2UuY2xhc3NMaXN0LmFkZCgndG91Y2hzdXJmYWNlJyk7XG5cbiAgc3BhY2VEaXYuYXBwZW5kQ2hpbGQoc3VyZmFjZSk7XG4gIHNwYWNlRGl2LmFwcGVuZENoaWxkKHNwYWNlVGV4dERpdik7XG4gIHZpZXcuYXBwZW5kQ2hpbGQoc3BhY2VEaXYpO1xuXG4gIHJldHVybiB7XG4gICAgc3BhY2VEaXY6IHNwYWNlRGl2LFxuICAgIHN1cmZhY2U6IHN1cmZhY2VcbiAgfVxufVxuXG4vLyBTb2xvaXN0UGVyZm9ybWFuY2UgY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvbG9pc3RQZXJmb3JtYW5jZSBleHRlbmRzIGNsaWVudFNpZGUuUGVyZm9ybWFuY2Uge1xuICBjb25zdHJ1Y3RvcihzZXR1cCwgc3BhY2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuXG4gICAgbGV0IGRvbSA9IGNyZWF0ZVNwYWNlRGl2KHRoaXMudmlldyk7XG5cbiAgICAvKipcbiAgICAgKiBEaWN0aW9uYXJ5IG9mIHRoZSBET00gZWxlbWVudHMgdGhhdCByZXByZXNlbnQgYSBmaW5nZXIgb24gc2NyZWVuLlxuICAgICAqIEtleXMgYXJlIHRoZSB0b3VjaCBpZGVudGlmaWVycyByZXRyaXZlZCBpbiB0aGUgdG91Y2ggZXZlbnRzLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5fZmluZ2VyRGl2cyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogRGljdGlvbmFyeSBvZiB0aGUgdGltZW91dHMgZm9yIGVhY2ggZmluZ2VyIERPTSBlbGVtZW50IG9uIHNjcmVlbi5cbiAgICAgKiBLZXlzIGFyZSB0aGUgdG91Y2ggaWRlbnRpZmllcnMgcmV0cml2ZWQgaW4gdGhlIHRvdWNoIGV2ZW50cy5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuX2ZpbmdlckRpdlRpbWVvdXRzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBTZXR1cC5cbiAgICAgKiBAdHlwZSB7U3BhY2V9XG4gICAgICovXG4gICAgdGhpcy5fc2V0dXAgPSBzZXR1cDtcblxuICAgIC8qKlxuICAgICAqIFNwYWNlLlxuICAgICAqIEB0eXBlIHtTcGFjZX1cbiAgICAgKi9cbiAgICB0aGlzLl9zcGFjZSA9IHNwYWNlO1xuXG4gICAgLyoqXG4gICAgICogYGRpdmAgdG8gcmVwcmVzZW50IHRoZSBTcGFjZSB2aXN1YWxpemF0aW9uLlxuICAgICAqIEB0eXBlIHtET01FbGVtZW50fVxuICAgICAqL1xuICAgIHRoaXMuX3NwYWNlRGl2ID0gZG9tLnNwYWNlRGl2O1xuXG4gICAgLyoqXG4gICAgICogVG91Y2ggc3VyZmFjZS5cbiAgICAgKiBAdHlwZSB7RE9NRWxlbWVudH1cbiAgICAgKi9cbiAgICB0aGlzLl9zdXJmYWNlID0gZG9tLnN1cmZhY2U7XG5cbiAgICAvKipcbiAgICAgKiBEaWN0aW9uYXJ5IG9mIHRoZSBjdXJyZW50IHRvdWNoZXMgKGZpbmdlcnMpIG9uIHNjcmVlbi5cbiAgICAgKiBLZXlzIGFyZSB0aGUgdG91Y2ggaWRlbnRpZmllcnMgcmV0cml2ZWQgaW4gdGhlIHRvdWNoIGV2ZW50cy5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuX3RvdWNoZXMgPSB7fTtcblxuICAgIC8vIE1ldGhvZCBiaW5kaW5nc1xuICAgIHRoaXMuX29uV2luZG93UmVzaXplID0gdGhpcy5fb25XaW5kb3dSZXNpemUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblRvdWNoID0gdGhpcy5fb25Ub3VjaC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uUGxheWVyQWRkID0gdGhpcy5fb25QbGF5ZXJBZGQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblBsYXllckxpc3QgPSB0aGlzLl9vblBsYXllckxpc3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblBsYXllclJlbW92ZSA9IHRoaXMuX29uUGxheWVyUmVtb3ZlLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogTnVtYmVyIGJ5IHdoaWNoIHdlIG11bHRpcGx5IHRoZSBmaW5nZXJSYWRpdXMgY29uc3RhbnQgdG8gZ2V0IHRoZSByYWRpdXNcbiAgICogdmFsdWUgaW4gcGl4ZWxzLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IE1pbmltdW0gb2YgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24gaGVpZ2h0IG9yIHdpZHRoLCBpblxuICAgKiBwaXhlbHMuXG4gICAqL1xuICBnZXQgX3B4UmF0aW8oKSB7XG4gICAgcmV0dXJuIE1hdGgubWluKHRoaXMuX3NwYWNlRGl2Lm9mZnNldEhlaWdodCwgdGhpcy5fc3BhY2VEaXYub2Zmc2V0V2lkdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgbW9kdWxlLlxuICAgKlxuICAgKiBTZXR1cCBsaXN0ZW5lcnMgZm9yOlxuICAgKiAtIHRoZSBtZXNzYWdlcyBmcm9tIHRoZSBzZXJ2ZXI7XG4gICAqIC0gdGhlIHdpbmRvdyBgJ3Jlc2l6ZSdgIGV2ZW50O1xuICAgKiAtIHRoZSB0b3VjaCBldmVudHMuXG4gICAqIERpc3BsYXkgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqL1xuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgLy8gRGlzcGxheSB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbiBpbiB0aGUgdmlldyBhbmQgYWRhcHQgdGhlIHNpemVcbiAgICB0aGlzLl9zcGFjZS5kaXNwbGF5KHRoaXMuX3NldHVwLCB0aGlzLl9zcGFjZURpdiwgeyB0cmFuc2Zvcm06ICdyb3RhdGUxODAnIH0pO1xuICAgIHRoaXMuX29uV2luZG93UmVzaXplKCk7XG5cbiAgICAvLyBTZXR1cCBsaXN0ZW5lcnMgZm9yIHBsYXllciBjb25uZWN0aW9ucyAvIGRpc2Nvbm5lY3Rpb25zXG4gICAgY2xpZW50LnJlY2VpdmUoJ3BlcmZvcm1hbmNlOnBsYXllckxpc3QnLCB0aGlzLl9vblBsYXllckxpc3QpO1xuICAgIGNsaWVudC5yZWNlaXZlKCdwZXJmb3JtYW5jZTpwbGF5ZXJBZGQnLCB0aGlzLl9vblBsYXllckFkZCk7XG4gICAgY2xpZW50LnJlY2VpdmUoJ3BlcmZvcm1hbmNlOnBsYXllclJlbW92ZScsIHRoaXMuX29uUGxheWVyUmVtb3ZlKTtcblxuICAgIC8vIFNldHVwIHdpbmRvdyByZXNpemUgbGlzdGVuZXJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fb25XaW5kb3dSZXNpemUpO1xuXG4gICAgLy8gU2V0dXAgdG91Y2ggZXZlbnQgbGlzdGVuZXJzXG4gICAgdGhpcy5fc3VyZmFjZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9vblRvdWNoKTtcbiAgICB0aGlzLl9zdXJmYWNlLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMuX29uVG91Y2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgbW9kdWxlIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuICAgKlxuICAgKiBSZW1vdmUgbGlzdGVuZXJzIGZvcjpcbiAgICogLSB0aGUgbWVzc2FnZXMgZnJvbSB0aGUgc2VydmVyO1xuICAgKiAtIHRoZSB3aW5kb3cgYCdyZXNpemUnYCBldmVudDtcbiAgICogLSB0aGUgdG91Y2ggZXZlbnRzLlxuICAgKiBSZW1vdmUgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqL1xuICByZXNldCgpIHtcbiAgICBzdXBlci5yZXNldCgpO1xuXG4gICAgLy8gUmVtb3ZlIGxpc3RlbmVycyBmb3IgcGxheWVyIGNvbm5lY3Rpb25zIC8gZGlzY29ubmVjdGlvbnNcbiAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoJ3BlcmZvcm1hbmNlOnBsYXllckxpc3QnLCB0aGlzLl9vblBsYXllckxpc3QpO1xuICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcigncGVyZm9ybWFuY2U6cGxheWVyQWRkJywgdGhpcy5fb25QbGF5ZXJBZGQpO1xuICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcigncGVyZm9ybWFuY2U6cGxheWVyUmVtb3ZlJywgdGhpcy5fb25QbGF5ZXJSZW1vdmUpO1xuXG4gICAgLy8gUmVtb3ZlIHdpbmRvdyByZXNpemUgbGlzdGVuZXJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fb25XaW5kb3dSZXNpemUpO1xuXG4gICAgLy8gUmVtb3ZlIHRvdWNoIGV2ZW50IGxpc3RlbmVyc1xuICAgIHRoaXMuX3N1cmZhY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLl9vblRvdWNoKTtcblxuICAgIC8vIFJlbW92ZSB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbiBmcm9tIHRoZSB2aWV3XG4gICAgdGhpcy52aWV3LmlubmVySFRNTCA9ICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHBsYXllciB0byB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsYXllciBQbGF5ZXIuXG4gICAqL1xuICBfb25QbGF5ZXJBZGQocGxheWVyKSB7XG4gICAgdGhpcy5fc3BhY2UuYWRkUG9zaXRpb24ocGxheWVyLCAxMCk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheSBhbGwgdGhlIHBsYXllcnMgZnJvbSBhIGxpc3QgaW4gdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0W119IHBsYXllckxpc3QgTGlzdCBvZiBwbGF5ZXJzLlxuICAgKi9cbiAgX29uUGxheWVyTGlzdChwbGF5ZXJMaXN0KSB7XG4gICAgdGhpcy5fc3BhY2UuZGlzcGxheVBvc2l0aW9ucyhwbGF5ZXJMaXN0LCAxMCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgcGxheWVyIGZyb20gdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbGF5ZXIgUGxheWVyLlxuICAgKi9cbiAgX29uUGxheWVyUmVtb3ZlKHBsYXllcikge1xuICAgIHRoaXMuX3NwYWNlLnJlbW92ZVBvc2l0aW9uKHBsYXllcik7XG4gIH1cblxuICAvKipcbiAgICogVG91Y2ggZXZlbnQgaGFuZGxlclxuICAgKiBAcGFyYW0ge09iamVjdH0gZSBUb3VjaCBldmVudC5cbiAgICovXG4gIF9vblRvdWNoKGUpIHtcbiAgICAvLyBQcmV2ZW50IHNjcm9sbGluZ1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIEEgZmV3IGNvbnN0YW50c1xuICAgIGNvbnN0IHR5cGUgPSBlLnR5cGU7XG4gICAgY29uc3QgY2hhbmdlZFRvdWNoZXMgPSBlLmNoYW5nZWRUb3VjaGVzO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBjaGFuZ2VkVG91Y2hlcyBhcnJheVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuX3NwYWNlRGl2Lm9mZnNldExlZnQsIHRoaXMuX3NwYWNlLnN2Z09mZnNldExlZnQsIHRoaXMuX3NwYWNlLnN2Z1dpZHRoKTtcbiAgICAgIC8vIFJldHJpZXZlIHRvdWNoIGRhdGFcbiAgICAgIGxldCBjb29yZGluYXRlcyA9IFtjaGFuZ2VkVG91Y2hlc1tpXS5jbGllbnRYLCBjaGFuZ2VkVG91Y2hlc1tpXS5jbGllbnRZXTtcbiAgICAgIGxldCBpZGVudGlmaWVyID0gY2hhbmdlZFRvdWNoZXNbaV0uaWRlbnRpZmllcjtcblxuICAgICAgLy8gQ2FsY3VsYXRlIG5vcm1hbGl6ZWQgdG91Y2ggcG9zaXRpb24gaW4gdGhlIHN1cmZhY2UncyByZWZlcmVudGlhbFxuICAgICAgLy8gKFdlIHN1YnN0cmFjdCB0byAxIGJlY2F1c2UgdGhlIHN1cmZhY2UgaXMgcm90YXRlZCBieSAxODDCsCBvbiB0aGVcbiAgICAgIC8vIHNvbG9pc3QgZGlzcGxheSlcbiAgICAgIGxldCB4ID0gMSAtIChjb29yZGluYXRlc1swXSAtXG4gICAgICAgICAgICAgICAgICAgdGhpcy5fc3BhY2VEaXYub2Zmc2V0TGVmdCAtXG4gICAgICAgICAgICAgICAgICAgdGhpcy5fc3BhY2Uuc3ZnT2Zmc2V0TGVmdCApIC8gdGhpcy5fc3BhY2Uuc3ZnV2lkdGg7XG4gICAgICBsZXQgeSA9IDEgLSAoY29vcmRpbmF0ZXNbMV0gLVxuICAgICAgICAgICAgICAgICAgIHRoaXMuX3NwYWNlRGl2Lm9mZnNldFRvcCAtXG4gICAgICAgICAgICAgICAgICAgdGhpcy5fc3BhY2Uuc3ZnT2Zmc2V0VG9wKSAvIHRoaXMuX3NwYWNlLnN2Z0hlaWdodDtcblxuICAgICAgbGV0IHRvdWNoTm9ybSA9IHsgaWQ6IGlkZW50aWZpZXIsIGNvb3JkaW5hdGVzOiBbeCwgeV0gfTtcblxuICAgICAgLy8gRGVwZW5kaW5nIG9uIHRoZSBldmVudCB0eXBl4oCmXG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgLy8gYCd0b3VjaHN0YXJ0J2A6XG4gICAgICAgIC8vIC0gYWRkIHRoZSB0b3VjaCBjb29yZGluYXRlcyB0byB0aGUgZGljdGlvbmFyeSBgdGhpcy5fdG91Y2hlc2BcbiAgICAgICAgLy8gLSBjcmVhdGUgYSBgZGl2YCB1bmRlciB0aGUgZmluZ2VyXG4gICAgICAgIGNhc2UgJ3RvdWNoc3RhcnQnOlxuICAgICAgICAgIHRoaXMuX3RvdWNoZXNbaWRlbnRpZmllcl0gPSBbeCwgeV07XG4gICAgICAgICAgdGhpcy5fY3JlYXRlRmluZ2VyRGl2KGlkZW50aWZpZXIsIGNvb3JkaW5hdGVzKTtcbiAgICAgICAgICBjbGllbnQuc2VuZCgnc29sb2lzdDpwZXJmb3JtYW5jZTp0b3VjaHN0YXJ0JywgdG91Y2hOb3JtKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAvLyBgJ3RvdWNobW92ZSdgOlxuICAgICAgICAvLyAtIGFkZCBvciB1cGRhdGUgdGhlIHRvdWNoIGNvb3JkaW5hdGVzIHRvIHRoZSBkaWN0aW9uYXJ5XG4gICAgICAgIC8vICAgICBgdGhpcy5fdG91Y2hlc2BcbiAgICAgICAgLy8gLSBtb3ZlIHRoZSBgZGl2YCB1bmRlciB0aGUgZmluZ2VyIG9yIGNyZWF0ZSBvbmUgaWYgaXQgZG9lc24ndCBleGlzdFxuICAgICAgICAvLyAgIGFscmVhZHkgKG1heSBoYXBwZW4gaWYgdGhlIGZpbmdlciBzbGlkZXMgZnJvbSB0aGUgZWRnZSBvZiB0aGVcbiAgICAgICAgLy8gICB0b3VjaHNjcmVlbilcbiAgICAgICAgY2FzZSAndG91Y2htb3ZlJzoge1xuICAgICAgICAgIHRoaXMuX3RvdWNoZXNbaWRlbnRpZmllcl0gPSBbeCwgeV07XG4gICAgICAgICAgaWYgKHRoaXMuX2ZpbmdlckRpdnNbaWRlbnRpZmllcl0pXG4gICAgICAgICAgICB0aGlzLl9tb3ZlRmluZ2VyRGl2KGlkZW50aWZpZXIsIGNvb3JkaW5hdGVzKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVGaW5nZXJEaXYoaWRlbnRpZmllciwgY29vcmRpbmF0ZXMpO1xuICAgICAgICAgIGNsaWVudC5zZW5kKCdzb2xvaXN0OnRvdWNobW92ZScsIHRvdWNoTm9ybSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBgJ3RvdWNoZW5kJ2A6XG4gICAgICAgIC8vIC0gZGVsZXRlIHRoZSB0b3VjaCBpbiB0aGUgZGljdGlvbmFyeSBgdGhpcy5fdG91Y2hlc2BcbiAgICAgICAgLy8gLSByZW1vdmUgdGhlIGNvcnJlc3BvbmRpbmcgYGRpdmBcbiAgICAgICAgY2FzZSAndG91Y2hlbmQnOiB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX3RvdWNoZXNbaWRlbnRpZmllcl07XG4gICAgICAgICAgaWYgKHRoaXMuX2ZpbmdlckRpdnNbaWRlbnRpZmllcl0pXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVGaW5nZXJEaXYoaWRlbnRpZmllcik7XG4gICAgICAgICAgY2xpZW50LnNlbmQoJ3NvbG9pc3Q6dG91Y2hlbmRvcmNhbmNlbCcsIHRvdWNoTm9ybSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBgJ3RvdWNoY2FuY2VsJ2A6IHNpbWlsYXIgdG8gYCd0b3VjaGVuZCdgXG4gICAgICAgIGNhc2UgJ3RvdWNoY2FuY2VsJzoge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl90b3VjaGVzW2lkZW50aWZpZXJdO1xuICAgICAgICAgIGlmICh0aGlzLl9maW5nZXJEaXZzW2lkZW50aWZpZXJdKVxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRmluZ2VyRGl2KGlkZW50aWZpZXIpO1xuICAgICAgICAgIGNsaWVudC5zZW5kKCdzb2xvaXN0OnRvdWNoZW5kb3JjYW5jZWwnLCB0b3VjaE5vcm0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdpbmRvdyByZXNpemUgaGFuZGxlci5cbiAgICogUmVkcmF3IHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uIHRvIGZpdCB0aGUgd2luZG93IG9yIHNjcmVlbiBzaXplLlxuICAgKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cbiAgICovXG4gIF9vbldpbmRvd1Jlc2l6ZSgpIHtcbiAgICBjb25zdCBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgY29uc3Qgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblxuICAgIGlmICh3aWR0aCA+IGhlaWdodCkge1xuICAgICAgdGhpcy5fc3BhY2VEaXYuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcbiAgICAgIHRoaXMuX3NwYWNlRGl2LnN0eWxlLndpZHRoID0gYCR7aGVpZ2h0fXB4YDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc3BhY2VEaXYuc3R5bGUuaGVpZ2h0ID0gYCR7d2lkdGh9cHhgO1xuICAgICAgdGhpcy5fc3BhY2VEaXYuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gICAgfVxuXG4gICAgdGhpcy5fc3BhY2UucmVzaXplKCk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgZmluZ2VyIGBkaXZgIGFuZCBhcHBlbmQgaXQgdG8gdGhlIERPTSAoYXMgYSBjaGlsZCBvZiB0aGUgYHZpZXdgKS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkIElkZW50aWZpZXIgb2YgdGhlIGBkaXZgIChjb21lcyBmcm9tIHRoZSB0b3VjaFxuICAgKiBpZGVudGlmaWVyKS5cbiAgICogQHBhcmFtIHtOdW1iZXJbXX0gY29vcmRpbmF0ZXMgQ29vcmRpbmF0ZXMgb2YgdGhlIGBkaXZgIChjb21lcyBmcm9tIHRoZVxuICAgKiB0b3VjaCBjb29yZGluYXRlcywgYXMgYSBgW3g6TnVtYmVyLCB5Ok51bWJlcl1gIGFycmF5KS5cbiAgICovXG4gIF9jcmVhdGVGaW5nZXJEaXYoaWQsIGNvb3JkaW5hdGVzKSB7XG4gICAgLy8gQ2FsY3VsYXRlIHRoZSByYWRpdXMgaW4gcGl4ZWxzXG4gICAgY29uc3QgcmFkaXVzID0gZmluZ2VyUmFkaXVzICogdGhpcy5fcHhSYXRpbztcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgY29vcmRpbmF0ZXMgb2YgdGhlIGZpbmdlciBgZGl2YFxuICAgIGNvbnN0IHhPZmZzZXQgPSBjb29yZGluYXRlc1swXSAtIHJhZGl1cztcbiAgICBjb25zdCB5T2Zmc2V0ID0gY29vcmRpbmF0ZXNbMV0gLSByYWRpdXM7XG5cbiAgICAvLyBDcmVhdGUgdGhlIEhUTUwgZWxlbWVudFxuICAgIGxldCBmaW5nZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBmaW5nZXJEaXYuY2xhc3NMaXN0LmFkZCgnZmluZ2VyJyk7XG4gICAgZmluZ2VyRGl2LnN0eWxlLmhlaWdodCA9IGAkezIgKiByYWRpdXN9cHhgO1xuICAgIGZpbmdlckRpdi5zdHlsZS53aWR0aCA9IGAkezIgKiByYWRpdXN9cHhgO1xuICAgIGZpbmdlckRpdi5zdHlsZS5sZWZ0ID0gYCR7eE9mZnNldH1weGA7XG4gICAgZmluZ2VyRGl2LnN0eWxlLnRvcCA9IGAke3lPZmZzZXR9cHhgO1xuXG4gICAgdGhpcy5fZmluZ2VyRGl2c1tpZF0gPSBmaW5nZXJEaXY7XG4gICAgdGhpcy5fc3BhY2VEaXYuaW5zZXJ0QmVmb3JlKGZpbmdlckRpdiwgdGhpcy5fc3BhY2VEaXYuZmlyc3RDaGlsZC5uZXh0U2libGluZyk7XG5cbiAgICAvLyBUaW1lb3V0XG4gICAgdGhpcy5fZmluZ2VyRGl2VGltZW91dHNbaWRdID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9yZW1vdmVGaW5nZXJEaXYoaWQpO1xuICAgIH0sIHRpbWVvdXRMZW5ndGggKiAxMDAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIGEgZmluZ2VyIGBkaXZgLlxuICAgKiBAcGFyYW0ge051bWJlcn0gaWQgSWRlbnRpZmllciBvZiB0aGUgYGRpdmAuXG4gICAqIEBwYXJhbSB7TnVtYmVyW119IGNvb3JkaW5hdGVzIENvb3JkaW5hdGVzIG9mIHRoZSBgZGl2YCAoYXMgYSBgW3g6TnVtYmVyLFxuICAgKiB5Ok51bWJlcl1gIGFycmF5KS5cbiAgICovXG4gIF9tb3ZlRmluZ2VyRGl2KGlkLCBjb29yZGluYXRlcykge1xuICAgIC8vIENhbGN1bGF0ZSB0aGUgcmFkaXVzIGluIHBpeGVsc1xuICAgIGNvbnN0IHJhZGl1cyA9IGZpbmdlclJhZGl1cyAqIHRoaXMuX3B4UmF0aW87XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBmaW5nZXIgYGRpdmBcbiAgICBjb25zdCB4T2Zmc2V0ID0gY29vcmRpbmF0ZXNbMF0gLSByYWRpdXM7XG4gICAgY29uc3QgeU9mZnNldCA9IGNvb3JkaW5hdGVzWzFdIC0gcmFkaXVzO1xuXG4gICAgLy8gTW92ZSB0aGUgZmluZ2VyIGBkaXZgXG4gICAgbGV0IGZpbmdlckRpdiA9IHRoaXMuX2ZpbmdlckRpdnNbaWRdO1xuICAgIGZpbmdlckRpdi5zdHlsZS5sZWZ0ID0gYCR7eE9mZnNldH1weGA7XG4gICAgZmluZ2VyRGl2LnN0eWxlLnRvcCA9IGAke3lPZmZzZXR9cHhgO1xuXG4gICAgLy8gVGltZW91dFxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9maW5nZXJEaXZUaW1lb3V0c1tpZF0pO1xuICAgIHRoaXMuX2ZpbmdlckRpdlRpbWVvdXRzW2lkXSA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fcmVtb3ZlRmluZ2VyRGl2KGlkKTtcbiAgICB9LCB0aW1lb3V0TGVuZ3RoICogMTAwMCk7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlcyBhIGZpbmdlciBkaXYgZnJvbSB0aGUgRE9NLlxuICAgKiBAcGFyYW0ge051bWJlcn0gaWQgSWRlbnRpZmllciBvZiB0aGUgYGRpdmAuXG4gICAqL1xuICBfcmVtb3ZlRmluZ2VyRGl2KGlkKSB7XG4gICAgLy8gUmVtb3ZlIHRoZSBmaW5nZXIgYGRpdiBmcm9tIHRoZSBET00gYW5kIHRoZSBkaWN0aW9uYXJ5XG4gICAgdGhpcy5fc3BhY2VEaXYucmVtb3ZlQ2hpbGQodGhpcy5fZmluZ2VyRGl2c1tpZF0pO1xuICAgIGRlbGV0ZSB0aGlzLl9maW5nZXJEaXZzW2lkXTtcblxuICAgIC8vIFRpbWVvdXRcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fZmluZ2VyRGl2VGltZW91dHNbaWRdKTtcbiAgICBkZWxldGUgdGhpcy5fZmluZ2VyRGl2VGltZW91dHNbaWRdO1xuICB9XG59XG4iXX0=