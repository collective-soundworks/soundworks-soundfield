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

// PlayerPerformance class

var PlayerPerformance = (function (_clientSide$Performance) {
  _inherits(PlayerPerformance, _clientSide$Performance);

  function PlayerPerformance(loader) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, PlayerPerformance);

    _get(Object.getPrototypeOf(PlayerPerformance.prototype), 'constructor', this).call(this, options);

    this.loader = loader; // the loader module
  }

  _createClass(PlayerPerformance, [{
    key: 'start',
    value: function start() {
      var _this = this;

      _get(Object.getPrototypeOf(PlayerPerformance.prototype), 'start', this).call(this); // don't forget this

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
})(_soundworksClient2['default'].Performance);

exports['default'] = PlayerPerformance;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvcGxheWVyL1BsYXllclBlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O2dDQUN1QixtQkFBbUI7Ozs7QUFDMUMsSUFBTSxNQUFNLEdBQUcsOEJBQVcsTUFBTSxDQUFDOzs7O0lBR1osaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFDekIsV0FEUSxpQkFBaUIsQ0FDeEIsTUFBTSxFQUFnQjtRQUFkLE9BQU8seURBQUcsRUFBRTs7MEJBRGIsaUJBQWlCOztBQUVsQywrQkFGaUIsaUJBQWlCLDZDQUU1QixPQUFPLEVBQUU7O0FBRWYsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7R0FDdEI7O2VBTGtCLGlCQUFpQjs7V0FPL0IsaUJBQUc7OztBQUNOLGlDQVJpQixpQkFBaUIsdUNBUXBCOzs7QUFHZCxVQUFJLEdBQUcsR0FBRyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUM1QyxTQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFNBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3RDLFNBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUVwQyxVQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUM7OztBQUd6QyxZQUFNLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLFlBQU07QUFDdkMsWUFBSSxHQUFHLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDNUMsV0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEMsV0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdEMsV0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7T0FDckMsQ0FBQyxDQUFDOzs7Ozs7OztLQVFKOzs7U0FoQ2tCLGlCQUFpQjtHQUFTLDhCQUFXLFdBQVc7O3FCQUFoRCxpQkFBaUIiLCJmaWxlIjoiL1VzZXJzL3JvYmkvRGV2L2NvbGxlY3RpdmUtc291bmR3b3Jrcy1kZXZlbG9wL3NvdW5kZmllbGQvc3JjL2NsaWVudC9wbGF5ZXIvUGxheWVyUGVyZm9ybWFuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbXBvcnQgU291bmR3b3JrcyBtb2R1bGVzIChjbGllbnQgc2lkZSlcbmltcG9ydCBjbGllbnRTaWRlIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmNvbnN0IGNsaWVudCA9IGNsaWVudFNpZGUuY2xpZW50O1xuXG4vLyBQbGF5ZXJQZXJmb3JtYW5jZSBjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWVyUGVyZm9ybWFuY2UgZXh0ZW5kcyBjbGllbnRTaWRlLlBlcmZvcm1hbmNlIHtcbiAgY29uc3RydWN0b3IobG9hZGVyLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zKTtcblxuICAgIHRoaXMubG9hZGVyID0gbG9hZGVyOyAvLyB0aGUgbG9hZGVyIG1vZHVsZVxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTsgLy8gZG9uJ3QgZm9yZ2V0IHRoaXNcblxuICAgIC8vIFBsYXkgdGhlIHdlbGNvbWUgc291bmQgaW1tZWRpYXRlbHlcbiAgICBsZXQgc3JjID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgIHNyYy5idWZmZXIgPSB0aGlzLmxvYWRlci5idWZmZXJzWzBdOyAvLyBnZXQgdGhlIGZpcnN0IGF1ZGlvIGJ1ZmZlciBmcm9tIHRoZSBsb2FkZXJcbiAgICBzcmMuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgIHNyYy5zdGFydChhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuXG4gICAgdGhpcy5zZXRDZW50ZXJlZFZpZXdDb250ZW50KCdMZXTigJlzIGdvIScpOyAvLyBkaXNwbGF5IHNvbWUgZmVlZGJhY2sgdGV4dCBpbiB0aGUgdmlld1xuXG4gICAgLy8gUGxheSBhbm90aGVyIHNvdW5kIHdoZW4gd2UgcmVjZWl2ZSB0aGUgJ3BsYXknIG1lc3NhZ2UgZnJvbSB0aGUgc2VydmVyXG4gICAgY2xpZW50LnJlY2VpdmUoJ3BlcmZvcm1hbmNlOnBsYXknLCAoKSA9PiB7XG4gICAgICBsZXQgc3JjID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgc3JjLmJ1ZmZlciA9IHRoaXMubG9hZGVyLmJ1ZmZlcnNbMV07IC8vIGdldCB0aGUgc2Vjb25kIGF1ZGlvQnVmZmVyIGZyb20gdGhlIGxvYWRlclxuICAgICAgc3JjLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIHNyYy5zdGFydChhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgIH0pO1xuXG4gICAgLyogV2Ugd291bGQgdXN1YWxseSBjYWxsIHRoZSAnZG9uZScgbWV0aG9kIHdoZW4gdGhlIG1vZHVsZVxuICAgICAqIGNhbiBoYW5kIG92ZXIgdGhlIGNvbnRyb2wgdG8gc3Vic2VxdWVudCBtb2R1bGVzLFxuICAgICAqIGhvd2V2ZXIgc2luY2UgdGhlIHBlcmZvcm1hbmNlIGlzIHRoZSBsYXN0IG1vZHVsZSB0byBiZSBjYWxsZWRcbiAgICAgKiBpbiB0aGlzIHNjZW5hcmlvLCB3ZSBkb24ndCBuZWVkIGl0IGhlcmUuXG4gICAgICovXG4gICAgLy8gdGhpcy5kb25lKCk7XG4gIH1cbn1cbiJdfQ==