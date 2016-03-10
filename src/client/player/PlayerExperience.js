import soundworks from 'soundworks/client';
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
    super('player-experience');

    this.welcome = this.require('welcome');
    this.locator = this.require('locator');

    // Method bindings to not loose the context.
    this._onPlay = this._onPlay.bind(this);
    this._onMute = this._onMute.bind(this);
  }

  init() {
    /**
     * White noise synth.
     * @type {WhiteNoiseSynth}
     */
    this._synth = new WhiteNoiseSynth();

    // use default
    this.content = { center: 'Listen!' };
    this.template = template;
    this.viewCtor = soundworks.display.SegmentedView;
    this.view = this.createView();
  }

  start() {
    super.start();

    if (!this.hasStarted)
      this.init();

    this.show();
    // setup listeners for server messages
    this.receive('play', this._onPlay);
    this.receive('mute', this._onMute);
  }

  _onPlay() {
    // start synth
    this._synth.start();
    // change background color
    this.view.$el.classList.add('white');
  }

  _onMute() {
    // stop synth
    this._synth.stop();
    // change background color
    this.view.$el.classList.add('black');
    this.view.$el.classList.remove('white');
  }
}
