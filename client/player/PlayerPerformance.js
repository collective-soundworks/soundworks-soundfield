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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1BsYXllclBlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O2dDQUN1QixtQkFBbUI7Ozs7OztpQ0FJZCxzQkFBc0I7Ozs7OztBQUhsRCxJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7SUFNWixpQkFBaUI7WUFBakIsaUJBQWlCOztBQUN6QixXQURRLGlCQUFpQixHQUNWO1FBQWQsT0FBTyx5REFBRyxFQUFFOzswQkFETCxpQkFBaUI7O0FBRWxDLCtCQUZpQixpQkFBaUIsNkNBRTVCLE9BQU8sRUFBRTs7Ozs7O0FBTWYsUUFBSSxDQUFDLE1BQU0sR0FBRyxvQ0FBcUIsQ0FBQzs7O0FBR3BDLFFBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7O0FBR3ZDLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkMsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN4Qzs7ZUFoQmtCLGlCQUFpQjs7V0FrQi9CLGlCQUFHO0FBQ04saUNBbkJpQixpQkFBaUIsdUNBbUJwQjs7QUFFZCxZQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDNUMsWUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzdDOzs7V0FFSSxpQkFBRztBQUNOLFlBQU0sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuRCxZQUFNLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDcEQ7OztXQUVNLG1CQUFHOztBQUVSLFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7OztBQUdwQixVQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDakMsVUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3JDOzs7V0FFTSxtQkFBRzs7QUFFUixVQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDOzs7QUFHbkIsVUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNyQzs7O1NBOUNrQixpQkFBaUI7R0FBUyw4QkFBVyxXQUFXOztxQkFBaEQsaUJBQWlCIiwiZmlsZSI6InNyYy9jbGllbnQvcGxheWVyL1BsYXllclBlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW1wb3J0IFNvdW5kd29ya3MgbW9kdWxlcyAoY2xpZW50IHNpZGUpXG5pbXBvcnQgY2xpZW50U2lkZSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5jb25zdCBjbGllbnQgPSBjbGllbnRTaWRlLmNsaWVudDtcblxuLy8gSW1wb3J0IFNvdW5kZmllbGQgbW9kdWxlcyAoY2xpZW50IHNpZGUpXG5pbXBvcnQgV2hpdGVOb2lzZVN5bnRoIGZyb20gJy4vV2hpdGVOb2lzZVN5bnRoLmpzJ1xuXG4vLyBQbGF5ZXJQZXJmb3JtYW5jZSBjbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWVyUGVyZm9ybWFuY2UgZXh0ZW5kcyBjbGllbnRTaWRlLlBlcmZvcm1hbmNlIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucyk7XG5cbiAgICAvKipcbiAgICAgKiBXaGl0ZSBub2lzZSBzeW50aC5cbiAgICAgKiBAdHlwZSB7V2hpdGVOb2lzZVN5bnRofVxuICAgICAqL1xuICAgIHRoaXMuX3N5bnRoID0gbmV3IFdoaXRlTm9pc2VTeW50aCgpO1xuXG4gICAgLy8gQWRkIHRleHQgdG8gdmlld1xuICAgIHRoaXMuc2V0Q2VudGVyZWRWaWV3Q29udGVudCgnTGlzdGVuIScpO1xuXG4gICAgLy8gTWV0aG9kIGJpbmRpbmdzXG4gICAgdGhpcy5fb25QbGF5ID0gdGhpcy5fb25QbGF5LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25NdXRlID0gdGhpcy5fb25NdXRlLmJpbmQodGhpcyk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpOyAvLyBkb24ndCBmb3JnZXQgdGhpc1xuXG4gICAgY2xpZW50LnJlY2VpdmUoJ3BsYXllcjpwbGF5JywgdGhpcy5fb25QbGF5KTtcbiAgICBjbGllbnQucmVjZWl2ZSgncGxheWVyOm11dGUnLCB0aGlzLl9vbk11dGUpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdwbGF5ZXI6cGxheScsIHRoaXMuX29uUGxheSk7XG4gICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdwbGF5ZXI6bXV0ZScsIHRoaXMuX29uTXV0ZSk7XG4gIH1cblxuICBfb25QbGF5KCkge1xuICAgIC8vIFN0YXJ0IHN5bnRoXG4gICAgdGhpcy5fc3ludGguc3RhcnQoKTtcblxuICAgIC8vIENoYW5nZSBiYWNrZ3JvdW5kIGNvbG9yXG4gICAgdGhpcy52aWV3LmNsYXNzTGlzdC5hZGQoJ3doaXRlJyk7XG4gICAgdGhpcy52aWV3LmNsYXNzTGlzdC5yZW1vdmUoJ2JsYWNrJyk7XG4gIH1cblxuICBfb25NdXRlKCkge1xuICAgIC8vIFN0b3Agc3ludGhcbiAgICB0aGlzLl9zeW50aC5zdG9wKCk7XG5cbiAgICAvLyBDaGFuZ2UgYmFja2dyb3VuZCBjb2xvclxuICAgIHRoaXMudmlldy5jbGFzc0xpc3QuYWRkKCdibGFjaycpO1xuICAgIHRoaXMudmlldy5jbGFzc0xpc3QucmVtb3ZlKCd3aGl0ZScpO1xuICB9XG59XG4iXX0=