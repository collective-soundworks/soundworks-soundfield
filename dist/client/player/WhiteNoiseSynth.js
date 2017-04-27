'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _client = require('soundworks/client');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Populate a mono `AudioBuffer` with random values and returns it.
 * @return {AudioBuffer}
 */
function createWhiteNoiseBuffer() {
  var sampleRate = _client.audioContext.sampleRate;
  var bufferSize = 2 * sampleRate; // 2 sec
  var buffer = _client.audioContext.createBuffer(1, bufferSize, sampleRate);
  var data = buffer.getChannelData(0);

  for (var i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }return buffer;
}

/**
 * Simple synthesizer producing white noise.
 */

var WhiteNoiseSynth = function () {
  function WhiteNoiseSynth() {
    (0, _classCallCheck3.default)(this, WhiteNoiseSynth);

    /**
     * Output gain node.
     * @type {GainNode}
     */
    this.output = _client.audioContext.createGain();
    this.output.gain.value = 0;

    /**
     * White noise buffer source node.
     * @type {AudioBufferSourceNode}
     */
    this.bufferSource = _client.audioContext.createBufferSource();
    this.bufferSource.connect(this.output);
    this.bufferSource.buffer = createWhiteNoiseBuffer();
    this.bufferSource.loop = true;
    this.bufferSource.start(0);
  }

  (0, _createClass3.default)(WhiteNoiseSynth, [{
    key: 'connect',
    value: function connect(destination) {
      this.output.connect(_client.audioContext.destination);
    }
  }, {
    key: 'start',
    value: function start() {
      var now = _client.audioContext.currentTime;
      this.output.gain.cancelScheduledValues(now);
      this.output.gain.setValueAtTime(this.output.gain.value, now);
      this.output.gain.linearRampToValueAtTime(1, now + 0.75);
    }
  }, {
    key: 'stop',
    value: function stop() {
      var now = _client.audioContext.currentTime;
      this.output.gain.cancelScheduledValues(now);
      this.output.gain.setValueAtTime(this.output.gain.value, now);
      this.output.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    }
  }]);
  return WhiteNoiseSynth;
}();

