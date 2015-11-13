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

// Helper functions
function getMinOfArray(array) {
  if (array.length > 0) return array.reduce(function (p, v) {
    return p < v ? p : v;
  });

  return undefined;
}

function getInfo(client) {
  return { index: client.index, coordinates: client.coordinates };
}

// SoloistPerformance class

var SoloistPerformance = (function (_serverSide$Performance) {
  _inherits(SoloistPerformance, _serverSide$Performance);

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
  }, {
    key: 'exit',
    value: function exit(soloist) {
      _get(Object.getPrototypeOf(SoloistPerformance.prototype), 'enter', this).call(this, soloist);

      // Remove client message listeners
      // soloist.removeListener('soloist:touchstart', this._onTouchStart);
      // soloist.removeListener('soloist:touchmove', this._onTouchMove);
      // soloist.removeListener('soloist:touchendorcancel',
      //                        this._onTouchEndOrCancel);
    }
  }, {
    key: '_getDistance',
    value: function _getDistance(a, b) {
      var x = (a[0] - b[0]) * this._widthNormalisation;
      var x2 = x * x;

      var y = (a[1] - b[1]) * this._heightNormalisation;
      var y2 = y * y;

      return a === null ? Infinity : Math.min(1, rInv2 * (x2 + y2));
    }
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
  }, {
    key: '_onTouchMove',
    value: function _onTouchMove(touch) {
      var _this2 = this;

      console.log('touch move', touch.coordinates);

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
  }, {
    key: '_onTouchEndOrCancel',
    value: function _onTouchEndOrCancel(touch) {
      delete this._touches[touch.id];
      this._updateDistances();
    }
  }, {
    key: '_deleteTouch',
    value: function _deleteTouch(id) {
      delete this._touches[id];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9zZXJ2ZXIvU29sb2lzdFBlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQ0FDdUIsbUJBQW1COzs7O0FBQzFDLElBQU0sTUFBTSxHQUFHLDhCQUFXLE1BQU0sQ0FBQzs7Ozs7Ozs7O0FBU2pDLElBQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQzs7Ozs7Ozs7QUFRekIsSUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7O0FBT3hCLElBQU0sS0FBSyxHQUFHLENBQUMsSUFBSSxZQUFZLEdBQUcsWUFBWSxDQUFBLEFBQUMsQ0FBQzs7O0FBSWhELFNBQVMsYUFBYSxDQUFDLEtBQUssRUFBRTtBQUM1QixNQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUNsQixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztXQUFLLEFBQUMsQ0FBQyxHQUFHLENBQUMsR0FBSSxDQUFDLEdBQUcsQ0FBQztHQUFBLENBQUMsQ0FBQzs7QUFFakQsU0FBTyxTQUFTLENBQUM7Q0FDbEI7O0FBRUQsU0FBUyxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ3ZCLFNBQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0NBQ2pFOzs7O0lBR29CLGtCQUFrQjtZQUFsQixrQkFBa0I7O0FBQzFCLFdBRFEsa0JBQWtCLENBQ3pCLGlCQUFpQixFQUFFLEtBQUssRUFBZ0I7UUFBZCxPQUFPLHlEQUFHLEVBQUU7OzBCQUQvQixrQkFBa0I7O0FBRW5DLCtCQUZpQixrQkFBa0IsNkNBRTdCLE9BQU8sRUFBRTs7Ozs7O0FBTWYsUUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDOzs7Ozs7QUFNNUMsUUFBSSxDQUFD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QUFFLENBQUMsQ0FBQztLQUMxQjs7O1NBdEpvQixlQUFHO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7S0FDL0M7Ozs7Ozs7OztTQU9zQixlQUFHO0FBQ3hCLFVBQUksSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsRUFDNUIsT0FBTyxDQUFDLENBQUM7QUFDWCxhQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztLQUMvQjs7Ozs7Ozs7O1NBT3VCLGVBQUc7QUFDekIsVUFBSSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxFQUM1QixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7QUFDcEMsYUFBTyxDQUFDLENBQUM7S0FDVjs7O1NBekRrQixrQkFBa0I7R0FBUyw4QkFBVyxXQUFXOztxQkFBakQsa0JBQWtCIiwiZmlsZSI6Ii9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9zZXJ2ZXIvU29sb2lzdFBlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW1wb3J0IFNvdW5kd29ya3MgbGlicmFyeSAoc2VydmVyIHNpZGUpXG5pbXBvcnQgc2VydmVyU2lkZSBmcm9tICdzb3VuZHdvcmtzL3NlcnZlcic7XG5jb25zdCBzZXJ2ZXIgPSBzZXJ2ZXJTaWRlLnNlcnZlcjtcblxuLyoqXG4gKiBOb3JtYWxpemVkIHZhbHVlIG9mIHJhZGl1cyBvZiB0aGUgZmluZ2VyIGdyYXBoaWNhbCByZXByZXNlbnRhdGlvbiAoYVxuICogdHJhbnNsdWNlbnQgcmVkIGNpcmNsZSkuXG4gKiBBIHZhbHVlIG9mIDEgY29ycmVzcG9uZCB0byBhIHJhZGl1cyBlcXVhbCB0byB0aGUgbWluaW11bSBvZiB0aGUgaGVpZ2h0IG9yXG4gKiB3aWR0aCBvZiB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbi5cbiAqIEB0eXBlIHtOdW1iZXJ9XG4gKi9cbmNvbnN0IGZpbmdlclJhZGl1cyA9IDAuMTtcblxuLyoqXG4gKiBMZW5ndGggb2YgdGhlIHRpbWVvdXQgKGluIHNlY29uZHMpIGFmdGVyIHdoaWNoIHRoZSB0b3VjaCBpcyBhdXRvbWF0aWNhbGx5XG4gKiByZW1vdmVkICh1c2VmdWwgd2hlbiBhIGAndG91Y2hlbmQnYCBvciBgJ3RvdWNoY2FuY2VsJ2AgbWVzc2FnZSBkb2Vzbid0IGdvXG4gKiB0aHJvdWdoKS5cbiAqIEB0eXBlIHtOdW1iZXJ9XG4gKi9cbmNvbnN0IHRpbWVvdXRMZW5ndGggPSA4O1xuXG4vKipcbiAqIEludmVyc2Ugb2YgdGhlIHNxdWFyZWQgZmluZ2VyIHJhZGl1cyBub3JtYWxpemVkIHZhbHVlLCB1c2VkIGZvciBvcHRpbWl6YXRpb25cbiAqIGluIHRoZSBkaXN0YW5jZXMgY2FsY3VsYXRpb25zLlxuICogQHR5cGUge051bWJlcn1cbiAqL1xuY29uc3QgckludjIgPSAxIC8gKGZpbmdlclJhZGl1cyAqIGZpbmdlclJhZGl1cyk7XG5cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuZnVuY3Rpb24gZ2V0TWluT2ZBcnJheShhcnJheSkge1xuICBpZiAoYXJyYXkubGVuZ3RoID4gMClcbiAgICByZXR1cm4gYXJyYXkucmVkdWNlKChwLCB2KSA9PiAocCA8IHYpID8gcCA6IHYpO1xuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGdldEluZm8oY2xpZW50KSB7XG4gIHJldHVybiB7IGluZGV4OiBjbGllbnQuaW5kZXgsIGNvb3JkaW5hdGVzOiBjbGllbnQuY29vcmRpbmF0ZXMgfTtcbn1cblxuLy8gU29sb2lzdFBlcmZvcm1hbmNlIGNsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2xvaXN0UGVyZm9ybWFuY2UgZXh0ZW5kcyBzZXJ2ZXJTaWRlLlBlcmZvcm1hbmNlIHtcbiAgY29uc3RydWN0b3IocGxheWVyUGVyZm9ybWFuY2UsIHNldHVwLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIFBsYXllciBwZXJmb3JtYW5jZSBtb2R1bGUuXG4gICAgICogQHR5cGUge1BlcmZvcm1hbmNlfVxuICAgICAqL1xuICAgIHRoaXMuX3BsYXllclBlcmZvcm1hbmNlID0gcGxheWVyUGVyZm9ybWFuY2U7XG5cbiAgICAvKipcbiAgICAgKiBTZXR1cCBtb2R1bGUuXG4gICAgICogQHR5cGUge1NldHVwfVxuICAgICAqL1xuICAgIHRoaXMuX3NldHVwID0gc2V0dXA7XG5cbiAgICAvKipcbiAgICAgKiBEaWN0aW9uYXJ5IG9mIHRoZSBjdXJyZW50IHRvdWNoZXMgKGZpbmdlcnMpIG9uIHNjcmVlbi5cbiAgICAgKiBLZXlzIGFyZSB0aGUgdG91Y2ggaWRlbnRpZmllcnMgcmV0cml2ZWQgaW4gdGhlIHRvdWNoIGV2ZW50cy5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuX3RvdWNoZXMgPSB7fTtcblxuICAgIC8vIE1ldGhvZCBiaW5kaW5nc1xuICAgIHRoaXMuX29uVG91Y2hTdGFydCA9IHRoaXMuX29uVG91Y2hTdGFydC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uVG91Y2hNb3ZlID0gdGhpcy5fb25Ub3VjaE1vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblRvdWNoRW5kT3JDYW5jZWwgPSB0aGlzLl9vblRvdWNoRW5kT3JDYW5jZWwuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIHdpZHRoIC8gaGVpZ2h0IHJhdGlvIG9mIHRoZSBzcGFjZS5cbiAgICogQHJldHVybiB7TnVtYmVyfSBXaWR0aCAvIGhlaWdodCByYXRpbyBvZiB0aGUgc3BhY2UuXG4gICAqL1xuICBnZXQgX3dpZHRoSGVpZ2h0UmF0aW8oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NldHVwLndpZHRoIC8gdGhpcy5fc2V0dXAuaGVpZ2h0O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSB0aGUgd2lkdGggbm9ybWFsaXphdGlvbiBmYWN0b3IgKGFsbCB0aGUgZGlzdGFuY2UgY2FsY3VsYXRpb25zXG4gICAqIGFyZSBtYWRlIGluIGEgbm9ybWFsaXplZCBzcGFjZSB3aGVyZSBoZWlnaHQgYW5kIHdpZHRoIGVxdWFsIDEpLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFdpZHRoIG5vcm1hbGl6YXRpb24gZmFjdG9yLlxuICAgKi9cbiAgZ2V0IF93aWR0aE5vcm1hbGlzYXRpb24oKSB7XG4gICAgaWYgKHRoaXMuX3dpZHRoSGVpZ2h0UmF0aW8gPiAxKVxuICAgICAgcmV0dXJuIDE7XG4gICAgcmV0dXJuIHRoaXMuX3dpZHRoSGVpZ2h0UmF0aW87XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHRoZSBoZWlnaHQgbm9ybWFsaXphdGlvbiBmYWN0b3IgKGFsbCB0aGUgZGlzdGFuY2UgY2FsY3VsYXRpb25zXG4gICAqIGFyZSBtYWRlIGluIGEgbm9ybWFsaXplZCBzcGFjZSB3aGVyZSBoZWlnaHQgYW5kIHdpZHRoIGVxdWFsIDEpLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IEhlaWdodCBub3JtYWxpemF0aW9uIGZhY3Rvci5cbiAgICovXG4gIGdldCBfaGVpZ2h0Tm9ybWFsaXNhdGlvbigpIHtcbiAgICBpZiAodGhpcy5fd2lkdGhIZWlnaHRSYXRpbyA+IDEpXG4gICAgICByZXR1cm4gMSAvIHRoaXMuX3dpZHRoSGVpZ2h0UmF0aW87XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBlbnRlcihzb2xvaXN0KSB7XG4gICAgc3VwZXIuZW50ZXIoc29sb2lzdCk7XG5cbiAgICAvLyBTZW5kIGxpc3Qgb2YgcGxheWVycyB0byB0aGUgc29sb2lzdFxuICAgIGNvbnN0IHBsYXllckxpc3QgPSB0aGlzLl9wbGF5ZXJQZXJmb3JtYW5jZS5jbGllbnRzLm1hcCgoYykgPT4gZ2V0SW5mbyhjKSk7XG4gICAgc29sb2lzdC5zZW5kKCdwZXJmb3JtYW5jZTpwbGF5ZXJMaXN0JywgcGxheWVyTGlzdCk7XG5cbiAgICAvLyBTZXR1cCBjbGllbnQgbWVzc2FnZSBsaXN0ZW5lcnNcbiAgICBzb2xvaXN0LnJlY2VpdmUoJ3NvbG9pc3Q6dG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2hTdGFydCk7XG4gICAgc29sb2lzdC5yZWNlaXZlKCdzb2xvaXN0OnRvdWNobW92ZScsIHRoaXMuX29uVG91Y2hNb3ZlKTtcbiAgICBzb2xvaXN0LnJlY2VpdmUoJ3NvbG9pc3Q6dG91Y2hlbmRvcmNhbmNlbCcsIHRoaXMuX29uVG91Y2hFbmRPckNhbmNlbCk7XG4gIH1cblxuICBleGl0KHNvbG9pc3QpIHtcbiAgICBzdXBlci5lbnRlcihzb2xvaXN0KTtcblxuICAgIC8vIFJlbW92ZSBjbGllbnQgbWVzc2FnZSBsaXN0ZW5lcnNcbiAgICAvLyBzb2xvaXN0LnJlbW92ZUxpc3RlbmVyKCdzb2xvaXN0OnRvdWNoc3RhcnQnLCB0aGlzLl9vblRvdWNoU3RhcnQpO1xuICAgIC8vIHNvbG9pc3QucmVtb3ZlTGlzdGVuZXIoJ3NvbG9pc3Q6dG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaE1vdmUpO1xuICAgIC8vIHNvbG9pc3QucmVtb3ZlTGlzdGVuZXIoJ3NvbG9pc3Q6dG91Y2hlbmRvcmNhbmNlbCcsXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vblRvdWNoRW5kT3JDYW5jZWwpO1xuICB9XG5cbiAgX2dldERpc3RhbmNlKGEsIGIpIHtcbiAgICBjb25zdCB4ID0gKGFbMF0gLSBiWzBdKSAqIHRoaXMuX3dpZHRoTm9ybWFsaXNhdGlvbjtcbiAgICBjb25zdCB4MiA9IHggKiB4O1xuXG4gICAgY29uc3QgeSA9IChhWzFdIC0gYlsxXSkgKiB0aGlzLl9oZWlnaHROb3JtYWxpc2F0aW9uO1xuICAgIGNvbnN0IHkyID0geSAqIHk7XG5cbiAgICByZXR1cm4gKGEgPT09IG51bGwpID8gSW5maW5pdHkgOiBNYXRoLm1pbigxLCBySW52MiAqICh4MiArIHkyKSk7XG4gIH1cblxuICBfdXBkYXRlRGlzdGFuY2VzKCkge1xuICAgIC8vIElmIGF0IGxlYXN0IG9uZSBmaW5nZXIgaXMgb24gc2NyZWVuXG4gICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuX3RvdWNoZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIEZvciBlYWNoIHBsYXllciBpbiB0aGUgcGVyZm9ybWFuY2VcbiAgICAgIGZvciAobGV0IHBsYXllciBvZiB0aGlzLl9wbGF5ZXJQZXJmb3JtYW5jZS5jbGllbnRzKSB7XG4gICAgICAgIGxldCBkaXN0YW5jZXMgPSBbXTtcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGZyb20gdGhlIHBsYXllciB0byBlYWNoIHRvdWNoIChmaW5nZXIpXG4gICAgICAgIGZvciAobGV0IGlkIGluIHRoaXMuX3RvdWNoZXMpIHtcbiAgICAgICAgICBkaXN0YW5jZXMucHVzaCh0aGlzLl9nZXREaXN0YW5jZShwbGF5ZXIuY29vcmRpbmF0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG91Y2hlc1tpZF0uY29vcmRpbmF0ZXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCBtaW5pbXVtIGRpc3RhbmNlIGFtb25nIGFsbCB0b3VjaGVzIChmaW5nZXJzKVxuICAgICAgICBsZXQgZCA9IGdldE1pbk9mQXJyYXkoZGlzdGFuY2VzKTtcblxuICAgICAgICAvLyBJZiB0aGUgcGxheWVyIGlzIHdpdGhpbiByYW5nZSBmb3IgcGxheWluZyBzb3VuZFxuICAgICAgICBpZiAoZCA8IDEgJiYgIXBsYXllci5tb2R1bGVzLnBlcmZvcm1hbmNlLmlzUGxheWluZykge1xuICAgICAgICAgIC8vIFNlbmQgbWVzc2FnZSB0byB0aGUgcGxheWVyXG4gICAgICAgICAgcGxheWVyLnNlbmQoJ3BsYXllcjpwbGF5Jyk7XG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgc3RhdHVzXG4gICAgICAgICAgcGxheWVyLm1vZHVsZXMucGVyZm9ybWFuY2UuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UsIGFuZCBpZiB0aGUgcGxheWVyIGlzIGN1cnJlbnRseSBwbGF5aW5nIHNvdW5kXG4gICAgICAgIGVsc2UgaWYgKGQgPT09IDEgJiYgcGxheWVyLm1vZHVsZXMucGVyZm9ybWFuY2UuaXNQbGF5aW5nKSB7XG4gICAgICAgICAgLy8gU2VuZCBtZXNzYWdlIHRvIHRoZSBwbGF5ZXJcbiAgICAgICAgICBwbGF5ZXIuc2VuZCgncGxheWVyOm11dGUnKTtcbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHBsYXllciBzdGF0dXNcbiAgICAgICAgICBwbGF5ZXIubW9kdWxlcy5wZXJmb3JtYW5jZS5pc1BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBPdGhlcndpc2UsIG11dGUgZXZlcnlvbmVcbiAgICBlbHNlIHtcbiAgICAgIC8vIEZvciBlYWNoIHBsYXllciBpbiB0aGUgcGVyZm9ybWFuY2VcbiAgICAgIGZvciAobGV0IHBsYXllciBvZiB0aGlzLl9wbGF5ZXJQZXJmb3JtYW5jZS5jbGllbnRzKSB7XG4gICAgICAgIC8vIElmIHRoZSBwbGF5ZXIgaXMgY3VycmVudGx5IHBsYXlpbmcgc291bmRcbiAgICAgICAgaWYgKHBsYXllci5tb2R1bGVzLnBlcmZvcm1hbmNlLmlzUGxheWluZykge1xuICAgICAgICAgIC8vIFNlbmQgbWVzc2FnZSB0byB0aGUgcGxheWVyXG4gICAgICAgICAgcGxheWVyLnNlbmQoJ3BsYXllcjptdXRlJyk7XG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgc3RhdHVzXG4gICAgICAgICAgcGxheWVyLm1vZHVsZXMucGVyZm9ybWFuY2UuaXNQbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfb25Ub3VjaFN0YXJ0KHRvdWNoKSB7XG4gICAgLy8gQ3JlYXRlIHRvdWNoIGluIHRoZSBkaWN0aW9uYXJ5XG4gICAgdGhpcy5fdG91Y2hlc1t0b3VjaC5pZF0gPSB7fTtcbiAgICB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXS5pZCA9IHRvdWNoLmlkO1xuICAgIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLmNvb3JkaW5hdGVzID0gdG91Y2guY29vcmRpbmF0ZXM7XG4gICAgdGhpcy5fdG91Y2hlc1t0b3VjaC5pZF0udGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdO1xuICAgIH0sIHRpbWVvdXRMZW5ndGggKiAxMDAwKTtcblxuICAgIC8vIE1ha2UgdGhlIGRpc3RhbmNlcyBjYWxjdWxhdGlvbnNcbiAgICB0aGlzLl91cGRhdGVEaXN0YW5jZXMoKTtcbiAgfVxuXG4gIF9vblRvdWNoTW92ZSh0b3VjaCkge1xuICAgIGNvbnNvbGUubG9nKCd0b3VjaCBtb3ZlJywgdG91Y2guY29vcmRpbmF0ZXMpO1xuXG4gICAgLy8gSWYgdGhlIHRvdWNoIGlzIG5vdCBpbiB0aGUgZGljdGlvbmFyeSBhbHJlYWR5IChtYXkgaGFwcGVuIGlmIHRoZSBmaW5nZXJcbiAgICAvLyBzbGlkZXMgZnJvbSB0aGUgZWRnZSBvZiB0aGUgdG91Y2hzY3JlZW4pXG4gICAgaWYgKCF0aGlzLl90b3VjaGVzW3RvdWNoLmlkXSkge1xuICAgICAgdGhpcy5fdG91Y2hlc1t0b3VjaC5pZF0gPSB7fTtcbiAgICAgIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLmlkID0gdG91Y2guaWQ7XG4gICAgfVxuICAgIC8vIE90aGVyd2lzZSwgY2xlYXIgdGltZW91dFxuICAgIGVsc2Uge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLnRpbWVvdXQpO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgY29vcmRpbmF0ZXMgYW5kIHRpbWVvdXRcbiAgICB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXS5jb29yZGluYXRlcyA9IHRvdWNoLmNvb3JkaW5hdGVzO1xuICAgIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXTtcbiAgICB9LCB0aW1lb3V0TGVuZ3RoICogMTAwMCk7XG5cbiAgICAvLyBNYWtlIHRoZSBkaXN0YW5jZXMgY2FsY3VsYXRpb25zXG4gICAgdGhpcy5fdXBkYXRlRGlzdGFuY2VzKCk7XG4gIH1cblxuICBfb25Ub3VjaEVuZE9yQ2FuY2VsKHRvdWNoKSB7XG4gICAgZGVsZXRlIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdO1xuICAgIHRoaXMuX3VwZGF0ZURpc3RhbmNlcygpO1xuICB9XG5cbiAgX2RlbGV0ZVRvdWNoKGlkKSB7XG4gICAgZGVsZXRlIHRoaXMuX3RvdWNoZXNbaWRdO1xuICB9XG59XG4iXX0=