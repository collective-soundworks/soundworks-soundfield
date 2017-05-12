import { audioContext, Experience, SegmentedView } from 'soundworks/client';
import WhiteNoiseSynth from './WhiteNoiseSynth';

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
export default class PlayerExperience extends Experience {
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
   * Start the experience when all services are ready.
   */
  start() {
    super.start();

    this.synth = new WhiteNoiseSynth();
    this.synth.connect(audioContext.destination);

    this.view = new SegmentedView(template, { center: 'Listen!' }, {}, {
      id: this.id,
      className: 'player',
    });
    // request the `viewManager` to display the view of the experience
    this.show();
    // setup socket listeners for server messages
    this.receive('start', this.onStartMessage);
    this.receive('stop', this.onStopMessage);
  }

  /**
   * Callback executed when receiving the `start` message from the server.
   */
  onStartMessage() {
    this.synth.start();
    this.view.$el.classList.add('active');
  }

  /**
   * Callback executed when receiving the `stop` message from the server.
   */
  onStopMessage() {
    this.synth.stop();
    this.view.$el.classList.remove('active');
  }
}
