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

var _client = require('soundworks/client');

var _WhiteNoiseSynth = require('./WhiteNoiseSynth');

var _WhiteNoiseSynth2 = _interopRequireDefault(_WhiteNoiseSynth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var template = '\n  <div class="section-top"></div>\n  <div class="section-center flex-center">\n    <p class="big"><%= center %></p>\n  </div>\n  <div class="section-bottom"></div>\n';

/**
 * The `PlayerExperience` requires the `players` to give its approximative
 * position into the `area` (see `src/server/index`) of the experience.
 * The device of the player is then remote controlled by another type of
 * client (i.e. `soloist`) that can control the `start` and `stop` of the
 * synthesizer from its own interface.
 */

var PlayerExperience = function (_Experience) {
  (0, _inherits3.default)(PlayerExperience, _Experience);

  function PlayerExperience() {
    (0, _classCallCheck3.default)(this, PlayerExperience);

    // the experience requires 2 services:
    // - the `platform` service checks for the availability of the requested
    //   features of the application, and display the home screen of the
    //   application
    var _this = (0, _possibleConstructorReturn3.default)(this, (PlayerExperience.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience)).call(this));

    _this.require('platform', { features: 'web-audio' });
    // - the `locator` service provide a view asking for the approximative
    //   position of the user in the defined `area`
    _this.require('locator');

    // bind methods to the instance to keep a safe `this` in callbacks
    _this.onStartMessage = _this.onStartMessage.bind(_this);
    _this.onStopMessage = _this.onStopMessage.bind(_this);
    return _this;
  }

  /**
   * Start the experience when all services are ready.
   */


  (0, _createClass3.default)(PlayerExperience, [{
    key: 'start',
    value: function start() {
      (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'start', this).call(this);

      this.synth = new _WhiteNoiseSynth2.default();
      this.synth.connect(_client.audioContext.destination);

      this.view = new _client.SegmentedView(template, { center: 'Listen!' }, {}, {
        id: this.id,
        className: 'player'
      });
      // request the `viewManager` to display the view of the experience
      this.show();
      // setup socket listeners for server messages
      this.receive('start', this.onStartMessage);
      this.receive('stop', this.onStopMessage);
    }

    /**
     * Callback executed when receiving the `start` message from the server.
     */

  }, {
    key: 'onStartMessage',
    value: function onStartMessage() {
      this.synth.start();
      this.view.$el.classList.add('active');
    }

    /**
     * Callback executed when receiving the `stop` message from the server.
     */

  }, {
    key: 'onStopMessage',
    value: function onStopMessage() {
      this.synth.stop();
      this.view.$el.classList.remove('active');
    }
  }]);
  return PlayerExperience;
}(_client.Experience);

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsidGVtcGxhdGUiLCJQbGF5ZXJFeHBlcmllbmNlIiwicmVxdWlyZSIsImZlYXR1cmVzIiwib25TdGFydE1lc3NhZ2UiLCJiaW5kIiwib25TdG9wTWVzc2FnZSIsInN5bnRoIiwiY29ubmVjdCIsImRlc3RpbmF0aW9uIiwidmlldyIsImNlbnRlciIsImlkIiwiY2xhc3NOYW1lIiwic2hvdyIsInJlY2VpdmUiLCJzdGFydCIsIiRlbCIsImNsYXNzTGlzdCIsImFkZCIsInN0b3AiLCJyZW1vdmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxvTEFBTjs7QUFRQTs7Ozs7Ozs7SUFPcUJDLGdCOzs7QUFDbkIsOEJBQWM7QUFBQTs7QUFHWjtBQUNBO0FBQ0E7QUFDQTtBQU5ZOztBQU9aLFVBQUtDLE9BQUwsQ0FBYSxVQUFiLEVBQXlCLEVBQUVDLFVBQVUsV0FBWixFQUF6QjtBQUNBO0FBQ0E7QUFDQSxVQUFLRCxPQUFMLENBQWEsU0FBYjs7QUFFQTtBQUNBLFVBQUtFLGNBQUwsR0FBc0IsTUFBS0EsY0FBTCxDQUFvQkMsSUFBcEIsT0FBdEI7QUFDQSxVQUFLQyxhQUFMLEdBQXFCLE1BQUtBLGFBQUwsQ0FBbUJELElBQW5CLE9BQXJCO0FBZFk7QUFlYjs7QUFFRDs7Ozs7Ozs0QkFHUTtBQUNOOztBQUVBLFdBQUtFLEtBQUwsR0FBYSwrQkFBYjtBQUNBLFdBQUtBLEtBQUwsQ0FBV0MsT0FBWCxDQUFtQixxQkFBYUMsV0FBaEM7O0FBRUEsV0FBS0MsSUFBTCxHQUFZLDBCQUFrQlYsUUFBbEIsRUFBNEIsRUFBRVcsUUFBUSxTQUFWLEVBQTVCLEVBQW1ELEVBQW5ELEVBQXVEO0FBQ2pFQyxZQUFJLEtBQUtBLEVBRHdEO0FBRWpFQyxtQkFBVztBQUZzRCxPQUF2RCxDQUFaO0FBSUE7QUFDQSxXQUFLQyxJQUFMO0FBQ0E7QUFDQSxXQUFLQyxPQUFMLENBQWEsT0FBYixFQUFzQixLQUFLWCxjQUEzQjtBQUNBLFdBQUtXLE9BQUwsQ0FBYSxNQUFiLEVBQXFCLEtBQUtULGFBQTFCO0FBQ0Q7O0FBRUQ7Ozs7OztxQ0FHaUI7QUFDZixXQUFLQyxLQUFMLENBQVdTLEtBQVg7QUFDQSxXQUFLTixJQUFMLENBQVVPLEdBQVYsQ0FBY0MsU0FBZCxDQUF3QkMsR0FBeEIsQ0FBNEIsUUFBNUI7QUFDRDs7QUFFRDs7Ozs7O29DQUdnQjtBQUNkLFdBQUtaLEtBQUwsQ0FBV2EsSUFBWDtBQUNBLFdBQUtWLElBQUwsQ0FBVU8sR0FBVixDQUFjQyxTQUFkLENBQXdCRyxNQUF4QixDQUErQixRQUEvQjtBQUNEOzs7OztrQkFwRGtCcEIsZ0IiLCJmaWxlIjoiUGxheWVyRXhwZXJpZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGF1ZGlvQ29udGV4dCwgRXhwZXJpZW5jZSwgU2VnbWVudGVkVmlldyB9IGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCBXaGl0ZU5vaXNlU3ludGggZnJvbSAnLi9XaGl0ZU5vaXNlU3ludGgnO1xuXG5jb25zdCB0ZW1wbGF0ZSA9IGBcbiAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wXCI+PC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgIDxwIGNsYXNzPVwiYmlnXCI+PCU9IGNlbnRlciAlPjwvcD5cbiAgPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbVwiPjwvZGl2PlxuYDtcblxuLyoqXG4gKiBUaGUgYFBsYXllckV4cGVyaWVuY2VgIHJlcXVpcmVzIHRoZSBgcGxheWVyc2AgdG8gZ2l2ZSBpdHMgYXBwcm94aW1hdGl2ZVxuICogcG9zaXRpb24gaW50byB0aGUgYGFyZWFgIChzZWUgYHNyYy9zZXJ2ZXIvaW5kZXhgKSBvZiB0aGUgZXhwZXJpZW5jZS5cbiAqIFRoZSBkZXZpY2Ugb2YgdGhlIHBsYXllciBpcyB0aGVuIHJlbW90ZSBjb250cm9sbGVkIGJ5IGFub3RoZXIgdHlwZSBvZlxuICogY2xpZW50IChpLmUuIGBzb2xvaXN0YCkgdGhhdCBjYW4gY29udHJvbCB0aGUgYHN0YXJ0YCBhbmQgYHN0b3BgIG9mIHRoZVxuICogc3ludGhlc2l6ZXIgZnJvbSBpdHMgb3duIGludGVyZmFjZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWVyRXhwZXJpZW5jZSBleHRlbmRzIEV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLy8gdGhlIGV4cGVyaWVuY2UgcmVxdWlyZXMgMiBzZXJ2aWNlczpcbiAgICAvLyAtIHRoZSBgcGxhdGZvcm1gIHNlcnZpY2UgY2hlY2tzIGZvciB0aGUgYXZhaWxhYmlsaXR5IG9mIHRoZSByZXF1ZXN0ZWRcbiAgICAvLyAgIGZlYXR1cmVzIG9mIHRoZSBhcHBsaWNhdGlvbiwgYW5kIGRpc3BsYXkgdGhlIGhvbWUgc2NyZWVuIG9mIHRoZVxuICAgIC8vICAgYXBwbGljYXRpb25cbiAgICB0aGlzLnJlcXVpcmUoJ3BsYXRmb3JtJywgeyBmZWF0dXJlczogJ3dlYi1hdWRpbycgfSk7XG4gICAgLy8gLSB0aGUgYGxvY2F0b3JgIHNlcnZpY2UgcHJvdmlkZSBhIHZpZXcgYXNraW5nIGZvciB0aGUgYXBwcm94aW1hdGl2ZVxuICAgIC8vICAgcG9zaXRpb24gb2YgdGhlIHVzZXIgaW4gdGhlIGRlZmluZWQgYGFyZWFgXG4gICAgdGhpcy5yZXF1aXJlKCdsb2NhdG9yJyk7XG5cbiAgICAvLyBiaW5kIG1ldGhvZHMgdG8gdGhlIGluc3RhbmNlIHRvIGtlZXAgYSBzYWZlIGB0aGlzYCBpbiBjYWxsYmFja3NcbiAgICB0aGlzLm9uU3RhcnRNZXNzYWdlID0gdGhpcy5vblN0YXJ0TWVzc2FnZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMub25TdG9wTWVzc2FnZSA9IHRoaXMub25TdG9wTWVzc2FnZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBleHBlcmllbmNlIHdoZW4gYWxsIHNlcnZpY2VzIGFyZSByZWFkeS5cbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICB0aGlzLnN5bnRoID0gbmV3IFdoaXRlTm9pc2VTeW50aCgpO1xuICAgIHRoaXMuc3ludGguY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuXG4gICAgdGhpcy52aWV3ID0gbmV3IFNlZ21lbnRlZFZpZXcodGVtcGxhdGUsIHsgY2VudGVyOiAnTGlzdGVuIScgfSwge30sIHtcbiAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgY2xhc3NOYW1lOiAncGxheWVyJyxcbiAgICB9KTtcbiAgICAvLyByZXF1ZXN0IHRoZSBgdmlld01hbmFnZXJgIHRvIGRpc3BsYXkgdGhlIHZpZXcgb2YgdGhlIGV4cGVyaWVuY2VcbiAgICB0aGlzLnNob3coKTtcbiAgICAvLyBzZXR1cCBzb2NrZXQgbGlzdGVuZXJzIGZvciBzZXJ2ZXIgbWVzc2FnZXNcbiAgICB0aGlzLnJlY2VpdmUoJ3N0YXJ0JywgdGhpcy5vblN0YXJ0TWVzc2FnZSk7XG4gICAgdGhpcy5yZWNlaXZlKCdzdG9wJywgdGhpcy5vblN0b3BNZXNzYWdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBleGVjdXRlZCB3aGVuIHJlY2VpdmluZyB0aGUgYHN0YXJ0YCBtZXNzYWdlIGZyb20gdGhlIHNlcnZlci5cbiAgICovXG4gIG9uU3RhcnRNZXNzYWdlKCkge1xuICAgIHRoaXMuc3ludGguc3RhcnQoKTtcbiAgICB0aGlzLnZpZXcuJGVsLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGV4ZWN1dGVkIHdoZW4gcmVjZWl2aW5nIHRoZSBgc3RvcGAgbWVzc2FnZSBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAqL1xuICBvblN0b3BNZXNzYWdlKCkge1xuICAgIHRoaXMuc3ludGguc3RvcCgpO1xuICAgIHRoaXMudmlldy4kZWwuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gIH1cbn1cbiJdfQ==