exports.default = WhiteNoiseSynth;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldoaXRlTm9pc2VTeW50aC5qcyJdLCJuYW1lcyI6WyJjcmVhdGVXaGl0ZU5vaXNlQnVmZmVyIiwic2FtcGxlUmF0ZSIsImJ1ZmZlclNpemUiLCJidWZmZXIiLCJjcmVhdGVCdWZmZXIiLCJkYXRhIiwiZ2V0Q2hhbm5lbERhdGEiLCJpIiwiTWF0aCIsInJhbmRvbSIsIldoaXRlTm9pc2VTeW50aCIsIm91dHB1dCIsImNyZWF0ZUdhaW4iLCJnYWluIiwidmFsdWUiLCJidWZmZXJTb3VyY2UiLCJjcmVhdGVCdWZmZXJTb3VyY2UiLCJjb25uZWN0IiwibG9vcCIsInN0YXJ0IiwiZGVzdGluYXRpb24iLCJub3ciLCJjdXJyZW50VGltZSIsImNhbmNlbFNjaGVkdWxlZFZhbHVlcyIsInNldFZhbHVlQXRUaW1lIiwibGluZWFyUmFtcFRvVmFsdWVBdFRpbWUiLCJleHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBRUE7Ozs7QUFJQSxTQUFTQSxzQkFBVCxHQUFrQztBQUNoQyxNQUFNQyxhQUFhLHFCQUFhQSxVQUFoQztBQUNBLE1BQU1DLGFBQWEsSUFBSUQsVUFBdkIsQ0FGZ0MsQ0FFRztBQUNuQyxNQUFNRSxTQUFTLHFCQUFhQyxZQUFiLENBQTBCLENBQTFCLEVBQTZCRixVQUE3QixFQUF5Q0QsVUFBekMsQ0FBZjtBQUNBLE1BQU1JLE9BQU9GLE9BQU9HLGNBQVAsQ0FBc0IsQ0FBdEIsQ0FBYjs7QUFFQSxPQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUwsVUFBcEIsRUFBZ0NLLEdBQWhDO0FBQ0VGLFNBQUtFLENBQUwsSUFBVUMsS0FBS0MsTUFBTCxLQUFnQixDQUFoQixHQUFvQixDQUE5QjtBQURGLEdBR0EsT0FBT04sTUFBUDtBQUNEOztBQUVEOzs7O0lBR3FCTyxlO0FBQ25CLDZCQUFjO0FBQUE7O0FBQ1o7Ozs7QUFJQSxTQUFLQyxNQUFMLEdBQWMscUJBQWFDLFVBQWIsRUFBZDtBQUNBLFNBQUtELE1BQUwsQ0FBWUUsSUFBWixDQUFpQkMsS0FBakIsR0FBeUIsQ0FBekI7O0FBRUE7Ozs7QUFJQSxTQUFLQyxZQUFMLEdBQW9CLHFCQUFhQyxrQkFBYixFQUFwQjtBQUNBLFNBQUtELFlBQUwsQ0FBa0JFLE9BQWxCLENBQTBCLEtBQUtOLE1BQS9CO0FBQ0EsU0FBS0ksWUFBTCxDQUFrQlosTUFBbEIsR0FBMkJILHdCQUEzQjtBQUNBLFNBQUtlLFlBQUwsQ0FBa0JHLElBQWxCLEdBQXlCLElBQXpCO0FBQ0EsU0FBS0gsWUFBTCxDQUFrQkksS0FBbEIsQ0FBd0IsQ0FBeEI7QUFDRDs7Ozs0QkFFT0MsVyxFQUFhO0FBQ25CLFdBQUtULE1BQUwsQ0FBWU0sT0FBWixDQUFvQixxQkFBYUcsV0FBakM7QUFDRDs7OzRCQUVPO0FBQ04sVUFBTUMsTUFBTSxxQkFBYUMsV0FBekI7QUFDQSxXQUFLWCxNQUFMLENBQVlFLElBQVosQ0FBaUJVLHFCQUFqQixDQUF1Q0YsR0FBdkM7QUFDQSxXQUFLVixNQUFMLENBQVlFLElBQVosQ0FBaUJXLGNBQWpCLENBQWdDLEtBQUtiLE1BQUwsQ0FBWUUsSUFBWixDQUFpQkMsS0FBakQsRUFBd0RPLEdBQXhEO0FBQ0EsV0FBS1YsTUFBTCxDQUFZRSxJQUFaLENBQWlCWSx1QkFBakIsQ0FBeUMsQ0FBekMsRUFBNENKLE1BQU0sSUFBbEQ7QUFDRDs7OzJCQUVNO0FBQ0wsVUFBTUEsTUFBTSxxQkFBYUMsV0FBekI7QUFDQSxXQUFLWCxNQUFMLENBQVlFLElBQVosQ0FBaUJVLHFCQUFqQixDQUF1Q0YsR0FBdkM7QUFDQSxXQUFLVixNQUFMLENBQVlFLElBQVosQ0FBaUJXLGNBQWpCLENBQWdDLEtBQUtiLE1BQUwsQ0FBWUUsSUFBWixDQUFpQkMsS0FBakQsRUFBd0RPLEdBQXhEO0FBQ0EsV0FBS1YsTUFBTCxDQUFZRSxJQUFaLENBQWlCYSw0QkFBakIsQ0FBOEMsTUFBOUMsRUFBc0RMLE1BQU0sR0FBNUQ7QUFDRDs7Ozs7a0JBcENrQlgsZSIsImZpbGUiOiJXaGl0ZU5vaXNlU3ludGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhdWRpb0NvbnRleHQgfSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5cbi8qKlxuICogUG9wdWxhdGUgYSBtb25vIGBBdWRpb0J1ZmZlcmAgd2l0aCByYW5kb20gdmFsdWVzIGFuZCByZXR1cm5zIGl0LlxuICogQHJldHVybiB7QXVkaW9CdWZmZXJ9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVdoaXRlTm9pc2VCdWZmZXIoKSB7XG4gIGNvbnN0IHNhbXBsZVJhdGUgPSBhdWRpb0NvbnRleHQuc2FtcGxlUmF0ZTtcbiAgY29uc3QgYnVmZmVyU2l6ZSA9IDIgKiBzYW1wbGVSYXRlOyAvLyAyIHNlY1xuICBjb25zdCBidWZmZXIgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKDEsIGJ1ZmZlclNpemUsIHNhbXBsZVJhdGUpO1xuICBjb25zdCBkYXRhID0gYnVmZmVyLmdldENoYW5uZWxEYXRhKDApO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnVmZmVyU2l6ZTsgaSsrKVxuICAgIGRhdGFbaV0gPSBNYXRoLnJhbmRvbSgpICogMiAtIDE7XG5cbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuLyoqXG4gKiBTaW1wbGUgc3ludGhlc2l6ZXIgcHJvZHVjaW5nIHdoaXRlIG5vaXNlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXaGl0ZU5vaXNlU3ludGgge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKipcbiAgICAgKiBPdXRwdXQgZ2FpbiBub2RlLlxuICAgICAqIEB0eXBlIHtHYWluTm9kZX1cbiAgICAgKi9cbiAgICB0aGlzLm91dHB1dCA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBXaGl0ZSBub2lzZSBidWZmZXIgc291cmNlIG5vZGUuXG4gICAgICogQHR5cGUge0F1ZGlvQnVmZmVyU291cmNlTm9kZX1cbiAgICAgKi9cbiAgICB0aGlzLmJ1ZmZlclNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICB0aGlzLmJ1ZmZlclNvdXJjZS5jb25uZWN0KHRoaXMub3V0cHV0KTtcbiAgICB0aGlzLmJ1ZmZlclNvdXJjZS5idWZmZXIgPSBjcmVhdGVXaGl0ZU5vaXNlQnVmZmVyKCk7XG4gICAgdGhpcy5idWZmZXJTb3VyY2UubG9vcCA9IHRydWU7XG4gICAgdGhpcy5idWZmZXJTb3VyY2Uuc3RhcnQoMCk7XG4gIH1cblxuICBjb25uZWN0KGRlc3RpbmF0aW9uKSB7XG4gICAgdGhpcy5vdXRwdXQuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgY29uc3Qgbm93ID0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIHRoaXMub3V0cHV0LmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKG5vdyk7XG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLm91dHB1dC5nYWluLnZhbHVlLCBub3cpO1xuICAgIHRoaXMub3V0cHV0LmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMSwgbm93ICsgMC43NSk7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIGNvbnN0IG5vdyA9IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcbiAgICB0aGlzLm91dHB1dC5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhub3cpO1xuICAgIHRoaXMub3V0cHV0LmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSwgbm93KTtcbiAgICB0aGlzLm91dHB1dC5nYWluLmV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUoMC4wMDAxLCBub3cgKyAxLjUpO1xuICB9XG59XG4iXX0=