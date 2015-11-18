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

// Import Soundfield modules (client side)

var _WhiteNoiseSynthJs = require('./WhiteNoiseSynth.js');

var _WhiteNoiseSynthJs2 = _interopRequireDefault(_WhiteNoiseSynthJs);

// PlayerPerformance class

var client = _soundworksClient2['default'].client;
var PlayerPerformance = (function (_clientSide$Performance) {
  _inherits(PlayerPerformance, _clientSide$Performance);

  function PlayerPerformance() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, PlayerPerformance);

    _get(Object.getPrototypeOf(PlayerPerformance.prototype), 'constructor', this).call(this, options);

    /**
     * White noise synth.
     * @type {WhiteNoiseSynth}
     */
    this._synth = new _WhiteNoiseSynthJs2['default']();

    // Add text to view
    this.setCenteredViewContent('Listen!');

    // Method bindings
    this._onPlay = this._onPlay.bind(this);
    this._onMute = this._onMute.bind(this);
  }

  _createClass(PlayerPerformance, [{
    key: 'start',
    value: function start() {
      _get(Object.getPrototypeOf(PlayerPerformance.prototype), 'start', this).call(this);

      // Setup listeners for server messages
      client.receive('player:play', this._onPlay);
      client.receive('player:mute', this._onMute);
    }
  }, {
    key: 'reset',
    value: function reset() {
      _get(Object.getPrototypeOf(PlayerPerformance.prototype), 'reset', this).call(this);

      // Remove listeners for server messages
      client.removeListener('player:play', this._onPlay);
      client.removeListener('player:mute', this._onMute);
    }
  }, {
    key: '_onPlay',
    value: function _onPlay() {
      // Start synth
      this._synth.start();

      // Change background color
      this.view.classList.add('white');
      this.view.classList.remove('black');
    }
  }, {
    key: '_onMute',
    value: function _onMute() {
      // Stop synth
      this._synth.stop();

      // Change background color
      this.view.classList.add('black');
      this.view.classList.remove('white');
    }
  }]);

  return PlayerPerformance;
})(_soundworksClient2['default'].Performance);

