// Import Soundworks modules (client side)
import * as soundworks from 'soundworks/client';
const SpaceView = soundworks.SpaceView;
const TouchSurface = soundworks.TouchSurface;

/**
 * `SoloistPerformance` class.
 * The `SoloistPerformance` is responsible for:
 * - displaying the positions on the players in the performance;
 * - tracking the soloist's finger(s) on screen and sending the touch
 *   coordinates to the server.
 */
export default class SoloistPerformance extends soundworks.Experience {
  constructor() {
    super();

    // require usefull services
    this._welcome = this.require('welcome');
    this._sharedConfig = this.require('shared-config');

    /**
     * Setup of the scenario.
     * @type {Object}
     */
    this.setup = null;

    /**
     * Width of the exited zone relative to the setup area definition
     * @type {Number}
     */
    this.radius = 1;

    this.touches = {};
    this.timeouts = {};

    this.timeoutDelay = 6000;

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this.onPlayerList = this.onPlayerList.bind(this);
    this.onPlayerAdd = this.onPlayerAdd.bind(this);
    this.onPlayerRemove = this.onPlayerRemove.bind(this);
  }


  init() {
    this.setup = this._sharedConfig.get('setup');
    // init the view
    this.viewCtor = SpaceView;
    this.view = this.createView();
    this.view.setArea(this.setup.area);
  }

  /**
   * Start the module.
   *
   * Setup listeners for:
   * - the messages from the server;
   * - the window `'resize'` event;
   * - the touch events.
   * Display the space visualization.
   */
  start() {
    super.start();

    if (!this.hasStarted)
      this.init();

    this.show();

    // Setup listeners for player connections / disconnections
    this.receive('player:list', this.onPlayerList);
    this.receive('player:add', this.onPlayerAdd);
    this.receive('player:remove', this.onPlayerRemove);

    // add a TouchSurface on the area svg
    const surface = new TouchSurface(this.view.$svg);

    surface.addListener('touchstart', this.onTouchStart);
    surface.addListener('touchmove', this.onTouchMove);
    surface.addListener('touchend', this.onTouchEnd);
  }

  /**
   * Display all the players from a list in the space visualization.
   * @param {Object[]} playerList List of players.
   */
  onPlayerList(playerList) {
    this.view.addPoints(playerList);
  }

  /**
   * Add a player to the space visualization.
   * @param {Object} player Player.
   */
  onPlayerAdd(playerInfos) {
    this.view.addPoint(playerInfos);
  }

  /**
   * Remove a player from the space visualization.
   * @param {Object} player Player.
   */
  onPlayerRemove(playerInfos) {
    this.view.deletePoint(playerInfos.id);
  }

  onTouchStart(id, x, y) {
    const area = this.setup.area;
    x = x * area.width;
    y = y * area.height;

    this.touches[id] = [x, y];
    // timeout if the `touchend` does not trigger
    clearTimeout(this.timeouts[id]);
    this.timeouts[id] = setTimeout(() => this.onTouchEnd(id), this.timeoutDelay);

    this.sendCoordinates();
  }

  onTouchMove(id, x, y) {
    const area = this.setup.area;
    const touch = this.touches[id];
    touch[0] = x * area.width;
    touch[1] = y * area.height;

    // timeout if the `touchend` does not trigger
    clearTimeout(this.timeouts[id]);
    this.timeouts[id] = setTimeout(() => this.onTouchEnd(id), this.timeoutDelay);

    this.sendCoordinates();
  }

  onTouchEnd(id) {
    delete this.touches[id];
    this.sendCoordinates();
  }

  sendCoordinates() {
    this.send('input:change', this.radius, this.touches);
  }
}
