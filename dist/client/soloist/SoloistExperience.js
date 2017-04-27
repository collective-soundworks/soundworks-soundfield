'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _client = require('soundworks/client');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// define the template of the view used by the experience
// the template uses some of the helper classes defined in `sass/_02-commons.scss`
var SoloistView = function (_View) {
  (0, _inherits3.default)(SoloistView, _View);

  function SoloistView(background, foreground) {
    (0, _classCallCheck3.default)(this, SoloistView);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SoloistView.__proto__ || (0, _getPrototypeOf2.default)(SoloistView)).call(this, '', {}, {}, { id: 'experience', className: 'soloist' }));

    _this.template = '\n      <div class="background fit-container"></div>\n      <div class="foreground fit-container"></div>\n    ';

    _this.background = background;
    _this.foreground = foreground;
    return _this;
  }

  (0, _createClass3.default)(SoloistView, [{
    key: 'render',
    value: function render(sel) {
      var $el = (0, _get3.default)(SoloistView.prototype.__proto__ || (0, _getPrototypeOf2.default)(SoloistView.prototype), 'render', this).call(this, sel);

      var $background = this.background.render();
      var $foreground = this.foreground.render();

      this.$el.querySelector('.background').appendChild($background);
      this.$el.querySelector('.foreground').appendChild($foreground);

      return $el;
    }
  }, {
    key: 'onRender',
    value: function onRender() {
      (0, _get3.default)(SoloistView.prototype.__proto__ || (0, _getPrototypeOf2.default)(SoloistView.prototype), 'onRender', this).call(this);
    }
  }, {
    key: 'show',
    value: function show() {
      (0, _get3.default)(SoloistView.prototype.__proto__ || (0, _getPrototypeOf2.default)(SoloistView.prototype), 'show', this).call(this);

      this.background.show();
      this.foreground.show();
    }
  }]);
  return SoloistView;
}(_client.View);

/**
 * The `SoloistPerformance` class is responsible for:
 * - displaying the positions of the player` client in the given `area`
 * - tracking the soloist's touche(s) on screen and sending their
 *   coordinates to the server.
 */
// Import Soundworks modules (client side)


