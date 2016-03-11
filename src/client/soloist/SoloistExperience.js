// Import Soundworks modules (client side)
import * as soundworks from 'soundworks/client';
const SpaceView = soundworks.SpaceView;
const View = soundworks.View;
const viewport = soundworks.viewport;
const TouchSurface = soundworks.TouchSurface;

// define the template of the view used by the experience
// the template uses some of the helper classes defined in `sass/_02-commons.scss`
const viewTemplate = `
  <div class="background fit-container"></div>
  <div class="foreground fit-container"></div>
`;


/**
 * The `SoloistPerformance` class is responsible for:
 * - displaying the positions on the players in the performance;
 * - tracking the soloist's finger(s) on screen and sending the touch
 *   coordinates to the server.
 */
export default class SoloistExperience extends soundworks.Experience {
  constructor() {
    super();

    // require usefull services
    this._welcome = this.require('welcome'); // could be removed
    this._sharedConfig = this.require('shared-config');

    /**
     * Area of the scenario.
     * @type {Object}
     */
    this.area = null;

    /**
     * Radius of the excited zone relative to the setup area definition.
     * @type {Number}
     */
    this.radius = 1;

    // @todo - document
    this.touches = {};
    this.renderedTouches = {};
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
    this.area = this._sharedConfig.get('setup.area');
    // init the view
    this.viewTemplate = viewTemplate;
    this.viewCtor = View;
    this.view = this.createView();
    // create a background space to display players positions
    this.playersSpace = new SpaceView();
    this.playersSpace.setArea(this.area);
    // create a foreground space for interactions feedback
    this.interactionsSpace = new SpaceView();
    this.interactionsSpace.setArea(this.area);
    // add the 2 spaces to the main view
    this.view.setViewComponent('.background', this.playersSpace);
    this.view.setViewComponent('.foreground', this.interactionsSpace);
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
    const surface = new TouchSurface(this.interactionsSpace.$svg);

    surface.addListener('touchstart', this.onTouchStart);
    surface.addListener('touchmove', this.onTouchMove);
    surface.addListener('touchend', this.onTouchEnd);
  }

  /**
   * Display all the players from a list in the space visualization.
   * @param {Object[]} playerList List of players.
   */
  onPlayerList(playerList) {
    this.playersSpace.addPoints(playerList);
  }

  /**
   * Add a player to the space visualization.
   * @param {Object} player Player.
   */
  onPlayerAdd(playerInfos) {
    this.playersSpace.addPoint(playerInfos);
  }

  /**
   * Remove a player from the space visualization.
   * @param {Object} player Player.
   */
  onPlayerRemove(playerInfos) {
    this.playersSpace.deletePoint(playerInfos.id);
  }

  onTouchStart(id, x, y) {
    // define the position according to the area (`x` and `y` are normalized values)
    const area = this.area;
    x = x * area.width;
    y = y * area.height;

    // add the coordinates to the ones sended to the server
    this.touches[id] = [x, y];
    this.sendCoordinates();

    // defines the radius of excitation in pixels according to the rendered area.
    const radius = (this.radius / area.width) * this.interactionsSpace.areaWidth;
    // create an object to be rendered by the `interactionsSpace`
    const point = { id, x, y, radius };
    // keep a reference to the rendered point for update
    this.renderedTouches[id] = point;
    // render the point
    this.interactionsSpace.addPoint(point);

    // timeout if the `touchend` does not trigger
    clearTimeout(this.timeouts[id]);
    this.timeouts[id] = setTimeout(() => this.onTouchEnd(id), this.timeoutDelay);
  }

  onTouchMove(id, x, y) {
    const area = this.area;
    x = x * area.width;
    y = y * area.height;

    // update values sended to the server
    const touch = this.touches[id];
    touch[0] = x;
    touch[1] = y;

    this.sendCoordinates();

    // update the feedback point
    const point = this.renderedTouches[id];
    point.x = x;
    point.y = y;

    this.interactionsSpace.updatePoint(point);

    // set a new timeout if the `touchend` does not trigger
    clearTimeout(this.timeouts[id]);
    this.timeouts[id] = setTimeout(() => this.onTouchEnd(id), this.timeoutDelay);
  }

  onTouchEnd(id) {
    // cancel preventive timeout for this id
    clearTimeout(this.timeouts[id]);

    // remove feedback
    const point = this.renderedTouches[id];
    this.interactionsSpace.deletePoint(point.id);
    // destroy references to this touch event
    delete this.touches[id];
    delete this.renderedTouches[id];

    this.sendCoordinates();
  }

  sendCoordinates() {
    this.send('input:change', this.radius, this.touches);
  }
}
