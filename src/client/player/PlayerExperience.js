import * as soundworks from 'soundworks/client';
import WhiteNoiseSynth from './WhiteNoiseSynth.js';


const template = `
  <div class="section-top"></div>
  <div class="section-center flex-center">
    <p class="big"><%= center %></p>
  </div>
  <div class="section-bottom"></div>
`;

/**
 * @todo
 */
export default class PlayerExperience extends soundworks.Experience {
  constructor() {
    super();

    this.require('platform', { features: 'web-audio' });
    this.require('welcome');
    this.require('locator');

    // bind the methods to the instance to keep a safe `this` in callbacks
    this.onStart = this.onStart.bind(this);
    this.onStop = this.onStop.bind(this);
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
    this.receive('start', this.onStart);
    this.receive('stop', this.onStop);
  }

  onStart() {
    // start synth
    this._synth.start();
    // change background color
    this.view.$el.classList.add('active');
  }

  onStop() {
    // stop synth
    this._synth.stop();
    // change background color
    this.view.$el.classList.remove('active');
  }
}
