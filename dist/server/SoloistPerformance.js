// Import Soundworks library (server side)
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
      if (Object.keys(this._touches).length > 0) {
        // For each player in the performance
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this._playerPerformance.clients[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
            for (var _iterator2 = this._playerPerformance.clients[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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