exports['default'] = PlayerPerformance;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvcGxheWVyL1BsYXllclBlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O2dDQUN1QixtQkFBbUI7Ozs7OztpQ0FJZCxzQkFBc0I7Ozs7OztBQUhsRCxJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7SUFNWixpQkFBaUI7WUFBakIsaUJBQWlCOztBQUN6QixXQURRLGlCQUFpQixHQUNWO1FBQWQsT0FBTyx5REFBRyxFQUFFOzswQkFETCxpQkFBaUI7O0FBRWxDLCtCQUZpQixpQkFBaUIsNkNBRTVCLE9BQU8sRUFBRTs7Ozs7O0FBTWYsUUFBSSxDQUFDLE1BQU0sR0FBRyxvQ0FBcUIsQ0FBQzs7O0FBR3BDLFFBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7O0FBR3ZDLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkMsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN4Qzs7ZUFoQmtCLGlCQUFpQjs7V0FrQi9CLGlCQUFHO0FBQ04saUNBbkJpQixpQkFBaUIsdUNBbUJwQjs7O0FBR2QsWUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzVDLFlBQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM3Qzs7O1dBRUksaUJBQUc7QUFDTixpQ0EzQmlCLGlCQUFpQix1Q0EyQnBCOzs7QUFHZCxZQUFNLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbkQsWUFBTSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3BEOzs7V0FFTSxtQkFBRzs7QUFFUixVQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDOzs7QUFHcEIsVUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNyQzs7O1dBRU0sbUJBQUc7O0FBRVIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7O0FBR25CLFVBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNqQyxVQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDckM7OztTQWxEa0IsaUJBQWlCO0dBQVMsOEJBQVcsV0FBVzs7cUJBQWhELGlCQUFpQiIsImZpbGUiOiIvVXNlcnMvcm9iaS9EZXYvY29sbGVjdGl2ZS1zb3VuZHdvcmtzLWRldmVsb3Avc291bmRmaWVsZC9zcmMvY2xpZW50L3BsYXllci9QbGF5ZXJQZXJmb3JtYW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEltcG9ydCBTb3VuZHdvcmtzIG1vZHVsZXMgKGNsaWVudCBzaWRlKVxuaW1wb3J0IGNsaWVudFNpZGUgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuY29uc3QgY2xpZW50ID0gY2xpZW50U2lkZS5jbGllbnQ7XG5cbi8vIEltcG9ydCBTb3VuZGZpZWxkIG1vZHVsZXMgKGNsaWVudCBzaWRlKVxuaW1wb3J0IFdoaXRlTm9pc2VTeW50aCBmcm9tICcuL1doaXRlTm9pc2VTeW50aC5qcydcblxuLy8gUGxheWVyUGVyZm9ybWFuY2UgY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllclBlcmZvcm1hbmNlIGV4dGVuZHMgY2xpZW50U2lkZS5QZXJmb3JtYW5jZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuXG4gICAgLyoqXG4gICAgICogV2hpdGUgbm9pc2Ugc3ludGguXG4gICAgICogQHR5cGUge1doaXRlTm9pc2VTeW50aH1cbiAgICAgKi9cbiAgICB0aGlzLl9zeW50aCA9IG5ldyBXaGl0ZU5vaXNlU3ludGgoKTtcblxuICAgIC8vIEFkZCB0ZXh0IHRvIHZpZXdcbiAgICB0aGlzLnNldENlbnRlcmVkVmlld0NvbnRlbnQoJ0xpc3RlbiEnKTtcblxuICAgIC8vIE1ldGhvZCBiaW5kaW5nc1xuICAgIHRoaXMuX29uUGxheSA9IHRoaXMuX29uUGxheS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uTXV0ZSA9IHRoaXMuX29uTXV0ZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIC8vIFNldHVwIGxpc3RlbmVycyBmb3Igc2VydmVyIG1lc3NhZ2VzXG4gICAgY2xpZW50LnJlY2VpdmUoJ3BsYXllcjpwbGF5JywgdGhpcy5fb25QbGF5KTtcbiAgICBjbGllbnQucmVjZWl2ZSgncGxheWVyOm11dGUnLCB0aGlzLl9vbk11dGUpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgc3VwZXIucmVzZXQoKTtcblxuICAgIC8vIFJlbW92ZSBsaXN0ZW5lcnMgZm9yIHNlcnZlciBtZXNzYWdlc1xuICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcigncGxheWVyOnBsYXknLCB0aGlzLl9vblBsYXkpO1xuICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcigncGxheWVyOm11dGUnLCB0aGlzLl9vbk11dGUpO1xuICB9XG5cbiAgX29uUGxheSgpIHtcbiAgICAvLyBTdGFydCBzeW50aFxuICAgIHRoaXMuX3N5bnRoLnN0YXJ0KCk7XG5cbiAgICAvLyBDaGFuZ2UgYmFja2dyb3VuZCBjb2xvclxuICAgIHRoaXMudmlldy5jbGFzc0xpc3QuYWRkKCd3aGl0ZScpO1xuICAgIHRoaXMudmlldy5jbGFzc0xpc3QucmVtb3ZlKCdibGFjaycpO1xuICB9XG5cbiAgX29uTXV0ZSgpIHtcbiAgICAvLyBTdG9wIHN5bnRoXG4gICAgdGhpcy5fc3ludGguc3RvcCgpO1xuXG4gICAgLy8gQ2hhbmdlIGJhY2tncm91bmQgY29sb3JcbiAgICB0aGlzLnZpZXcuY2xhc3NMaXN0LmFkZCgnYmxhY2snKTtcbiAgICB0aGlzLnZpZXcuY2xhc3NMaXN0LnJlbW92ZSgnd2hpdGUnKTtcbiAgfVxufVxuIl19