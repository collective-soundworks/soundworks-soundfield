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

/**
 * Create a white noise buffer.
 * @return {AudioBuffer} White noise buffer
 */
function createWhiteNoiseBuffer() {
  var bufferSize = 2 * audioContext.sampleRate;
  var noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  var output = noiseBuffer.getChannelData(0);

  for (var i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

  return noiseBuffer;
}

/**
 * `WhiteNoiseSynth` class.
 * The `WhiteNoiseSynth` class creates a white noise synth.
 */

var WhiteNoiseSynth = (function () {
  /**
   * Create a new instance of the class.
   */

  function WhiteNoiseSynth() {
    _classCallCheck(this, WhiteNoiseSynth);

    /**
     * White noise buffer source node.
     * @type {AudioBufferSourceNode}
     */
    this._whiteNoise = audioContext.createBufferSource();
    this._whiteNoise.buffer = createWhiteNoiseBuffer();
    this._whiteNoise.loop = true;
    this._whiteNoise.start(0);

    /**
     * Output gain node.
     * @type {GainNode}
     */
    this._output = audioContext.createGain();
    this._output.gain.value = 0;

    // Connect nodes
    this._whiteNoise.connect(this._output);
    this._output.connect(audioContext.destination);
  }

  /**
   * Start the synth.
   */

  _createClass(WhiteNoiseSynth, [{
    key: 'start',
    value: function start() {
      this._output.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.5);
    }

    /**
     * Stop de synth.
     */
  }, {
    key: 'stop',
    value: function stop() {
      this._output.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    }
  }]);

  return WhiteNoiseSynth;
})();

exports['default'] = WhiteNoiseSynth;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvcGxheWVyL1doaXRlTm9pc2VTeW50aC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O2dDQUN1QixtQkFBbUI7Ozs7QUFDMUMsSUFBTSxZQUFZLEdBQUcsOEJBQVcsWUFBWSxDQUFDOzs7Ozs7QUFNN0MsU0FBUyxzQkFBc0IsR0FBRztBQUNoQyxNQUFNLFVBQVUsR0FBRyxDQUFDLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQztBQUMvQyxNQUFJLFdBQVcsR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BGLE1BQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTNDLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQ2pDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFcEMsU0FBTyxXQUFXLENBQUM7Q0FDcEI7Ozs7Ozs7SUFNb0IsZUFBZTs7Ozs7QUFJdkIsV0FKUSxlQUFlLEdBSXBCOzBCQUpLLGVBQWU7Ozs7OztBQVNoQyxRQUFJLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQ3JELFFBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLHNCQUFzQixFQUFFLENBQUM7QUFDbkQsUUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7QUFNMUIsUUFBSSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDekMsUUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQzs7O0FBRzVCLFFBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2QyxRQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDaEQ7Ozs7OztlQXhCa0IsZUFBZTs7V0E2QjdCLGlCQUFHO0FBQ04sVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUNELFlBQVksQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLENBQUM7S0FDM0U7Ozs7Ozs7V0FLRyxnQkFBRztBQUNMLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFDRCxZQUFZLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0tBQzNFOzs7U0F4Q2tCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6Ii9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvcGxheWVyL1doaXRlTm9pc2VTeW50aC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEltcG9ydCBTb3VuZHdvcmtzIG1vZHVsZXMgKGNsaWVudCBzaWRlKVxuaW1wb3J0IGNsaWVudFNpZGUgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuY29uc3QgYXVkaW9Db250ZXh0ID0gY2xpZW50U2lkZS5hdWRpb0NvbnRleHQ7XG5cbi8qKlxuICogQ3JlYXRlIGEgd2hpdGUgbm9pc2UgYnVmZmVyLlxuICogQHJldHVybiB7QXVkaW9CdWZmZXJ9IFdoaXRlIG5vaXNlIGJ1ZmZlclxuICovXG5mdW5jdGlvbiBjcmVhdGVXaGl0ZU5vaXNlQnVmZmVyKCkge1xuICBjb25zdCBidWZmZXJTaXplID0gMiAqIGF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlO1xuICBsZXQgbm9pc2VCdWZmZXIgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKDEsIGJ1ZmZlclNpemUsIGF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlKTtcbiAgbGV0IG91dHB1dCA9IG5vaXNlQnVmZmVyLmdldENoYW5uZWxEYXRhKDApO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnVmZmVyU2l6ZTsgaSsrKVxuICAgIG91dHB1dFtpXSA9IE1hdGgucmFuZG9tKCkgKiAyIC0gMTtcblxuICByZXR1cm4gbm9pc2VCdWZmZXI7XG59XG5cbi8qKlxuICogYFdoaXRlTm9pc2VTeW50aGAgY2xhc3MuXG4gKiBUaGUgYFdoaXRlTm9pc2VTeW50aGAgY2xhc3MgY3JlYXRlcyBhIHdoaXRlIG5vaXNlIHN5bnRoLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXaGl0ZU5vaXNlU3ludGgge1xuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBjbGFzcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8qKlxuICAgICAqIFdoaXRlIG5vaXNlIGJ1ZmZlciBzb3VyY2Ugbm9kZS5cbiAgICAgKiBAdHlwZSB7QXVkaW9CdWZmZXJTb3VyY2VOb2RlfVxuICAgICAqL1xuICAgIHRoaXMuX3doaXRlTm9pc2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgdGhpcy5fd2hpdGVOb2lzZS5idWZmZXIgPSBjcmVhdGVXaGl0ZU5vaXNlQnVmZmVyKCk7XG4gICAgdGhpcy5fd2hpdGVOb2lzZS5sb29wID0gdHJ1ZTtcbiAgICB0aGlzLl93aGl0ZU5vaXNlLnN0YXJ0KDApO1xuXG4gICAgLyoqXG4gICAgICogT3V0cHV0IGdhaW4gbm9kZS5cbiAgICAgKiBAdHlwZSB7R2Fpbk5vZGV9XG4gICAgICovXG4gICAgdGhpcy5fb3V0cHV0ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl9vdXRwdXQuZ2Fpbi52YWx1ZSA9IDA7XG5cbiAgICAvLyBDb25uZWN0IG5vZGVzXG4gICAgdGhpcy5fd2hpdGVOb2lzZS5jb25uZWN0KHRoaXMuX291dHB1dCk7XG4gICAgdGhpcy5fb3V0cHV0LmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB0aGUgc3ludGguXG4gICAqL1xuICBzdGFydCgpIHtcbiAgICB0aGlzLl9vdXRwdXQuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuNSk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBkZSBzeW50aC5cbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5fb3V0cHV0LmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjUpO1xuICB9XG59XG4iXX0=