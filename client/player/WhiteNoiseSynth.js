// Import Soundworks modules (client side)
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _soundworksClient = require('soundworks/client');

var _soundworksClient2 = _interopRequireDefault(_soundworksClient);

var audioContext = _soundworksClient2['default'].audioContext;

// Helper function
function createWhiteNoiseBuffer() {
  var bufferSize = 2 * audioContext.sampleRate;
  var noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  var output = noiseBuffer.getChannelData(0);

  for (var i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

  return noiseBuffer;
}

// WhiteNoiseSynth class

var WhiteNoiseSynth = (function () {
  function WhiteNoiseSynth() {
    _classCallCheck(this, WhiteNoiseSynth);

    var noiseBuffer = createWhiteNoiseBuffer();

    // Buffer source node
    var whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.start(0);
    this._whiteNoise = whiteNoise;

    // Output gain node
    var outputGain = audioContext.createGain();
    outputGain.gain.value = 0;
    this._out = outputGain;

    // Connect nodes
    this._whiteNoise.connect(this._out);
    this._out.connect(audioContext.destination);
  }

  _createClass(WhiteNoiseSynth, [{
    key: 'start',
    value: function start() {
      this._out.gain.value = 1;
    }
  }, {
    key: 'stop',
    value: function stop() {
      this._out.gain.value = 0;
    }
  }]);

  return WhiteNoiseSynth;
})();

exports['default'] = WhiteNoiseSynth;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL1doaXRlTm9pc2VTeW50aC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O2dDQUN1QixtQkFBbUI7Ozs7QUFDMUMsSUFBTSxZQUFZLEdBQUcsOEJBQVcsWUFBWSxDQUFDOzs7QUFHN0MsU0FBUyxzQkFBc0IsR0FBRztBQUNoQyxNQUFNLFVBQVUsR0FBRyxDQUFDLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQztBQUMvQyxNQUFJLFdBQVcsR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BGLE1BQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTNDLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQ2pDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFcEMsU0FBTyxXQUFXLENBQUM7Q0FDcEI7Ozs7SUFHb0IsZUFBZTtBQUN2QixXQURRLGVBQWUsR0FDcEI7MEJBREssZUFBZTs7QUFFaEMsUUFBTSxXQUFXLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQzs7O0FBRzdDLFFBQUksVUFBVSxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQ25ELGNBQVUsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDO0FBQ2hDLGNBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLGNBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsUUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7OztBQUc5QixRQUFJLFVBQVUsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDM0MsY0FBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLFFBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDOzs7QUFHdkIsUUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BDLFFBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUM3Qzs7ZUFuQmtCLGVBQWU7O1dBcUI3QixpQkFBRztBQUNOLFVBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7S0FDMUI7OztXQUVHLGdCQUFHO0FBQ0wsVUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztLQUMxQjs7O1NBM0JrQixlQUFlOzs7cUJBQWYsZUFBZSIsImZpbGUiOiJzcmMvY2xpZW50L3BsYXllci9XaGl0ZU5vaXNlU3ludGguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbXBvcnQgU291bmR3b3JrcyBtb2R1bGVzIChjbGllbnQgc2lkZSlcbmltcG9ydCBjbGllbnRTaWRlIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmNvbnN0IGF1ZGlvQ29udGV4dCA9IGNsaWVudFNpZGUuYXVkaW9Db250ZXh0O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb25cbmZ1bmN0aW9uIGNyZWF0ZVdoaXRlTm9pc2VCdWZmZXIoKSB7XG4gIGNvbnN0IGJ1ZmZlclNpemUgPSAyICogYXVkaW9Db250ZXh0LnNhbXBsZVJhdGU7XG4gIGxldCBub2lzZUJ1ZmZlciA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIoMSwgYnVmZmVyU2l6ZSwgYXVkaW9Db250ZXh0LnNhbXBsZVJhdGUpO1xuICBsZXQgb3V0cHV0ID0gbm9pc2VCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWZmZXJTaXplOyBpKyspXG4gICAgb3V0cHV0W2ldID0gTWF0aC5yYW5kb20oKSAqIDIgLSAxO1xuXG4gIHJldHVybiBub2lzZUJ1ZmZlcjtcbn1cblxuLy8gV2hpdGVOb2lzZVN5bnRoIGNsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXaGl0ZU5vaXNlU3ludGgge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBub2lzZUJ1ZmZlciA9IGNyZWF0ZVdoaXRlTm9pc2VCdWZmZXIoKTtcblxuICAgIC8vIEJ1ZmZlciBzb3VyY2Ugbm9kZVxuICAgIGxldCB3aGl0ZU5vaXNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgIHdoaXRlTm9pc2UuYnVmZmVyID0gbm9pc2VCdWZmZXI7XG4gICAgd2hpdGVOb2lzZS5sb29wID0gdHJ1ZTtcbiAgICB3aGl0ZU5vaXNlLnN0YXJ0KDApO1xuICAgIHRoaXMuX3doaXRlTm9pc2UgPSB3aGl0ZU5vaXNlO1xuXG4gICAgLy8gT3V0cHV0IGdhaW4gbm9kZVxuICAgIGxldCBvdXRwdXRHYWluID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICBvdXRwdXRHYWluLmdhaW4udmFsdWUgPSAwO1xuICAgIHRoaXMuX291dCA9IG91dHB1dEdhaW47XG5cbiAgICAvLyBDb25uZWN0IG5vZGVzXG4gICAgdGhpcy5fd2hpdGVOb2lzZS5jb25uZWN0KHRoaXMuX291dCk7XG4gICAgdGhpcy5fb3V0LmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuX291dC5nYWluLnZhbHVlID0gMTtcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5fb3V0LmdhaW4udmFsdWUgPSAwO1xuICB9XG59XG4iXX0=