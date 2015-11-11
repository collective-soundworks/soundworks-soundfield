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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Import Soundworks modules (client side)
var clientSide = require('soundworks')('client');
var client = clientSide.client;

/**
 * Normalized value of radius of the finger graphical representation (a
 * translucent red circle).
 * A value of 1 correspond to a radius equal to the minimum of the height or
 * width of the space visualization.
 * @type {Number}
 */
var fingerRadius = 0.1;

/**
 * Length of the timeout (in seconds) after which the touch is automatically
 * removed (useful when a `'touchend'` or `'touchcancel'` message doesn't go
 * through).
 * @type {Number}
 */
var timeoutLength = 8;

// SoloistPerformance class

var SoundfieldPerformance = (function (_clientSide$Performan) {
  (0, _inherits3.default)(SoundfieldPerformance, _clientSide$Performan);

  function SoundfieldPerformance() {
    (0, _classCallCheck3.default)(this, SoundfieldPerformance);
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    /**
     * Dictionary of the DOM elements that represent a finger on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SoundfieldPerformance).call(this, options));

    _this3._fingerDivs = {};

    /**
     * Dictionary of the timeouts for each finger DOM element on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    _this3._fingerDivTimeouts = {};

    /**
     * Space.
     * @type {Space}
     */
    _this3._space = null;

    /**
     * Touch surface.
     * @type {DOMElement}
     */
    _this3._surface = null;

    /**
     * Dictionary of the current touches (fingers) on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    _this3._touches = {};
    return _this3;
  }

  /**
   * Number by which we multiply the fingerRadius constant to get the radius
   * value in pixels.
   * @return {Number} Minimum of the space visualization height or width, in
   * pixels.
   */

  (0, _createClass3.default)(SoundfieldPerformance, [{
    key: 'start',

    /**
     * Starts the module.
     *
     * Setup listeners for:
     * - the messages from the server;
     * - the window `'resize'` event;
     * - the touch events.
     * Display the space visualization.
     */
    value: function start() {
      (0, _get3.default)((0, _getPrototypeOf2.default)(SoundfieldPerformance.prototype), 'start', this).call(this);

      // Setup listeners for player connections / disconnections
      client.receive('performance:playerList', this._onPlayerList);
      client.receive('performance:addPlayer', this._onAddPlayer);
      client.receive('performance:removePlayer', this._onRemovePlayer);

      // Setup window resize listener
      window.addEventListener('resize', this._onResize);

      // Setup touch event listeners
      this._surface.addListener('touchstart', this._onTouch);
      this._surface.addListener('touchmove', this._onTouch);
      this._surface.addListener('touchend', this._onTouch);
      this._surface.addListener('touchcancel', this._onTouch);

      // Display the space visualization in the view and adapt the size
      this._space.display(this._surface, { transform: 'rotate180' });
      this._onResize();
    }

    /**
     * Resets the module to its initial state.
     *
     * Remove listeners for:
     * - the messages from the server;
     * - the window `'resize'` event;
     * - the touch events.
     * Remove the space visualization.
     */

  }, {
    key: 'reset',
    value: function reset() {
      (0, _get3.default)((0, _getPrototypeOf2.default)(SoundfieldPerformance.prototype), 'reset', this).call(this);

      // Remove listeners for player connections / disconnections
      client.removeListener('performance:playerList', this._onPlayerList);
      client.removeListener('performance:addPlayer', this._onAddPlayer);
      client.removeListener('performance:removePlayer', this._onRemovePlayer);

      // Remove window resize listener
      window.removeEventListener('resize', this._onWindowResize);

      // Remove touch event listeners
      this._surface.removeListener('touchstart', this._onTouch);
      this._surface.removeListener('touchmove', this._onTouch);
      this._surface.removeListener('touchend', this._onTouch);
      this._surface.removeListener('touchcancel', this._onTouch);

      // Remove the space visualization from the view
      this.view.innerHTML = '';
    }

    /**
     * Add a player to the space visualization.
     * @param {Object} player Player.
     */

  }, {
    key: '_onPlayerAdd',
    value: function _onPlayerAdd(player) {
      this._space.addPosition(player, 10);
    }

    /**
     * Display all the players from a list in the space visualization.
     * @param {Object[]} playerList List of players.
     */

  }, {
    key: '_onPlayerList',
    value: function _onPlayerList(playerList) {
      this._space.displayPositions(playerList, 10);
    }

    /**
     * Remove a player from the space visualization.
     * @param {Object} player Player.
     */

  }, {
    key: '_onPlayerRemove',
    value: function _onPlayerRemove(player) {
      this._space.removePosition(player);
    }

    /**
     * Touch event handler
     * @param {Object} e Touch event.
     */

  }, {
    key: '_onTouch',
    value: function _onTouch(e) {
      // Prevent scrolling
      e.preventDefault();

      // A few constants
      var type = e.type;
      var changedTouches = e.changedTouches;

      // Iterate through the changedTouches array
      for (var i = 0; i < changedTouches.length; i++) {
        // Retrieve touch data
        var coordinates = [changedTouches[i].clientX, changedTouches[i].clientY];
        var identifier = changedTouches[i].identifier;
        var touch = { id: identifier, coordinates: coordinates };

        // Calculate normalized touch position in the surface's referential
        // (We multiply by -1 because the surface is rotated by 180° on the
        // soloist display)
        var x = -(coordinates[0] - this._surface.offsetLeft - this.setup.svgOffsetLeft) / this.setup.svgWidth;
        var y = -(coordinates[1] - this._surface.offsetTop - this.setup.svgOffsetTop) / this.setup.svgHeight;

        // Depending on the event type…
        switch (type) {
          // `'touchstart'`:
          // - add the touch coordinates to the dictionary `this._touches`
          // - create a `div` under the finger
          case 'touchstart':
            this._touches[identifier] = [x, y];
            this._createFingerDiv(identifier, coordinates);
            client.send('soloist:performance:touchstart', touch);
            break;

          // `'touchmove'`:
          // - add or update the touch coordinates to the dictionary
          //     `this._touches`
          // - move the `div` under the finger or create one if it doesn't exist
          //   already (may happen if the finger slides from the edge of the
          //   touchscreen)
          case 'touchmove':
            {
              this._touches[identifier] = [x, y];
              if (this._fingerDivs[identifier]) this._moveFingerDiv(identifier, coordinates);else this._createFingerDiv(identifier, coordinates);
              client.send('soloist:touchmove', touch);
              break;
            }

          // `'touchend'`:
          // - delete the touch in the dictionary `this._touches`
          // - remove the corresponding `div`
          case 'touchend':
            {
              delete this._touches[identifier];
              if (this._fingerDivs[identifier]) this._removeFingerDiv(identifier);
              client.send('soloist:touchendorcancel', touch);
              break;
            }

          // `'touchcancel'`: similar to `'touchend'`
          case 'touchcancel':
            {
              delete this._touches[identifier];
              if (this._fingerDivs[identifier]) this._removeFingerDiv(identifier);
              client.send('soloist:touchendorcancel', touch);
              break;
            }
        }
      }
    }

    /**
     * Window resize handler.
     * Redraw the space visualization to fit the window or screen size.
     * @return {[type]} [description]
     */

  }, {
    key: '_onWindowResize',
    value: function _onWindowResize() {
      var height = window.innerHeight;
      var width = window.innerWidth;

      if (width > height) {
        this._surface.style.height = height + 'px';
        this._surface.style.width = height + 'px';
      } else {
        this._surface.style.height = width + 'px';
        this._surface.style.width = width + 'px';
      }

      this._space.resize();
    }

    /**
     * Create a finger `div` and append it to the DOM (as a child of the `view`).
     * @param {Number} id Identifier of the `div` (comes from the touch
     * identifier).
     * @param {Number[]} coordinates Coordinates of the `div` (comes from the
     * touch coordinates, as a `[x:Number, y:Number]` array).
     */

  }, {
    key: '_createFingerDiv',
    value: function _createFingerDiv(id, coordinates) {
      var _this = this;

      // Calculate the radius in pixels
      var radius = fingerRadius * this._pxRatio;

      // Calculate the coordinates of the finger `div`
      var xOffset = coordinates[0] - radius;
      var yOffset = coordinates[1] - radius;

      // Create the HTML element
      var fingerDiv = document.createElement('div');
      fingerDiv.classList.add('finger');
      fingerDiv.style.height = 2 * radius + 'px';
      fingerDiv.style.width = 2 * radius + 'px';
      fingerDiv.style.left = xOffset + 'px';
      fingerDiv.style.top = yOffset + 'px';

      this._fingerDivs[id] = fingerDiv;
      this._surface.insertBefore(fingerDiv, this.setupDiv.firstChild.nextSibling);

      // Timeout
      this._fingerDivTimeouts[id] = setTimeout(function () {
        _this._removeFingerDiv(id);
      }, timeoutLength * 1000);
    }

    /**
     * Move a finger `div`.
     * @param {Number} id Identifier of the `div`.
     * @param {Number[]} coordinates Coordinates of the `div` (as a `[x:Number,
     * y:Number]` array).
     */

  }, {
    key: '_moveFingerDiv',
    value: function _moveFingerDiv(id, coordinates) {
      var _this2 = this;

      // Calculate the radius in pixels
      var radius = fingerRadius * this._pxRatio;

      // Calculate the coordinates of the finger `div`
      var xOffset = coordinates[0] - radius;
      var yOffset = coordinates[1] - radius;

      // Move the finger `div`
      var soundDiv = this._soundDivs[id];
      soundDiv.style.left = xOffset + 'px';
      soundDiv.style.top = yOffset + 'px';

      // Timeout
      clearTimeout(this._fingerDivTimeouts[id]);
      this._fingerDivTimeouts[id] = setTimeout(function () {
        _this2._removeFingerDiv(id);
      }, timeoutLength * 1000);
    }

    /**
     * Deletes a finger div from the DOM.
     * @param {Number} id Identifier of the `div`.
     */

  }, {
    key: '_removeFingerDiv',
    value: function _removeFingerDiv(id) {
      // Remove the finger `div from the DOM and the dictionary
      this._surface.removeChild(this._fingerDivs[id]);
      delete this._fingerDivs[id];

      // Timeout
      clearTimeout(this._fingerDivTimeouts[id]);
      delete this._fingerDivTimeouts[id];
    }
  }, {
    key: '_pxRatio',
    get: function get() {
      return Math.min(this._surface.offsetHeight, this._surface.offsetWidth);
    }
  }]);
  return SoundfieldPerformance;
})(clientSide.Performance);

exports.default = SoundfieldPerformance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNvbG9pc3RQZXJmb3JtYW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkQsSUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU07Ozs7Ozs7OztBQUFDLEFBU2pDLElBQU0sWUFBWSxHQUFHLEdBQUc7Ozs7Ozs7O0FBQUMsQUFRekIsSUFBTSxhQUFhLEdBQUcsQ0FBQzs7O0FBQUM7SUFHSCxxQkFBcUI7MEJBQXJCLHFCQUFxQjs7QUFDeEMsV0FEbUIscUJBQXFCLEdBQ2Q7d0NBRFAscUJBQXFCO1FBQzVCLE9BQU8seURBQUcsRUFBRTs7Ozs7Ozs7OEZBREwscUJBQXFCLGFBRWhDLE9BQU87O0FBT2IsV0FBSyxXQUFXLEdBQUcsRUFBRTs7Ozs7OztBQUFDLEFBT3RCLFdBQUssa0JBQWtCLEdBQUcsRUFBRTs7Ozs7O0FBQUMsQUFNN0IsV0FBSyxNQUFNLEdBQUcsSUFBSTs7Ozs7O0FBQUMsQUFNbkIsV0FBSyxRQUFRLEdBQUcsSUFBSTs7Ozs7OztBQUFDLEFBT3JCLFdBQUssUUFBUSxHQUFHLEVBQUUsQ0FBQzs7R0FDcEI7Ozs7Ozs7O0FBQUE7NkJBcENrQixxQkFBcUI7Ozs7Ozs7Ozs7Ozs0QkF5RGhDO0FBQ04sdURBMURpQixxQkFBcUI7OztBQTBEeEIsQUFHZCxZQUFNLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM3RCxZQUFNLENBQUMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzRCxZQUFNLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxlQUFlLENBQUM7OztBQUFDLEFBR2pFLFlBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFD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anMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbXBvcnQgU291bmR3b3JrcyBtb2R1bGVzIChjbGllbnQgc2lkZSlcbmNvbnN0IGNsaWVudFNpZGUgPSByZXF1aXJlKCdzb3VuZHdvcmtzJykoJ2NsaWVudCcpO1xuY29uc3QgY2xpZW50ID0gY2xpZW50U2lkZS5jbGllbnQ7XG5cbi8qKlxuICogTm9ybWFsaXplZCB2YWx1ZSBvZiByYWRpdXMgb2YgdGhlIGZpbmdlciBncmFwaGljYWwgcmVwcmVzZW50YXRpb24gKGFcbiAqIHRyYW5zbHVjZW50IHJlZCBjaXJjbGUpLlxuICogQSB2YWx1ZSBvZiAxIGNvcnJlc3BvbmQgdG8gYSByYWRpdXMgZXF1YWwgdG8gdGhlIG1pbmltdW0gb2YgdGhlIGhlaWdodCBvclxuICogd2lkdGggb2YgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gKiBAdHlwZSB7TnVtYmVyfVxuICovXG5jb25zdCBmaW5nZXJSYWRpdXMgPSAwLjE7XG5cbi8qKlxuICogTGVuZ3RoIG9mIHRoZSB0aW1lb3V0IChpbiBzZWNvbmRzKSBhZnRlciB3aGljaCB0aGUgdG91Y2ggaXMgYXV0b21hdGljYWxseVxuICogcmVtb3ZlZCAodXNlZnVsIHdoZW4gYSBgJ3RvdWNoZW5kJ2Agb3IgYCd0b3VjaGNhbmNlbCdgIG1lc3NhZ2UgZG9lc24ndCBnb1xuICogdGhyb3VnaCkuXG4gKiBAdHlwZSB7TnVtYmVyfVxuICovXG5jb25zdCB0aW1lb3V0TGVuZ3RoID0gODtcblxuLy8gU29sb2lzdFBlcmZvcm1hbmNlIGNsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb3VuZGZpZWxkUGVyZm9ybWFuY2UgZXh0ZW5kcyBjbGllbnRTaWRlLlBlcmZvcm1hbmNlIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucyk7XG5cbiAgICAvKipcbiAgICAgKiBEaWN0aW9uYXJ5IG9mIHRoZSBET00gZWxlbWVudHMgdGhhdCByZXByZXNlbnQgYSBmaW5nZXIgb24gc2NyZWVuLlxuICAgICAqIEtleXMgYXJlIHRoZSB0b3VjaCBpZGVudGlmaWVycyByZXRyaXZlZCBpbiB0aGUgdG91Y2ggZXZlbnRzLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5fZmluZ2VyRGl2cyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogRGljdGlvbmFyeSBvZiB0aGUgdGltZW91dHMgZm9yIGVhY2ggZmluZ2VyIERPTSBlbGVtZW50IG9uIHNjcmVlbi5cbiAgICAgKiBLZXlzIGFyZSB0aGUgdG91Y2ggaWRlbnRpZmllcnMgcmV0cml2ZWQgaW4gdGhlIHRvdWNoIGV2ZW50cy5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuX2ZpbmdlckRpdlRpbWVvdXRzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBTcGFjZS5cbiAgICAgKiBAdHlwZSB7U3BhY2V9XG4gICAgICovXG4gICAgdGhpcy5fc3BhY2UgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVG91Y2ggc3VyZmFjZS5cbiAgICAgKiBAdHlwZSB7RE9NRWxlbWVudH1cbiAgICAgKi9cbiAgICB0aGlzLl9zdXJmYWNlID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIERpY3Rpb25hcnkgb2YgdGhlIGN1cnJlbnQgdG91Y2hlcyAoZmluZ2Vycykgb24gc2NyZWVuLlxuICAgICAqIEtleXMgYXJlIHRoZSB0b3VjaCBpZGVudGlmaWVycyByZXRyaXZlZCBpbiB0aGUgdG91Y2ggZXZlbnRzLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5fdG91Y2hlcyA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIE51bWJlciBieSB3aGljaCB3ZSBtdWx0aXBseSB0aGUgZmluZ2VyUmFkaXVzIGNvbnN0YW50IHRvIGdldCB0aGUgcmFkaXVzXG4gICAqIHZhbHVlIGluIHBpeGVscy5cbiAgICogQHJldHVybiB7TnVtYmVyfSBNaW5pbXVtIG9mIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uIGhlaWdodCBvciB3aWR0aCwgaW5cbiAgICogcGl4ZWxzLlxuICAgKi9cbiAgZ2V0IF9weFJhdGlvKCkge1xuICAgIHJldHVybiBNYXRoLm1pbih0aGlzLl9zdXJmYWNlLm9mZnNldEhlaWdodCwgdGhpcy5fc3VyZmFjZS5vZmZzZXRXaWR0aCk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIFNldHVwIGxpc3RlbmVycyBmb3I6XG4gICAqIC0gdGhlIG1lc3NhZ2VzIGZyb20gdGhlIHNlcnZlcjtcbiAgICogLSB0aGUgd2luZG93IGAncmVzaXplJ2AgZXZlbnQ7XG4gICAqIC0gdGhlIHRvdWNoIGV2ZW50cy5cbiAgICogRGlzcGxheSB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbi5cbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHN1cGVyLnN0YXJ0KCk7XG5cbiAgICAvLyBTZXR1cCBsaXN0ZW5lcnMgZm9yIHBsYXllciBjb25uZWN0aW9ucyAvIGRpc2Nvbm5lY3Rpb25zXG4gICAgY2xpZW50LnJlY2VpdmUoJ3BlcmZvcm1hbmNlOnBsYXllckxpc3QnLCB0aGlzLl9vblBsYXllckxpc3QpO1xuICAgIGNsaWVudC5yZWNlaXZlKCdwZXJmb3JtYW5jZTphZGRQbGF5ZXInLCB0aGlzLl9vbkFkZFBsYXllcik7XG4gICAgY2xpZW50LnJlY2VpdmUoJ3BlcmZvcm1hbmNlOnJlbW92ZVBsYXllcicsIHRoaXMuX29uUmVtb3ZlUGxheWVyKTtcblxuICAgIC8vIFNldHVwIHdpbmRvdyByZXNpemUgbGlzdGVuZXJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fb25SZXNpemUpO1xuXG4gICAgLy8gU2V0dXAgdG91Y2ggZXZlbnQgbGlzdGVuZXJzXG4gICAgdGhpcy5fc3VyZmFjZS5hZGRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UuYWRkTGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UuYWRkTGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5hZGRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLl9vblRvdWNoKTtcblxuICAgIC8vIERpc3BsYXkgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24gaW4gdGhlIHZpZXcgYW5kIGFkYXB0IHRoZSBzaXplXG4gICAgdGhpcy5fc3BhY2UuZGlzcGxheSh0aGlzLl9zdXJmYWNlLCB7IHRyYW5zZm9ybTogJ3JvdGF0ZTE4MCcgfSk7XG4gICAgdGhpcy5fb25SZXNpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIG1vZHVsZSB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cbiAgICpcbiAgICogUmVtb3ZlIGxpc3RlbmVycyBmb3I6XG4gICAqIC0gdGhlIG1lc3NhZ2VzIGZyb20gdGhlIHNlcnZlcjtcbiAgICogLSB0aGUgd2luZG93IGAncmVzaXplJ2AgZXZlbnQ7XG4gICAqIC0gdGhlIHRvdWNoIGV2ZW50cy5cbiAgICogUmVtb3ZlIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uLlxuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgc3VwZXIucmVzZXQoKTtcblxuICAgIC8vIFJlbW92ZSBsaXN0ZW5lcnMgZm9yIHBsYXllciBjb25uZWN0aW9ucyAvIGRpc2Nvbm5lY3Rpb25zXG4gICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdwZXJmb3JtYW5jZTpwbGF5ZXJMaXN0JywgdGhpcy5fb25QbGF5ZXJMaXN0KTtcbiAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoJ3BlcmZvcm1hbmNlOmFkZFBsYXllcicsIHRoaXMuX29uQWRkUGxheWVyKTtcbiAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoJ3BlcmZvcm1hbmNlOnJlbW92ZVBsYXllcicsIHRoaXMuX29uUmVtb3ZlUGxheWVyKTtcblxuICAgIC8vIFJlbW92ZSB3aW5kb3cgcmVzaXplIGxpc3RlbmVyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX29uV2luZG93UmVzaXplKTtcblxuICAgIC8vIFJlbW92ZSB0b3VjaCBldmVudCBsaXN0ZW5lcnNcbiAgICB0aGlzLl9zdXJmYWNlLnJlbW92ZUxpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5yZW1vdmVMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5yZW1vdmVMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9vblRvdWNoKTtcbiAgICB0aGlzLl9zdXJmYWNlLnJlbW92ZUxpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMuX29uVG91Y2gpO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uIGZyb20gdGhlIHZpZXdcbiAgICB0aGlzLnZpZXcuaW5uZXJIVE1MID0gJyc7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgcGxheWVyIHRvIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGxheWVyIFBsYXllci5cbiAgICovXG4gIF9vblBsYXllckFkZChwbGF5ZXIpIHtcbiAgICB0aGlzLl9zcGFjZS5hZGRQb3NpdGlvbihwbGF5ZXIsIDEwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwbGF5IGFsbCB0aGUgcGxheWVycyBmcm9tIGEgbGlzdCBpbiB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbi5cbiAgICogQHBhcmFtIHtPYmplY3RbXX0gcGxheWVyTGlzdCBMaXN0IG9mIHBsYXllcnMuXG4gICAqL1xuICBfb25QbGF5ZXJMaXN0KHBsYXllckxpc3QpIHtcbiAgICB0aGlzLl9zcGFjZS5kaXNwbGF5UG9zaXRpb25zKHBsYXllckxpc3QsIDEwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBwbGF5ZXIgZnJvbSB0aGUgc3BhY2UgdmlzdWFsaXphdGlvbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsYXllciBQbGF5ZXIuXG4gICAqL1xuICBfb25QbGF5ZXJSZW1vdmUocGxheWVyKSB7XG4gICAgdGhpcy5fc3BhY2UucmVtb3ZlUG9zaXRpb24ocGxheWVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb3VjaCBldmVudCBoYW5kbGVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlIFRvdWNoIGV2ZW50LlxuICAgKi9cbiAgX29uVG91Y2goZSkge1xuICAgIC8vIFByZXZlbnQgc2Nyb2xsaW5nXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gQSBmZXcgY29uc3RhbnRzXG4gICAgY29uc3QgdHlwZSA9IGUudHlwZTtcbiAgICBjb25zdCBjaGFuZ2VkVG91Y2hlcyA9IGUuY2hhbmdlZFRvdWNoZXM7XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIGNoYW5nZWRUb3VjaGVzIGFycmF5XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gUmV0cmlldmUgdG91Y2ggZGF0YVxuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gW2NoYW5nZWRUb3VjaGVzW2ldLmNsaWVudFgsIGNoYW5nZWRUb3VjaGVzW2ldLmNsaWVudFldO1xuICAgICAgbGV0IGlkZW50aWZpZXIgPSBjaGFuZ2VkVG91Y2hlc1tpXS5pZGVudGlmaWVyO1xuICAgICAgbGV0IHRvdWNoID0geyBpZDogaWRlbnRpZmllciwgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzIH07XG5cbiAgICAgIC8vIENhbGN1bGF0ZSBub3JtYWxpemVkIHRvdWNoIHBvc2l0aW9uIGluIHRoZSBzdXJmYWNlJ3MgcmVmZXJlbnRpYWxcbiAgICAgIC8vIChXZSBtdWx0aXBseSBieSAtMSBiZWNhdXNlIHRoZSBzdXJmYWNlIGlzIHJvdGF0ZWQgYnkgMTgwwrAgb24gdGhlXG4gICAgICAvLyBzb2xvaXN0IGRpc3BsYXkpXG4gICAgICBsZXQgeCA9IC0oY29vcmRpbmF0ZXNbMF0gLVxuICAgICAgICAgICAgICAgIHRoaXMuX3N1cmZhY2Uub2Zmc2V0TGVmdCAtXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR1cC5zdmdPZmZzZXRMZWZ0ICkgLyB0aGlzLnNldHVwLnN2Z1dpZHRoO1xuICAgICAgbGV0IHkgPSAtKGNvb3JkaW5hdGVzWzFdIC1cbiAgICAgICAgICAgICAgICB0aGlzLl9zdXJmYWNlLm9mZnNldFRvcCAtXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR1cC5zdmdPZmZzZXRUb3ApIC8gdGhpcy5zZXR1cC5zdmdIZWlnaHQ7XG5cbiAgICAgIC8vIERlcGVuZGluZyBvbiB0aGUgZXZlbnQgdHlwZeKAplxuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIC8vIGAndG91Y2hzdGFydCdgOlxuICAgICAgICAvLyAtIGFkZCB0aGUgdG91Y2ggY29vcmRpbmF0ZXMgdG8gdGhlIGRpY3Rpb25hcnkgYHRoaXMuX3RvdWNoZXNgXG4gICAgICAgIC8vIC0gY3JlYXRlIGEgYGRpdmAgdW5kZXIgdGhlIGZpbmdlclxuICAgICAgICBjYXNlICd0b3VjaHN0YXJ0JzpcbiAgICAgICAgICB0aGlzLl90b3VjaGVzW2lkZW50aWZpZXJdID0gW3gsIHldO1xuICAgICAgICAgIHRoaXMuX2NyZWF0ZUZpbmdlckRpdihpZGVudGlmaWVyLCBjb29yZGluYXRlcyk7XG4gICAgICAgICAgY2xpZW50LnNlbmQoJ3NvbG9pc3Q6cGVyZm9ybWFuY2U6dG91Y2hzdGFydCcsIHRvdWNoKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAvLyBgJ3RvdWNobW92ZSdgOlxuICAgICAgICAvLyAtIGFkZCBvciB1cGRhdGUgdGhlIHRvdWNoIGNvb3JkaW5hdGVzIHRvIHRoZSBkaWN0aW9uYXJ5XG4gICAgICAgIC8vICAgICBgdGhpcy5fdG91Y2hlc2BcbiAgICAgICAgLy8gLSBtb3ZlIHRoZSBgZGl2YCB1bmRlciB0aGUgZmluZ2VyIG9yIGNyZWF0ZSBvbmUgaWYgaXQgZG9lc24ndCBleGlzdFxuICAgICAgICAvLyAgIGFscmVhZHkgKG1heSBoYXBwZW4gaWYgdGhlIGZpbmdlciBzbGlkZXMgZnJvbSB0aGUgZWRnZSBvZiB0aGVcbiAgICAgICAgLy8gICB0b3VjaHNjcmVlbilcbiAgICAgICAgY2FzZSAndG91Y2htb3ZlJzoge1xuICAgICAgICAgIHRoaXMuX3RvdWNoZXNbaWRlbnRpZmllcl0gPSBbeCwgeV07XG4gICAgICAgICAgaWYgKHRoaXMuX2ZpbmdlckRpdnNbaWRlbnRpZmllcl0pXG4gICAgICAgICAgICB0aGlzLl9tb3ZlRmluZ2VyRGl2KGlkZW50aWZpZXIsIGNvb3JkaW5hdGVzKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVGaW5nZXJEaXYoaWRlbnRpZmllciwgY29vcmRpbmF0ZXMpO1xuICAgICAgICAgIGNsaWVudC5zZW5kKCdzb2xvaXN0OnRvdWNobW92ZScsIHRvdWNoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGAndG91Y2hlbmQnYDpcbiAgICAgICAgLy8gLSBkZWxldGUgdGhlIHRvdWNoIGluIHRoZSBkaWN0aW9uYXJ5IGB0aGlzLl90b3VjaGVzYFxuICAgICAgICAvLyAtIHJlbW92ZSB0aGUgY29ycmVzcG9uZGluZyBgZGl2YFxuICAgICAgICBjYXNlICd0b3VjaGVuZCc6IHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5fdG91Y2hlc1tpZGVudGlmaWVyXTtcbiAgICAgICAgICBpZiAodGhpcy5fZmluZ2VyRGl2c1tpZGVudGlmaWVyXSlcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUZpbmdlckRpdihpZGVudGlmaWVyKTtcbiAgICAgICAgICBjbGllbnQuc2VuZCgnc29sb2lzdDp0b3VjaGVuZG9yY2FuY2VsJywgdG91Y2gpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYCd0b3VjaGNhbmNlbCdgOiBzaW1pbGFyIHRvIGAndG91Y2hlbmQnYFxuICAgICAgICBjYXNlICd0b3VjaGNhbmNlbCc6IHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5fdG91Y2hlc1tpZGVudGlmaWVyXTtcbiAgICAgICAgICBpZiAodGhpcy5fZmluZ2VyRGl2c1tpZGVudGlmaWVyXSlcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUZpbmdlckRpdihpZGVudGlmaWVyKTtcbiAgICAgICAgICBjbGllbnQuc2VuZCgnc29sb2lzdDp0b3VjaGVuZG9yY2FuY2VsJywgdG91Y2gpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdpbmRvdyByZXNpemUgaGFuZGxlci5cbiAgICogUmVkcmF3IHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uIHRvIGZpdCB0aGUgd2luZG93IG9yIHNjcmVlbiBzaXplLlxuICAgKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cbiAgICovXG4gIF9vbldpbmRvd1Jlc2l6ZSgpIHtcbiAgICBjb25zdCBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgY29uc3Qgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblxuICAgIGlmICh3aWR0aCA+IGhlaWdodCkge1xuICAgICAgdGhpcy5fc3VyZmFjZS5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuICAgICAgdGhpcy5fc3VyZmFjZS5zdHlsZS53aWR0aCA9IGAke2hlaWdodH1weGA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3N1cmZhY2Uuc3R5bGUuaGVpZ2h0ID0gYCR7d2lkdGh9cHhgO1xuICAgICAgdGhpcy5fc3VyZmFjZS5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICB9XG5cbiAgICB0aGlzLl9zcGFjZS5yZXNpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBmaW5nZXIgYGRpdmAgYW5kIGFwcGVuZCBpdCB0byB0aGUgRE9NIChhcyBhIGNoaWxkIG9mIHRoZSBgdmlld2ApLlxuICAgKiBAcGFyYW0ge051bWJlcn0gaWQgSWRlbnRpZmllciBvZiB0aGUgYGRpdmAgKGNvbWVzIGZyb20gdGhlIHRvdWNoXG4gICAqIGlkZW50aWZpZXIpLlxuICAgKiBAcGFyYW0ge051bWJlcltdfSBjb29yZGluYXRlcyBDb29yZGluYXRlcyBvZiB0aGUgYGRpdmAgKGNvbWVzIGZyb20gdGhlXG4gICAqIHRvdWNoIGNvb3JkaW5hdGVzLCBhcyBhIGBbeDpOdW1iZXIsIHk6TnVtYmVyXWAgYXJyYXkpLlxuICAgKi9cbiAgX2NyZWF0ZUZpbmdlckRpdihpZCwgY29vcmRpbmF0ZXMpIHtcbiAgICAvLyBDYWxjdWxhdGUgdGhlIHJhZGl1cyBpbiBwaXhlbHNcbiAgICBjb25zdCByYWRpdXMgPSBmaW5nZXJSYWRpdXMgKiB0aGlzLl9weFJhdGlvO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBjb29yZGluYXRlcyBvZiB0aGUgZmluZ2VyIGBkaXZgXG4gICAgY29uc3QgeE9mZnNldCA9IGNvb3JkaW5hdGVzWzBdIC0gcmFkaXVzO1xuICAgIGNvbnN0IHlPZmZzZXQgPSBjb29yZGluYXRlc1sxXSAtIHJhZGl1cztcblxuICAgIC8vIENyZWF0ZSB0aGUgSFRNTCBlbGVtZW50XG4gICAgbGV0IGZpbmdlckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGZpbmdlckRpdi5jbGFzc0xpc3QuYWRkKCdmaW5nZXInKTtcbiAgICBmaW5nZXJEaXYuc3R5bGUuaGVpZ2h0ID0gYCR7MiAqIHJhZGl1c31weGA7XG4gICAgZmluZ2VyRGl2LnN0eWxlLndpZHRoID0gYCR7MiAqIHJhZGl1c31weGA7XG4gICAgZmluZ2VyRGl2LnN0eWxlLmxlZnQgPSBgJHt4T2Zmc2V0fXB4YDtcbiAgICBmaW5nZXJEaXYuc3R5bGUudG9wID0gYCR7eU9mZnNldH1weGA7XG5cbiAgICB0aGlzLl9maW5nZXJEaXZzW2lkXSA9IGZpbmdlckRpdjtcbiAgICB0aGlzLl9zdXJmYWNlLmluc2VydEJlZm9yZShmaW5nZXJEaXYsIHRoaXMuc2V0dXBEaXYuZmlyc3RDaGlsZC5uZXh0U2libGluZyk7XG5cbiAgICAvLyBUaW1lb3V0XG4gICAgdGhpcy5fZmluZ2VyRGl2VGltZW91dHNbaWRdID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9yZW1vdmVGaW5nZXJEaXYoaWQpO1xuICAgIH0sIHRpbWVvdXRMZW5ndGggKiAxMDAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIGEgZmluZ2VyIGBkaXZgLlxuICAgKiBAcGFyYW0ge051bWJlcn0gaWQgSWRlbnRpZmllciBvZiB0aGUgYGRpdmAuXG4gICAqIEBwYXJhbSB7TnVtYmVyW119IGNvb3JkaW5hdGVzIENvb3JkaW5hdGVzIG9mIHRoZSBgZGl2YCAoYXMgYSBgW3g6TnVtYmVyLFxuICAgKiB5Ok51bWJlcl1gIGFycmF5KS5cbiAgICovXG4gIF9tb3ZlRmluZ2VyRGl2KGlkLCBjb29yZGluYXRlcykge1xuICAgIC8vIENhbGN1bGF0ZSB0aGUgcmFkaXVzIGluIHBpeGVsc1xuICAgIGNvbnN0IHJhZGl1cyA9IGZpbmdlclJhZGl1cyAqIHRoaXMuX3B4UmF0aW87XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBmaW5nZXIgYGRpdmBcbiAgICBjb25zdCB4T2Zmc2V0ID0gY29vcmRpbmF0ZXNbMF0gLSByYWRpdXM7XG4gICAgY29uc3QgeU9mZnNldCA9IGNvb3JkaW5hdGVzWzFdIC0gcmFkaXVzO1xuXG4gICAgLy8gTW92ZSB0aGUgZmluZ2VyIGBkaXZgXG4gICAgbGV0IHNvdW5kRGl2ID0gdGhpcy5fc291bmREaXZzW2lkXTtcbiAgICBzb3VuZERpdi5zdHlsZS5sZWZ0ID0gYCR7eE9mZnNldH1weGA7XG4gICAgc291bmREaXYuc3R5bGUudG9wID0gYCR7eU9mZnNldH1weGA7XG5cbiAgICAvLyBUaW1lb3V0XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2ZpbmdlckRpdlRpbWVvdXRzW2lkXSk7XG4gICAgdGhpcy5fZmluZ2VyRGl2VGltZW91dHNbaWRdID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9yZW1vdmVGaW5nZXJEaXYoaWQpO1xuICAgIH0sIHRpbWVvdXRMZW5ndGggKiAxMDAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGVzIGEgZmluZ2VyIGRpdiBmcm9tIHRoZSBET00uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZCBJZGVudGlmaWVyIG9mIHRoZSBgZGl2YC5cbiAgICovXG4gIF9yZW1vdmVGaW5nZXJEaXYoaWQpIHtcbiAgICAvLyBSZW1vdmUgdGhlIGZpbmdlciBgZGl2IGZyb20gdGhlIERPTSBhbmQgdGhlIGRpY3Rpb25hcnlcbiAgICB0aGlzLl9zdXJmYWNlLnJlbW92ZUNoaWxkKHRoaXMuX2ZpbmdlckRpdnNbaWRdKTtcbiAgICBkZWxldGUgdGhpcy5fZmluZ2VyRGl2c1tpZF07XG5cbiAgICAvLyBUaW1lb3V0XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2ZpbmdlckRpdlRpbWVvdXRzW2lkXSk7XG4gICAgZGVsZXRlIHRoaXMuX2ZpbmdlckRpdlRpbWVvdXRzW2lkXTtcbiAgfVxufVxuIl19