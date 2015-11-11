'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Import Soundworks library (server side)
var serverSide = require('soundworks')('server');
var server = serverSide.server;

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

var SoloistPerformance = (function (_serverSide$Performan) {
  (0, _inherits3.default)(SoloistPerformance, _serverSide$Performan);

  function SoloistPerformance(playerPerformance) {
    (0, _classCallCheck3.default)(this, SoloistPerformance);
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    /**
     * Player performance module.
     * @type {Performance}
     */

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SoloistPerformance).call(this, options));

    _this4._playerPerformance = playerPerformance;

    /**
     * Dictionary of the current touches (fingers) on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    _this4._touches = {};

    // Method bindings
    _this4._onTouchStart = _this4._onTouchStart.bind(_this4);
    _this4._onTouchMove = _this4._onTouchMove.bind(_this4);
    _this4._onTouchEndOrCancel = _this4._onTouchEndOrCancel.bind(_this4);
    return _this4;
  }

  /**
   * Calculate the width / height ratio of the space.
   * @return {Number} Width / height ratio of the space.
   */

  (0, _createClass3.default)(SoloistPerformance, [{
    key: 'enter',
    value: function enter(soloist) {
      var _this = this;

      (0, _get3.default)((0, _getPrototypeOf2.default)(SoloistPerformance.prototype), 'enter', this).call(this, soloist);

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
      (0, _get3.default)((0, _getPrototypeOf2.default)(SoloistPerformance.prototype), 'enter', this).call(this, soloist);

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
      if ((0, _keys2.default)(this._touches).length > 0) {
        // For each player in the performance
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (0, _getIterator3.default)(this._playerPerformance.clients), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
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
            for (var _iterator2 = (0, _getIterator3.default)(this._playerPerformance.clients), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
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
})(serverSide.Performance);

exports.default = SoloistPerformance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNvbG9pc3RQZXJmb3JtYW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNuRCxJQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTTs7Ozs7Ozs7O0FBQUMsQUFTakMsSUFBTSxZQUFZLEdBQUcsR0FBRzs7Ozs7Ozs7QUFBQyxBQVF6QixJQUFNLGFBQWEsR0FBRyxDQUFDOzs7Ozs7O0FBQUMsQUFPeEIsSUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFJLFlBQVksR0FBRyxZQUFZLENBQUEsQUFBQzs7O0FBQUMsQUFJaEQsU0FBUyxhQUFhLENBQUMsS0FBSyxFQUFFO0FBQzVCLE1BQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ2xCLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO1dBQUssQUFBQyxDQUFDLEdBQUcsQ0FBQyxHQUFJLENBQUMsR0FBRyxDQUFDO0dBQUEsQ0FBQyxDQUFDOztBQUVqRCxTQUFPLFNBQVMsQ0FBQztDQUNsQjs7QUFFRCxTQUFTLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDdkIsU0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7Q0FDakU7OztBQUFBO0lBR29CLGtCQUFrQjswQkFBbEIsa0JBQWtCOztBQUNyQyxXQURtQixrQkFBa0IsQ0FDekIsaUJBQWlCLEVBQWdCO3dDQUQxQixrQkFBa0I7UUFDTixPQUFPLHlEQUFHLEVBQUU7Ozs7Ozs7OEZBRHhCLGtCQUFrQixhQUU3QixPQUFPOztBQU1iLFdBQUssa0JBQWtCLEdBQUcsaUJBQWlCOzs7Ozs7O0FBQUMsQUFPNUMsV0FBSyxRQUFRLEdBQUcsRUFBRTs7O0FBQUMsQUFH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ekI7OztpQ0FFWSxFQUFFLEVBQUU7QUFDZixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDMUI7Ozt3QkFySnVCO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7S0FDL0M7Ozs7Ozs7Ozs7d0JBT3lCO0FBQ3hCLFVBQUksSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsRUFDNUIsT0FBTyxDQUFDLENBQUM7QUFDWCxhQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztLQUMvQjs7Ozs7Ozs7Ozt3QkFPMEI7QUFDekIsVUFBSSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxFQUM1QixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7QUFDcEMsYUFBTyxDQUFDLENBQUM7S0FDVjs7U0FuRGtCLGtCQUFrQjtHQUFTLFVBQVUsQ0FBQyxXQUFXOztrQkFBakQsa0JBQWtCIiwiZmlsZSI6IlNvbG9pc3RQZXJmb3JtYW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEltcG9ydCBTb3VuZHdvcmtzIGxpYnJhcnkgKHNlcnZlciBzaWRlKVxuY29uc3Qgc2VydmVyU2lkZSA9IHJlcXVpcmUoJ3NvdW5kd29ya3MnKSgnc2VydmVyJyk7XG5jb25zdCBzZXJ2ZXIgPSBzZXJ2ZXJTaWRlLnNlcnZlcjtcblxuLyoqXG4gKiBOb3JtYWxpemVkIHZhbHVlIG9mIHJhZGl1cyBvZiB0aGUgZmluZ2VyIGdyYXBoaWNhbCByZXByZXNlbnRhdGlvbiAoYVxuICogdHJhbnNsdWNlbnQgcmVkIGNpcmNsZSkuXG4gKiBBIHZhbHVlIG9mIDEgY29ycmVzcG9uZCB0byBhIHJhZGl1cyBlcXVhbCB0byB0aGUgbWluaW11bSBvZiB0aGUgaGVpZ2h0IG9yXG4gKiB3aWR0aCBvZiB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbi5cbiAqIEB0eXBlIHtOdW1iZXJ9XG4gKi9cbmNvbnN0IGZpbmdlclJhZGl1cyA9IDAuMTtcblxuLyoqXG4gKiBMZW5ndGggb2YgdGhlIHRpbWVvdXQgKGluIHNlY29uZHMpIGFmdGVyIHdoaWNoIHRoZSB0b3VjaCBpcyBhdXRvbWF0aWNhbGx5XG4gKiByZW1vdmVkICh1c2VmdWwgd2hlbiBhIGAndG91Y2hlbmQnYCBvciBgJ3RvdWNoY2FuY2VsJ2AgbWVzc2FnZSBkb2Vzbid0IGdvXG4gKiB0aHJvdWdoKS5cbiAqIEB0eXBlIHtOdW1iZXJ9XG4gKi9cbmNvbnN0IHRpbWVvdXRMZW5ndGggPSA4O1xuXG4vKipcbiAqIEludmVyc2Ugb2YgdGhlIHNxdWFyZWQgZmluZ2VyIHJhZGl1cyBub3JtYWxpemVkIHZhbHVlLCB1c2VkIGZvciBvcHRpbWl6YXRpb25cbiAqIGluIHRoZSBkaXN0YW5jZXMgY2FsY3VsYXRpb25zLlxuICogQHR5cGUge051bWJlcn1cbiAqL1xuY29uc3QgckludjIgPSAxIC8gKGZpbmdlclJhZGl1cyAqIGZpbmdlclJhZGl1cyk7XG5cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuZnVuY3Rpb24gZ2V0TWluT2ZBcnJheShhcnJheSkge1xuICBpZiAoYXJyYXkubGVuZ3RoID4gMClcbiAgICByZXR1cm4gYXJyYXkucmVkdWNlKChwLCB2KSA9PiAocCA8IHYpID8gcCA6IHYpO1xuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGdldEluZm8oY2xpZW50KSB7XG4gIHJldHVybiB7IGluZGV4OiBjbGllbnQuaW5kZXgsIGNvb3JkaW5hdGVzOiBjbGllbnQuY29vcmRpbmF0ZXMgfTtcbn1cblxuLy8gU29sb2lzdFBlcmZvcm1hbmNlIGNsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2xvaXN0UGVyZm9ybWFuY2UgZXh0ZW5kcyBzZXJ2ZXJTaWRlLlBlcmZvcm1hbmNlIHtcbiAgY29uc3RydWN0b3IocGxheWVyUGVyZm9ybWFuY2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuXG4gICAgLyoqXG4gICAgICogUGxheWVyIHBlcmZvcm1hbmNlIG1vZHVsZS5cbiAgICAgKiBAdHlwZSB7UGVyZm9ybWFuY2V9XG4gICAgICovXG4gICAgdGhpcy5fcGxheWVyUGVyZm9ybWFuY2UgPSBwbGF5ZXJQZXJmb3JtYW5jZTtcblxuICAgIC8qKlxuICAgICAqIERpY3Rpb25hcnkgb2YgdGhlIGN1cnJlbnQgdG91Y2hlcyAoZmluZ2Vycykgb24gc2NyZWVuLlxuICAgICAqIEtleXMgYXJlIHRoZSB0b3VjaCBpZGVudGlmaWVycyByZXRyaXZlZCBpbiB0aGUgdG91Y2ggZXZlbnRzLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5fdG91Y2hlcyA9IHt9O1xuXG4gICAgLy8gTWV0aG9kIGJpbmRpbmdzXG4gICAgdGhpcy5fb25Ub3VjaFN0YXJ0ID0gdGhpcy5fb25Ub3VjaFN0YXJ0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Ub3VjaE1vdmUgPSB0aGlzLl9vblRvdWNoTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uVG91Y2hFbmRPckNhbmNlbCA9IHRoaXMuX29uVG91Y2hFbmRPckNhbmNlbC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSB0aGUgd2lkdGggLyBoZWlnaHQgcmF0aW8gb2YgdGhlIHNwYWNlLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IFdpZHRoIC8gaGVpZ2h0IHJhdGlvIG9mIHRoZSBzcGFjZS5cbiAgICovXG4gIGdldCBfd2lkdGhIZWlnaHRSYXRpbygpIHtcbiAgICByZXR1cm4gdGhpcy5fc3BhY2Uud2lkdGggLyB0aGlzLl9zcGFjZS5oZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHRoZSB3aWR0aCBub3JtYWxpemF0aW9uIGZhY3RvciAoYWxsIHRoZSBkaXN0YW5jZSBjYWxjdWxhdGlvbnNcbiAgICogYXJlIG1hZGUgaW4gYSBub3JtYWxpemVkIHNwYWNlIHdoZXJlIGhlaWdodCBhbmQgd2lkdGggZXF1YWwgMSkuXG4gICAqIEByZXR1cm4ge051bWJlcn0gV2lkdGggbm9ybWFsaXphdGlvbiBmYWN0b3IuXG4gICAqL1xuICBnZXQgX3dpZHRoTm9ybWFsaXNhdGlvbigpIHtcbiAgICBpZiAodGhpcy5fd2lkdGhIZWlnaHRSYXRpbyA+IDEpXG4gICAgICByZXR1cm4gMTtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGhIZWlnaHRSYXRpbztcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIGhlaWdodCBub3JtYWxpemF0aW9uIGZhY3RvciAoYWxsIHRoZSBkaXN0YW5jZSBjYWxjdWxhdGlvbnNcbiAgICogYXJlIG1hZGUgaW4gYSBub3JtYWxpemVkIHNwYWNlIHdoZXJlIGhlaWdodCBhbmQgd2lkdGggZXF1YWwgMSkuXG4gICAqIEByZXR1cm4ge051bWJlcn0gSGVpZ2h0IG5vcm1hbGl6YXRpb24gZmFjdG9yLlxuICAgKi9cbiAgZ2V0IF9oZWlnaHROb3JtYWxpc2F0aW9uKCkge1xuICAgIGlmICh0aGlzLl93aWR0aEhlaWdodFJhdGlvID4gMSlcbiAgICAgIHJldHVybiAxIC8gdGhpcy5fd2lkdGhIZWlnaHRSYXRpbztcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGVudGVyKHNvbG9pc3QpIHtcbiAgICBzdXBlci5lbnRlcihzb2xvaXN0KTtcblxuICAgIC8vIFNlbmQgbGlzdCBvZiBwbGF5ZXJzIHRvIHRoZSBzb2xvaXN0XG4gICAgY29uc3QgcGxheWVyTGlzdCA9IHRoaXMuX3BsYXllclBlcmZvcm1hbmNlLmNsaWVudHMubWFwKChjKSA9PiB0aGlzLl9nZXRJbmZvKGMpKTtcbiAgICBzb2xvaXN0LnNlbmQoJ3BlcmZvcm1hbmNlOnBsYXllckxpc3QnLCBwbGF5ZXJMaXN0KTtcblxuICAgIC8vIFNldHVwIGNsaWVudCBtZXNzYWdlIGxpc3RlbmVyc1xuICAgIHNvbG9pc3QucmVjZWl2ZSgnc29sb2lzdDp0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaFN0YXJ0KTtcbiAgICBzb2xvaXN0LnJlY2VpdmUoJ3NvbG9pc3Q6dG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaE1vdmUpO1xuICAgIHNvbG9pc3QucmVjZWl2ZSgnc29sb2lzdDp0b3VjaGVuZG9yY2FuY2VsJywgdGhpcy5fb25Ub3VjaEVuZE9yQ2FuY2VsKTtcbiAgfVxuXG4gIGV4aXQoc29sb2lzdCkge1xuICAgIHN1cGVyLmVudGVyKHNvbG9pc3QpO1xuXG4gICAgLy8gUmVtb3ZlIGNsaWVudCBtZXNzYWdlIGxpc3RlbmVyc1xuICAgIHNvbG9pc3QucmVtb3ZlTGlzdGVuZXIoJ3NvbG9pc3Q6dG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2hTdGFydCk7XG4gICAgc29sb2lzdC5yZW1vdmVMaXN0ZW5lcignc29sb2lzdDp0b3VjaG1vdmUnLCB0aGlzLl9vblRvdWNoTW92ZSk7XG4gICAgc29sb2lzdC5yZW1vdmVMaXN0ZW5lcignc29sb2lzdDp0b3VjaGVuZG9yY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29uVG91Y2hFbmRPckNhbmNlbCk7XG4gIH1cblxuICBfY2FsY3VsYXRlRGlzdGFuY2UoKSB7XG4gICAgY29uc3QgeCA9IChhWzBdIC0gYlswXSkgKiB0aGlzLl93aWR0aE5vcm1hbGlzYXRpb247XG4gICAgY29uc3QgeDIgPSB4ICogeDtcblxuICAgIGNvbnN0IHkgPSAoYVsxXSAtIGJbMV0pICogdGhpcy5faGVpZ2h0Tm9ybWFsaXNhdGlvbjtcbiAgICBjb25zdCB5MiA9IHkgKiB5O1xuXG4gICAgcmV0dXJuIChhID09PSBudWxsKSA/IEluZmluaXR5IDogTWF0aC5taW4oMSwgckludjIgKiAoeDIgKyB5MikpO1xuICB9XG5cbiAgX3VwZGF0ZURpc3RhbmNlcygpIHtcbiAgICAvLyBJZiBhdCBsZWFzdCBvbmUgZmluZ2VyIGlzIG9uIHNjcmVlblxuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLl90b3VjaGVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBGb3IgZWFjaCBwbGF5ZXIgaW4gdGhlIHBlcmZvcm1hbmNlXG4gICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgdGhpcy5fcGxheWVyUGVyZm9ybWFuY2UuY2xpZW50cykge1xuICAgICAgICBsZXQgcGxheWVyQ29vcmRpbmF0ZXMgPSBwbGF5ZXIuY29vcmRpbmF0ZXM7XG4gICAgICAgIGxldCBkaXN0YW5jZXMgPSBbXTtcblxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGZyb20gdGhlIHBsYXllciB0byBlYWNoIHRvdWNoIChmaW5nZXIpXG4gICAgICAgIGZvciAobGV0IGlkIGluIHRoaXMuX3RvdWNoZXMpIHtcbiAgICAgICAgICBkaXN0YW5jZXMucHVzaCh0aGlzLl9jYWxjdWxhdGVEaXN0YW5jZShwbGF5ZXJDb29yZGluYXRlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90b3VjaGVzW2lkXS5jb29yZGluYXRlcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IG1pbmltdW0gZGlzdGFuY2UgYW1vbmcgYWxsIHRvdWNoZXMgKGZpbmdlcnMpXG4gICAgICAgIGxldCBkID0gZ2V0TWluT2ZBcnJheShkaXN0YW5jZXMpO1xuXG4gICAgICAgIC8vIElmIHRoZSBwbGF5ZXIgaXMgd2l0aGluIHJhbmdlIGZvciBwbGF5aW5nIHNvdW5kXG4gICAgICAgIGlmIChkIDwgMSAmJiAhcGxheWVyLm1vZHVsZXMucGVyZm9ybWFuY2UucGxheWluZ1tzb2xvaXN0SW5kZXhdKSB7XG4gICAgICAgICAgLy8gU2VuZCBtZXNzYWdlIHRvIHRoZSBwbGF5ZXJcbiAgICAgICAgICBwbGF5ZXIuc2VuZCgncGxheWVyOnBsYXknLCB0cnVlKTtcbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHBsYXllciBzdGF0dXNcbiAgICAgICAgICBwbGF5ZXIubW9kdWxlcy5wZXJmb3JtYW5jZS5pc1BsYXlpbmcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgYW5kIGlmIHRoZSBwbGF5ZXIgaXMgY3VycmVudGx5IHBsYXlpbmcgc291bmRcbiAgICAgICAgZWxzZSBpZiAoZCA9PT0gMSAmJiBwbGF5ZXIubW9kdWxlcy5wZXJmb3JtYW5jZS5wbGF5aW5nKSB7XG4gICAgICAgICAgLy8gU2VuZCBtZXNzYWdlIHRvIHRoZSBwbGF5ZXJcbiAgICAgICAgICBwbGF5ZXIuc2VuZCgncGxheWVyOnBsYXknLCBmYWxzZSk7XG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5ZXIgc3RhdHVzXG4gICAgICAgICAgcGxheWVyLm1vZHVsZXMucGVyZm9ybWFuY2UuaXNQbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gT3RoZXJ3aXNlLCBtdXRlIGV2ZXJ5b25lXG4gICAgZWxzZSB7XG4gICAgICAvLyBGb3IgZWFjaCBwbGF5ZXIgaW4gdGhlIHBlcmZvcm1hbmNlXG4gICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgdGhpcy5fcGxheWVyUGVyZm9ybWFuY2UuY2xpZW50cykge1xuICAgICAgICAvLyBJZiB0aGUgcGxheWVyIGlzIGN1cnJlbnRseSBwbGF5aW5nIHNvdW5kXG4gICAgICAgIGlmIChwbGF5ZXIubW9kdWxlcy5wZXJmb3JtYW5jZS5pc1BsYXlpbmcpIHtcbiAgICAgICAgICAvLyBTZW5kIG1lc3NhZ2UgdG8gdGhlIHBsYXllclxuICAgICAgICAgIHBsYXllci5zZW5kKCdwbGF5ZXI6cGxheScsIGZhbHNlKTtcbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHBsYXllciBzdGF0dXNcbiAgICAgICAgICBwbGF5ZXIubW9kdWxlcy5wZXJmb3JtYW5jZS5pc1BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9vblRvdWNoU3RhcnQodG91Y2gpIHtcbiAgICAvLyBDcmVhdGUgdG91Y2ggaW4gdGhlIGRpY3Rpb25hcnlcbiAgICB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXSA9IHt9O1xuICAgIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLmlkID0gdG91Y2guaWQ7XG4gICAgdGhpcy5fdG91Y2hlc1t0b3VjaC5pZF0uY29vcmRpbmF0ZXMgPSB0b3VjaC5jb29yZGluYXRlcztcbiAgICB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXS50aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5fdG91Y2hlc1t0b3VjaC5pZF07XG4gICAgfSwgdGltZW91dExlbmd0aCAqIDEwMDApO1xuXG4gICAgLy8gTWFrZSB0aGUgZGlzdGFuY2VzIGNhbGN1bGF0aW9uc1xuICAgIHRoaXMuX3VwZGF0ZURpc3RhbmNlcygpO1xuICB9XG5cbiAgX29uVG91Y2hNb3ZlKHRvdWNoKSB7XG4gICAgLy8gSWYgdGhlIHRvdWNoIGlzIG5vdCBpbiB0aGUgZGljdGlvbmFyeSBhbHJlYWR5IChtYXkgaGFwcGVuIGlmIHRoZSBmaW5nZXJcbiAgICAvLyBzbGlkZXMgZnJvbSB0aGUgZWRnZSBvZiB0aGUgdG91Y2hzY3JlZW4pXG4gICAgaWYgKCF0aGlzLl90b3VjaGVzW3RvdWNoLmlkXSkge1xuICAgICAgdGhpcy5fdG91Y2hlc1t0b3VjaC5pZF0gPSB7fTtcbiAgICAgIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLmlkID0gdG91Y2guaWQ7XG4gICAgfVxuICAgIC8vIE90aGVyd2lzZSwgY2xlYXIgdGltZW91dFxuICAgIGVsc2Uge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLnRpbWVvdXQpO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgY29vcmRpbmF0ZXMgYW5kIHRpbWVvdXRcbiAgICB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXS5jb29yZGluYXRlcyA9IHRvdWNoLmNvb3JkaW5hdGVzO1xuICAgIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl90b3VjaGVzW3RvdWNoLmlkXTtcbiAgICB9LCB0aW1lb3V0TGVuZ3RoICogMTAwMCk7XG5cbiAgICAvLyBNYWtlIHRoZSBkaXN0YW5jZXMgY2FsY3VsYXRpb25zXG4gICAgdGhpcy5fdXBkYXRlRGlzdGFuY2VzKCk7XG4gIH1cblxuICBfb25Ub3VjaEVuZE9yQ2FuY2VsKHRvdWNoKSB7XG4gICAgZGVsZXRlIHRoaXMuX3RvdWNoZXNbdG91Y2guaWRdO1xuICAgIHRoaXMuX3VwZGF0ZURpc3RhbmNlcygpO1xuICB9XG5cbiAgX2RlbGV0ZVRvdWNoKGlkKSB7XG4gICAgZGVsZXRlIHRoaXMuX3RvdWNoZXNbaWRdO1xuICB9XG59XG4iXX0=