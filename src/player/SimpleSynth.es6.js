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

class SimpleSynth {
  constructor(voiced = false) {
    this.output = audioContext.createGain();
    this.output.connect(audioContext.destination);
    this.output.gain.value = 0;

    this.filter = audioContext.createBiquadFilter();
    this.filter.connect(this.output);
    this.filter.frequency.value = 0;
    this.filter.Q.value = 24;
    this.filter.type = 0;

    if (voiced) {
      this.osc = audioContext.createOscillator();
      this.osc.connect(this.filter);
      this.osc.type = "square";
      this.osc.frequency.value = 60;
      this.osc.start(0);

      this.gain = 1;
    } else {
      this.osc = audioContext.createScriptProcessor(4096, 1, 1);
      this.osc.connect(this.filter);

      var b0 = 0;
      var b1 = 0;
      var b2 = 0;
      var b3 = 0;
      var b4 = 0;
      var b5 = 0;
      var b6 = 0;

      this.osc.onaudioprocess = function(e) {
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

      this.gain = 1;
    }

    this.minCutoff = 200;
    this.maxCutoff = 8000;
    this.logCutoffRatio = Math.log(this.maxCutoff / this.minCutoff);

    this.speedFilter = new MvavrgFilter(8);
  }

  update(distance, speed) {
    var filteredSpeed = this.speedFilter.input(speed);
    var cutoffFrequency = this.minCutoff * Math.exp(this.logCutoffRatio * filteredSpeed);

    this.filter.frequency.value = cutoffFrequency;

    var now = audioContext.currentTime;
    var currentGain = this.output.gain.value;

    this.output.gain.cancelScheduledValues(now);
    this.output.gain.setValueAtTime(currentGain, now);

    var gain = this.gain * (1 - distance);
    var duration = 0.050;

    this.output.gain.linearRampToValueAtTime(gain, now + duration);
  }
}

module.exports = SimpleSynth;