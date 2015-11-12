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

  function SoloistPerformance(playerPerformance) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, SoloistPerformance);

    _get(Object.getPrototypeOf(SoloistPerformance.prototype), 'constructor', this).call(this, options);

    /**
     * Player performance module.
     * @type {Performance}
     */
    this._playerPerformance = playerPerformance;

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
      var _this = this;

      _get(Object.getPrototypeOf(SoloistPerformance.prototype), 'enter', this).call(this, soloist);

      // Send list of players to the soloist
      var playerList = this._playerPerformance.clients.map(function (c) {
        return _this._getInfo(c);
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
      soloist.removeListener('soloist:touchstart', this._onTouchStart);
      soloist.removeListener('soloist:touchmove', this._onTouchMove);
      soloist.removeListener('soloist:touchendorcancel', this._onTouchEndOrCancel);
    }
  }, {
    key: '_calculateDistance',
    value: function _calculateDistance() {
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

            var playerCoordinates = player.coordinates;
            var distances = [];

            // Calculate the distance from the player to each touch (finger)
            for (var id in this._touches) {
              distances.push(this._calculateDistance(playerCoordinates, this._touches[id].coordinates));
            }

            // Get minimum distance among all touches (fingers)
            var d = getMinOfArray(distances);

            // If the player is within range for playing sound
            if (d < 1 && !player.modules.performance.playing[soloistIndex]) {
              // Send message to the player
              player.send('player:play', true);
              // Update the player status
              player.modules.performance.isPlaying = true;
            }
            // Otherwise, and if the player is currently playing sound
            else if (d === 1 && player.modules.performance.playing) {
                // Send message to the player
                player.send('player:play', false);
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
                player.send('player:play', false);
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
      var _this2 = this;

      // Create touch in the dictionary
      this._touches[touch.id] = {};
      this._touches[touch.id].id = touch.id;
      this._touches[touch.id].coordinates = touch.coordinates;
      this._touches[touch.id].timeout = setTimeout(function () {
        delete _this2._touches[touch.id];
      }, timeoutLength * 1000);

      // Make the distances calculations
      this._updateDistances();
    }
  }, {
    key: '_onTouchMove',
    value: function _onTouchMove(touch) {
      var _this3 = this;

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
        delete _this3._touches[touch.id];
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
      return this._space.width / this._space.height;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9zZXJ2ZXIvU29sb2lzdFBlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQ0FDdUIsbUJBQW1COzs7O0FBQzFDLElBQU0sTUFBTSxHQUFHLDhCQUFXLE1BQU0sQ0FBQzs7Ozs7Ozs7O0FBU2pDLElBQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQzs7Ozs7Ozs7QUFRekIsSUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7O0FBT3hCLElBQU0sS0FBSyxHQUFHLENBQUMsSUFBSSxZQUFZLEdBQUcsWUFBWSxDQUFBLEFBQUMsQ0FBQzs7O0FBSWhELFNBQVMsYUFBYSxDQUFDLEtBQUssRUFBRTtBQUM1QixNQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUNsQixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztXQUFLLEFBQUMsQ0FBQyxHQUFHLENBQUMsR0FBSSxDQUFDLEdBQUcsQ0FBQztHQUFBLENBQUMsQ0FBQzs7QUFFakQsU0FBTyxTQUFTLENBQUM7Q0FDbEI7O0FBRUQsU0FBUyxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ3ZCLFNBQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0NBQ2pFOzs7O0lBR29CLGtCQUFrQjtZQUFsQixrQkFBa0I7O0FBQzFCLFdBRFEsa0JBQWtCLENBQ3pCLGlCQUFpQixFQUFnQjtRQUFkLE9BQU8seURBQUcsRUFBRTs7MEJBRHhCLGtCQUFrQjs7QUFFbkMsK0JBRmlCLGtCQUFrQiw2Q0FFN0IsT0FBTyxFQUFFOzs7Ozs7QUFNZixRQUFJLENBQUMsa0JBQWtCLEdBQUcsaUJBQWlCLENBQUM7Ozs7Ozs7QUFPNUMsUUFBSSxDQUFDLFFBQVEsR0FB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ekIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMvQixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUN6Qjs7O1dBRVcsc0JBQUMsRUFBRSxFQUFFO0FBQ2YsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzFCOzs7U0FySm9CLGVBQUc7QUFDdEIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztLQUMvQzs7Ozs7Ozs7O1NBT3NCLGVBQUc7QUFDeEIsVUFBSSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxFQUM1QixPQUFPLENBQUMsQ0FBQztBQUNYLGFBQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO0tBQy9COzs7Ozs7Ozs7U0FPdUIsZUFBRztBQUN6QixVQUFJLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLEVBQzVCLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztBQUNwQyxhQUFPLENBQUMsQ0FBQztLQUNWOzs7U0FuRGtCLGtCQUFrQjtHQUFTLDhCQUFXLFdBQVc7O3FCQUFqRCxrQkFBa0IiLCJmaWxlIjoiL1VzZXJzL3JvYmkvRGV2L2NvbGxlY3RpdmUtc291bmR3b3Jrcy1kZXZlbG9wL3NvdW5kZmllbGQvc3JjL3NlcnZlci9Tb2xvaXN0UGVyZm9ybWFuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbXBvcnQgU291bmR3b3JrcyBsaWJyYXJ5IChzZXJ2ZXIgc2lkZSlcbmltcG9ydCBzZXJ2ZXJTaWRlIGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcbmNvbnN0IHNlcnZlciA9IHNlcnZlclNpZGUuc2VydmVyO1xuXG4vKipcbiAqIE5vcm1hbGl6ZWQgdmFsdWUgb2YgcmFkaXVzIG9mIHRoZSBmaW5nZXIgZ3JhcGhpY2FsIHJlcHJlc2VudGF0aW9uIChhXG4gKiB0cmFuc2x1Y2VudCByZWQgY2lyY2xlKS5cbiAqIEEgdmFsdWUgb2YgMSBjb3JyZXNwb25kIHRvIGEgcmFkaXVzIGVxdWFsIHRvIHRoZSBtaW5pbXVtIG9mIHRoZSBoZWlnaHQgb3JcbiAqIHdpZHRoIG9mIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uLlxuICogQHR5cGUge051bWJlcn1cbiAqL1xuY29uc3QgZmluZ2VyUmFkaXVzID0gMC4xO1xuXG4vKipcbiAqIExlbmd0aCBvZiB0aGUgdGltZW91dCAoaW4gc2Vjb25kcykgYWZ0ZXIgd2hpY2ggdGhlIHRvdWNoIGlzIGF1dG9tYXRpY2FsbHlcbiAqIHJlbW92ZWQgKHVzZWZ1bCB3aGVuIGEgYCd0b3VjaGVuZCdgIG9yIGAndG91Y2hjYW5jZWwnYCBtZXNzYWdlIGRvZXNuJ3QgZ29cbiAqIHRocm91Z2gpLlxuICogQHR5cGUge051bWJlcn1cbiAqL1xuY29uc3QgdGltZW91dExlbmd0aCA9IDg7XG5cbi8qKlxuICogSW52ZXJzZSBvZiB0aGUgc3F1YXJlZCBmaW5nZXIgcmFkaXVzIG5vcm1hbGl6ZWQgdmFsdWUsIHVzZWQgZm9yIG9wdGltaXphdGlvblxuICogaW4gdGhlIGRpc3RhbmNlcyBjYWxjdWxhdGlvbnMuXG4gKiBAdHlwZSB7TnVtYmVyfVxuICovXG5jb25zdCBySW52MiA9IDEgLyAoZmluZ2VyUmFkaXVzICogZmluZ2VyUmFkaXVzKTtcblxuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5mdW5jdGlvbiBnZXRNaW5PZkFycmF5KGFycmF5KSB7XG4gIGlmIChhcnJheS5sZW5ndGggPiAwKVxuICAgIHJldHVybiBhcnJheS5yZWR1Y2UoKHAsIHYpID0+IChwIDwgdikgPyBwIDogdik7XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZ2V0SW5mbyhjbGllbnQpIHtcbiAgcmV0dXJuIHsgaW5kZXg6IGNsaWVudC5pbmRleCwgY29vcmRpbmF0ZXM6IGNsaWVudC5jb29yZGluYXRlcyB9O1xufVxuXG4vLyBTb2xvaXN0UGVyZm9ybWFuY2UgY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvbG9pc3RQZXJmb3JtYW5jZSBleHRlbmRzIHNlcnZlclNpZGUuUGVyZm9ybWFuY2Uge1xuICBjb25zdHJ1Y3RvcihwbGF5ZXJQZXJmb3JtYW5jZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucyk7XG5cbiAgICAvKipcbiAgICAgKiBQbGF5ZXIgcGVyZm9ybWFuY2UgbW9kdWxlLlxuICAgICAqIEB0eXBlIHtQZXJmb3JtYW5jZX1cbiAgICAgKi9cbiAgICB0aGlzLl9wbGF5ZXJQZXJmb3JtYW5jZSA9IHBsYXllclBlcmZvcm1hbmNlO1xuXG4gICAgLyoqXG4gICAgICogRGljdGlvbmFyeSBvZiB0aGUgY3VycmVudCB0b3VjaGVzIChmaW5nZXJzKSBvbiBzY3JlZW4uXG4gICAgICogS2V5cyBhcmUgdGhlIHRvdWNoIGlkZW50aWZpZXJzIHJldHJpdmVkIGluIHRoZSB0b3VjaCBldmVudHMuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB0aGlzLl90b3VjaGVzID0ge307XG5cbiAgICAvLyBNZXRob2QgYmluZGluZ3NcbiAgICB0aGlzLl9vblRvdWNoU3RhcnQgPSB0aGlzLl9vblRvdWNoU3RhcnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblRvdWNoTW92ZSA9IHRoaXMuX29uVG91Y2hNb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Ub3VjaEVuZE9yQ2FuY2VsID0gdGhpcy5fb25Ub3VjaEVuZE9yQ2FuY2VsLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHRoZSB3aWR0aCAvIGhlaWdodCByYXRpbyBvZiB0aGUgc3BhY2UuXG4gICAqIEByZXR1cm4ge051bWJlcn0gV2lkdGggLyBoZWlnaHQgcmF0aW8gb2YgdGhlIHNwYWNlLlxuICAgKi9cbiAgZ2V0IF93aWR0aEhlaWdodFJhdGlvKCkge1xuICAgIHJldHVybiB0aGlzLl9zcGFjZS53aWR0aCAvIHRoaXMuX3NwYWNlLmhlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIHdpZHRoIG5vcm1hbGl6YXRpb24gZmFjdG9yIChhbGwgdGhlIGRpc3RhbmNlIGNhbGN1bGF0aW9uc1xuICAgKiBhcmUgbWFkZSBpbiBhIG5vcm1hbGl6ZWQgc3BhY2Ugd2hlcmUgaGVpZ2h0IGFuZCB3aWR0aCBlcXVhbCAxKS5cbiAgICogQHJldHVybiB7TnVtYmVyfSBXaWR0aCBub3JtYWxpemF0aW9uIGZhY3Rvci5cbiAgICovXG4gIGdldCBfd2lkdGhOb3JtYWxpc2F0aW9uKCkge1xuICAgIGlmICh0aGlzLl93aWR0aEhlaWdodFJhdGlvID4gMSlcbiAgICAgIHJldHVybiAxO1xuICAgIHJldHVybiB0aGlzLl93aWR0aEhlaWdodFJhdGlvO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSB0aGUgaGVpZ2h0IG5vcm1hbGl6YXRpb24gZmFjdG9yIChhbGwgdGhlIGRpc3RhbmNlIGNhbGN1bGF0aW9uc1xuICAgKiBhcmUgbWFkZSBpbiBhIG5vcm1hbGl6ZWQgc3BhY2Ugd2hlcmUgaGVpZ2h0IGFuZCB3aWR0aCBlcXVhbCAxKS5cbiAgICogQHJldHVybiB7TnVtYmVyfSBIZWlnaHQgbm9ybWFsaXphdGlvbiBmYWN0b3IuXG4gICAqL1xuICBnZXQgX2hlaWdodE5vcm1hbGlzYXRpb24oKSB7XG4gICAgaWYgKHRoaXMuX3dpZHRoSGVpZ2h0UmF0aW8gPiAxKVxuICAgICAgcmV0dXJuIDEgLyB0aGlzLl93aWR0aEhlaWdodFJhdGlvO1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgZW50ZXIoc29sb2lzdCkge1xuICAgIHN1cGVyLmVudGVyKHNvbG9pc3QpO1xuXG4gICAgLy8gU2VuZCBsaXN0IG9mIHBsYXllcnMgdG8gdGhlIHNvbG9pc3RcbiAgICBjb25zdCBwbGF5ZXJMaXN0ID0gdGhpcy5fcGxheWVyUGVyZm9ybWFuY2UuY2xpZW50cy5tYXAoKGMpID0+IHRoaXMuX2dldEluZm8oYykpO1xuICAgIHNvbG9pc3Quc2VuZCgncGVyZm9ybWFuY2U6cGxheWVyTGlzdCcsIHBsYXllckxpc3QpO1xuXG4gICAgLy8gU2V0dXAgY2xpZW50IG1lc3NhZ2UgbGlzdGVuZXJzXG4gICAgc29sb2lzdC5yZWNlaXZlKCdzb2xvaXN0OnRvdWNoc3RhcnQnLCB0aGlzLl9vblRvdWNoU3RhcnQpO1xuICAgIHNvbG9pc3QucmVjZWl2ZSgnc29sb2lzdDp0b3VjaG1vdmUnLCB0aGlzLl9vblRvdWNoTW92ZSk7XG4gICAgc29sb2lzdC5yZWNlaXZlKCdzb2xvaXN0OnRvdWNoZW5kb3JjYW5jZWwnLCB0aGlzLl9vblRvdWNoRW5kT3JDYW5jZWwpO1xuICB9XG5cbiAgZXhpdChzb2xvaXN0KSB7XG4gICAgc3VwZXIuZW50ZXIoc29sb2lzdCk7XG5cbiAgICAvLyBSZW1vdmUgY2xpZW50IG1lc3NhZ2UgbGlzdGVuZXJzXG4gICAgc29sb2lzdC5yZW1vdmVMaXN0ZW5lcignc29sb2lzdDp0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaFN0YXJ0KTtcbiAgICBzb2xvaXN0LnJlbW92ZUxpc3RlbmVyKCdzb2xvaXN0OnRvdWNobW92ZScsIHRoaXMuX29uVG91Y2hNb3ZlKTtcbiAgICBzb2xvaXN0LnJlbW92ZUxpc3RlbmVyKCdzb2xvaXN0OnRvdWNoZW5kb3JjYW5jZWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25Ub3VjaEVuZE9yQ2FuY2VsKTtcbiAgfVxuXG4gIF9jYWxjdWxhdGVEaXN0YW5jZSgpIHtcbiAgICBjb25zdCB4ID0gKGFbMF0gLSBiWzBdKSAqIHRoaXMuX3dpZHRoTm9ybWFsaXNhdGlvbjtcbiAgICBjb25zdCB4MiA9IHggKiB4O1xuXG4gICAgY29uc3QgeSA9IChhWzFdIC0gYlsxXSkgKiB0aGlzLl9oZWlnaHROb3JtYWxpc2F0aW9uO1xuICAgIGNvbnN0IHkyID0geSAqIHk7XG5cbiAgICByZXR1cm4gKGEgPT09IG51bGwpID8gSW5maW5pdHkgOiBNYXRoLm1pbigxLCBySW52MiAqICh4MiArIHkyKSk7XG4gIH1cblxuICBfdXBkYXRlRGlzdGFuY2VzKCkge1xuICAgIC8vIElmIGF0IGxlYXN0IG9uZSBmaW5nZXIgaXMgb24gc2NyZWVuXG4gICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuX3RvdWNoZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIEZvciBlYWNoIHBsYXllciBpbiB0aGUgcGVyZm9ybWFuY2VcbiAgICAgIGZvciAobGV0IHBsYXllciBvZiB0aGlzLl9wbGF5ZXJQZXJmb3JtYW5jZS5jbGllbnRzKSB7XG4gICAgICAgIGxldCBwbGF5ZXJDb29yZGluYXRlcyA9IHBsYXllci5jb29yZGluYXRlcztcbiAgICAgICAgbGV0IGRpc3RhbmNlcyA9IFtdO1xuXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgcGxheWVyIHRvIGVhY2ggdG91Y2ggKGZpbmdlcilcbiAgICAgICAgZm9yIChsZXQgaWQgaW4gdGhpcy5fdG91Y2hlcykge1xuICAgICAgICAgIGRpc3RhbmNlcy5wdXNoKHRoaXMuX2NhbGN1bGF0ZURpc3RhbmNlKHBsYXllckNvb3JkaW5hdGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RvdWNoZXNbaWRdLmNvb3JkaW5hdGVzKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgbWluaW11bSBkaXN0YW5jZSBhbW9uZyBhbGwgdG91Y2hlcyAoZmluZ2VycylcbiAgICAgICAgbGV0IGQgPSBnZXRNaW5PZkFycmF5KGRpc3RhbmNlcyk7XG5cbiAgICAgICAgLy8gSWYgdGhlIHBsYXllciBpcyB3aXRoaW4gcmFuZ2UgZm9yIHBsYXlpbmcgc291bmRcbiAgICAgICAgaWYgKGQgPCAxICYmICFwbGF5ZXIubW9kdWxlcy5wZXJmb3JtYW5jZS5wbGF5aW5nW3NvbG9pc3RJbmRleF0pIHtcbiAgICAgICAgICAvLyBTZW5kIG1lc3NhZ2UgdG8gdGhlIHBsYXllclxuICAgICAgICAgIHBsYXllci5zZW5kKCdwbGF5ZXI6cGxheScsIHRydWUpO1xuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcGxheWVyIHN0YXR1c1xuICAgICAgICAgIHBsYXllci5tb2R1bGVzLnBlcmZvcm1hbmNlLmlzUGxheWluZyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBhbmQgaWYgdGhlIHBsYXllciBpcyBjdXJyZW50bHkgcGxheWluZyBzb3VuZFxuICAgICAgICBlbHNlIGlmIChkID09PSAxICYmIHBsYXllci5tb2R1bGVzLnBlcmZvcm1hbmNlLnBsYXlpbmcpIHtcbiAgICAgICAgICAvLyBTZW5kIG1lc3NhZ2UgdG8gdGhlIHBsYXllclxuICAgICAgICAgIHBsYXllci5zZW5kKCdwbGF5ZXI6cGxheScsIGZhbHNlKTtcbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHBsYXllciBzdGF0dXNcbiAgICAgICAgICBwbGF5ZXIubW9kdWxlcy5wZXJmb3JtYW5jZS5pc1BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBPdGhlcndpc2UsIG11dGUgZXZlcnlvbmVcbiAgICBlbHNlIHtcbiAgICAgIC8vIEZvciBlYWNoIHBsYXllciBpbiB0aGUgcGVyZm9ybWFuY2VcbiAgICAgIGZvciAobGV0IHBsYXllciBvZiB0aGlzLl9wbGF5ZXJQZXJmb3JtYW5jZS5jbGllbnRzKSB7XG4gICAgICAgIC8vIElmIHRoZSBwbGF5ZXIgaXMgY3VycmVudGx5IHBsYXlpbmcgc291bmRcbiAgICAgICAgaWYgKHBsYXllci5tb2R1bGVzLnBlcmZvcm1hbmNlLmlzUGxheWluZykge1xuICAgICAgICAgIC8vIFNlbmQgbWVzc2FnZSB0byB0aGUgcGxheWVyXG4gICAgICAgICAgcGxheWVyLnNlbmQoJ3BsYXllcjpwbGF5JywgZmFsc2UpO1xuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcGxheWVyIHN0YXR1c1xuICAgICAgICAgIHBsYXllci5tb2R1bGVzLnBlcmZvcm1hbmNlLmlzUGxheWluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX29uVG91Y2hTdGFydCh0b3VjaCkge1xuICAgIC8vIENyZWF0ZSB0b3VjaCBpbiB0aGUgZGljdGlvbmFyeVxuICAgIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdID0ge307XG4gICAgdGhpcy5fdG91Y2hlc1t0b3VjaC5pZF0uaWQgPSB0b3VjaC5pZDtcbiAgICB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXS5jb29yZGluYXRlcyA9IHRvdWNoLmNvb3JkaW5hdGVzO1xuICAgIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXTtcbiAgICB9LCB0aW1lb3V0TGVuZ3RoICogMTAwMCk7XG5cbiAgICAvLyBNYWtlIHRoZSBkaXN0YW5jZXMgY2FsY3VsYXRpb25zXG4gICAgdGhpcy5fdXBkYXRlRGlzdGFuY2VzKCk7XG4gIH1cblxuICBfb25Ub3VjaE1vdmUodG91Y2gpIHtcbiAgICAvLyBJZiB0aGUgdG91Y2ggaXMgbm90IGluIHRoZSBkaWN0aW9uYXJ5IGFscmVhZHkgKG1heSBoYXBwZW4gaWYgdGhlIGZpbmdlclxuICAgIC8vIHNsaWRlcyBmcm9tIHRoZSBlZGdlIG9mIHRoZSB0b3VjaHNjcmVlbilcbiAgICBpZiAoIXRoaXMuX3RvdWNoZXNbdG91Y2guaWRdKSB7XG4gICAgICB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXSA9IHt9O1xuICAgICAgdGhpcy5fdG91Y2hlc1t0b3VjaC5pZF0uaWQgPSB0b3VjaC5pZDtcbiAgICB9XG4gICAgLy8gT3RoZXJ3aXNlLCBjbGVhciB0aW1lb3V0XG4gICAgZWxzZSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fdG91Y2hlc1t0b3VjaC5pZF0udGltZW91dCk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBjb29yZGluYXRlcyBhbmQgdGltZW91dFxuICAgIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLmNvb3JkaW5hdGVzID0gdG91Y2guY29vcmRpbmF0ZXM7XG4gICAgdGhpcy5fdG91Y2hlc1t0b3VjaC5pZF0udGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdO1xuICAgIH0sIHRpbWVvdXRMZW5ndGggKiAxMDAwKTtcblxuICAgIC8vIE1ha2UgdGhlIGRpc3RhbmNlcyBjYWxjdWxhdGlvbnNcbiAgICB0aGlzLl91cGRhdGVEaXN0YW5jZXMoKTtcbiAgfVxuXG4gIF9vblRvdWNoRW5kT3JDYW5jZWwodG91Y2gpIHtcbiAgICBkZWxldGUgdGhpcy5fdG91Y2hlc1t0b3VjaC5pZF07XG4gICAgdGhpcy5fdXBkYXRlRGlzdGFuY2VzKCk7XG4gIH1cblxuICBfZGVsZXRlVG91Y2goaWQpIHtcbiAgICBkZWxldGUgdGhpcy5fdG91Y2hlc1tpZF07XG4gIH1cbn1cbiJdfQ==