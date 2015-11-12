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

  function PlayerPerformance() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, PlayerPerformance);

    _get(Object.getPrototypeOf(PlayerPerformance.prototype), 'constructor', this).call(this, options);

    // TODO: add text

    // Method bindings
    this._onPlay = this._onPlay.bind(this);
    this._onMute = this._onMute.bind(this);
  }

  _createClass(PlayerPerformance, [{
    key: 'start',
    value: function start() {
      _get(Object.getPrototypeOf(PlayerPerformance.prototype), 'start', this).call(this); // don't forget this

      client.receive('player:play', this._onPlay);
      client.receive('player:mute', this._onMute);
    }
  }, {
    key: 'reset',
    value: function reset() {
      client.removeListener('player:play', this._onPlay);
      client.removeListener('player:mute', this._onMute);
    }
  }, {
    key: '_onPlay',
    value: function _onPlay() {
      console.log('play!');
    }
  }, {
    key: '_onMute',
    value: function _onMute() {
      console.log('mute!');
    }
  }]);

  return PlayerPerformance;
})(_soundworksClient2['default'].Performance);

exports['default'] = PlayerPerformance;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1BsYXllclBlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O2dDQUN1QixtQkFBbUI7Ozs7QUFDMUMsSUFBTSxNQUFNLEdBQUcsOEJBQVcsTUFBTSxDQUFDOzs7O0lBR1osaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFDekIsV0FEUSxpQkFBaUIsR0FDVjtRQUFkLE9BQU8seURBQUcsRUFBRTs7MEJBREwsaUJBQWlCOztBQUVsQywrQkFGaUIsaUJBQWlCLDZDQUU1QixPQUFPLEVBQUU7Ozs7O0FBS2YsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QyxRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3hDOztlQVRrQixpQkFBaUI7O1dBVy9CLGlCQUFHO0FBQ04saUNBWmlCLGlCQUFpQix1Q0FZcEI7O0FBRWQsWUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzVDLFlBQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM3Qzs7O1dBRUksaUJBQUc7QUFDTixZQUFNLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbkQsWUFBTSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3BEOzs7V0FFTSxtQkFBRztBQUNSLGFBQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDdEI7OztXQUVNLG1CQUFHO0FBQ1IsYUFBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN0Qjs7O1NBN0JrQixpQkFBaUI7R0FBUyw4QkFBVyxXQUFXOztxQkFBaEQsaUJBQWlCIiwiZmlsZSI6InNyYy9jbGllbnQvcGxheWVyL1BsYXllclBlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW1wb3J0IFNvdW5kd29ya3MgbW9kdWxlcyAoY2xpZW50IHNpZGUpXG5pbXBvcnQgY2xpZW50U2lkZSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5jb25zdCBjbGllbnQgPSBjbGllbnRTaWRlLmNsaWVudDtcblxuLy8gUGxheWVyUGVyZm9ybWFuY2UgY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllclBlcmZvcm1hbmNlIGV4dGVuZHMgY2xpZW50U2lkZS5QZXJmb3JtYW5jZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuXG4gICAgLy8gVE9ETzogYWRkIHRleHRcblxuICAgIC8vIE1ldGhvZCBiaW5kaW5nc1xuICAgIHRoaXMuX29uUGxheSA9IHRoaXMuX29uUGxheS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uTXV0ZSA9IHRoaXMuX29uTXV0ZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTsgLy8gZG9uJ3QgZm9yZ2V0IHRoaXNcblxuICAgIGNsaWVudC5yZWNlaXZlKCdwbGF5ZXI6cGxheScsIHRoaXMuX29uUGxheSk7XG4gICAgY2xpZW50LnJlY2VpdmUoJ3BsYXllcjptdXRlJywgdGhpcy5fb25NdXRlKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcigncGxheWVyOnBsYXknLCB0aGlzLl9vblBsYXkpO1xuICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcigncGxheWVyOm11dGUnLCB0aGlzLl9vbk11dGUpO1xuICB9XG5cbiAgX29uUGxheSgpIHtcbiAgICBjb25zb2xlLmxvZygncGxheSEnKTtcbiAgfVxuXG4gIF9vbk11dGUoKSB7XG4gICAgY29uc29sZS5sb2coJ211dGUhJyk7XG4gIH1cbn1cbiJdfQ==