var SoloistExperience = function (_Experience) {
  (0, _inherits3.default)(SoloistExperience, _Experience);

  function SoloistExperience() {
    (0, _classCallCheck3.default)(this, SoloistExperience);

    // the experience requires 2 service:
    // - the `platform` service can create the home page of the application
    var _this2 = (0, _possibleConstructorReturn3.default)(this, (SoloistExperience.__proto__ || (0, _getPrototypeOf2.default)(SoloistExperience)).call(this));

    _this2.platform = _this2.require('platform', { showDialog: true });
    // - the `shared-config` assure the experience has access to certain
    //   server configuration options when it starts
    _this2.sharedConfig = _this2.require('shared-config');

    /**
     * Area of the scenario.
     * @type {Object}
     */
    _this2.area = null;

    /**
     * Radius of the excited zone relative to the setup area definition.
     * @type {Number}
     */
    _this2.radius = 1;

    /**
     * Object containing the current touch coordinates, ids of the
     * touch events are used as keys.
     * @type {Object<String, Array<Number>>}
     */
    _this2.touches = {};

    /**
     * Object containing the object used to render the feedback of the touches,
     * ids of the touch events are used as keys.
     * @type {Object<String, Array<Number>>}
     */
    _this2.renderedTouches = {};

    /**
     * List of the timeout ids for each touch events, ids of the touch events
     * are used as keys.
     * @type {Object<String, Number>}
     */
    _this2.timeouts = {};

    /**
     * The delay in which a touch event is cancelled of no touch move or touch
     * end occured since its start.
     * @type {Numeber}
     */
    _this2.timeoutDelay = 6000;

    // bind methods to the instance to keep a safe `this` in callbacks
    _this2.onTouchStart = _this2.onTouchStart.bind(_this2);
    _this2.onTouchMove = _this2.onTouchMove.bind(_this2);
    _this2.onTouchEnd = _this2.onTouchEnd.bind(_this2);

    _this2.onPlayerList = _this2.onPlayerList.bind(_this2);
    _this2.onPlayerAdd = _this2.onPlayerAdd.bind(_this2);
    _this2.onPlayerRemove = _this2.onPlayerRemove.bind(_this2);
    return _this2;
  }

  /**
   * Start the experience when all services are ready.
   */


  (0, _createClass3.default)(SoloistExperience, [{
    key: 'start',
    value: function start() {
      (0, _get3.default)(SoloistExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(SoloistExperience.prototype), 'start', this).call(this);

      this.area = this.sharedConfig.get('setup.area');
      // create a background `SpaceView` to display players positions
      this.playersSpace = new _client.SpaceView();
      this.playersSpace.setArea(this.area);
      // create a foreground `SpaceView` for interactions feedback
      this.interactionsSpace = new _client.SpaceView();
      this.interactionsSpace.setArea(this.area);

      this.view = new SoloistView(this.playersSpace, this.interactionsSpace);

      this.show();

      // Setup listeners for player connections / disconnections
      this.receive('player:list', this.onPlayerList);
      this.receive('player:add', this.onPlayerAdd);
      this.receive('player:remove', this.onPlayerRemove);

      // Add a `TouchSurface` to the area svg. The `TouchSurface` is a helper
      // which send normalized coordinates on touch events according to the given
      // `DOMElement`
      var surface = new _client.TouchSurface(this.interactionsSpace.$svg);
      // setup listeners to the `TouchSurface` events
      surface.addListener('touchstart', this.onTouchStart);
      surface.addListener('touchmove', this.onTouchMove);
      surface.addListener('touchend', this.onTouchEnd);
    }

    /**
     * Display all the players from a list in the space visualization.
     * @param {Object[]} playerList List of players.
     */

  }, {
    key: 'onPlayerList',
    value: function onPlayerList(playerList) {
      this.playersSpace.addPoints(playerList);
    }

    /**
     * Add a player to the space visualization.
     * @param {Object} player Player.
     */

  }, {
    key: 'onPlayerAdd',
    value: function onPlayerAdd(playerInfos) {
      this.playersSpace.addPoint(playerInfos);
    }

    /**
     * Remove a player from the space visualization.
     * @param {Object} player Player.
     */

  }, {
    key: 'onPlayerRemove',
    value: function onPlayerRemove(playerInfos) {
      this.playersSpace.deletePoint(playerInfos.id);
    }

    /**
     * Callback for the `touchstart` event.
     * @param {Number} id - The id of the touch event as given by the browser.
     * @param {Number} x - The normalized x coordinate of the touch according to the
     *  listened `DOMElement`.
     * @param {Number} y - The normalized y coordinate of the touch according to the
     *  listened `DOMElement`.
     */

  }, {
    key: 'onTouchStart',
    value: function onTouchStart(id, x, y) {
      var _this3 = this;

      // define the position according to the area (`x` and `y` are normalized values)
      var area = this.area;
      x = x * area.width;
      y = y * area.height;

      // add the coordinates to the ones sended to the server
      this.touches[id] = [x, y];
      this.sendCoordinates();

      // defines the radius of excitation in pixels according to the rendered area.
      var radius = this.radius / area.width * this.interactionsSpace.areaWidth;
      // create an object to be rendered by the `interactionsSpace`
      var point = { id: id, x: x, y: y, radius: radius };
      // keep a reference to the rendered point for update
      this.renderedTouches[id] = point;
      // render the point
      this.interactionsSpace.addPoint(point);

      // timeout if the `touchend` does not trigger
      clearTimeout(this.timeouts[id]);
      this.timeouts[id] = setTimeout(function () {
        return _this3.onTouchEnd(id);
      }, this.timeoutDelay);
    }

    /**
     * Callback for the `touchmove` event.
     * @param {Number} id - The id of the touch event as given by the browser.
     * @param {Number} x - The normalized x coordinate of the touch according to the
     *  listened `DOMElement`.
     * @param {Number} y - The normalized y coordinate of the touch according to the
     *  listened `DOMElement`.
     */

  }, {
    key: 'onTouchMove',
    value: function onTouchMove(id, x, y) {
      var _this4 = this;

      var area = this.area;
      x = x * area.width;
      y = y * area.height;

      // update values sended to the server
      var touch = this.touches[id];
      touch[0] = x;
      touch[1] = y;

      this.sendCoordinates();

      // update the feedback point
      var point = this.renderedTouches[id];
      point.x = x;
      point.y = y;

      this.interactionsSpace.updatePoint(point);

      // set a new timeout if the `touchend` does not trigger
      clearTimeout(this.timeouts[id]);
      this.timeouts[id] = setTimeout(function () {
        return _this4.onTouchEnd(id);
      }, this.timeoutDelay);
    }

    /**
     * Callback for the `touchend` and `touchcancel` events.
     * @param {Number} id - The id of the touch event as given by the browser.
     * @param {Number} x - The normalized x coordinate of the touch according to the
     *  listened `DOMElement`.
     * @param {Number} y - The normalized y coordinate of the touch according to the
     *  listened `DOMElement`.
     */

  }, {
    key: 'onTouchEnd',
    value: function onTouchEnd(id) {
      // cancel preventive timeout for this id
      clearTimeout(this.timeouts[id]);

      // remove feedback point
      var point = this.renderedTouches[id];
      this.interactionsSpace.deletePoint(point.id);
      // destroy references to this particular touch event
      delete this.touches[id];
      delete this.renderedTouches[id];

      this.sendCoordinates();
    }

    /**
     * Send the current state of the touche coordinates to the server.
     */

  }, {
    key: 'sendCoordinates',
    value: function sendCoordinates() {
      this.send('input:change', this.radius, this.touches);
    }
  }]);
  return SoloistExperience;
}(_client.Experience);

