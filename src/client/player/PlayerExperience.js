import * as soundworks from 'soundworks/client';
import WhiteNoiseSynth from './WhiteNoiseSynth';


// html template used by `View` of the `PlayerExperience`
const template = `
  <div class="section-top"></div>
  <div class="section-center flex-center">
    <p class="big"><%= center %></p>
  </div>
  <div class="section-bottom"></div>
`;

/**
 * The `PlayerExperience` requires the `players` to give its approximative
 * position into the `area` (see `src/server/index`) of the experience.
 * The device of the player is then remote controlled by another type of
 * client (i.e. `soloist`) that can control the `start` and `stop` of the
 * synthesizer from its own interface.
 */
export default class PlayerExperience extends soundworks.Experience {
  constructor() {
    super();

    // the experience requires 2 services:
    // - the `platform` service checks for the availability of the requested
    //   features of the application, and display the home screen of the
    //   application
    this.require('platform', { features: 'web-audio' });
    // - the `locator` service provide a view asking for the approximative
    //   position of the user in the defined `area`
    this.require('locator');

    // bind methods to the instance to keep a safe `this` in callbacks
    this.onStartMessage = this.onStartMessage.bind(this);
    this.onStopMessage = this.onStopMessage.bind(this);
  }

  /**
   * Initialize the experience when all services are ready.
   */
  init() {
    /**
     * The Synthesizer used in the experience.
     * @type {WhiteNoiseSynth}
     */
    this.synth = new WhiteNoiseSynth();

    // configure and instanciate the view of the experience
    this.viewContent = { center: 'Listen!' };
    this.viewTemplate = template;
    this.viewCtor = soundworks.SegmentedView;
    this.view = this.createView();
  }

  /**
   * Start the experience when all services are ready.
   */
  start() {
    super.start();

    // if the experience has never started, initialize it
    if (!this.hasStarted)
      this.init();

    // request the `viewManager` to display the view of the experience
    this.show();
    // setup socket listeners for server messages
    this.receive('start', this.onStartMessage);
    this.receive('stop', this.onStopMessage);
  }

  /**
   * Callback to be executed when receiving the `start` message from the server.
   */
  onStartMessage() {
    // start synth and change background color
    this.synth.start();
    this.view.$el.classList.add('active');
  }

  /**
   * Callback to be executed when receiving the `stop` message from the server.
   */
  onStopMessage() {
    // stop synth and change background color
    this.synth.stop();
    this.view.$el.classList.remove('active');
  }
}
