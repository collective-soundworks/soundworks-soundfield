// Import Soundworks modules (client side)
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _soundworksClient = require('soundworks/client');

var _soundworksClient2 = _interopRequireDefault(_soundworksClient);

var client = _soundworksClient2['default'].client;

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

// Helper functions
function createSpaceDiv(view) {
  var spaceDiv = document.createElement('div');
  spaceDiv.setAttribute('id', 'setup');

  var spaceTextDiv = document.createElement('div');
  spaceTextDiv.innerHTML = 'Move your finger on screen';
  spaceTextDiv.classList.add('centered-content');

  var surface = document.createElement('div');
  surface.setAttribute('id', 'touchsurface');
  surface.classList.add('touchsurface');

  spaceDiv.appendChild(surface);
  spaceDiv.appendChild(spaceTextDiv);
  view.appendChild(spaceDiv);

  return {
    spaceDiv: spaceDiv,
    surface: surface
  };
}

// SoloistPerformance class

var SoloistPerformance = (function (_clientSide$Performance) {
  _inherits(SoloistPerformance, _clientSide$Performance);

  function SoloistPerformance(setup, space) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, SoloistPerformance);

    _get(Object.getPrototypeOf(SoloistPerformance.prototype), 'constructor', this).call(this, options);

    var dom = createSpaceDiv(this.view);

    /**
     * Dictionary of the DOM elements that represent a finger on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    this._fingerDivs = {};

    /**
     * Dictionary of the timeouts for each finger DOM element on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    this._fingerDivTimeouts = {};

    /**
     * Setup.
     * @type {Space}
     */
    this._setup = setup;

    /**
     * Space.
     * @type {Space}
     */
    this._space = space;

    /**
     * `div` to represent the Space visualization.
     * @type {DOMElement}
     */
    this._spaceDiv = dom.spaceDiv;

    /**
     * Touch surface.
     * @type {DOMElement}
     */
    this._surface = dom.surface;

    /**
     * Dictionary of the current touches (fingers) on screen.
     * Keys are the touch identifiers retrived in the touch events.
     * @type {Object}
     */
    this._touches = {};

    // Method bindings
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onTouch = this._onTouch.bind(this);
    this._onPlayerAdd = this._onPlayerAdd.bind(this);
    this._onPlayerList = this._onPlayerList.bind(this);
    this._onPlayerRemove = this._onPlayerRemove.bind(this);
  }

  /**
   * Number by which we multiply the fingerRadius constant to get the radius
   * value in pixels.
   * @return {Number} Minimum of the space visualization height or width, in
   * pixels.
   */

  _createClass(SoloistPerformance, [{
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
      _get(Object.getPrototypeOf(SoloistPerformance.prototype), 'start', this).call(this);

      // Display the space visualization in the view and adapt the size
      this._space.display(this._setup, this._spaceDiv, { transform: 'rotate180' });
      this._onWindowResize();

      // Setup listeners for player connections / disconnections
      client.receive('performance:playerList', this._onPlayerList);
      client.receive('performance:playerAdd', this._onPlayer);
      client.receive('performance:playerRemove', this._onRemovePlayer);

      // Setup window resize listener
      window.addEventListener('resize', this._onWindowResize);

      // Setup touch event listeners
      this._surface.addEventListener('touchstart', this._onTouch);
      this._surface.addEventListener('touchmove', this._onTouch);
      this._surface.addEventListener('touchend', this._onTouch);
      this._surface.addEventListener('touchcancel', this._onTouch);
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
      _get(Object.getPrototypeOf(SoloistPerformance.prototype), 'reset', this).call(this);

      // Remove listeners for player connections / disconnections
      client.removeListener('performance:playerList', this._onPlayerList);
      client.removeListener('performance:playerAdd', this._onPlayerAdd);
      client.removeListener('performance:playerRemove', this._onPlayerRemove);

      // Remove window resize listener
      window.removeEventListener('resize', this._onWindowResize);

      // Remove touch event listeners
      this._surface.removeEventListener('touchstart', this._onTouch);
      this._surface.removeEventListener('touchmove', this._onTouch);
      this._surface.removeEventListener('touchend', this._onTouch);
      this._surface.removeEventListener('touchcancel', this._onTouch);

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
        var x = -(coordinates[0] - this._spaceDiv.offsetLeft - this._setup.svgOffsetLeft) / this._setup.svgWidth;
        var y = -(coordinates[1] - this._spaceDiv.offsetTop - this._setup.svgOffsetTop) / this._setup.svgHeight;

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
        this._spaceDiv.style.height = height + 'px';
        this._spaceDiv.style.width = height + 'px';
      } else {
        this._spaceDiv.style.height = width + 'px';
        this._spaceDiv.style.width = width + 'px';
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
      this._spaceDiv.insertBefore(fingerDiv, this._spaceDiv.firstChild.nextSibling);

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
      var fingerDiv = this._fingerDivs[id];
      fingerDiv.style.left = xOffset + 'px';
      fingerDiv.style.top = yOffset + 'px';

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
      this._spaceDiv.removeChild(this._fingerDivs[id]);
      delete this._fingerDivs[id];

      // Timeout
      clearTimeout(this._fingerDivTimeouts[id]);
      delete this._fingerDivTimeouts[id];
    }
  }, {
    key: '_pxRatio',
    get: function get() {
      return Math.min(this._spaceDiv.offsetHeight, this._spaceDiv.offsetWidth);
    }
  }]);

  return SoloistPerformance;
})(_soundworksClient2['default'].Performance);