exports.default = SoloistExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNvbG9pc3RFeHBlcmllbmNlLmpzIl0sIm5hbWVzIjpbIlNvbG9pc3RWaWV3IiwiYmFja2dyb3VuZCIsImZvcmVncm91bmQiLCJpZCIsImNsYXNzTmFtZSIsInRlbXBsYXRlIiwic2VsIiwiJGVsIiwiJGJhY2tncm91bmQiLCJyZW5kZXIiLCIkZm9yZWdyb3VuZCIsInF1ZXJ5U2VsZWN0b3IiLCJhcHBlbmRDaGlsZCIsInNob3ciLCJTb2xvaXN0RXhwZXJpZW5jZSIsInBsYXRmb3JtIiwicmVxdWlyZSIsInNob3dEaWFsb2ciLCJzaGFyZWRDb25maWciLCJhcmVhIiwicmFkaXVzIiwidG91Y2hlcyIsInJlbmRlcmVkVG91Y2hlcyIsInRpbWVvdXRzIiwidGltZW91dERlbGF5Iiwib25Ub3VjaFN0YXJ0IiwiYmluZCIsIm9uVG91Y2hNb3ZlIiwib25Ub3VjaEVuZCIsIm9uUGxheWVyTGlzdCIsIm9uUGxheWVyQWRkIiwib25QbGF5ZXJSZW1vdmUiLCJnZXQiLCJwbGF5ZXJzU3BhY2UiLCJzZXRBcmVhIiwiaW50ZXJhY3Rpb25zU3BhY2UiLCJ2aWV3IiwicmVjZWl2ZSIsInN1cmZhY2UiLCIkc3ZnIiwiYWRkTGlzdGVuZXIiLCJwbGF5ZXJMaXN0IiwiYWRkUG9pbnRzIiwicGxheWVySW5mb3MiLCJhZGRQb2ludCIsImRlbGV0ZVBvaW50IiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsInNlbmRDb29yZGluYXRlcyIsImFyZWFXaWR0aCIsInBvaW50IiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsInRvdWNoIiwidXBkYXRlUG9pbnQiLCJzZW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQTs7OztBQUVBO0FBQ0E7SUFDTUEsVzs7O0FBQ0osdUJBQVlDLFVBQVosRUFBd0JDLFVBQXhCLEVBQW9DO0FBQUE7O0FBQUEsZ0pBQzVCLEVBRDRCLEVBQ3hCLEVBRHdCLEVBQ3BCLEVBRG9CLEVBQ2hCLEVBQUVDLElBQUks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aUJBQUwsQ0FBdUJVLFdBQXZCLENBQW1DTyxNQUFNakQsRUFBekM7QUFDQTtBQUNBLGFBQU8sS0FBS2tCLE9BQUwsQ0FBYWxCLEVBQWIsQ0FBUDtBQUNBLGFBQU8sS0FBS21CLGVBQUwsQ0FBcUJuQixFQUFyQixDQUFQOztBQUVBLFdBQUsrQyxlQUFMO0FBQ0Q7O0FBRUQ7Ozs7OztzQ0FHa0I7QUFDaEIsV0FBS08sSUFBTCxDQUFVLGNBQVYsRUFBMEIsS0FBS3JDLE1BQS9CLEVBQXVDLEtBQUtDLE9BQTVDO0FBQ0Q7Ozs7O2tCQWpOa0JQLGlCIiwiZmlsZSI6IlNvbG9pc3RFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW1wb3J0IFNvdW5kd29ya3MgbW9kdWxlcyAoY2xpZW50IHNpZGUpXG5pbXBvcnQgeyBTcGFjZVZpZXcsIFZpZXcsIHZpZXdwb3J0LCBUb3VjaFN1cmZhY2UsIEV4cGVyaWVuY2UgfSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5cbi8vIGRlZmluZSB0aGUgdGVtcGxhdGUgb2YgdGhlIHZpZXcgdXNlZCBieSB0aGUgZXhwZXJpZW5jZVxuLy8gdGhlIHRlbXBsYXRlIHVzZXMgc29tZSBvZiB0aGUgaGVscGVyIGNsYXNzZXMgZGVmaW5lZCBpbiBgc2Fzcy9fMDItY29tbW9ucy5zY3NzYFxuY2xhc3MgU29sb2lzdFZpZXcgZXh0ZW5kcyBWaWV3IHtcbiAgY29uc3RydWN0b3IoYmFja2dyb3VuZCwgZm9yZWdyb3VuZCkge1xuICAgIHN1cGVyKCcnLCB7fSwge30sIHsgaWQ6ICdleHBlcmllbmNlJywgY2xhc3NOYW1lOiAnc29sb2lzdCcgfSk7XG5cbiAgICB0aGlzLnRlbXBsYXRlID0gYFxuICAgICAgPGRpdiBjbGFzcz1cImJhY2tncm91bmQgZml0LWNvbnRhaW5lclwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImZvcmVncm91bmQgZml0LWNvbnRhaW5lclwiPjwvZGl2PlxuICAgIGA7XG5cbiAgICB0aGlzLmJhY2tncm91bmQgPSBiYWNrZ3JvdW5kO1xuICAgIHRoaXMuZm9yZWdyb3VuZCA9IGZvcmVncm91bmQ7XG4gIH1cblxuICByZW5kZXIoc2VsKSB7XG4gICAgY29uc3QgJGVsID0gc3VwZXIucmVuZGVyKHNlbCk7XG5cbiAgICBjb25zdCAkYmFja2dyb3VuZCA9IHRoaXMuYmFja2dyb3VuZC5yZW5kZXIoKTtcbiAgICBjb25zdCAkZm9yZWdyb3VuZCA9IHRoaXMuZm9yZWdyb3VuZC5yZW5kZXIoKTtcblxuICAgIHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5iYWNrZ3JvdW5kJykuYXBwZW5kQ2hpbGQoJGJhY2tncm91bmQpO1xuICAgIHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5mb3JlZ3JvdW5kJykuYXBwZW5kQ2hpbGQoJGZvcmVncm91bmQpO1xuXG4gICAgcmV0dXJuICRlbDtcbiAgfVxuXG4gIG9uUmVuZGVyKCkge1xuICAgIHN1cGVyLm9uUmVuZGVyKCk7XG4gIH1cblxuICBzaG93KCkge1xuICAgIHN1cGVyLnNob3coKTtcblxuICAgIHRoaXMuYmFja2dyb3VuZC5zaG93KCk7XG4gICAgdGhpcy5mb3JlZ3JvdW5kLnNob3coKTtcbiAgfVxufVxuXG5cbi8qKlxuICogVGhlIGBTb2xvaXN0UGVyZm9ybWFuY2VgIGNsYXNzIGlzIHJlc3BvbnNpYmxlIGZvcjpcbiAqIC0gZGlzcGxheWluZyB0aGUgcG9zaXRpb25zIG9mIHRoZSBwbGF5ZXJgIGNsaWVudCBpbiB0aGUgZ2l2ZW4gYGFyZWFgXG4gKiAtIHRyYWNraW5nIHRoZSBzb2xvaXN0J3MgdG91Y2hlKHMpIG9uIHNjcmVlbiBhbmQgc2VuZGluZyB0aGVpclxuICogICBjb29yZGluYXRlcyB0byB0aGUgc2VydmVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2xvaXN0RXhwZXJpZW5jZSBleHRlbmRzIEV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLy8gdGhlIGV4cGVyaWVuY2UgcmVxdWlyZXMgMiBzZXJ2aWNlOlxuICAgIC8vIC0gdGhlIGBwbGF0Zm9ybWAgc2VydmljZSBjYW4gY3JlYXRlIHRoZSBob21lIHBhZ2Ugb2YgdGhlIGFwcGxpY2F0aW9uXG4gICAgdGhpcy5wbGF0Zm9ybSA9IHRoaXMucmVxdWlyZSgncGxhdGZvcm0nLCB7IHNob3dEaWFsb2c6IHRydWUgfSk7XG4gICAgLy8gLSB0aGUgYHNoYXJlZC1jb25maWdgIGFzc3VyZSB0aGUgZXhwZXJpZW5jZSBoYXMgYWNjZXNzIHRvIGNlcnRhaW5cbiAgICAvLyAgIHNlcnZlciBjb25maWd1cmF0aW9uIG9wdGlvbnMgd2hlbiBpdCBzdGFydHNcbiAgICB0aGlzLnNoYXJlZENvbmZpZyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLWNvbmZpZycpO1xuXG4gICAgLyoqXG4gICAgICogQXJlYSBvZiB0aGUgc2NlbmFyaW8uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB0aGlzLmFyZWEgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogUmFkaXVzIG9mIHRoZSBleGNpdGVkIHpvbmUgcmVsYXRpdmUgdG8gdGhlIHNldHVwIGFyZWEgZGVmaW5pdGlvbi5cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmFkaXVzID0gMTtcblxuICAgIC8qKlxuICAgICAqIE9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50IHRvdWNoIGNvb3JkaW5hdGVzLCBpZHMgb2YgdGhlXG4gICAgICogdG91Y2ggZXZlbnRzIGFyZSB1c2VkIGFzIGtleXMuXG4gICAgICogQHR5cGUge09iamVjdDxTdHJpbmcsIEFycmF5PE51bWJlcj4+fVxuICAgICAqL1xuICAgIHRoaXMudG91Y2hlcyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogT2JqZWN0IGNvbnRhaW5pbmcgdGhlIG9iamVjdCB1c2VkIHRvIHJlbmRlciB0aGUgZmVlZGJhY2sgb2YgdGhlIHRvdWNoZXMsXG4gICAgICogaWRzIG9mIHRoZSB0b3VjaCBldmVudHMgYXJlIHVzZWQgYXMga2V5cy5cbiAgICAgKiBAdHlwZSB7T2JqZWN0PFN0cmluZywgQXJyYXk8TnVtYmVyPj59XG4gICAgICovXG4gICAgdGhpcy5yZW5kZXJlZFRvdWNoZXMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIExpc3Qgb2YgdGhlIHRpbWVvdXQgaWRzIGZvciBlYWNoIHRvdWNoIGV2ZW50cywgaWRzIG9mIHRoZSB0b3VjaCBldmVudHNcbiAgICAgKiBhcmUgdXNlZCBhcyBrZXlzLlxuICAgICAqIEB0eXBlIHtPYmplY3Q8U3RyaW5nLCBOdW1iZXI+fVxuICAgICAqL1xuICAgIHRoaXMudGltZW91dHMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBkZWxheSBpbiB3aGljaCBhIHRvdWNoIGV2ZW50IGlzIGNhbmNlbGxlZCBvZiBubyB0b3VjaCBtb3ZlIG9yIHRvdWNoXG4gICAgICogZW5kIG9jY3VyZWQgc2luY2UgaXRzIHN0YXJ0LlxuICAgICAqIEB0eXBlIHtOdW1lYmVyfVxuICAgICAqL1xuICAgIHRoaXMudGltZW91dERlbGF5ID0gNjAwMDtcblxuICAgIC8vIGJpbmQgbWV0aG9kcyB0byB0aGUgaW5zdGFuY2UgdG8ga2VlcCBhIHNhZmUgYHRoaXNgIGluIGNhbGxiYWNrc1xuICAgIHRoaXMub25Ub3VjaFN0YXJ0ID0gdGhpcy5vblRvdWNoU3RhcnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uVG91Y2hNb3ZlID0gdGhpcy5vblRvdWNoTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMub25Ub3VjaEVuZCA9IHRoaXMub25Ub3VjaEVuZC5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5vblBsYXllckxpc3QgPSB0aGlzLm9uUGxheWVyTGlzdC5iaW5kKHRoaXMpO1xuICAgIHRoaXMub25QbGF5ZXJBZGQgPSB0aGlzLm9uUGxheWVyQWRkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vblBsYXllclJlbW92ZSA9IHRoaXMub25QbGF5ZXJSZW1vdmUuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB0aGUgZXhwZXJpZW5jZSB3aGVuIGFsbCBzZXJ2aWNlcyBhcmUgcmVhZHkuXG4gICAqL1xuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgdGhpcy5hcmVhID0gdGhpcy5zaGFyZWRDb25maWcuZ2V0KCdzZXR1cC5hcmVhJyk7XG4gICAgLy8gY3JlYXRlIGEgYmFja2dyb3VuZCBgU3BhY2VWaWV3YCB0byBkaXNwbGF5IHBsYXllcnMgcG9zaXRpb25zXG4gICAgdGhpcy5wbGF5ZXJzU3BhY2UgPSBuZXcgU3BhY2VWaWV3KCk7XG4gICAgdGhpcy5wbGF5ZXJzU3BhY2Uuc2V0QXJlYSh0aGlzLmFyZWEpO1xuICAgIC8vIGNyZWF0ZSBhIGZvcmVncm91bmQgYFNwYWNlVmlld2AgZm9yIGludGVyYWN0aW9ucyBmZWVkYmFja1xuICAgIHRoaXMuaW50ZXJhY3Rpb25zU3BhY2UgPSBuZXcgU3BhY2VWaWV3KCk7XG4gICAgdGhpcy5pbnRlcmFjdGlvbnNTcGFjZS5zZXRBcmVhKHRoaXMuYXJlYSk7XG5cbiAgICB0aGlzLnZpZXcgPSBuZXcgU29sb2lzdFZpZXcodGhpcy5wbGF5ZXJzU3BhY2UsIHRoaXMuaW50ZXJhY3Rpb25zU3BhY2UpO1xuXG4gICAgdGhpcy5zaG93KCk7XG5cbiAgICAvLyBTZXR1cCBsaXN0ZW5lcnMgZm9yIHBsYXllciBjb25uZWN0aW9ucyAvIGRpc2Nvbm5lY3Rpb25zXG4gICAgdGhpcy5yZWNlaXZlKCdwbGF5ZXI6bGlzdCcsIHRoaXMub25QbGF5ZXJMaXN0KTtcbiAgICB0aGlzLnJlY2VpdmUoJ3BsYXllcjphZGQnLCB0aGlzLm9uUGxheWVyQWRkKTtcbiAgICB0aGlzLnJlY2VpdmUoJ3BsYXllcjpyZW1vdmUnLCB0aGlzLm9uUGxheWVyUmVtb3ZlKTtcblxuICAgIC8vIEFkZCBhIGBUb3VjaFN1cmZhY2VgIHRvIHRoZSBhcmVhIHN2Zy4gVGhlIGBUb3VjaFN1cmZhY2VgIGlzIGEgaGVscGVyXG4gICAgLy8gd2hpY2ggc2VuZCBub3JtYWxpemVkIGNvb3JkaW5hdGVzIG9uIHRvdWNoIGV2ZW50cyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuXG4gICAgLy8gYERPTUVsZW1lbnRgXG4gICAgY29uc3Qgc3VyZmFjZSA9IG5ldyBUb3VjaFN1cmZhY2UodGhpcy5pbnRlcmFjdGlvbnNTcGFjZS4kc3ZnKTtcbiAgICAvLyBzZXR1cCBsaXN0ZW5lcnMgdG8gdGhlIGBUb3VjaFN1cmZhY2VgIGV2ZW50c1xuICAgIHN1cmZhY2UuYWRkTGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uVG91Y2hTdGFydCk7XG4gICAgc3VyZmFjZS5hZGRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vblRvdWNoTW92ZSk7XG4gICAgc3VyZmFjZS5hZGRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uVG91Y2hFbmQpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXkgYWxsIHRoZSBwbGF5ZXJzIGZyb20gYSBsaXN0IGluIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uLlxuICAgKiBAcGFyYW0ge09iamVjdFtdfSBwbGF5ZXJMaXN0IExpc3Qgb2YgcGxheWVycy5cbiAgICovXG4gIG9uUGxheWVyTGlzdChwbGF5ZXJMaXN0KSB7XG4gICAgdGhpcy5wbGF5ZXJzU3BhY2UuYWRkUG9pbnRzKHBsYXllckxpc3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHBsYXllciB0byB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsYXllciBQbGF5ZXIuXG4gICAqL1xuICBvblBsYXllckFkZChwbGF5ZXJJbmZvcykge1xuICAgIHRoaXMucGxheWVyc1NwYWNlLmFkZFBvaW50KHBsYXllckluZm9zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBwbGF5ZXIgZnJvbSB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsYXllciBQbGF5ZXIuXG4gICAqL1xuICBvblBsYXllclJlbW92ZShwbGF5ZXJJbmZvcykge1xuICAgIHRoaXMucGxheWVyc1NwYWNlLmRlbGV0ZVBvaW50KHBsYXllckluZm9zLmlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmb3IgdGhlIGB0b3VjaHN0YXJ0YCBldmVudC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkIC0gVGhlIGlkIG9mIHRoZSB0b3VjaCBldmVudCBhcyBnaXZlbiBieSB0aGUgYnJvd3Nlci5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHggLSBUaGUgbm9ybWFsaXplZCB4IGNvb3JkaW5hdGUgb2YgdGhlIHRvdWNoIGFjY29yZGluZyB0byB0aGVcbiAgICogIGxpc3RlbmVkIGBET01FbGVtZW50YC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHkgLSBUaGUgbm9ybWFsaXplZCB5IGNvb3JkaW5hdGUgb2YgdGhlIHRvdWNoIGFjY29yZGluZyB0byB0aGVcbiAgICogIGxpc3RlbmVkIGBET01FbGVtZW50YC5cbiAgICovXG4gIG9uVG91Y2hTdGFydChpZCwgeCwgeSkge1xuICAgIC8vIGRlZmluZSB0aGUgcG9zaXRpb24gYWNjb3JkaW5nIHRvIHRoZSBhcmVhIChgeGAgYW5kIGB5YCBhcmUgbm9ybWFsaXplZCB2YWx1ZXMpXG4gICAgY29uc3QgYXJlYSA9IHRoaXMuYXJlYTtcbiAgICB4ID0geCAqIGFyZWEud2lkdGg7XG4gICAgeSA9IHkgKiBhcmVhLmhlaWdodDtcblxuICAgIC8vIGFkZCB0aGUgY29vcmRpbmF0ZXMgdG8gdGhlIG9uZXMgc2VuZGVkIHRvIHRoZSBzZXJ2ZXJcbiAgICB0aGlzLnRvdWNoZXNbaWRdID0gW3gsIHldO1xuICAgIHRoaXMuc2VuZENvb3JkaW5hdGVzKCk7XG5cbiAgICAvLyBkZWZpbmVzIHRoZSByYWRpdXMgb2YgZXhjaXRhdGlvbiBpbiBwaXhlbHMgYWNjb3JkaW5nIHRvIHRoZSByZW5kZXJlZCBhcmVhLlxuICAgIGNvbnN0IHJhZGl1cyA9ICh0aGlzLnJhZGl1cyAvIGFyZWEud2lkdGgpICogdGhpcy5pbnRlcmFjdGlvbnNTcGFjZS5hcmVhV2lkdGg7XG4gICAgLy8gY3JlYXRlIGFuIG9iamVjdCB0byBiZSByZW5kZXJlZCBieSB0aGUgYGludGVyYWN0aW9uc1NwYWNlYFxuICAgIGNvbnN0IHBvaW50ID0geyBpZCwgeCwgeSwgcmFkaXVzIH07XG4gICAgLy8ga2VlcCBhIHJlZmVyZW5jZSB0byB0aGUgcmVuZGVyZWQgcG9pbnQgZm9yIHVwZGF0ZVxuICAgIHRoaXMucmVuZGVyZWRUb3VjaGVzW2lkXSA9IHBvaW50O1xuICAgIC8vIHJlbmRlciB0aGUgcG9pbnRcbiAgICB0aGlzLmludGVyYWN0aW9uc1NwYWNlLmFkZFBvaW50KHBvaW50KTtcblxuICAgIC8vIHRpbWVvdXQgaWYgdGhlIGB0b3VjaGVuZGAgZG9lcyBub3QgdHJpZ2dlclxuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRzW2lkXSk7XG4gICAgdGhpcy50aW1lb3V0c1tpZF0gPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMub25Ub3VjaEVuZChpZCksIHRoaXMudGltZW91dERlbGF5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmb3IgdGhlIGB0b3VjaG1vdmVgIGV2ZW50LlxuICAgKiBAcGFyYW0ge051bWJlcn0gaWQgLSBUaGUgaWQgb2YgdGhlIHRvdWNoIGV2ZW50IGFzIGdpdmVuIGJ5IHRoZSBicm93c2VyLlxuICAgKiBAcGFyYW0ge051bWJlcn0geCAtIFRoZSBub3JtYWxpemVkIHggY29vcmRpbmF0ZSBvZiB0aGUgdG91Y2ggYWNjb3JkaW5nIHRvIHRoZVxuICAgKiAgbGlzdGVuZWQgYERPTUVsZW1lbnRgLlxuICAgKiBAcGFyYW0ge051bWJlcn0geSAtIFRoZSBub3JtYWxpemVkIHkgY29vcmRpbmF0ZSBvZiB0aGUgdG91Y2ggYWNjb3JkaW5nIHRvIHRoZVxuICAgKiAgbGlzdGVuZWQgYERPTUVsZW1lbnRgLlxuICAgKi9cbiAgb25Ub3VjaE1vdmUoaWQsIHgsIHkpIHtcbiAgICBjb25zdCBhcmVhID0gdGhpcy5hcmVhO1xuICAgIHggPSB4ICogYXJlYS53aWR0aDtcbiAgICB5ID0geSAqIGFyZWEuaGVpZ2h0O1xuXG4gICAgLy8gdXBkYXRlIHZhbHVlcyBzZW5kZWQgdG8gdGhlIHNlcnZlclxuICAgIGNvbnN0IHRvdWNoID0gdGhpcy50b3VjaGVzW2lkXTtcbiAgICB0b3VjaFswXSA9IHg7XG4gICAgdG91Y2hbMV0gPSB5O1xuXG4gICAgdGhpcy5zZW5kQ29vcmRpbmF0ZXMoKTtcblxuICAgIC8vIHVwZGF0ZSB0aGUgZmVlZGJhY2sgcG9pbnRcbiAgICBjb25zdCBwb2ludCA9IHRoaXMucmVuZGVyZWRUb3VjaGVzW2lkXTtcbiAgICBwb2ludC54ID0geDtcbiAgICBwb2ludC55ID0geTtcblxuICAgIHRoaXMuaW50ZXJhY3Rpb25zU3BhY2UudXBkYXRlUG9pbnQocG9pbnQpO1xuXG4gICAgLy8gc2V0IGEgbmV3IHRpbWVvdXQgaWYgdGhlIGB0b3VjaGVuZGAgZG9lcyBub3QgdHJpZ2dlclxuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRzW2lkXSk7XG4gICAgdGhpcy50aW1lb3V0c1tpZF0gPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMub25Ub3VjaEVuZChpZCksIHRoaXMudGltZW91dERlbGF5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmb3IgdGhlIGB0b3VjaGVuZGAgYW5kIGB0b3VjaGNhbmNlbGAgZXZlbnRzLlxuICAgKiBAcGFyYW0ge051bWJlcn0gaWQgLSBUaGUgaWQgb2YgdGhlIHRvdWNoIGV2ZW50IGFzIGdpdmVuIGJ5IHRoZSBicm93c2VyLlxuICAgKiBAcGFyYW0ge051bWJlcn0geCAtIFRoZSBub3JtYWxpemVkIHggY29vcmRpbmF0ZSBvZiB0aGUgdG91Y2ggYWNjb3JkaW5nIHRvIHRoZVxuICAgKiAgbGlzdGVuZWQgYERPTUVsZW1lbnRgLlxuICAgKiBAcGFyYW0ge051bWJlcn0geSAtIFRoZSBub3JtYWxpemVkIHkgY29vcmRpbmF0ZSBvZiB0aGUgdG91Y2ggYWNjb3JkaW5nIHRvIHRoZVxuICAgKiAgbGlzdGVuZWQgYERPTUVsZW1lbnRgLlxuICAgKi9cbiAgb25Ub3VjaEVuZChpZCkge1xuICAgIC8vIGNhbmNlbCBwcmV2ZW50aXZlIHRpbWVvdXQgZm9yIHRoaXMgaWRcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0c1tpZF0pO1xuXG4gICAgLy8gcmVtb3ZlIGZlZWRiYWNrIHBvaW50XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLnJlbmRlcmVkVG91Y2hlc1tpZF07XG4gICAgdGhpcy5pbnRlcmFjdGlvbnNTcGFjZS5kZWxldGVQb2ludChwb2ludC5pZCk7XG4gICAgLy8gZGVzdHJveSByZWZlcmVuY2VzIHRvIHRoaXMgcGFydGljdWxhciB0b3VjaCBldmVudFxuICAgIGRlbGV0ZSB0aGlzLnRvdWNoZXNbaWRdO1xuICAgIGRlbGV0ZSB0aGlzLnJlbmRlcmVkVG91Y2hlc1tpZF07XG5cbiAgICB0aGlzLnNlbmRDb29yZGluYXRlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHRvdWNoZSBjb29yZGluYXRlcyB0byB0aGUgc2VydmVyLlxuICAgKi9cbiAgc2VuZENvb3JkaW5hdGVzKCkge1xuICAgIHRoaXMuc2VuZCgnaW5wdXQ6Y2hhbmdlJywgdGhpcy5yYWRpdXMsIHRoaXMudG91Y2hlcyk7XG4gIH1cbn1cbiJdfQ==