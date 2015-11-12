// Import Soundworks modules (client side)
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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