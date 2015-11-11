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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Import Soundworks modules (client side)
var clientSide = require('soundworks/client');
var client = clientSide.client;

// PlayerPerformance class

var PlayerPerformance = (function (_clientSide$Performan) {
  (0, _inherits3.default)(PlayerPerformance, _clientSide$Performan);

  function PlayerPerformance(loader) {
    (0, _classCallCheck3.default)(this, PlayerPerformance);
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayerPerformance).call(this, options));

    _this2.loader = loader; // the loader module
    return _this2;
  }

  (0, _createClass3.default)(PlayerPerformance, [{
    key: 'start',
    value: function start() {
      var _this = this;

      (0, _get3.default)((0, _getPrototypeOf2.default)(PlayerPerformance.prototype), 'start', this).call(this); // don't forget this

      // Play the welcome sound immediately
      var src = audioContext.createBufferSource();
      src.buffer = this.loader.buffers[0]; // get the first audio buffer from the loader
      src.connect(audioContext.destination);
      src.start(audioContext.currentTime);

      this.setCenteredViewContent('Let’s go!'); // display some feedback text in the view

      // Play another sound when we receive the 'play' message from the server
      client.receive('performance:play', function () {
        var src = audioContext.createBufferSource();
        src.buffer = _this.loader.buffers[1]; // get the second audioBuffer from the loader
        src.connect(audioContext.destination);
        src.start(audioContext.currentTime);
      });

      /* We would usually call the 'done' method when the module
       * can hand over the control to subsequent modules,
       * however since the performance is the last module to be called
       * in this scenario, we don't need it here.
       */
      // this.done();
    }
  }]);
  return PlayerPerformance;
})(clientSide.Performance);

exports.default = PlayerPerformance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllclBlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ2hELElBQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNOzs7QUFBQztJQUdaLGlCQUFpQjswQkFBakIsaUJBQWlCOztBQUNwQyxXQURtQixpQkFBaUIsQ0FDeEIsTUFBTSxFQUFnQjt3Q0FEZixpQkFBaUI7UUFDaEIsT0FBTyx5REFBRyxFQUFFOzs4RkFEYixpQkFBaUIsYUFFNUIsT0FBTzs7QUFFYixXQUFLLE1BQU0sR0FBRyxNQUFNO0FBQUM7R0FDdEI7OzZCQUxrQixpQkFBaUI7OzRCQU81Qjs7O0FBQ04sdURBUmlCLGlCQUFpQjs7O0FBUXBCLEFBR2QsVUFBSSxHQUFHLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDNUMsU0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFBQyxBQUNwQyxTQUFHLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN0QyxTQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFcEMsVUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQzs7O0FBQUMsQUFHekMsWUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxZQUFNO0FBQ3ZDLFlBQUksR0FBRyxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQzVDLFdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBSyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUFDLEFBQ3BDLFdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3RDLFdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO09BQ3JDLENBQUM7Ozs7Ozs7O0FBQUMsS0FRSjs7U0FoQ2tCLGlCQUFpQjtHQUFTLFVBQVUsQ0FBQyxXQUFXOztrQkFBaEQsaUJBQWlCIiwiZmlsZSI6IlBsYXllclBlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW1wb3J0IFNvdW5kd29ya3MgbW9kdWxlcyAoY2xpZW50IHNpZGUpXG5jb25zdCBjbGllbnRTaWRlID0gcmVxdWlyZSgnc291bmR3b3Jrcy9jbGllbnQnKTtcbmNvbnN0IGNsaWVudCA9IGNsaWVudFNpZGUuY2xpZW50O1xuXG4vLyBQbGF5ZXJQZXJmb3JtYW5jZSBjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWVyUGVyZm9ybWFuY2UgZXh0ZW5kcyBjbGllbnRTaWRlLlBlcmZvcm1hbmNlIHtcbiAgY29uc3RydWN0b3IobG9hZGVyLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zKTtcblxuICAgIHRoaXMubG9hZGVyID0gbG9hZGVyOyAvLyB0aGUgbG9hZGVyIG1vZHVsZVxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTsgLy8gZG9uJ3QgZm9yZ2V0IHRoaXNcblxuICAgIC8vIFBsYXkgdGhlIHdlbGNvbWUgc291bmQgaW1tZWRpYXRlbHlcbiAgICBsZXQgc3JjID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgIHNyYy5idWZmZXIgPSB0aGlzLmxvYWRlci5idWZmZXJzWzBdOyAvLyBnZXQgdGhlIGZpcnN0IGF1ZGlvIGJ1ZmZlciBmcm9tIHRoZSBsb2FkZXJcbiAgICBzcmMuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgIHNyYy5zdGFydChhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuXG4gICAgdGhpcy5zZXRDZW50ZXJlZFZpZXdDb250ZW50KCdMZXTigJlzIGdvIScpOyAvLyBkaXNwbGF5IHNvbWUgZmVlZGJhY2sgdGV4dCBpbiB0aGUgdmlld1xuXG4gICAgLy8gUGxheSBhbm90aGVyIHNvdW5kIHdoZW4gd2UgcmVjZWl2ZSB0aGUgJ3BsYXknIG1lc3NhZ2UgZnJvbSB0aGUgc2VydmVyXG4gICAgY2xpZW50LnJlY2VpdmUoJ3BlcmZvcm1hbmNlOnBsYXknLCAoKSA9PiB7XG4gICAgICBsZXQgc3JjID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgc3JjLmJ1ZmZlciA9IHRoaXMubG9hZGVyLmJ1ZmZlcnNbMV07IC8vIGdldCB0aGUgc2Vjb25kIGF1ZGlvQnVmZmVyIGZyb20gdGhlIGxvYWRlclxuICAgICAgc3JjLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIHNyYy5zdGFydChhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgIH0pO1xuXG4gICAgLyogV2Ugd291bGQgdXN1YWxseSBjYWxsIHRoZSAnZG9uZScgbWV0aG9kIHdoZW4gdGhlIG1vZHVsZVxuICAgICAqIGNhbiBoYW5kIG92ZXIgdGhlIGNvbnRyb2wgdG8gc3Vic2VxdWVudCBtb2R1bGVzLFxuICAgICAqIGhvd2V2ZXIgc2luY2UgdGhlIHBlcmZvcm1hbmNlIGlzIHRoZSBsYXN0IG1vZHVsZSB0byBiZSBjYWxsZWRcbiAgICAgKiBpbiB0aGlzIHNjZW5hcmlvLCB3ZSBkb24ndCBuZWVkIGl0IGhlcmUuXG4gICAgICovXG4gICAgLy8gdGhpcy5kb25lKCk7XG4gIH1cbn1cbiJdfQ==