var audioContext = require('audio-context');

'use strict';

class MvavrgFilter {
  constructor(size) {
    this.__buffer = new Float32Array(size);
    this.__index = 0;
  }

  input(value) {
    this.__buffer[this.__index] = value;

    var sum = 0.0;

    for (var i = 0; i < this.__buffer.length; i++)
      sum += this.__buffer[i];

    this.__index = (this.__index + 1) % this.__buffer.length;

    return sum / this.__buffer.length;
  }
}

class WanderingSoundSynth {
  constructor(voiced = false) {
    this.output = audioContext.createGain();
    this.filter = audioContext.createBiquadFilter();

    if (voiced) {
      var osc = audioContext.createOscillator();

      osc.type = 2;
      osc.frequency.value = 80;
      osc.start(0);

      this.osc = osc;
      this.gain = 1;
    } else {
      var noise = audioContext.createScriptProcessor(4096, 1, 1);

      var b0 = 0;
      var b1 = 0;
      var b2 = 0;
      var b3 = 0;
      var b4 = 0;
      var b5 = 0;
      var b6 = 0;

      noise.onaudioprocess = function(e) {
        // copied from https://github.com/zacharydenton/noise.js
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < 4096; i++) {
          var white = Math.random() * 2 - 1;

          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;

          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11; // (roughly) compensate for gain

          b6 = white * 0.115926;
        }
      };

      this.osc = noise;
      this.gain = 0.25;
    }

    this.filter.frequency.value = 400;
    this.filter.Q.value = 24;
    this.filter.type = 0;

    this.output.gain.value = 0;

    this.osc.connect(this.filter);
    this.filter.connect(this.output);
    this.output.connect(audioContext.destination);

    this.speedFilter = new MvavrgFilter(8);
  }

  update(distance, speed) {
    var filteredSpeed = this.speedFilter.input(speed);
    var filterFrequency = this.calculateFrequency(filteredSpeed, 200, 8000);
    this.filter.frequency.value = filterFrequency;

    var now = audioContext.currentTime;
    var currentGain = this.output.gain.value;

    this.output.gain.cancelScheduledValues(now);
    this.output.gain.setValueAtTime(currentGain, now);

    var gain = this.gain * (1 - distance);
    var duration = 0.050;

    this.output.gain.linearRampToValueAtTime(gain, now + duration);
  }

  /*
   * Utils methods
   */

  calculateFrequency(s, fMin, fMax) {
    if (s < 0.05)
      return fMin;
    else if (s > 1)
      return fMax;
    return fMin + s * (fMax - fMin);
  }

}

module.exports = WanderingSoundSynth;