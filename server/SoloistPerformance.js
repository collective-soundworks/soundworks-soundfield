// Import Soundworks library (server side)
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _soundworksServer = require('soundworks/server');

var _soundworksServer2 = _interopRequireDefault(_soundworksServer);

var server = _soundworksServer2['default'].server;

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
 * Inverse of the squared finger radius normalized value, used for optimization
 * in the distances calculations.
 * @type {Number}
 */
var rInv2 = 1 / (fingerRadius * fingerRadius);

/**
 * Get minimum value of an array.
 * @param {Array} array Array.
 * @return {Number} Minimum value of the array.
 */
function getMinOfArray(array) {
  if (array.length > 0) return array.reduce(function (p, v) {
    return p < v ? p : v;
  });

  return undefined;
}

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

var SoloistPerformance = (function (_serverSide$Performance) {
  _inherits(SoloistPerformance, _serverSide$Performance);

  /**
   * Create an instance of the class.
   * @param {Performance} playerPerformance `'player'` clients performance
   * module (server side).
   * @param {Setup} setup Setup of the scenario.
   * @param {Object} [options={}] Options (as in the base class).
   */

  function SoloistPerformance(playerPerformance, setup) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, SoloistPerformance);

    _get(Object.getPrototypeOf(SoloistPerformance.prototype), 'constructor', this).call(this, options);

    /**
     * Player performance module.
     * @type {Performance}
     */
    this._playerPerformance = playerPerformance;

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

  _createClass(SoloistPerformance, [{
    key: 'enter',

    /**
     * Called when a soloist starts the (soloist) performance.
     * The method sends the player list, and listens for touch messages.
     * @param {Client} soloist Soloist that enters the performance.
     */
    value: function enter(soloist) {
      _get(Object.getPrototypeOf(SoloistPerformance.prototype), 'enter', this).call(this, soloist);

      // Send list of players to the soloist
      var playerList = this._playerPerformance.clients.map(function (c) {
        return getInfo(c);
      });
      soloist.send('performance:playerList', playerList);

      // Setup client message listeners
      soloist.receive('soloist:touchstart', this._onTouchStart);
      soloist.receive('soloist:touchmove', this._onTouchMove);
      soloist.receive('soloist:touchendorcancel', this._onTouchEndOrCancel);
    }

    /**
     * Calculate the squared distance between two points in a 2D space.
     * @param {Number[]} a Coordinates of the first point (`[x:Number,
     * y:Number]`).
     * @param {Number[]} b Coordinates of the second point (`[x:Number,
     * y:Number]`).
     * @return {Number} Squared distance between the two points.
     */
  }, {
    key: '_getDistance',
    value: function _getDistance(a, b) {
      var x = (a[0] - b[0]) * this._widthNormalisation;
      var x2 = x * x;

      var y = (a[1] - b[1]) * this._heightNormalisation;
      var y2 = y * y;

      return a === null ? Infinity : Math.min(1, rInv2 * (x2 + y2));
    }

    /**
     * Calculate the distance of each player to the closest touch (finger on
     * screen) and sends messages to the `'player'` clients accordingly.
     */
  }, {
    key: '_updateDistances',
    value: function _updateDistances() {
      // If at least one finger is on screen
      if (_Object$keys(this._touches).length > 0) {
        // For each player in the performance
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _getIterator(this._playerPerformance.clients), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var player = _step.value;

            var distances = [];

            // Calculate the distance from the player to each touch (finger)
            for (var id in this._touches) {
              distances.push(this._getDistance(player.coordinates, this._touches[id].coordinates));
            }

            // Get minimum distance among all touches (fingers)
            var d = getMinOfArray(distances);

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
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      // Otherwise, mute everyone
      else {
          // For each player in the performance
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = _getIterator(this._playerPerformance.clients), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var player = _step2.value;

              // If the player is currently playing sound
              if (player.modules.performance.isPlaying) {
                // Send message to the player
                player.send('player:mute');
                // Update the player status
                player.modules.performance.isPlaying = false;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                _iterator2['return']();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
    }

    /**
     * `'soloist:touchstart'` event handler.
     * Add a new touch to the touches dictionary, and recalculate the distances.
     * @param {Object} touch Touch.
     */
  }, {
    key: '_onTouchStart',
    value: function _onTouchStart(touch) {
      var _this = this;

      // Create touch in the dictionary
      this._touches[touch.id] = {};
      this._touches[touch.id].id = touch.id;
      this._touches[touch.id].coordinates = touch.coordinates;
      this._touches[touch.id].timeout = setTimeout(function () {
        delete _this._touches[touch.id];
      }, timeoutLength * 1000);

      // Make the distances calculations
      this._updateDistances();
    }

    /**
     * `'soloist:touchmove'` event handler.
     * Update the touches dictionary, and recalculate the distances.
     * @param {Object} touch Touch.
     */
  }, {
    key: '_onTouchMove',
    value: function _onTouchMove(touch) {
      var _this2 = this;

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
      this._touches[touch.id].timeout = setTimeout(function () {
        delete _this2._touches[touch.id];
      }, timeoutLength * 1000);

      // Make the distances calculations
      this._updateDistances();
    }

    /**
     * `'soloist:touchendorcancel'` event handler.
     * Delete a touch from the touches dictionary, and recalculate the distances.
     * @param {Object} touch Touch.
     */
  }, {
    key: '_onTouchEndOrCancel',
    value: function _onTouchEndOrCancel(touch) {
      delete this._touches[touch.id];
      this._updateDistances();
    }
  }, {
    key: '_widthHeightRatio',
    get: function get() {
      return this._setup.width / this._setup.height;
    }

    /**
     * Calculate the width normalization factor (all the distance calculations
     * are made in a normalized space where height and width equal 1).
     * @return {Number} Width normalization factor.
     */
  }, {
    key: '_widthNormalisation',
    get: function get() {
      if (this._widthHeightRatio > 1) return 1;
      return this._widthHeightRatio;
    }

    /**
     * Calculate the height normalization factor (all the distance calculations
     * are made in a normalized space where height and width equal 1).
     * @return {Number} Height normalization factor.
     */
  }, {
    key: '_heightNormalisation',
    get: function get() {
      if (this._widthHeightRatio > 1) return 1 / this._widthHeightRatio;
      return 1;
    }
  }]);

  return SoloistPerformance;
})(_soundworksServer2['default'].Performance);

exports['default'] = SoloistPerformance;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9zZXJ2ZXIvU29sb2lzdFBlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQ0FDdUIsbUJBQW1COzs7O0FBQzFDLElBQU0sTUFBTSxHQUFHLDhCQUFXLE1BQU0sQ0FBQzs7Ozs7Ozs7O0FBU2pDLElBQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQzs7Ozs7Ozs7QUFRekIsSUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7O0FBT3hCLElBQU0sS0FBSyxHQUFHLENBQUMsSUFBSSxZQUFZLEdBQUcsWUFBWSxDQUFBLEFBQUMsQ0FBQzs7Ozs7OztBQVFoRCxTQUFTLGFBQWEsQ0FBQyxLQUFLLEVBQUU7QUFDNUIsTUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDbEIsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7V0FBSyxBQUFDLENBQUMsR0FBRyxDQUFDLEdBQUksQ0FBQyxHQUFHLENBQUM7R0FBQSxDQUFDLENBQUM7O0FBRWpELFNBQU8sU0FBUyxDQUFDO0NBQ2xCOzs7Ozs7Ozs7O0FBVUQsU0FBUyxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ3ZCLFNBQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0NBQ2pFOzs7Ozs7Ozs7OztJQVVvQixrQkFBa0I7WUFBbEIsa0JBQWtCOzs7Ozs7Ozs7O0FBUTFCLFdBUlEsa0JBQWtCLENBUXpCLGlCQUFpQixFQUFFLEtBQUssRUFBZ0I7UUFBZCxPQUFPLHlEQUFHLEVBQUU7OzBCQVIvQixrQkFBa0I7O0FBU25DLCtCQVRpQixrQkFBa0IsNkNBUzdCLE9BQU8sRUFBRTs7Ozs7O0FBTWYsUUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFp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QUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLEVBQzVCLE9BQU8sQ0FBQyxDQUFDO0FBQ1gsYUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7S0FDL0I7Ozs7Ozs7OztTQU91QixlQUFHO0FBQ3pCLFVBQUksSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsRUFDNUIsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO0FBQ3BDLGFBQU8sQ0FBQyxDQUFDO0tBQ1Y7OztTQWhFa0Isa0JBQWtCO0dBQVMsOEJBQVcsV0FBVzs7cUJBQWpELGtCQUFrQiIsImZpbGUiOiIvVXNlcnMvcm9iaS9EZXYvY29sbGVjdGl2ZS1zb3VuZHdvcmtzLWRldmVsb3Avc291bmRmaWVsZC9zcmMvc2VydmVyL1NvbG9pc3RQZXJmb3JtYW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEltcG9ydCBTb3VuZHdvcmtzIGxpYnJhcnkgKHNlcnZlciBzaWRlKVxuaW1wb3J0IHNlcnZlclNpZGUgZnJvbSAnc291bmR3b3Jrcy9zZXJ2ZXInO1xuY29uc3Qgc2VydmVyID0gc2VydmVyU2lkZS5zZXJ2ZXI7XG5cbi8qKlxuICogTm9ybWFsaXplZCB2YWx1ZSBvZiByYWRpdXMgb2YgdGhlIGZpbmdlciBncmFwaGljYWwgcmVwcmVzZW50YXRpb24gKGFcbiAqIHRyYW5zbHVjZW50IHJlZCBjaXJjbGUpLlxuICogQSB2YWx1ZSBvZiAxIGNvcnJlc3BvbmQgdG8gYSByYWRpdXMgZXF1YWwgdG8gdGhlIG1pbmltdW0gb2YgdGhlIGhlaWdodCBvclxuICogd2lkdGggb2YgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gKiBAdHlwZSB7TnVtYmVyfVxuICovXG5jb25zdCBmaW5nZXJSYWRpdXMgPSAwLjE7XG5cbi8qKlxuICogTGVuZ3RoIG9mIHRoZSB0aW1lb3V0IChpbiBzZWNvbmRzKSBhZnRlciB3aGljaCB0aGUgdG91Y2ggaXMgYXV0b21hdGljYWxseVxuICogcmVtb3ZlZCAodXNlZnVsIHdoZW4gYSBgJ3RvdWNoZW5kJ2Agb3IgYCd0b3VjaGNhbmNlbCdgIG1lc3NhZ2UgZG9lc24ndCBnb1xuICogdGhyb3VnaCkuXG4gKiBAdHlwZSB7TnVtYmVyfVxuICovXG5jb25zdCB0aW1lb3V0TGVuZ3RoID0gODtcblxuLyoqXG4gKiBJbnZlcnNlIG9mIHRoZSBzcXVhcmVkIGZpbmdlciByYWRpdXMgbm9ybWFsaXplZCB2YWx1ZSwgdXNlZCBmb3Igb3B0aW1pemF0aW9uXG4gKiBpbiB0aGUgZGlzdGFuY2VzIGNhbGN1bGF0aW9ucy5cbiAqIEB0eXBlIHtOdW1iZXJ9XG4gKi9cbmNvbnN0IHJJbnYyID0gMSAvIChmaW5nZXJSYWRpdXMgKiBmaW5nZXJSYWRpdXMpO1xuXG5cbi8qKlxuICogR2V0IG1pbmltdW0gdmFsdWUgb2YgYW4gYXJyYXkuXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBBcnJheS5cbiAqIEByZXR1cm4ge051bWJlcn0gTWluaW11bSB2YWx1ZSBvZiB0aGUgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGdldE1pbk9mQXJyYXkoYXJyYXkpIHtcbiAgaWYgKGFycmF5Lmxlbmd0aCA+IDApXG4gICAgcmV0dXJuIGFycmF5LnJlZHVjZSgocCwgdikgPT4gKHAgPCB2KSA/IHAgOiB2KTtcblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFJldHJpZXZlIGluZm9ybWF0aW9uIChpbmRleCBhbmQgY29vcmRpbmF0ZXMpIGFib3V0IHRoZSBjbGllbnQuXG4gKiBAcGFyYW0ge0NsaWVudH0gY2xpZW50IENsaWVudC5cbiAqIEByZXR1cm4ge09iamVjdH0gSW5mb3JtYXRpb24gYWJvdXQgdGhlIGNsaWVudC5cbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBpbmRleCBJbmRleCBvZiB0aGUgY2xpZW50LlxuICogQHByb3BlcnR5IHtOdW1iZXJbXX0gY29vcmRpbmF0ZXMgQ29vcmRpbmF0ZXMgb2YgdGhlIGNsaWVudCAoYFt4Ok51bWJlcixcbiAqIHk6TnVtYmVyXWAgYXJyYXkpLlxuICovXG5mdW5jdGlvbiBnZXRJbmZvKGNsaWVudCkge1xuICByZXR1cm4geyBpbmRleDogY2xpZW50LmluZGV4LCBjb29yZGluYXRlczogY2xpZW50LmNvb3JkaW5hdGVzIH07XG59XG5cbi8qKlxuICogYFNvbG9pc3RQZXJmb3JtYW5jZWAgY2xhc3MuXG4gKiBUaGUgYFNvbG9pc3RQZXJmb3JtYW5jZWAgY2xhc3MgbWFrZXMgdGhlIGNvbm5lY3Rpb24gYmV0d2VlbiB0aGUgYCdzb2xvaXN0J2BcbiAqIGNsaWVudHMgYW5kIHRoZSBgJ3BsYXllcidgIGNsaWVudHMuIE1vcmUgc3BlY2lmaWNhbGx5LCB0aGUgbW9kdWxlIGxpc3RlbnMgZm9yXG4gKiB0aGUgbWVzc2FnZXMgZnJvbSB0aGUgYCdzb2xvaXN0J2AgY2xpZW50cyAod2l0aCB0aGUgdG91Y2ggY29vcmRpbmF0ZXMpLFxuICogY2FsY3VsYXRlcyB0aGUgZGlzdGFuY2VzIGZyb20gdGhlIHRvdWNoIHRvIGV2ZXJ5IGAncGxheWVyJ2AgY2xpZW50LCBhbmQgc2VuZHNcbiAqIGEgJ3BsYXknIG9yICdtdXRlJyBtZXNzYWdlIHRvIHRoZSByZWxldmFudCBgJ3BsYXllcidgIGNsaWVudHMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvbG9pc3RQZXJmb3JtYW5jZSBleHRlbmRzIHNlcnZlclNpZGUuUGVyZm9ybWFuY2Uge1xuICAvKipcbiAgICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBjbGFzcy5cbiAgICogQHBhcmFtIHtQZXJmb3JtYW5jZX0gcGxheWVyUGVyZm9ybWFuY2UgYCdwbGF5ZXInYCBjbGllbnRzIHBlcmZvcm1hbmNlXG4gICAqIG1vZHVsZSAoc2VydmVyIHNpZGUpLlxuICAgKiBAcGFyYW0ge1NldHVwfSBzZXR1cCBTZXR1cCBvZiB0aGUgc2NlbmFyaW8uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gT3B0aW9ucyAoYXMgaW4gdGhlIGJhc2UgY2xhc3MpLlxuICAgKi9cbiAgY29uc3RydWN0b3IocGxheWVyUGVyZm9ybWFuY2UsIHNldHVwLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIFBsYXllciBwZXJmb3JtYW5jZSBtb2R1bGUuXG4gICAgICogQHR5cGUge1BlcmZvcm1hbmNlfVxuICAgICAqL1xuICAgIHRoaXMuX3BsYXllclBlcmZvcm1hbmNlID0gcGxheWVyUGVyZm9ybWFuY2U7XG5cbiAgICAvKipcbiAgICAgKiBTZXR1cCBtb2R1bGUuXG4gICAgICogQHR5cGUge1NldHVwfVxuICAgICAqL1xuICAgIHRoaXMuX3NldHVwID0gc2V0dXA7XG5cbiAgICAvKipcbiAgICAgKiBEaWN0aW9uYXJ5IG9mIHRoZSBjdXJyZW50IHRvdWNoZXMgKGZpbmdlcnMpIG9uIHNjcmVlbi5cbiAgICAgKiBLZXlzIGFyZSB0aGUgdG91Y2ggaWRlbnRpZmllcnMgcmV0cml2ZWQgaW4gdGhlIHRvdWNoIGV2ZW50cy5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuX3RvdWNoZXMgPSB7fTtcblxuICAgIC8vIE1ldGhvZCBiaW5kaW5nc1xuICAgIHRoaXMuX29uVG91Y2hTdGFydCA9IHRoaXMuX29uVG91Y2hTdGFydC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uVG91Y2hNb3ZlID0gdGhpcy5fb25Ub3VjaE1vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblRvdWNoRW5kT3JDYW5jZWwgPSB0aGlzLl9vblRvdWNoRW5kT3JDYW5jZWwuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIHdpZHRoIC8gaGVpZ2h0IHJhdGlvIG9mIHRoZSBzcGFjZS5cbiAgICogQHJldHVybiB7TnVtYmVyfSBXaWR0aCAvIGhlaWdodCByYXRpbyBvZiB0aGUgc3BhY2UuXG4gICAqL1xuICBnZXQgX3dpZHRoSGVpZ2h0UmF0aW8oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NldHVwLndpZHRoIC8gdGhpcy5fc2V0dXAuaGVpZ2h0O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSB0aGUgd2lkdGggbm9ybWFsaXphdGlvbiBmYWN0b3IgKGFsbCB0aGUgZGlzdGFuY2UgY2FsY3VsYXRpb25zXG4gICAqIGFyZSBtYWRlIGluIGEgbm9ybWFsaXplZCBzcGFjZSB3aGVyZSBoZWlnaHQgYW5kIHdpZHRoIGVxdWFsIDEpLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFdpZHRoIG5vcm1hbGl6YXRpb24gZmFjdG9yLlxuICAgKi9cbiAgZ2V0IF93aWR0aE5vcm1hbGlzYXRpb24oKSB7XG4gICAgaWYgKHRoaXMuX3dpZHRoSGVpZ2h0UmF0aW8gPiAxKVxuICAgICAgcmV0dXJuIDE7XG4gICAgcmV0dXJuIHRoaXMuX3dpZHRoSGVpZ2h0UmF0aW87XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHRoZSBoZWlnaHQgbm9ybWFsaXphdGlvbiBmYWN0b3IgKGFsbCB0aGUgZGlzdGFuY2UgY2FsY3VsYXRpb25zXG4gICAqIGFyZSBtYWRlIGluIGEgbm9ybWFsaXplZCBzcGFjZSB3aGVyZSBoZWlnaHQgYW5kIHdpZHRoIGVxdWFsIDEpLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IEhlaWdodCBub3JtYWxpemF0aW9uIGZhY3Rvci5cbiAgICovXG4gIGdldCBfaGVpZ2h0Tm9ybWFsaXNhdGlvbigpIHtcbiAgICBpZiAodGhpcy5fd2lkdGhIZWlnaHRSYXRpbyA+IDEpXG4gICAgICByZXR1cm4gMSAvIHRoaXMuX3dpZHRoSGVpZ2h0UmF0aW87XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBzb2xvaXN0IHN0YXJ0cyB0aGUgKHNvbG9pc3QpIHBlcmZvcm1hbmNlLlxuICAgKiBUaGUgbWV0aG9kIHNlbmRzIHRoZSBwbGF5ZXIgbGlzdCwgYW5kIGxpc3RlbnMgZm9yIHRvdWNoIG1lc3NhZ2VzLlxuICAgKiBAcGFyYW0ge0NsaWVudH0gc29sb2lzdCBTb2xvaXN0IHRoYXQgZW50ZXJzIHRoZSBwZXJmb3JtYW5jZS5cbiAgICovXG4gIGVudGVyKHNvbG9pc3QpIHtcbiAgICBzdXBlci5lbnRlcihzb2xvaXN0KTtcblxuICAgIC8vIFNlbmQgbGlzdCBvZiBwbGF5ZXJzIHRvIHRoZSBzb2xvaXN0XG4gICAgY29uc3QgcGxheWVyTGlzdCA9IHRoaXMuX3BsYXllclBlcmZvcm1hbmNlLmNsaWVudHMubWFwKChjKSA9PiBnZXRJbmZvKGMpKTtcbiAgICBzb2xvaXN0LnNlbmQoJ3BlcmZvcm1hbmNlOnBsYXllckxpc3QnLCBwbGF5ZXJMaXN0KTtcblxuICAgIC8vIFNldHVwIGNsaWVudCBtZXNzYWdlIGxpc3RlbmVyc1xuICAgIHNvbG9pc3QucmVjZWl2ZSgnc29sb2lzdDp0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaFN0YXJ0KTtcbiAgICBzb2xvaXN0LnJlY2VpdmUoJ3NvbG9pc3Q6dG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaE1vdmUpO1xuICAgIHNvbG9pc3QucmVjZWl2ZSgnc29sb2lzdDp0b3VjaGVuZG9yY2FuY2VsJywgdGhpcy5fb25Ub3VjaEVuZE9yQ2FuY2VsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzIGluIGEgMkQgc3BhY2UuXG4gICAqIEBwYXJhbSB7TnVtYmVyW119IGEgQ29vcmRpbmF0ZXMgb2YgdGhlIGZpcnN0IHBvaW50IChgW3g6TnVtYmVyLFxuICAgKiB5Ok51bWJlcl1gKS5cbiAgICogQHBhcmFtIHtOdW1iZXJbXX0gYiBDb29yZGluYXRlcyBvZiB0aGUgc2Vjb25kIHBvaW50IChgW3g6TnVtYmVyLFxuICAgKiB5Ok51bWJlcl1gKS5cbiAgICogQHJldHVybiB7TnVtYmVyfSBTcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gdGhlIHR3byBwb2ludHMuXG4gICAqL1xuICBfZ2V0RGlzdGFuY2UoYSwgYikge1xuICAgIGNvbnN0IHggPSAoYVswXSAtIGJbMF0pICogdGhpcy5fd2lkdGhOb3JtYWxpc2F0aW9uO1xuICAgIGNvbnN0IHgyID0geCAqIHg7XG5cbiAgICBjb25zdCB5ID0gKGFbMV0gLSBiWzFdKSAqIHRoaXMuX2hlaWdodE5vcm1hbGlzYXRpb247XG4gICAgY29uc3QgeTIgPSB5ICogeTtcblxuICAgIHJldHVybiAoYSA9PT0gbnVsbCkgPyBJbmZpbml0eSA6IE1hdGgubWluKDEsIHJJbnYyICogKHgyICsgeTIpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIGRpc3RhbmNlIG9mIGVhY2ggcGxheWVyIHRvIHRoZSBjbG9zZXN0IHRvdWNoIChmaW5nZXIgb25cbiAgICogc2NyZWVuKSBhbmQgc2VuZHMgbWVzc2FnZXMgdG8gdGhlIGAncGxheWVyJ2AgY2xpZW50cyBhY2NvcmRpbmdseS5cbiAgICovXG4gIF91cGRhdGVEaXN0YW5jZXMoKSB7XG4gICAgLy8gSWYgYXQgbGVhc3Qgb25lIGZpbmdlciBpcyBvbiBzY3JlZW5cbiAgICBpZiAoT2JqZWN0LmtleXModGhpcy5fdG91Y2hlcykubGVuZ3RoID4gMCkge1xuICAgICAgLy8gRm9yIGVhY2ggcGxheWVyIGluIHRoZSBwZXJmb3JtYW5jZVxuICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRoaXMuX3BsYXllclBlcmZvcm1hbmNlLmNsaWVudHMpIHtcbiAgICAgICAgbGV0IGRpc3RhbmNlcyA9IFtdO1xuXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgcGxheWVyIHRvIGVhY2ggdG91Y2ggKGZpbmdlcilcbiAgICAgICAgZm9yIChsZXQgaWQgaW4gdGhpcy5fdG91Y2hlcykge1xuICAgICAgICAgIGRpc3RhbmNlcy5wdXNoKHRoaXMuX2dldERpc3RhbmNlKHBsYXllci5jb29yZGluYXRlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90b3VjaGVzW2lkXS5jb29yZGluYXRlcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IG1pbmltdW0gZGlzdGFuY2UgYW1vbmcgYWxsIHRvdWNoZXMgKGZpbmdlcnMpXG4gICAgICAgIGxldCBkID0gZ2V0TWluT2ZBcnJheShkaXN0YW5jZXMpO1xuXG4gICAgICAgIC8vIElmIHRoZSBwbGF5ZXIgaXMgd2l0aGluIHJhbmdlIGZvciBwbGF5aW5nIHNvdW5kXG4gICAgICAgIGlmIChkIDwgMSAmJiAhcGxheWVyLm1vZHVsZXMucGVyZm9ybWFuY2UuaXNQbGF5aW5nKSB7XG4gICAgICAgICAgLy8gU2VuZCBtZXNzYWdlIHRvIHRoZSBwbGF5ZXJcbiAgICAgICAgICBwbGF5ZXIuc2VuZCgncGxheWVyOnBsYXknKTtcbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHBsYXllciBzdGF0dXNcbiAgICAgICAgICBwbGF5ZXIubW9kdWxlcy5wZXJmb3JtYW5jZS5pc1BsYXlpbmcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgYW5kIGlmIHRoZSBwbGF5ZXIgaXMgY3VycmVudGx5IHBsYXlpbmcgc291bmRcbiAgICAgICAgZWxzZSBpZiAoZCA9PT0gMSAmJiBwbGF5ZXIubW9kdWxlcy5wZXJmb3JtYW5jZS5pc1BsYXlpbmcpIHtcbiAgICAgICAgICAvLyBTZW5kIG1lc3NhZ2UgdG8gdGhlIHBsYXllclxuICAgICAgICAgIHBsYXllci5zZW5kKCdwbGF5ZXI6bXV0ZScpO1xuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcGxheWVyIHN0YXR1c1xuICAgICAgICAgIHBsYXllci5tb2R1bGVzLnBlcmZvcm1hbmNlLmlzUGxheWluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE90aGVyd2lzZSwgbXV0ZSBldmVyeW9uZVxuICAgIGVsc2Uge1xuICAgICAgLy8gRm9yIGVhY2ggcGxheWVyIGluIHRoZSBwZXJmb3JtYW5jZVxuICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRoaXMuX3BsYXllclBlcmZvcm1hbmNlLmNsaWVudHMpIHtcbiAgICAgICAgLy8gSWYgdGhlIHBsYXllciBpcyBjdXJyZW50bHkgcGxheWluZyBzb3VuZFxuICAgICAgICBpZiAocGxheWVyLm1vZHVsZXMucGVyZm9ybWFuY2UuaXNQbGF5aW5nKSB7XG4gICAgICAgICAgLy8gU2VuZCBtZXNzYWdlIHRvIHRoZSBwbGF5ZXJcbiAgICAgICAgICBwbGF5ZXIuc2VuZCgncGxheWVyOm11dGUnKTtcbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHBsYXllciBzdGF0dXNcbiAgICAgICAgICBwbGF5ZXIubW9kdWxlcy5wZXJmb3JtYW5jZS5pc1BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBgJ3NvbG9pc3Q6dG91Y2hzdGFydCdgIGV2ZW50IGhhbmRsZXIuXG4gICAqIEFkZCBhIG5ldyB0b3VjaCB0byB0aGUgdG91Y2hlcyBkaWN0aW9uYXJ5LCBhbmQgcmVjYWxjdWxhdGUgdGhlIGRpc3RhbmNlcy5cbiAgICogQHBhcmFtIHtPYmplY3R9IHRvdWNoIFRvdWNoLlxuICAgKi9cbiAgX29uVG91Y2hTdGFydCh0b3VjaCkge1xuICAgIC8vIENyZWF0ZSB0b3VjaCBpbiB0aGUgZGljdGlvbmFyeVxuICAgIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdID0ge307XG4gICAgdGhpcy5fdG91Y2hlc1t0b3VjaC5pZF0uaWQgPSB0b3VjaC5pZDtcbiAgICB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXS5jb29yZGluYXRlcyA9IHRvdWNoLmNvb3JkaW5hdGVzO1xuICAgIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXTtcbiAgICB9LCB0aW1lb3V0TGVuZ3RoICogMTAwMCk7XG5cbiAgICAvLyBNYWtlIHRoZSBkaXN0YW5jZXMgY2FsY3VsYXRpb25zXG4gICAgdGhpcy5fdXBkYXRlRGlzdGFuY2VzKCk7XG4gIH1cblxuICAvKipcbiAgICogYCdzb2xvaXN0OnRvdWNobW92ZSdgIGV2ZW50IGhhbmRsZXIuXG4gICAqIFVwZGF0ZSB0aGUgdG91Y2hlcyBkaWN0aW9uYXJ5LCBhbmQgcmVjYWxjdWxhdGUgdGhlIGRpc3RhbmNlcy5cbiAgICogQHBhcmFtIHtPYmplY3R9IHRvdWNoIFRvdWNoLlxuICAgKi9cbiAgX29uVG91Y2hNb3ZlKHRvdWNoKSB7XG4gICAgLy8gSWYgdGhlIHRvdWNoIGlzIG5vdCBpbiB0aGUgZGljdGlvbmFyeSBhbHJlYWR5IChtYXkgaGFwcGVuIGlmIHRoZSBmaW5nZXJcbiAgICAvLyBzbGlkZXMgZnJvbSB0aGUgZWRnZSBvZiB0aGUgdG91Y2hzY3JlZW4pXG4gICAgaWYgKCF0aGlzLl90b3VjaGVzW3RvdWNoLmlkXSkge1xuICAgICAgdGhpcy5fdG91Y2hlc1t0b3VjaC5pZF0gPSB7fTtcbiAgICAgIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLmlkID0gdG91Y2guaWQ7XG4gICAgfVxuICAgIC8vIE90aGVyd2lzZSwgY2xlYXIgdGltZW91dFxuICAgIGVsc2Uge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLnRpbWVvdXQpO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgY29vcmRpbmF0ZXMgYW5kIHRpbWVvdXRcbiAgICB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXS5jb29yZGluYXRlcyA9IHRvdWNoLmNvb3JkaW5hdGVzO1xuICAgIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXTtcbiAgICB9LCB0aW1lb3V0TGVuZ3RoICogMTAwMCk7XG5cbiAgICAvLyBNYWtlIHRoZSBkaXN0YW5jZXMgY2FsY3VsYXRpb25zXG4gICAgdGhpcy5fdXBkYXRlRGlzdGFuY2VzKCk7XG4gIH1cblxuICAvKipcbiAgICogYCdzb2xvaXN0OnRvdWNoZW5kb3JjYW5jZWwnYCBldmVudCBoYW5kbGVyLlxuICAgKiBEZWxldGUgYSB0b3VjaCBmcm9tIHRoZSB0b3VjaGVzIGRpY3Rpb25hcnksIGFuZCByZWNhbGN1bGF0ZSB0aGUgZGlzdGFuY2VzLlxuICAgKiBAcGFyYW0ge09iamVjdH0gdG91Y2ggVG91Y2guXG4gICAqL1xuICBfb25Ub3VjaEVuZE9yQ2FuY2VsKHRvdWNoKSB7XG4gICAgZGVsZXRlIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdO1xuICAgIHRoaXMuX3VwZGF0ZURpc3RhbmNlcygpO1xuICB9XG59XG4iXX0=