exports['default'] = SoloistPerformance;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvc29sb2lzdC9Tb2xvaXN0UGVyZm9ybWFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBQ3VCLG1CQUFtQjs7OztBQUMxQyxJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7Ozs7Ozs7OztBQVNqQyxJQUFNLFlBQVksR0FBRyxHQUFHLENBQUM7Ozs7Ozs7O0FBUXpCLElBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQzs7O0FBR3hCLFNBQVMsY0FBYyxDQUFDLElBQUksRUFBRTtBQUM1QixNQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdDLFVBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUVyQyxNQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pELGNBQVksQ0FBQyxTQUFTLEdBQUcsNEJBQTRCLENBQUM7QUFDdEQsY0FBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7QUFFL0MsTUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QyxTQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztBQUMzQyxTQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFdEMsVUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QixVQUFRLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ25DLE1BQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTNCLFNBQU87QUFDTCxZQUFRLEVBQUUsUUFBUTtBQUNsQixXQUFPLEVBQUUsT0FBTztHQUNqQixDQUFBO0NBQ0Y7Ozs7SUFHb0Isa0JBQWtCO1lBQWxC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LElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7OztBQUc1QixrQkFBWSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFDLGFBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDOzs7U0FsUVcsZUFBRztBQUNiLGFBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQzFFOzs7U0FuRWtCLGtCQUFrQjtHQUFTLDhCQUFXLFdBQVc7O3FCQUFqRCxrQkFBa0IiLCJmaWxlIjoic3JjL2NsaWVudC9zb2xvaXN0L1NvbG9pc3RQZXJmb3JtYW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEltcG9ydCBTb3VuZHdvcmtzIG1vZHVsZXMgKGNsaWVudCBzaWRlKVxuaW1wb3J0IGNsaWVudFNpZGUgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuY29uc3QgY2xpZW50ID0gY2xpZW50U2lkZS5jbGllbnQ7XG5cbi8qKlxuICogTm9ybWFsaXplZCB2YWx1ZSBvZiByYWRpdXMgb2YgdGhlIGZpbmdlciBncmFwaGljYWwgcmVwcmVzZW50YXRpb24gKGFcbiAqIHRyYW5zbHVjZW50IHJlZCBjaXJjbGUpLlxuICogQSB2YWx1ZSBvZiAxIGNvcnJlc3BvbmQgdG8gYSByYWRpdXMgZXF1YWwgdG8gdGhlIG1pbmltdW0gb2YgdGhlIGhlaWdodCBvclxuICogd2lkdGggb2YgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gKiBAdHlwZSB7TnVtYmVyfVxuICovXG5jb25zdCBmaW5nZXJSYWRpdXMgPSAwLjE7XG5cbi8qKlxuICogTGVuZ3RoIG9mIHRoZSB0aW1lb3V0IChpbiBzZWNvbmRzKSBhZnRlciB3aGljaCB0aGUgdG91Y2ggaXMgYXV0b21hdGljYWxseVxuICogcmVtb3ZlZCAodXNlZnVsIHdoZW4gYSBgJ3RvdWNoZW5kJ2Agb3IgYCd0b3VjaGNhbmNlbCdgIG1lc3NhZ2UgZG9lc24ndCBnb1xuICogdGhyb3VnaCkuXG4gKiBAdHlwZSB7TnVtYmVyfVxuICovXG5jb25zdCB0aW1lb3V0TGVuZ3RoID0gODtcblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuZnVuY3Rpb24gY3JlYXRlU3BhY2VEaXYodmlldykge1xuICBsZXQgc3BhY2VEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgc3BhY2VEaXYuc2V0QXR0cmlidXRlKCdpZCcsICdzZXR1cCcpO1xuXG4gIGxldCBzcGFjZVRleHREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgc3BhY2VUZXh0RGl2LmlubmVySFRNTCA9ICdNb3ZlIHlvdXIgZmluZ2VyIG9uIHNjcmVlbic7XG4gIHNwYWNlVGV4dERpdi5jbGFzc0xpc3QuYWRkKCdjZW50ZXJlZC1jb250ZW50Jyk7XG5cbiAgbGV0IHN1cmZhY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgc3VyZmFjZS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3RvdWNoc3VyZmFjZScpO1xuICBzdXJmYWNlLmNsYXNzTGlzdC5hZGQoJ3RvdWNoc3VyZmFjZScpO1xuXG4gIHNwYWNlRGl2LmFwcGVuZENoaWxkKHN1cmZhY2UpO1xuICBzcGFjZURpdi5hcHBlbmRDaGlsZChzcGFjZVRleHREaXYpO1xuICB2aWV3LmFwcGVuZENoaWxkKHNwYWNlRGl2KTtcblxuICByZXR1cm4ge1xuICAgIHNwYWNlRGl2OiBzcGFjZURpdixcbiAgICBzdXJmYWNlOiBzdXJmYWNlXG4gIH1cbn1cblxuLy8gU29sb2lzdFBlcmZvcm1hbmNlIGNsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2xvaXN0UGVyZm9ybWFuY2UgZXh0ZW5kcyBjbGllbnRTaWRlLlBlcmZvcm1hbmNlIHtcbiAgY29uc3RydWN0b3Ioc2V0dXAsIHNwYWNlLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zKTtcblxuICAgIGxldCBkb20gPSBjcmVhdGVTcGFjZURpdih0aGlzLnZpZXcpO1xuXG4gICAgLyoqXG4gICAgICogRGljdGlvbmFyeSBvZiB0aGUgRE9NIGVsZW1lbnRzIHRoYXQgcmVwcmVzZW50IGEgZmluZ2VyIG9uIHNjcmVlbi5cbiAgICAgKiBLZXlzIGFyZSB0aGUgdG91Y2ggaWRlbnRpZmllcnMgcmV0cml2ZWQgaW4gdGhlIHRvdWNoIGV2ZW50cy5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuX2ZpbmdlckRpdnMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIERpY3Rpb25hcnkgb2YgdGhlIHRpbWVvdXRzIGZvciBlYWNoIGZpbmdlciBET00gZWxlbWVudCBvbiBzY3JlZW4uXG4gICAgICogS2V5cyBhcmUgdGhlIHRvdWNoIGlkZW50aWZpZXJzIHJldHJpdmVkIGluIHRoZSB0b3VjaCBldmVudHMuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB0aGlzLl9maW5nZXJEaXZUaW1lb3V0cyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogU2V0dXAuXG4gICAgICogQHR5cGUge1NwYWNlfVxuICAgICAqL1xuICAgIHRoaXMuX3NldHVwID0gc2V0dXA7XG5cbiAgICAvKipcbiAgICAgKiBTcGFjZS5cbiAgICAgKiBAdHlwZSB7U3BhY2V9XG4gICAgICovXG4gICAgdGhpcy5fc3BhY2UgPSBzcGFjZTtcblxuICAgIC8qKlxuICAgICAqIGBkaXZgIHRvIHJlcHJlc2VudCB0aGUgU3BhY2UgdmlzdWFsaXphdGlvbi5cbiAgICAgKiBAdHlwZSB7RE9NRWxlbWVudH1cbiAgICAgKi9cbiAgICB0aGlzLl9zcGFjZURpdiA9IGRvbS5zcGFjZURpdjtcblxuICAgIC8qKlxuICAgICAqIFRvdWNoIHN1cmZhY2UuXG4gICAgICogQHR5cGUge0RPTUVsZW1lbnR9XG4gICAgICovXG4gICAgdGhpcy5fc3VyZmFjZSA9IGRvbS5zdXJmYWNlO1xuXG4gICAgLyoqXG4gICAgICogRGljdGlvbmFyeSBvZiB0aGUgY3VycmVudCB0b3VjaGVzIChmaW5nZXJzKSBvbiBzY3JlZW4uXG4gICAgICogS2V5cyBhcmUgdGhlIHRvdWNoIGlkZW50aWZpZXJzIHJldHJpdmVkIGluIHRoZSB0b3VjaCBldmVudHMuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB0aGlzLl90b3VjaGVzID0ge307XG5cbiAgICAvLyBNZXRob2QgYmluZGluZ3NcbiAgICB0aGlzLl9vbldpbmRvd1Jlc2l6ZSA9IHRoaXMuX29uV2luZG93UmVzaXplLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Ub3VjaCA9IHRoaXMuX29uVG91Y2guYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblBsYXllckFkZCA9IHRoaXMuX29uUGxheWVyQWRkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25QbGF5ZXJMaXN0ID0gdGhpcy5fb25QbGF5ZXJMaXN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25QbGF5ZXJSZW1vdmUgPSB0aGlzLl9vblBsYXllclJlbW92ZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE51bWJlciBieSB3aGljaCB3ZSBtdWx0aXBseSB0aGUgZmluZ2VyUmFkaXVzIGNvbnN0YW50IHRvIGdldCB0aGUgcmFkaXVzXG4gICAqIHZhbHVlIGluIHBpeGVscy5cbiAgICogQHJldHVybiB7TnVtYmVyfSBNaW5pbXVtIG9mIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uIGhlaWdodCBvciB3aWR0aCwgaW5cbiAgICogcGl4ZWxzLlxuICAgKi9cbiAgZ2V0IF9weFJhdGlvKCkge1xuICAgIHJldHVybiBNYXRoLm1pbih0aGlzLl9zcGFjZURpdi5vZmZzZXRIZWlnaHQsIHRoaXMuX3NwYWNlRGl2Lm9mZnNldFdpZHRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIG1vZHVsZS5cbiAgICpcbiAgICogU2V0dXAgbGlzdGVuZXJzIGZvcjpcbiAgICogLSB0aGUgbWVzc2FnZXMgZnJvbSB0aGUgc2VydmVyO1xuICAgKiAtIHRoZSB3aW5kb3cgYCdyZXNpemUnYCBldmVudDtcbiAgICogLSB0aGUgdG91Y2ggZXZlbnRzLlxuICAgKiBEaXNwbGF5IHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uLlxuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIC8vIERpc3BsYXkgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24gaW4gdGhlIHZpZXcgYW5kIGFkYXB0IHRoZSBzaXplXG4gICAgdGhpcy5fc3BhY2UuZGlzcGxheSh0aGlzLl9zZXR1cCwgdGhpcy5fc3BhY2VEaXYsIHsgdHJhbnNmb3JtOiAncm90YXRlMTgwJyB9KTtcbiAgICB0aGlzLl9vbldpbmRvd1Jlc2l6ZSgpO1xuXG4gICAgLy8gU2V0dXAgbGlzdGVuZXJzIGZvciBwbGF5ZXIgY29ubmVjdGlvbnMgLyBkaXNjb25uZWN0aW9uc1xuICAgIGNsaWVudC5yZWNlaXZlKCdwZXJmb3JtYW5jZTpwbGF5ZXJMaXN0JywgdGhpcy5fb25QbGF5ZXJMaXN0KTtcbiAgICBjbGllbnQucmVjZWl2ZSgncGVyZm9ybWFuY2U6cGxheWVyQWRkJywgdGhpcy5fb25QbGF5ZXIpO1xuICAgIGNsaWVudC5yZWNlaXZlKCdwZXJmb3JtYW5jZTpwbGF5ZXJSZW1vdmUnLCB0aGlzLl9vblJlbW92ZVBsYXllcik7XG5cbiAgICAvLyBTZXR1cCB3aW5kb3cgcmVzaXplIGxpc3RlbmVyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX29uV2luZG93UmVzaXplKTtcblxuICAgIC8vIFNldHVwIHRvdWNoIGV2ZW50IGxpc3RlbmVyc1xuICAgIHRoaXMuX3N1cmZhY2UuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fc3VyZmFjZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLl9vblRvdWNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIG1vZHVsZSB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cbiAgICpcbiAgICogUmVtb3ZlIGxpc3RlbmVycyBmb3I6XG4gICAqIC0gdGhlIG1lc3NhZ2VzIGZyb20gdGhlIHNlcnZlcjtcbiAgICogLSB0aGUgd2luZG93IGAncmVzaXplJ2AgZXZlbnQ7XG4gICAqIC0gdGhlIHRvdWNoIGV2ZW50cy5cbiAgICogUmVtb3ZlIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uLlxuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgc3VwZXIucmVzZXQoKTtcblxuICAgIC8vIFJlbW92ZSBsaXN0ZW5lcnMgZm9yIHBsYXllciBjb25uZWN0aW9ucyAvIGRpc2Nvbm5lY3Rpb25zXG4gICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKCdwZXJmb3JtYW5jZTpwbGF5ZXJMaXN0JywgdGhpcy5fb25QbGF5ZXJMaXN0KTtcbiAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoJ3BlcmZvcm1hbmNlOnBsYXllckFkZCcsIHRoaXMuX29uUGxheWVyQWRkKTtcbiAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoJ3BlcmZvcm1hbmNlOnBsYXllclJlbW92ZScsIHRoaXMuX29uUGxheWVyUmVtb3ZlKTtcblxuICAgIC8vIFJlbW92ZSB3aW5kb3cgcmVzaXplIGxpc3RlbmVyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX29uV2luZG93UmVzaXplKTtcblxuICAgIC8vIFJlbW92ZSB0b3VjaCBldmVudCBsaXN0ZW5lcnNcbiAgICB0aGlzLl9zdXJmYWNlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9vblRvdWNoKTtcbiAgICB0aGlzLl9zdXJmYWNlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX3N1cmZhY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9vblRvdWNoKTtcbiAgICB0aGlzLl9zdXJmYWNlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5fb25Ub3VjaCk7XG5cbiAgICAvLyBSZW1vdmUgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24gZnJvbSB0aGUgdmlld1xuICAgIHRoaXMudmlldy5pbm5lckhUTUwgPSAnJztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBwbGF5ZXIgdG8gdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbGF5ZXIgUGxheWVyLlxuICAgKi9cbiAgX29uUGxheWVyQWRkKHBsYXllcikge1xuICAgIHRoaXMuX3NwYWNlLmFkZFBvc2l0aW9uKHBsYXllciwgMTApO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXkgYWxsIHRoZSBwbGF5ZXJzIGZyb20gYSBsaXN0IGluIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uLlxuICAgKiBAcGFyYW0ge09iamVjdFtdfSBwbGF5ZXJMaXN0IExpc3Qgb2YgcGxheWVycy5cbiAgICovXG4gIF9vblBsYXllckxpc3QocGxheWVyTGlzdCkge1xuICAgIHRoaXMuX3NwYWNlLmRpc3BsYXlQb3NpdGlvbnMocGxheWVyTGlzdCwgMTApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIHBsYXllciBmcm9tIHRoZSBzcGFjZSB2aXN1YWxpemF0aW9uLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGxheWVyIFBsYXllci5cbiAgICovXG4gIF9vblBsYXllclJlbW92ZShwbGF5ZXIpIHtcbiAgICB0aGlzLl9zcGFjZS5yZW1vdmVQb3NpdGlvbihwbGF5ZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvdWNoIGV2ZW50IGhhbmRsZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IGUgVG91Y2ggZXZlbnQuXG4gICAqL1xuICBfb25Ub3VjaChlKSB7XG4gICAgLy8gUHJldmVudCBzY3JvbGxpbmdcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyBBIGZldyBjb25zdGFudHNcbiAgICBjb25zdCB0eXBlID0gZS50eXBlO1xuICAgIGNvbnN0IGNoYW5nZWRUb3VjaGVzID0gZS5jaGFuZ2VkVG91Y2hlcztcblxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgY2hhbmdlZFRvdWNoZXMgYXJyYXlcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBSZXRyaWV2ZSB0b3VjaCBkYXRhXG4gICAgICBsZXQgY29vcmRpbmF0ZXMgPSBbY2hhbmdlZFRvdWNoZXNbaV0uY2xpZW50WCwgY2hhbmdlZFRvdWNoZXNbaV0uY2xpZW50WV07XG4gICAgICBsZXQgaWRlbnRpZmllciA9IGNoYW5nZWRUb3VjaGVzW2ldLmlkZW50aWZpZXI7XG4gICAgICBsZXQgdG91Y2ggPSB7IGlkOiBpZGVudGlmaWVyLCBjb29yZGluYXRlczogY29vcmRpbmF0ZXMgfTtcblxuICAgICAgLy8gQ2FsY3VsYXRlIG5vcm1hbGl6ZWQgdG91Y2ggcG9zaXRpb24gaW4gdGhlIHN1cmZhY2UncyByZWZlcmVudGlhbFxuICAgICAgLy8gKFdlIG11bHRpcGx5IGJ5IC0xIGJlY2F1c2UgdGhlIHN1cmZhY2UgaXMgcm90YXRlZCBieSAxODDCsCBvbiB0aGVcbiAgICAgIC8vIHNvbG9pc3QgZGlzcGxheSlcbiAgICAgIGxldCB4ID0gLShjb29yZGluYXRlc1swXSAtXG4gICAgICAgICAgICAgICAgdGhpcy5fc3BhY2VEaXYub2Zmc2V0TGVmdCAtXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0dXAuc3ZnT2Zmc2V0TGVmdCApIC8gdGhpcy5fc2V0dXAuc3ZnV2lkdGg7XG4gICAgICBsZXQgeSA9IC0oY29vcmRpbmF0ZXNbMV0gLVxuICAgICAgICAgICAgICAgIHRoaXMuX3NwYWNlRGl2Lm9mZnNldFRvcCAtXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0dXAuc3ZnT2Zmc2V0VG9wKSAvIHRoaXMuX3NldHVwLnN2Z0hlaWdodDtcblxuICAgICAgLy8gRGVwZW5kaW5nIG9uIHRoZSBldmVudCB0eXBl4oCmXG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgLy8gYCd0b3VjaHN0YXJ0J2A6XG4gICAgICAgIC8vIC0gYWRkIHRoZSB0b3VjaCBjb29yZGluYXRlcyB0byB0aGUgZGljdGlvbmFyeSBgdGhpcy5fdG91Y2hlc2BcbiAgICAgICAgLy8gLSBjcmVhdGUgYSBgZGl2YCB1bmRlciB0aGUgZmluZ2VyXG4gICAgICAgIGNhc2UgJ3RvdWNoc3RhcnQnOlxuICAgICAgICAgIHRoaXMuX3RvdWNoZXNbaWRlbnRpZmllcl0gPSBbeCwgeV07XG4gICAgICAgICAgdGhpcy5fY3JlYXRlRmluZ2VyRGl2KGlkZW50aWZpZXIsIGNvb3JkaW5hdGVzKTtcbiAgICAgICAgICBjbGllbnQuc2VuZCgnc29sb2lzdDpwZXJmb3JtYW5jZTp0b3VjaHN0YXJ0JywgdG91Y2gpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8vIGAndG91Y2htb3ZlJ2A6XG4gICAgICAgIC8vIC0gYWRkIG9yIHVwZGF0ZSB0aGUgdG91Y2ggY29vcmRpbmF0ZXMgdG8gdGhlIGRpY3Rpb25hcnlcbiAgICAgICAgLy8gICAgIGB0aGlzLl90b3VjaGVzYFxuICAgICAgICAvLyAtIG1vdmUgdGhlIGBkaXZgIHVuZGVyIHRoZSBmaW5nZXIgb3IgY3JlYXRlIG9uZSBpZiBpdCBkb2Vzbid0IGV4aXN0XG4gICAgICAgIC8vICAgYWxyZWFkeSAobWF5IGhhcHBlbiBpZiB0aGUgZmluZ2VyIHNsaWRlcyBmcm9tIHRoZSBlZGdlIG9mIHRoZVxuICAgICAgICAvLyAgIHRvdWNoc2NyZWVuKVxuICAgICAgICBjYXNlICd0b3VjaG1vdmUnOiB7XG4gICAgICAgICAgdGhpcy5fdG91Y2hlc1tpZGVudGlmaWVyXSA9IFt4LCB5XTtcbiAgICAgICAgICBpZiAodGhpcy5fZmluZ2VyRGl2c1tpZGVudGlmaWVyXSlcbiAgICAgICAgICAgIHRoaXMuX21vdmVGaW5nZXJEaXYoaWRlbnRpZmllciwgY29vcmRpbmF0ZXMpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUZpbmdlckRpdihpZGVudGlmaWVyLCBjb29yZGluYXRlcyk7XG4gICAgICAgICAgY2xpZW50LnNlbmQoJ3NvbG9pc3Q6dG91Y2htb3ZlJywgdG91Y2gpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYCd0b3VjaGVuZCdgOlxuICAgICAgICAvLyAtIGRlbGV0ZSB0aGUgdG91Y2ggaW4gdGhlIGRpY3Rpb25hcnkgYHRoaXMuX3RvdWNoZXNgXG4gICAgICAgIC8vIC0gcmVtb3ZlIHRoZSBjb3JyZXNwb25kaW5nIGBkaXZgXG4gICAgICAgIGNhc2UgJ3RvdWNoZW5kJzoge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl90b3VjaGVzW2lkZW50aWZpZXJdO1xuICAgICAgICAgIGlmICh0aGlzLl9maW5nZXJEaXZzW2lkZW50aWZpZXJdKVxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRmluZ2VyRGl2KGlkZW50aWZpZXIpO1xuICAgICAgICAgIGNsaWVudC5zZW5kKCdzb2xvaXN0OnRvdWNoZW5kb3JjYW5jZWwnLCB0b3VjaCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBgJ3RvdWNoY2FuY2VsJ2A6IHNpbWlsYXIgdG8gYCd0b3VjaGVuZCdgXG4gICAgICAgIGNhc2UgJ3RvdWNoY2FuY2VsJzoge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl90b3VjaGVzW2lkZW50aWZpZXJdO1xuICAgICAgICAgIGlmICh0aGlzLl9maW5nZXJEaXZzW2lkZW50aWZpZXJdKVxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRmluZ2VyRGl2KGlkZW50aWZpZXIpO1xuICAgICAgICAgIGNsaWVudC5zZW5kKCdzb2xvaXN0OnRvdWNoZW5kb3JjYW5jZWwnLCB0b3VjaCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2luZG93IHJlc2l6ZSBoYW5kbGVyLlxuICAgKiBSZWRyYXcgdGhlIHNwYWNlIHZpc3VhbGl6YXRpb24gdG8gZml0IHRoZSB3aW5kb3cgb3Igc2NyZWVuIHNpemUuXG4gICAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxuICAgKi9cbiAgX29uV2luZG93UmVzaXplKCkge1xuICAgIGNvbnN0IGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBjb25zdCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXG4gICAgaWYgKHdpZHRoID4gaGVpZ2h0KSB7XG4gICAgICB0aGlzLl9zcGFjZURpdi5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuICAgICAgdGhpcy5fc3BhY2VEaXYuc3R5bGUud2lkdGggPSBgJHtoZWlnaHR9cHhgO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zcGFjZURpdi5zdHlsZS5oZWlnaHQgPSBgJHt3aWR0aH1weGA7XG4gICAgICB0aGlzLl9zcGFjZURpdi5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICB9XG5cbiAgICB0aGlzLl9zcGFjZS5yZXNpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBmaW5nZXIgYGRpdmAgYW5kIGFwcGVuZCBpdCB0byB0aGUgRE9NIChhcyBhIGNoaWxkIG9mIHRoZSBgdmlld2ApLlxuICAgKiBAcGFyYW0ge051bWJlcn0gaWQgSWRlbnRpZmllciBvZiB0aGUgYGRpdmAgKGNvbWVzIGZyb20gdGhlIHRvdWNoXG4gICAqIGlkZW50aWZpZXIpLlxuICAgKiBAcGFyYW0ge051bWJlcltdfSBjb29yZGluYXRlcyBDb29yZGluYXRlcyBvZiB0aGUgYGRpdmAgKGNvbWVzIGZyb20gdGhlXG4gICAqIHRvdWNoIGNvb3JkaW5hdGVzLCBhcyBhIGBbeDpOdW1iZXIsIHk6TnVtYmVyXWAgYXJyYXkpLlxuICAgKi9cbiAgX2NyZWF0ZUZpbmdlckRpdihpZCwgY29vcmRpbmF0ZXMpIHtcbiAgICAvLyBDYWxjdWxhdGUgdGhlIHJhZGl1cyBpbiBwaXhlbHNcbiAgICBjb25zdCByYWRpdXMgPSBmaW5nZXJSYWRpdXMgKiB0aGlzLl9weFJhdGlvO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBjb29yZGluYXRlcyBvZiB0aGUgZmluZ2VyIGBkaXZgXG4gICAgY29uc3QgeE9mZnNldCA9IGNvb3JkaW5hdGVzWzBdIC0gcmFkaXVzO1xuICAgIGNvbnN0IHlPZmZzZXQgPSBjb29yZGluYXRlc1sxXSAtIHJhZGl1cztcblxuICAgIC8vIENyZWF0ZSB0aGUgSFRNTCBlbGVtZW50XG4gICAgbGV0IGZpbmdlckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGZpbmdlckRpdi5jbGFzc0xpc3QuYWRkKCdmaW5nZXInKTtcbiAgICBmaW5nZXJEaXYuc3R5bGUuaGVpZ2h0ID0gYCR7MiAqIHJhZGl1c31weGA7XG4gICAgZmluZ2VyRGl2LnN0eWxlLndpZHRoID0gYCR7MiAqIHJhZGl1c31weGA7XG4gICAgZmluZ2VyRGl2LnN0eWxlLmxlZnQgPSBgJHt4T2Zmc2V0fXB4YDtcbiAgICBmaW5nZXJEaXYuc3R5bGUudG9wID0gYCR7eU9mZnNldH1weGA7XG5cbiAgICB0aGlzLl9maW5nZXJEaXZzW2lkXSA9IGZpbmdlckRpdjtcbiAgICB0aGlzLl9zcGFjZURpdi5pbnNlcnRCZWZvcmUoZmluZ2VyRGl2LCB0aGlzLl9zcGFjZURpdi5maXJzdENoaWxkLm5leHRTaWJsaW5nKTtcblxuICAgIC8vIFRpbWVvdXRcbiAgICB0aGlzLl9maW5nZXJEaXZUaW1lb3V0c1tpZF0gPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3JlbW92ZUZpbmdlckRpdihpZCk7XG4gICAgfSwgdGltZW91dExlbmd0aCAqIDEwMDApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgYSBmaW5nZXIgYGRpdmAuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZCBJZGVudGlmaWVyIG9mIHRoZSBgZGl2YC5cbiAgICogQHBhcmFtIHtOdW1iZXJbXX0gY29vcmRpbmF0ZXMgQ29vcmRpbmF0ZXMgb2YgdGhlIGBkaXZgIChhcyBhIGBbeDpOdW1iZXIsXG4gICAqIHk6TnVtYmVyXWAgYXJyYXkpLlxuICAgKi9cbiAgX21vdmVGaW5nZXJEaXYoaWQsIGNvb3JkaW5hdGVzKSB7XG4gICAgLy8gQ2FsY3VsYXRlIHRoZSByYWRpdXMgaW4gcGl4ZWxzXG4gICAgY29uc3QgcmFkaXVzID0gZmluZ2VyUmFkaXVzICogdGhpcy5fcHhSYXRpbztcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgY29vcmRpbmF0ZXMgb2YgdGhlIGZpbmdlciBgZGl2YFxuICAgIGNvbnN0IHhPZmZzZXQgPSBjb29yZGluYXRlc1swXSAtIHJhZGl1cztcbiAgICBjb25zdCB5T2Zmc2V0ID0gY29vcmRpbmF0ZXNbMV0gLSByYWRpdXM7XG5cbiAgICAvLyBNb3ZlIHRoZSBmaW5nZXIgYGRpdmBcbiAgICBsZXQgZmluZ2VyRGl2ID0gdGhpcy5fZmluZ2VyRGl2c1tpZF07XG4gICAgZmluZ2VyRGl2LnN0eWxlLmxlZnQgPSBgJHt4T2Zmc2V0fXB4YDtcbiAgICBmaW5nZXJEaXYuc3R5bGUudG9wID0gYCR7eU9mZnNldH1weGA7XG5cbiAgICAvLyBUaW1lb3V0XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2ZpbmdlckRpdlRpbWVvdXRzW2lkXSk7XG4gICAgdGhpcy5fZmluZ2VyRGl2VGltZW91dHNbaWRdID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9yZW1vdmVGaW5nZXJEaXYoaWQpO1xuICAgIH0sIHRpbWVvdXRMZW5ndGggKiAxMDAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGVzIGEgZmluZ2VyIGRpdiBmcm9tIHRoZSBET00uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZCBJZGVudGlmaWVyIG9mIHRoZSBgZGl2YC5cbiAgICovXG4gIF9yZW1vdmVGaW5nZXJEaXYoaWQpIHtcbiAgICAvLyBSZW1vdmUgdGhlIGZpbmdlciBgZGl2IGZyb20gdGhlIERPTSBhbmQgdGhlIGRpY3Rpb25hcnlcbiAgICB0aGlzLl9zcGFjZURpdi5yZW1vdmVDaGlsZCh0aGlzLl9maW5nZXJEaXZzW2lkXSk7XG4gICAgZGVsZXRlIHRoaXMuX2ZpbmdlckRpdnNbaWRdO1xuXG4gICAgLy8gVGltZW91dFxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9maW5nZXJEaXZUaW1lb3V0c1tpZF0pO1xuICAgIGRlbGV0ZSB0aGlzLl9maW5nZXJEaXZUaW1lb3V0c1tpZF07XG4gIH1cbn1cbiJdfQ==