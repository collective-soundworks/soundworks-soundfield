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

// SoloistPerformance class

var SoloistPerformance = (function (_clientSide$Performance) {
  _inherits(SoloistPerformance, _clientSide$Performance);

  function SoloistPerformance() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, SoloistPerformance);

    _get(Object.getPrototypeOf(SoloistPerformance.prototype), 'constructor', this).call(this, options);

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
     * Space.
     * @type {Space}
     */
    this._space = null;

    /**
     * Touch surface.
     * @type {DOMElement}
     */
    this._surface = null;

    /**
     * Dictionary of the current touches (fingers) on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    this._touches = {};
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

      // Setup listeners for player connections / disconnections
      client.receive('performance:playerList', this._onPlayerList);
      client.receive('performance:addPlayer', this._onAddPlayer);
      client.receive('performance:removePlayer', this._onRemovePlayer);

      // Setup window resize listener
      window.addEventListener('resize', this._onResize);

      // Setup touch event listeners
      this._surface.addListener('touchstart', this._onTouch);
      this._surface.addListener('touchmove', this._onTouch);
      this._surface.addListener('touchend', this._onTouch);
      this._surface.addListener('touchcancel', this._onTouch);

      // Display the space visualization in the view and adapt the size
      this._space.display(this._surface, { transform: 'rotate180' });
      this._onResize();
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
      client.removeListener('performance:addPlayer', this._onAddPlayer);
      client.removeListener('performance:removePlayer', this._onRemovePlayer);

      // Remove window resize listener
      window.removeEventListener('resize', this._onWindowResize);

      // Remove touch event listeners
      this._surface.removeListener('touchstart', this._onTouch);
      this._surface.removeListener('touchmove', this._onTouch);
      this._surface.removeListener('touchend', this._onTouch);
      this._surface.removeListener('touchcancel', this._onTouch);

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
        var touch = { id: identifier, coordinates: coordinates };

        // Calculate normalized touch position in the surface's referential
        // (We multiply by -1 because the surface is rotated by 180° on the
        // soloist display)
        var x = -(coordinates[0] - this._surface.offsetLeft - this.setup.svgOffsetLeft) / this.setup.svgWidth;
        var y = -(coordinates[1] - this._surface.offsetTop - this.setup.svgOffsetTop) / this.setup.svgHeight;

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
          case 'touchmove':
            {
              this._touches[identifier] = [x, y];
              if (this._fingerDivs[identifier]) this._moveFingerDiv(identifier, coordinates);else this._createFingerDiv(identifier, coordinates);
              client.send('soloist:touchmove', touch);
              break;
            }

          // `'touchend'`:
          // - delete the touch in the dictionary `this._touches`
          // - remove the corresponding `div`
          case 'touchend':
            {
              delete this._touches[identifier];
              if (this._fingerDivs[identifier]) this._removeFingerDiv(identifier);
              client.send('soloist:touchendorcancel', touch);
              break;
            }

          // `'touchcancel'`: similar to `'touchend'`
          case 'touchcancel':
            {
              delete this._touches[identifier];
              if (this._fingerDivs[identifier]) this._removeFingerDiv(identifier);
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
  }, {
    key: '_onWindowResize',
    value: function _onWindowResize() {
      var height = window.innerHeight;
      var width = window.innerWidth;

      if (width > height) {
        this._surface.style.height = height + 'px';
        this._surface.style.width = height + 'px';
      } else {
        this._surface.style.height = width + 'px';
        this._surface.style.width = width + 'px';
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
      this._surface.insertBefore(fingerDiv, this.setupDiv.firstChild.nextSibling);

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
      var soundDiv = this._soundDivs[id];
      soundDiv.style.left = xOffset + 'px';
      soundDiv.style.top = yOffset + 'px';

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
      this._surface.removeChild(this._fingerDivs[id]);
      delete this._fingerDivs[id];

      // Timeout
      clearTimeout(this._fingerDivTimeouts[id]);
      delete this._fingerDivTimeouts[id];
    }
  }, {
    key: '_pxRatio',
    get: function get() {
      return Math.min(this._surface.offsetHeight, this._surface.offsetWidth);
    }
  }]);

  return SoloistPerformance;
})(_soundworksClient2['default'].Performance);

exports['default'] = SoloistPerformance;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvc29sb2lzdC9Tb2xvaXN0UGVyZm9ybWFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBQ3VCLG1CQUFtQjs7OztBQUMxQyxJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7Ozs7Ozs7OztBQVNqQyxJQUFNLFlBQVksR0FBRyxHQUFHLENBQUM7Ozs7Ozs7O0FBUXpCLElBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQzs7OztJQUdILGtCQUFrQjtZQUFsQixrQkFBa0I7O0FBQzFCLFdBRFEsa0JBQWtCLEdBQ1g7UUFBZCxPQUFPLHlEQUFHLEVBQUU7OzBCQURMLGtCQUFrQjs7QUFFbkMsK0JBRmlCLGtCQUFrQiw2Q0FFN0IsT0FBTyxFQUFFOzs7Ozs7O0FBT2YsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7Ozs7Ozs7QUFPdEIsUUFBSSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQzs7Ozs7O0FBTTdCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDOzs7Ozs7QUFNbkIsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Ozs7Ozs7QUFPckIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7R0FDcEI7Ozs7Ozs7OztlQXBDa0Isa0JBQWtCOzs7Ozs7Ozs7Ozs7V0F5RGhDLGlCQUFHO0FBQ04saUNBMURpQixrQkFBa0IsdUNBMERyQjs7O0FBR2QsWUFBTSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDN0QsWUFBTSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0QsWUFBTSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7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S0FDeEU7OztTQTlDa0Isa0JBQWtCO0dBQVMsOEJBQVcsV0FBVzs7cUJBQWpELGtCQUFrQiIsImZpbGUiOiIvVXNlcnMvcm9iaS9EZXYvY29sbGVjdGl2ZS1zb3VuZHdvcmtzLWRldmVsb3Avc291bmRmaWVsZC9zcmMvY2xpZW50L3NvbG9pc3QvU29sb2lzdFBlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW1wb3J0IFNvdW5kd29ya3MgbW9kdWxlcyAoY2xpZW50IHNpZGUpXG5pbXBvcnQgY2xpZW50U2lkZSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5jb25zdCBjbGllbnQgPSBjbGllbnRTaWRlLmNsaWVudDtcblxuLyoqXG4gKiBOb3JtYWxpemVkIHZhbHVlIG9mIHJhZGl1cyBvZiB0aGUgZmluZ2VyIGdyYXBoaWNhbCByZXByZXNlbnRhdGlvbiAoYVxuICogdHJhbnNsdWNlbnQgcmVkIGNpcmNsZSkuXG4gKiBBIHZhbHVlIG9mIDEgY29ycmVzcG9uZCB0byBhIHJhZGl1cyBlcXVhbCB0byB0aGUgbWluaW11bSBvZiB0aGUgaGVpZ2h0IG9yXG4gKiB3aWR0aCBvZiB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbi5cbiAqIEB0eXBlIHtOdW1iZXJ9XG4gKi9cbmNvbnN0IGZpbmdlclJhZGl1cyA9IDAuMTtcblxuLyoqXG4gKiBMZW5ndGggb2YgdGhlIHRpbWVvdXQgKGluIHNlY29uZHMpIGFmdGVyIHdoaWNoIHRoZSB0b3VjaCBpcyBhdXRvbWF0aWNhbGx5XG4gKiByZW1vdmVkICh1c2VmdWwgd2hlbiBhIGAndG91Y2hlbmQnYCBvciBgJ3RvdWNoY2FuY2VsJ2AgbWVzc2FnZSBkb2Vzbid0IGdvXG4gKiB0aHJvdWdoKS5cbiAqIEB0eXBlIHtOdW1iZXJ9XG4gKi9cbmNvbnN0IHRpbWVvdXRMZW5ndGggPSA4O1xuXG4vLyBTb2xvaXN0UGVyZm9ybWFuY2UgY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvbG9pc3RQZXJmb3JtYW5jZSBleHRlbmRzIGNsaWVudFNpZGUuUGVyZm9ybWFuY2Uge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIERpY3Rpb25hcnkgb2YgdGhlIERPTSBlbGVtZW50cyB0aGF0IHJlcHJlc2VudCBhIGZpbmdlciBvbiBzY3JlZW4uXG4gICAgICogS2V5cyBhcmUgdGhlIHRvdWNoIGlkZW50aWZpZXJzIHJldHJpdmVkIGluIHRoZSB0b3VjaCBldmVudHMuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB0aGlzLl9maW5nZXJEaXZzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBEaWN0aW9uYXJ5IG9mIHRoZSB0aW1lb3V0cyBmb3IgZWFjaCBmaW5nZXIgRE9NIGVsZW1lbnQgb24gc2NyZWVuLlxuICAgICAqIEtleXMgYXJlIHRoZSB0b3VjaCBpZGVudGlmaWVycyByZXRyaXZlZCBpbiB0aGUgdG91Y2ggZXZlbnRzLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5fZmluZ2VyRGl2VGltZW91dHMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIFNwYWNlLlxuICAgICAqIEB0eXBlIHtTcGFjZX1cbiAgICAgKi9cbiAgICB0aGlzLl9zcGFjZSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUb3VjaCBzdXJmYWNlLlxuICAgICAqIEB0eXBlIHtET01FbGVtZW50fVxuICAgICAqL1xuICAgIHRoaXMuX3N1cmZhY2UgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogRGljdGlvbmFyeSBvZiB0aGUgY3VycmVudCB0b3VjaGVzIChmaW5nZXJzKSBvbiBzY3JlZW4uXG4gICAgICogS2V5cyBhcmUgdGhlIHRvdWNoIGlkZW50aWZpZXJzIHJldHJpdmVkIGluIHRoZSB0b3VjaCBldmVudHMuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB0aGlzLl90b3VjaGVzID0ge307XG4gIH1cblxuICAvKipcbiAgICogTnVtYmVyIGJ5IHdoaWNoIHdlIG11bHRpcGx5IHRoZSBmaW5nZXJSYWRpdXMgY29uc3RhbnQgdG8gZ2V0IHRoZSByYWRpdXNcbiAgICogdmFsdWUgaW4gcGl4ZWxzLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IE1pbmltdW0gb2YgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24gaGVpZ2h0IG9yIHdpZHRoLCBpblxuICAgKiBwaXhlbHMuXG4gICAqL1xuICBnZXQgX3B4UmF0aW8oKSB7XG4gICAgcmV0dXJuIE1hdGgubWluKHRoaXMuX3N1cmZhY2Uub2Zmc2V0SGVpZ2h0LCB0aGlzLl9zdXJmYWNlLm9mZnNldFdpZHRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIG1vZHVsZS5cbiAgICpcbiAgICogU2V0dXAgbGlzdGVuZXJzIGZvcjpcbiAgICogLSB0aGUgbWVzc2FnZXMgZnJvbSB0aGUgc2VydmVyO1xuICAgKiAtIHRoZSB3aW5kb3cgYCdyZXNpemUnYCBldmVudDtcbiAgICogLSB0aGUgdG91Y2ggZXZlbnRzLlxuICAgKiBEaXNwbGF5IHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uLlxuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIC8vIFNldHVwIGxpc3RlbmVycyBmb3IgcGxheWVyIGNvbm5lY3Rpb25zIC8gZGlzY29ubmVjdGlvbnNcbiAgICBjbGllbnQucmVjZWl2ZSgncGVyZm9ybWFuY2U6cGxheWVyTGlzdCcsIHRoaXMuX29uUGxheWVyTGlzdCk7XG4gICAgY2xpZW50LnJlY2VpdmUoJ3BlcmZvcm1hbmNlOmFkZFBsYXllcicsIHRoaXMuX29uQWRkUGxheWVyKTtcbiAgICBjbGllbnQucmVjZWl2ZSgncGVyZm9ybWFuY2U6cmVtb3ZlUGxheWVyJywgdGhpcy5fb25SZW1vdmVQbGF5ZXIpO1xuXG4gICAgLy8gU2V0dXAgd2luZG93IHJlc2l6ZSBsaXN0ZW5lclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9vblJlc2l6ZSk7XG5cbiAgICAvLyBTZXR1cCB0b3VjaCBldmVudCBsaXN0ZW5lcnNcbiAgICB0aGlzLl9zdXJmYWNlLmFkZExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5hZGRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5hZGRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9vblRvdWNoKTtcbiAgICB0aGlzLl9zdXJmYWNlLmFkZExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMuX29uVG91Y2gpO1xuXG4gICAgLy8gRGlzcGxheSB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbiBpbiB0aGUgdmlldyBhbmQgYWRhcHQgdGhlIHNpemVcbiAgICB0aGlzLl9zcGFjZS5kaXNwbGF5KHRoaXMuX3N1cmZhY2UsIHsgdHJhbnNmb3JtOiAncm90YXRlMTgwJyB9KTtcbiAgICB0aGlzLl9vblJlc2l6ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgbW9kdWxlIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuICAgKlxuICAgKiBSZW1vdmUgbGlzdGVuZXJzIGZvcjpcbiAgICogLSB0aGUgbWVzc2FnZXMgZnJvbSB0aGUgc2VydmVyO1xuICAgKiAtIHRoZSB3aW5kb3cgYCdyZXNpemUnYCBldmVudDtcbiAgICogLSB0aGUgdG91Y2ggZXZlbnRzLlxuICAgKiBSZW1vdmUgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqL1xuICByZXNldCgpIHtcbiAgICBzdXBlci5yZXNldCgpO1xuXG4gICAgLy8gUmVtb3ZlIGxpc3RlbmVycyBmb3IgcGxheWVyIGNvbm5lY3Rpb25zIC8gZGlzY29ubmVjdGlvbnNcbiAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoJ3BlcmZvcm1hbmNlOnBsYXllckxpc3QnLCB0aGlzLl9vblBsYXllckxpc3QpO1xuICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcigncGVyZm9ybWFuY2U6YWRkUGxheWVyJywgdGhpcy5fb25BZGRQbGF5ZXIpO1xuICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcigncGVyZm9ybWFuY2U6cmVtb3ZlUGxheWVyJywgdGhpcy5fb25SZW1vdmVQbGF5ZXIpO1xuXG4gICAgLy8gUmVtb3ZlIHdpbmRvdyByZXNpemUgbGlzdGVuZXJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fb25XaW5kb3dSZXNpemUpO1xuXG4gICAgLy8gUmVtb3ZlIHRvdWNoIGV2ZW50IGxpc3RlbmVyc1xuICAgIHRoaXMuX3N1cmZhY2UucmVtb3ZlTGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9vblRvdWNoKTtcbiAgICB0aGlzLl9zdXJmYWNlLnJlbW92ZUxpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9vblRvdWNoKTtcbiAgICB0aGlzLl9zdXJmYWNlLnJlbW92ZUxpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UucmVtb3ZlTGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5fb25Ub3VjaCk7XG5cbiAgICAvLyBSZW1vdmUgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24gZnJvbSB0aGUgdmlld1xuICAgIHRoaXMudmlldy5pbm5lckhUTUwgPSAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBwbGF5ZXIgdG8gdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbGF5ZXIgUGxheWVyLlxuICAgKi9cbiAgX29uUGxheWVyQWRkKHBsYXllcikge1xuICAgIHRoaXMuX3NwYWNlLmFkZFBvc2l0aW9uKHBsYXllciwgMTApO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXkgYWxsIHRoZSBwbGF5ZXJzIGZyb20gYSBsaXN0IGluIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uLlxuICAgKiBAcGFyYW0ge09iamVjdFtdfSBwbGF5ZXJMaXN0IExpc3Qgb2YgcGxheWVycy5cbiAgICovXG4gIF9vblBsYXllckxpc3QocGxheWVyTGlzdCkge1xuICAgIHRoaXMuX3NwYWNlLmRpc3BsYXlQb3NpdGlvbnMocGxheWVyTGlzdCwgMTApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIHBsYXllciBmcm9tIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGxheWVyIFBsYXllci5cbiAgICovXG4gIF9vblBsYXllclJlbW92ZShwbGF5ZXIpIHtcbiAgICB0aGlzLl9zcGFjZS5yZW1vdmVQb3NpdGlvbihwbGF5ZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvdWNoIGV2ZW50IGhhbmRsZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IGUgVG91Y2ggZXZlbnQuXG4gICAqL1xuICBfb25Ub3VjaChlKSB7XG4gICAgLy8gUHJldmVudCBzY3JvbGxpbmdcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyBBIGZldyBjb25zdGFudHNcbiAgICBjb25zdCB0eXBlID0gZS50eXBlO1xuICAgIGNvbnN0IGNoYW5nZWRUb3VjaGVzID0gZS5jaGFuZ2VkVG91Y2hlcztcblxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgY2hhbmdlZFRvdWNoZXMgYXJyYXlcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBSZXRyaWV2ZSB0b3VjaCBkYXRhXG4gICAgICBsZXQgY29vcmRpbmF0ZXMgPSBbY2hhbmdlZFRvdWNoZXNbaV0uY2xpZW50WCwgY2hhbmdlZFRvdWNoZXNbaV0uY2xpZW50WV07XG4gICAgICBsZXQgaWRlbnRpZmllciA9IGNoYW5nZWRUb3VjaGVzW2ldLmlkZW50aWZpZXI7XG4gICAgICBsZXQgdG91Y2ggPSB7IGlkOiBpZGVudGlmaWVyLCBjb29yZGluYXRlczogY29vcmRpbmF0ZXMgfTtcblxuICAgICAgLy8gQ2FsY3VsYXRlIG5vcm1hbGl6ZWQgdG91Y2ggcG9zaXRpb24gaW4gdGhlIHN1cmZhY2UncyByZWZlcmVudGlhbFxuICAgICAgLy8gKFdlIG11bHRpcGx5IGJ5IC0xIGJlY2F1c2UgdGhlIHN1cmZhY2UgaXMgcm90YXRlZCBieSAxODDCsCBvbiB0aGVcbiAgICAgIC8vIHNvbG9pc3QgZGlzcGxheSlcbiAgICAgIGxldCB4ID0gLShjb29yZGluYXRlc1swXSAtXG4gICAgICAgICAgICAgICAgdGhpcy5fc3VyZmFjZS5vZmZzZXRMZWZ0IC1cbiAgICAgICAgICAgICAgICB0aGlzLnNldHVwLnN2Z09mZnNldExlZnQgKSAvIHRoaXMuc2V0dXAuc3ZnV2lkdGg7XG4gICAgICBsZXQgeSA9IC0oY29vcmRpbmF0ZXNbMV0gLVxuICAgICAgICAgICAgICAgIHRoaXMuX3N1cmZhY2Uub2Zmc2V0VG9wIC1cbiAgICAgICAgICAgICAgICB0aGlzLnNldHVwLnN2Z09mZnNldFRvcCkgLyB0aGlzLnNldHVwLnN2Z0hlaWdodDtcblxuICAgICAgLy8gRGVwZW5kaW5nIG9uIHRoZSBldmVudCB0eXBl4oCmXG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgLy8gYCd0b3VjaHN0YXJ0J2A6XG4gICAgICAgIC8vIC0gYWRkIHRoZSB0b3VjaCBjb29yZGluYXRlcyB0byB0aGUgZGljdGlvbmFyeSBgdGhpcy5fdG91Y2hlc2BcbiAgICAgICAgLy8gLSBjcmVhdGUgYSBgZGl2YCB1bmRlciB0aGUgZmluZ2VyXG4gICAgICAgIGNhc2UgJ3RvdWNoc3RhcnQnOlxuICAgICAgICAgIHRoaXMuX3RvdWNoZXNbaWRlbnRpZmllcl0gPSBbeCwgeV07XG4gICAgICAgICAgdGhpcy5fY3JlYXRlRmluZ2VyRGl2KGlkZW50aWZpZXIsIGNvb3JkaW5hdGVzKTtcbiAgICAgICAgICBjbGllbnQuc2VuZCgnc29sb2lzdDpwZXJmb3JtYW5jZTp0b3VjaHN0YXJ0JywgdG91Y2gpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8vIGAndG91Y2htb3ZlJ2A6XG4gICAgICAgIC8vIC0gYWRkIG9yIHVwZGF0ZSB0aGUgdG91Y2ggY29vcmRpbmF0ZXMgdG8gdGhlIGRpY3Rpb25hcnlcbiAgICAgICAgLy8gICAgIGB0aGlzLl90b3VjaGVzYFxuICAgICAgICAvLyAtIG1vdmUgdGhlIGBkaXZgIHVuZGVyIHRoZSBmaW5nZXIgb3IgY3JlYXRlIG9uZSBpZiBpdCBkb2Vzbid0IGV4aXN0XG4gICAgICAgIC8vICAgYWxyZWFkeSAobWF5IGhhcHBlbiBpZiB0aGUgZmluZ2VyIHNsaWRlcyBmcm9tIHRoZSBlZGdlIG9mIHRoZVxuICAgICAgICAvLyAgIHRvdWNoc2NyZWVuKVxuICAgICAgICBjYXNlICd0b3VjaG1vdmUnOiB7XG4gICAgICAgICAgdGhpcy5fdG91Y2hlc1tpZGVudGlmaWVyXSA9IFt4LCB5XTtcbiAgICAgICAgICBpZiAodGhpcy5fZmluZ2VyRGl2c1tpZGVudGlmaWVyXSlcbiAgICAgICAgICAgIHRoaXMuX21vdmVGaW5nZXJEaXYoaWRlbnRpZmllciwgY29vcmRpbmF0ZXMpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZpbmdlckRpdihpZGVudGlmaWVyLCBjb29yZGluYXRlcyk7XG4gICAgICAgICAgY2xpZW50LnNlbmQoJ3NvbG9pc3Q6dG91Y2htb3ZlJywgdG91Y2gpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYCd0b3VjaGVuZCdgOlxuICAgICAgICAvLyAtIGRlbGV0ZSB0aGUgdG91Y2ggaW4gdGhlIGRpY3Rpb25hcnkgYHRoaXMuX3RvdWNoZXNgXG4gICAgICAgIC8vIC0gcmVtb3ZlIHRoZSBjb3JyZXNwb25kaW5nIGBkaXZgXG4gICAgICAgIGNhc2UgJ3RvdWNoZW5kJzoge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl90b3VjaGVzW2lkZW50aWZpZXJdO1xuICAgICAgICAgIGlmICh0aGlzLl9maW5nZXJEaXZzW2lkZW50aWZpZXJdKVxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRmluZ2VyRGl2KGlkZW50aWZpZXIpO1xuICAgICAgICAgIGNsaWVudC5zZW5kKCdzb2xvaXN0OnRvdWNoZW5kb3JjYW5jZWwnLCB0b3VjaCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBgJ3RvdWNoY2FuY2VsJ2A6IHNpbWlsYXIgdG8gYCd0b3VjaGVuZCdgXG4gICAgICAgIGNhc2UgJ3RvdWNoY2FuY2VsJzoge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl90b3VjaGVzW2lkZW50aWZpZXJdO1xuICAgICAgICAgIGlmICh0aGlzLl9maW5nZXJEaXZzW2lkZW50aWZpZXJdKVxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRmluZ2VyRGl2KGlkZW50aWZpZXIpO1xuICAgICAgICAgIGNsaWVudC5zZW5kKCdzb2xvaXN0OnRvdWNoZW5kb3JjYW5jZWwnLCB0b3VjaCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2luZG93IHJlc2l6ZSBoYW5kbGVyLlxuICAgKiBSZWRyYXcgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24gdG8gZml0IHRoZSB3aW5kb3cgb3Igc2NyZWVuIHNpemUuXG4gICAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxuICAgKi9cbiAgX29uV2luZG93UmVzaXplKCkge1xuICAgIGNvbnN0IGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBjb25zdCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXG4gICAgaWYgKHdpZHRoID4gaGVpZ2h0KSB7XG4gICAgICB0aGlzLl9zdXJmYWNlLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG4gICAgICB0aGlzLl9zdXJmYWNlLnN0eWxlLndpZHRoID0gYCR7aGVpZ2h0fXB4YDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc3VyZmFjZS5zdHlsZS5oZWlnaHQgPSBgJHt3aWR0aH1weGA7XG4gICAgICB0aGlzLl9zdXJmYWNlLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICAgIH1cblxuICAgIHRoaXMuX3NwYWNlLnJlc2l6ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGZpbmdlciBgZGl2YCBhbmQgYXBwZW5kIGl0IHRvIHRoZSBET00gKGFzIGEgY2hpbGQgb2YgdGhlIGB2aWV3YCkuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZCBJZGVudGlmaWVyIG9mIHRoZSBgZGl2YCAoY29tZXMgZnJvbSB0aGUgdG91Y2hcbiAgICogaWRlbnRpZmllcikuXG4gICAqIEBwYXJhbSB7TnVtYmVyW119IGNvb3JkaW5hdGVzIENvb3JkaW5hdGVzIG9mIHRoZSBgZGl2YCAoY29tZXMgZnJvbSB0aGVcbiAgICogdG91Y2ggY29vcmRpbmF0ZXMsIGFzIGEgYFt4Ok51bWJlciwgeTpOdW1iZXJdYCBhcnJheSkuXG4gICAqL1xuICBfY3JlYXRlRmluZ2VyRGl2KGlkLCBjb29yZGluYXRlcykge1xuICAgIC8vIENhbGN1bGF0ZSB0aGUgcmFkaXVzIGluIHBpeGVsc1xuICAgIGNvbnN0IHJhZGl1cyA9IGZpbmdlclJhZGl1cyAqIHRoaXMuX3B4UmF0aW87XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBmaW5nZXIgYGRpdmBcbiAgICBjb25zdCB4T2Zmc2V0ID0gY29vcmRpbmF0ZXNbMF0gLSByYWRpdXM7XG4gICAgY29uc3QgeU9mZnNldCA9IGNvb3JkaW5hdGVzWzFdIC0gcmFkaXVzO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBIVE1MIGVsZW1lbnRcbiAgICBsZXQgZmluZ2VyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZmluZ2VyRGl2LmNsYXNzTGlzdC5hZGQoJ2ZpbmdlcicpO1xuICAgIGZpbmdlckRpdi5zdHlsZS5oZWlnaHQgPSBgJHsyICogcmFkaXVzfXB4YDtcbiAgICBmaW5nZXJEaXYuc3R5bGUud2lkdGggPSBgJHsyICogcmFkaXVzfXB4YDtcbiAgICBmaW5nZXJEaXYuc3R5bGUubGVmdCA9IGAke3hPZmZzZXR9cHhgO1xuICAgIGZpbmdlckRpdi5zdHlsZS50b3AgPSBgJHt5T2Zmc2V0fXB4YDtcblxuICAgIHRoaXMuX2ZpbmdlckRpdnNbaWRdID0gZmluZ2VyRGl2O1xuICAgIHRoaXMuX3N1cmZhY2UuaW5zZXJ0QmVmb3JlKGZpbmdlckRpdiwgdGhpcy5zZXR1cERpdi5maXJzdENoaWxkLm5leHRTaWJsaW5nKTtcblxuICAgIC8vIFRpbWVvdXRcbiAgICB0aGlzLl9maW5nZXJEaXZUaW1lb3V0c1tpZF0gPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3JlbW92ZUZpbmdlckRpdihpZCk7XG4gICAgfSwgdGltZW91dExlbmd0aCAqIDEwMDApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgYSBmaW5nZXIgYGRpdmAuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZCBJZGVudGlmaWVyIG9mIHRoZSBgZGl2YC5cbiAgICogQHBhcmFtIHtOdW1iZXJbXX0gY29vcmRpbmF0ZXMgQ29vcmRpbmF0ZXMgb2YgdGhlIGBkaXZgIChhcyBhIGBbeDpOdW1iZXIsXG4gICAqIHk6TnVtYmVyXWAgYXJyYXkpLlxuICAgKi9cbiAgX21vdmVGaW5nZXJEaXYoaWQsIGNvb3JkaW5hdGVzKSB7XG4gICAgLy8gQ2FsY3VsYXRlIHRoZSByYWRpdXMgaW4gcGl4ZWxzXG4gICAgY29uc3QgcmFkaXVzID0gZmluZ2VyUmFkaXVzICogdGhpcy5fcHhSYXRpbztcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgY29vcmRpbmF0ZXMgb2YgdGhlIGZpbmdlciBgZGl2YFxuICAgIGNvbnN0IHhPZmZzZXQgPSBjb29yZGluYXRlc1swXSAtIHJhZGl1cztcbiAgICBjb25zdCB5T2Zmc2V0ID0gY29vcmRpbmF0ZXNbMV0gLSByYWRpdXM7XG5cbiAgICAvLyBNb3ZlIHRoZSBmaW5nZXIgYGRpdmBcbiAgICBsZXQgc291bmREaXYgPSB0aGlzLl9zb3VuZERpdnNbaWRdO1xuICAgIHNvdW5kRGl2LnN0eWxlLmxlZnQgPSBgJHt4T2Zmc2V0fXB4YDtcbiAgICBzb3VuZERpdi5zdHlsZS50b3AgPSBgJHt5T2Zmc2V0fXB4YDtcblxuICAgIC8vIFRpbWVvdXRcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fZmluZ2VyRGl2VGltZW91dHNbaWRdKTtcbiAgICB0aGlzLl9maW5nZXJEaXZUaW1lb3V0c1tpZF0gPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3JlbW92ZUZpbmdlckRpdihpZCk7XG4gICAgfSwgdGltZW91dExlbmd0aCAqIDEwMDApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZXMgYSBmaW5nZXIgZGl2IGZyb20gdGhlIERPTS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkIElkZW50aWZpZXIgb2YgdGhlIGBkaXZgLlxuICAgKi9cbiAgX3JlbW92ZUZpbmdlckRpdihpZCkge1xuICAgIC8vIFJlbW92ZSB0aGUgZmluZ2VyIGBkaXYgZnJvbSB0aGUgRE9NIGFuZCB0aGUgZGljdGlvbmFyeVxuICAgIHRoaXMuX3N1cmZhY2UucmVtb3ZlQ2hpbGQodGhpcy5fZmluZ2VyRGl2c1tpZF0pO1xuICAgIGRlbGV0ZSB0aGlzLl9maW5nZXJEaXZzW2lkXTtcblxuICAgIC8vIFRpbWVvdXRcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fZmluZ2VyRGl2VGltZW91dHNbaWRdKTtcbiAgICBkZWxldGUgdGhpcy5fZmluZ2VyRGl2VGltZW91dHNbaWRdO1xuICB9XG59XG4iXX0=