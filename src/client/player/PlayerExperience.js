import * as soundworks from 'soundworks/client';
import WhiteNoiseSynth from './WhiteNoiseSynth.js';

const template = `
  <div class="section-top"></div>
  <div class="section-center flex-center">
    <p class="big"><%= center %></p>
  </div>
  <div class="section-bottom"></div>
`;

// PlayerPerformance class
export default class PlayerExperience extends soundworks.Experience {
  constructor() {
    super();

    this._welcome = this.require('welcome');
    this._locator = this.require('locator');

    // Method bindings to not loose the context.
    this._onStart = this._onStart.bind(this);
    this._onStop = this._onStop.bind(this);
  }

  init() {
    /**
     * White noise synth.
     * @type {WhiteNoiseSynth}
     */
    this._synth = new WhiteNoiseSynth();

    // use default
    this.viewContent = { center: 'Listen!' };
    this.viewTemplate = template;
    this.viewCtor = soundworks.SegmentedView;
    this.view = this.createView();
  }

  start() {
    super.start();

    if (!this.hasStarted)
      this.init();

    this.show();
    // setup listeners for server messages
    this.receive('start', this._onStart);
    this.receive('stop', this._onStop);
  }

  _onStart() {
    // start synth
    this._synth.start();
    // change background color
    this.view.$el.classList.add('active');
  }

  _onStop() {
    // stop synth
    this._synth.stop();
    // change background color
    this.view.$el.classList.remove('active');
  }
}
