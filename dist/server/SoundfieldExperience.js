'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

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

var _server = require('soundworks/server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The `SoundfieldExperience` makes the connection between the `soloist`
 * and the `player` client types.
 * More specifically, the module listens for messages containing the touch
 * coordinates from the `soloist` clients, calculates the distances from the
 * touch to every `player`, and sends a `play` or `stop`
 * message to the relevant `player` clients.
 */
var SoundfieldExperience = function (_Experience) {
  (0, _inherits3.default)(SoundfieldExperience, _Experience);

  /**
   * @param {Array} clientTypes - The client types the experience should be binded.
   */
  function SoundfieldExperience(clientTypes) {
    (0, _classCallCheck3.default)(this, SoundfieldExperience);

    /**
     * List of the connected players along with their formatted informations.
     * @type {Map<Object, Object>}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (SoundfieldExperience.__proto__ || (0, _getPrototypeOf2.default)(SoundfieldExperience)).call(this, clientTypes));

    _this.players = new _map2.default();

    /**
     * List of the currently active players.
     * @type {Set}
     */
    _this.activePlayers = new _set2.default();

    // the `shared-config` service is used by the `soloist` clients to get
    // informations from the server configuration
    _this.sharedConfig = _this.require('shared-config');
    // this instruction adds the sharing of the `setup` entry of the server
    // configuration as a requirement for `soloist`
    _this.sharedConfig.share('setup', 'soloist');

    // the `locator` service is required by the `player` clients to get their
    // approximative position into the defined area
    _this.locator = _this.require('locator');
    return _this;
  }

  /**
   * Function called whenever a client enters its `Experience`. When called, the
   * given `client` can be assumed to be fully configured.
   * @param {Client} client
   */


  (0, _createClass3.default)(SoundfieldExperience, [{
    key: 'enter',
    value: function enter(client) {
      (0, _get3.default)(SoundfieldExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(SoundfieldExperience.prototype), 'enter', this).call(this, client);

      // define what to do ccording to the `client` type (i.e. `player` or `soloist`)
      switch (client.type) {
        case 'soloist':
          this.onSoloistEnter(client);
          break;
        case 'player':
          this.onPlayerEnter(client);
          break;
      }
    }

    /**
     * Function called whenever a client exists its `Experience`.
     */

  }, {
    key: 'exit',
    value: function exit(client) {
      if (client.type === 'player') this.onPlayerExit(client);
    }

    /**
     * Specific `enter` routine for clients of type `soloist`.
     */

  }, {
    key: 'onSoloistEnter',
    value: function onSoloistEnter(client) {
      var _this2 = this;

      // send the list of connected players
      var playerInfos = (0, _from2.default)(this.players.values());
      this.send(client, 'player:list', playerInfos);

      // listen touch inputs from the `soloist` client
      this.receive(client, 'input:change', function (radius, coordinates) {
        _this2.onInputChange(radius, coordinates);
      });
    }

    /**
     * Specific `enter` routine for clients of type `player`.
     */

  }, {
    key: 'onPlayerEnter',
    value: function onPlayerEnter(client) {
      // format infos from the player to be consmumed by the solist
      var infos = this.formatClientInformations(client);
      // keep track of the informations
      this.players.set(client, infos);
      // send the informations of the new client to all the connected soloists
      this.broadcast('soloist', null, 'player:add', infos);
    }

    /**
     * Specific `exit` routine for clients of type `player`.
     */

  }, {
    key: 'onPlayerExit',
    value: function onPlayerExit(client) {
      // retrieve stored informations from the client
      var infos = this.players.get(client);
      // delete it from the stack of client `player`
      this.players.delete(client);
      // send the informations of the exited client to all the connected soloists
      this.broadcast('soloist', null, 'player:remove', infos);
    }

    /**
     * Format informations the given player in order to be simply comsumed by soloists.
     * @param {Client} client - The client object.
     * @return {Object}
     * @property {Number} id - Unique id of the client.
     * @property {Array<Number>} coordinates - Coordinates of the client.
     */

  }, {
    key: 'formatClientInformations',
    value: function formatClientInformations(client) {
      return {
        id: client.uuid,
        x: client.coordinates[0],
        y: client.coordinates[1]
      };
    }

    /**
     * This method is called whenever a `soloist` client send the coordinates of
     * its touches on the screen.
     * @param {Number} radius - The radius of the excited zone as defined in the
     *  client-side `SoloistExperience`.
     * @param {Array<Array<Number>>} - List of the coordinates (relative to the
     *  `area`) of the touch events.
     */

  }, {
    key: 'onInputChange',
    value: function onInputChange(radius, coordinates) {
      var _this3 = this;

      var sqrRadius = radius * radius;
      var activePlayers = this.activePlayers;
      var players = new _set2.default(this.players.keys());

      // if coordinates are empty, stop all players, else defines if a client
      // should be sent a `start` or `stop` message according to its previous
      // state and if it is or not in an zone that is excited by the soloist
      if ((0, _keys2.default)(coordinates).length === 0) {
        activePlayers.forEach(function (player) {
          return _this3.send(player, 'stop');
        });
        activePlayers.clear();
      } else {
        players.forEach(function (player) {
          var inArea = false;
          var isActive = activePlayers.has(player);

          for (var id in coordinates) {
            var center = coordinates[id];
            inArea = inArea || _this3.inArea(player.coordinates, center, sqrRadius);

            if (inArea) {
              if (!isActive) {
                _this3.send(player, 'start');
                activePlayers.add(player);
              }

              break;
            }
          }

          if (isActive && !inArea) {
            _this3.send(player, 'stop');
            activePlayers.delete(player);
          }
        });
      }
    }

    /**
     * Defines if `point` is inside the circle defined by `center` and `sqrRadius`.
     * The computation is done in squared space in order to save square root
     * computation on each call.
     * @param {Array<Number>} point - The x, y coordinates of the point to be tested.
     * @param {Array<Number>} center - The x, y coordinates of center of the circle.
     * @param {Number} sqrRadius - The squared radius of the circle.
     * @return {Boolean} - `true` if point is in the circle, `false` otherwise.
     */

  }, {
    key: 'inArea',
    value: function inArea(point, center, sqrRadius) {
      var x = point[0] - center[0];
      var y = point[1] - center[1];
      var sqrDistance = x * x + y * y;

      return sqrDistance < sqrRadius;
    }
  }]);
  return SoundfieldExperience;
}(_server.Experience);

exports.default = SoundfieldExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNvdW5kZmllbGRFeHBlcmllbmNlLmpzIl0sIm5hbWVzIjpbIlNvdW5kZmllbGRFeHBlcmllbmNlIiwiY2xpZW50VHlwZXMiLCJwbGF5ZXJzIiwiYWN0aXZlUGxheWVycyIsInNoYXJlZENvbmZpZyIsInJlcXVpcmUiLCJzaGFyZSIsImxvY2F0b3IiLCJjbGllbnQiLCJ0eXBlIiwib25Tb2xvaXN0RW50ZXIiLCJvblBsYXllckVudGVyIiwib25QbGF5ZXJFeGl0IiwicGxheWVySW5mb3MiLCJ2YWx1ZXMiLCJzZW5kIiwicmVjZWl2ZSIsInJhZGl1cyIsImNvb3JkaW5hdGVzIiwib25JbnB1dENoYW5nZSIsImluZm9zIiwiZm9ybWF0Q2xpZW50SW5mb3JtYXRpb25zIiwic2V0IiwiYnJvYWRjYXN0IiwiZ2V0IiwiZGVsZXRlIiwiaWQiLCJ1dWlkIiwieCIsInkiLCJzcXJSYWRpdXMiLCJrZXlzIiwibGVuZ3RoIiwiZm9yRWFjaCIsInBsYXllciIsImNsZWFyIiwiaW5BcmVhIiwiaXNBY3RpdmUiLCJoYXMiLCJjZW50ZXIiLCJhZGQiLCJwb2ludCIsInNxckRpc3RhbmNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFHQTs7Ozs7Ozs7SUFRcUJBLG9COzs7QUFDbkI7OztBQUdBLGdDQUFZQyxXQUFaLEVBQXlCO0FBQUE7O0FBR3ZCOzs7O0FBSHVCLGtLQUNqQkEsV0FEaUI7O0FBT3ZCLFVBQUtDLE9BQUwsR0FBZSxtQkFBZjs7QUFFQTs7OztBQUlBLFVBQUtDLGFBQUwsR0FBcUIsbUJBQXJCOztBQUVBO0FBQ0E7QUFDQSxVQUFLQyxZQUFMLEdBQW9CLE1BQUtDLE9BQUwsQ0FBYSxlQUFiLENBQXBCO0FBQ0E7QUFDQTtBQUNBLFVBQUtELFlBQUwsQ0FBa0JFLEtBQWxCLENBQXdCLE9BQXhCLEVBQWlDLFNBQWpDOztBQUVBO0FBQ0E7QUFDQSxVQUFLQyxPQUFMLEdBQWUsTUFBS0Ys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Qjs7QUFFQSxnQkFBSU0sTUFBSixFQUFZO0FBQ1Ysa0JBQUksQ0FBQ0MsUUFBTCxFQUFlO0FBQ2IsdUJBQUt0QixJQUFMLENBQVVtQixNQUFWLEVBQWtCLE9BQWxCO0FBQ0EvQiw4QkFBY3FDLEdBQWQsQ0FBa0JOLE1BQWxCO0FBQ0Q7O0FBRUQ7QUFDRDtBQUNGOztBQUVELGNBQUlHLFlBQVksQ0FBQ0QsTUFBakIsRUFBeUI7QUFDdkIsbUJBQUtyQixJQUFMLENBQVVtQixNQUFWLEVBQWtCLE1BQWxCO0FBQ0EvQiwwQkFBY3NCLE1BQWQsQ0FBcUJTLE1BQXJCO0FBQ0Q7QUFDRixTQXRCRDtBQXVCRDtBQUNGOztBQUVEOzs7Ozs7Ozs7Ozs7MkJBU09PLEssRUFBT0YsTSxFQUFRVCxTLEVBQVc7QUFDL0IsVUFBTUYsSUFBSWEsTUFBTSxDQUFOLElBQVdGLE9BQU8sQ0FBUCxDQUFyQjtBQUNBLFVBQU1WLElBQUlZLE1BQU0sQ0FBTixJQUFXRixPQUFPLENBQVAsQ0FBckI7QUFDQSxVQUFNRyxjQUFjZCxJQUFJQSxDQUFKLEdBQVFDLElBQUlBLENBQWhDOztBQUVBLGFBQU9hLGNBQWNaLFNBQXJCO0FBQ0Q7Ozs7O2tCQTVLa0I5QixvQiIsImZpbGUiOiJTb3VuZGZpZWxkRXhwZXJpZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV4cGVyaWVuY2UgfSBmcm9tICdzb3VuZHdvcmtzL3NlcnZlcic7XG5cblxuLyoqXG4gKiBUaGUgYFNvdW5kZmllbGRFeHBlcmllbmNlYCBtYWtlcyB0aGUgY29ubmVjdGlvbiBiZXR3ZWVuIHRoZSBgc29sb2lzdGBcbiAqIGFuZCB0aGUgYHBsYXllcmAgY2xpZW50IHR5cGVzLlxuICogTW9yZSBzcGVjaWZpY2FsbHksIHRoZSBtb2R1bGUgbGlzdGVucyBmb3IgbWVzc2FnZXMgY29udGFpbmluZyB0aGUgdG91Y2hcbiAqIGNvb3JkaW5hdGVzIGZyb20gdGhlIGBzb2xvaXN0YCBjbGllbnRzLCBjYWxjdWxhdGVzIHRoZSBkaXN0YW5jZXMgZnJvbSB0aGVcbiAqIHRvdWNoIHRvIGV2ZXJ5IGBwbGF5ZXJgLCBhbmQgc2VuZHMgYSBgcGxheWAgb3IgYHN0b3BgXG4gKiBtZXNzYWdlIHRvIHRoZSByZWxldmFudCBgcGxheWVyYCBjbGllbnRzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb3VuZGZpZWxkRXhwZXJpZW5jZSBleHRlbmRzIEV4cGVyaWVuY2Uge1xuICAvKipcbiAgICogQHBhcmFtIHtBcnJheX0gY2xpZW50VHlwZXMgLSBUaGUgY2xpZW50IHR5cGVzIHRoZSBleHBlcmllbmNlIHNob3VsZCBiZSBiaW5kZWQuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihjbGllbnRUeXBlcykge1xuICAgIHN1cGVyKGNsaWVudFR5cGVzKTtcblxuICAgIC8qKlxuICAgICAqIExpc3Qgb2YgdGhlIGNvbm5lY3RlZCBwbGF5ZXJzIGFsb25nIHdpdGggdGhlaXIgZm9ybWF0dGVkIGluZm9ybWF0aW9ucy5cbiAgICAgKiBAdHlwZSB7TWFwPE9iamVjdCwgT2JqZWN0Pn1cbiAgICAgKi9cbiAgICB0aGlzLnBsYXllcnMgPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIHRoZSBjdXJyZW50bHkgYWN0aXZlIHBsYXllcnMuXG4gICAgICogQHR5cGUge1NldH1cbiAgICAgKi9cbiAgICB0aGlzLmFjdGl2ZVBsYXllcnMgPSBuZXcgU2V0KCk7XG5cbiAgICAvLyB0aGUgYHNoYXJlZC1jb25maWdgIHNlcnZpY2UgaXMgdXNlZCBieSB0aGUgYHNvbG9pc3RgIGNsaWVudHMgdG8gZ2V0XG4gICAgLy8gaW5mb3JtYXRpb25zIGZyb20gdGhlIHNlcnZlciBjb25maWd1cmF0aW9uXG4gICAgdGhpcy5zaGFyZWRDb25maWcgPSB0aGlzLnJlcXVpcmUoJ3NoYXJlZC1jb25maWcnKTtcbiAgICAvLyB0aGlzIGluc3RydWN0aW9uIGFkZHMgdGhlIHNoYXJpbmcgb2YgdGhlIGBzZXR1cGAgZW50cnkgb2YgdGhlIHNlcnZlclxuICAgIC8vIGNvbmZpZ3VyYXRpb24gYXMgYSByZXF1aXJlbWVudCBmb3IgYHNvbG9pc3RgXG4gICAgdGhpcy5zaGFyZWRDb25maWcuc2hhcmUoJ3NldHVwJywgJ3NvbG9pc3QnKTtcblxuICAgIC8vIHRoZSBgbG9jYXRvcmAgc2VydmljZSBpcyByZXF1aXJlZCBieSB0aGUgYHBsYXllcmAgY2xpZW50cyB0byBnZXQgdGhlaXJcbiAgICAvLyBhcHByb3hpbWF0aXZlIHBvc2l0aW9uIGludG8gdGhlIGRlZmluZWQgYXJlYVxuICAgIHRoaXMubG9jYXRvciA9IHRoaXMucmVxdWlyZSgnbG9jYXRvcicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGNhbGxlZCB3aGVuZXZlciBhIGNsaWVudCBlbnRlcnMgaXRzIGBFeHBlcmllbmNlYC4gV2hlbiBjYWxsZWQsIHRoZVxuICAgKiBnaXZlbiBgY2xpZW50YCBjYW4gYmUgYXNzdW1lZCB0byBiZSBmdWxseSBjb25maWd1cmVkLlxuICAgKiBAcGFyYW0ge0NsaWVudH0gY2xpZW50XG4gICAqL1xuICBlbnRlcihjbGllbnQpIHtcbiAgICBzdXBlci5lbnRlcihjbGllbnQpO1xuXG4gICAgLy8gZGVmaW5lIHdoYXQgdG8gZG8gY2NvcmRpbmcgdG8gdGhlIGBjbGllbnRgIHR5cGUgKGkuZS4gYHBsYXllcmAgb3IgYHNvbG9pc3RgKVxuICAgIHN3aXRjaCAoY2xpZW50LnR5cGUpIHtcbiAgICAgIGNhc2UgJ3NvbG9pc3QnOlxuICAgICAgICB0aGlzLm9uU29sb2lzdEVudGVyKGNsaWVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncGxheWVyJzpcbiAgICAgICAgdGhpcy5vblBsYXllckVudGVyKGNsaWVudCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiBjYWxsZWQgd2hlbmV2ZXIgYSBjbGllbnQgZXhpc3RzIGl0cyBgRXhwZXJpZW5jZWAuXG4gICAqL1xuICBleGl0KGNsaWVudCkge1xuICAgIGlmIChjbGllbnQudHlwZSA9PT0gJ3BsYXllcicpXG4gICAgICB0aGlzLm9uUGxheWVyRXhpdChjbGllbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNwZWNpZmljIGBlbnRlcmAgcm91dGluZSBmb3IgY2xpZW50cyBvZiB0eXBlIGBzb2xvaXN0YC5cbiAgICovXG4gIG9uU29sb2lzdEVudGVyKGNsaWVudCkge1xuICAgIC8vIHNlbmQgdGhlIGxpc3Qgb2YgY29ubmVjdGVkIHBsYXllcnNcbiAgICBjb25zdCBwbGF5ZXJJbmZvcyA9IEFycmF5LmZyb20odGhpcy5wbGF5ZXJzLnZhbHVlcygpKVxuICAgIHRoaXMuc2VuZChjbGllbnQsICdwbGF5ZXI6bGlzdCcsIHBsYXllckluZm9zKTtcblxuICAgIC8vIGxpc3RlbiB0b3VjaCBpbnB1dHMgZnJvbSB0aGUgYHNvbG9pc3RgIGNsaWVudFxuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdpbnB1dDpjaGFuZ2UnLCAocmFkaXVzLCBjb29yZGluYXRlcykgPT4ge1xuICAgICAgdGhpcy5vbklucHV0Q2hhbmdlKHJhZGl1cywgY29vcmRpbmF0ZXMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNwZWNpZmljIGBlbnRlcmAgcm91dGluZSBmb3IgY2xpZW50cyBvZiB0eXBlIGBwbGF5ZXJgLlxuICAgKi9cbiAgb25QbGF5ZXJFbnRlcihjbGllbnQpIHtcbiAgICAvLyBmb3JtYXQgaW5mb3MgZnJvbSB0aGUgcGxheWVyIHRvIGJlIGNvbnNtdW1lZCBieSB0aGUgc29saXN0XG4gICAgY29uc3QgaW5mb3MgPSB0aGlzLmZvcm1hdENsaWVudEluZm9ybWF0aW9ucyhjbGllbnQpO1xuICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIGluZm9ybWF0aW9uc1xuICAgIHRoaXMucGxheWVycy5zZXQoY2xpZW50LCBpbmZvcyk7XG4gICAgLy8gc2VuZCB0aGUgaW5mb3JtYXRpb25zIG9mIHRoZSBuZXcgY2xpZW50IHRvIGFsbCB0aGUgY29ubmVjdGVkIHNvbG9pc3RzXG4gICAgdGhpcy5icm9hZGNhc3QoJ3NvbG9pc3QnLCBudWxsLCAncGxheWVyOmFkZCcsIGluZm9zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTcGVjaWZpYyBgZXhpdGAgcm91dGluZSBmb3IgY2xpZW50cyBvZiB0eXBlIGBwbGF5ZXJgLlxuICAgKi9cbiAgb25QbGF5ZXJFeGl0KGNsaWVudCkge1xuICAgIC8vIHJldHJpZXZlIHN0b3JlZCBpbmZvcm1hdGlvbnMgZnJvbSB0aGUgY2xpZW50XG4gICAgY29uc3QgaW5mb3MgPSB0aGlzLnBsYXllcnMuZ2V0KGNsaWVudCk7XG4gICAgLy8gZGVsZXRlIGl0IGZyb20gdGhlIHN0YWNrIG9mIGNsaWVudCBgcGxheWVyYFxuICAgIHRoaXMucGxheWVycy5kZWxldGUoY2xpZW50KTtcbiAgICAvLyBzZW5kIHRoZSBpbmZvcm1hdGlvbnMgb2YgdGhlIGV4aXRlZCBjbGllbnQgdG8gYWxsIHRoZSBjb25uZWN0ZWQgc29sb2lzdHNcbiAgICB0aGlzLmJyb2FkY2FzdCgnc29sb2lzdCcsIG51bGwsICdwbGF5ZXI6cmVtb3ZlJywgaW5mb3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcm1hdCBpbmZvcm1hdGlvbnMgdGhlIGdpdmVuIHBsYXllciBpbiBvcmRlciB0byBiZSBzaW1wbHkgY29tc3VtZWQgYnkgc29sb2lzdHMuXG4gICAqIEBwYXJhbSB7Q2xpZW50fSBjbGllbnQgLSBUaGUgY2xpZW50IG9iamVjdC5cbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKiBAcHJvcGVydHkge051bWJlcn0gaWQgLSBVbmlxdWUgaWQgb2YgdGhlIGNsaWVudC5cbiAgICogQHByb3BlcnR5IHtBcnJheTxOdW1iZXI+fSBjb29yZGluYXRlcyAtIENvb3JkaW5hdGVzIG9mIHRoZSBjbGllbnQuXG4gICAqL1xuICBmb3JtYXRDbGllbnRJbmZvcm1hdGlvbnMoY2xpZW50KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBjbGllbnQudXVpZCxcbiAgICAgIHg6IGNsaWVudC5jb29yZGluYXRlc1swXSxcbiAgICAgIHk6IGNsaWVudC5jb29yZGluYXRlc1sxXSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCB3aGVuZXZlciBhIGBzb2xvaXN0YCBjbGllbnQgc2VuZCB0aGUgY29vcmRpbmF0ZXMgb2ZcbiAgICogaXRzIHRvdWNoZXMgb24gdGhlIHNjcmVlbi5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHJhZGl1cyAtIFRoZSByYWRpdXMgb2YgdGhlIGV4Y2l0ZWQgem9uZSBhcyBkZWZpbmVkIGluIHRoZVxuICAgKiAgY2xpZW50LXNpZGUgYFNvbG9pc3RFeHBlcmllbmNlYC5cbiAgICogQHBhcmFtIHtBcnJheTxBcnJheTxOdW1iZXI+Pn0gLSBMaXN0IG9mIHRoZSBjb29yZGluYXRlcyAocmVsYXRpdmUgdG8gdGhlXG4gICAqICBgYXJlYWApIG9mIHRoZSB0b3VjaCBldmVudHMuXG4gICAqL1xuICBvbklucHV0Q2hhbmdlKHJhZGl1cywgY29vcmRpbmF0ZXMpIHtcbiAgICBjb25zdCBzcXJSYWRpdXMgPSByYWRpdXMgKiByYWRpdXM7XG4gICAgY29uc3QgYWN0aXZlUGxheWVycyA9IHRoaXMuYWN0aXZlUGxheWVycztcbiAgICBjb25zdCBwbGF5ZXJzID0gbmV3IFNldCh0aGlzLnBsYXllcnMua2V5cygpKTtcblxuICAgIC8vIGlmIGNvb3JkaW5hdGVzIGFyZSBlbXB0eSwgc3RvcCBhbGwgcGxheWVycywgZWxzZSBkZWZpbmVzIGlmIGEgY2xpZW50XG4gICAgLy8gc2hvdWxkIGJlIHNlbnQgYSBgc3RhcnRgIG9yIGBzdG9wYCBtZXNzYWdlIGFjY29yZGluZyB0byBpdHMgcHJldmlvdXNcbiAgICAvLyBzdGF0ZSBhbmQgaWYgaXQgaXMgb3Igbm90IGluIGFuIHpvbmUgdGhhdCBpcyBleGNpdGVkIGJ5IHRoZSBzb2xvaXN0XG4gICAgaWYgKE9iamVjdC5rZXlzKGNvb3JkaW5hdGVzKS5sZW5ndGggPT09IDApIHtcbiAgICAgIGFjdGl2ZVBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiB0aGlzLnNlbmQocGxheWVyLCAnc3RvcCcpKTtcbiAgICAgIGFjdGl2ZVBsYXllcnMuY2xlYXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHtcbiAgICAgICAgbGV0IGluQXJlYSA9IGZhbHNlO1xuICAgICAgICBjb25zdCBpc0FjdGl2ZSA9IGFjdGl2ZVBsYXllcnMuaGFzKHBsYXllcik7XG5cbiAgICAgICAgZm9yIChsZXQgaWQgaW4gY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICBjb25zdCBjZW50ZXIgPSBjb29yZGluYXRlc1tpZF07XG4gICAgICAgICAgaW5BcmVhID0gaW5BcmVhIHx8wqB0aGlzLmluQXJlYShwbGF5ZXIuY29vcmRpbmF0ZXMsIGNlbnRlciwgc3FyUmFkaXVzKTtcblxuICAgICAgICAgIGlmIChpbkFyZWEpIHtcbiAgICAgICAgICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgdGhpcy5zZW5kKHBsYXllciwgJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAgIGFjdGl2ZVBsYXllcnMuYWRkKHBsYXllcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0FjdGl2ZSAmJiAhaW5BcmVhKSB7XG4gICAgICAgICAgdGhpcy5zZW5kKHBsYXllciwgJ3N0b3AnKTtcbiAgICAgICAgICBhY3RpdmVQbGF5ZXJzLmRlbGV0ZShwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVmaW5lcyBpZiBgcG9pbnRgIGlzIGluc2lkZSB0aGUgY2lyY2xlIGRlZmluZWQgYnkgYGNlbnRlcmAgYW5kIGBzcXJSYWRpdXNgLlxuICAgKiBUaGUgY29tcHV0YXRpb24gaXMgZG9uZSBpbiBzcXVhcmVkIHNwYWNlIGluIG9yZGVyIHRvIHNhdmUgc3F1YXJlIHJvb3RcbiAgICogY29tcHV0YXRpb24gb24gZWFjaCBjYWxsLlxuICAgKiBAcGFyYW0ge0FycmF5PE51bWJlcj59IHBvaW50IC0gVGhlIHgsIHkgY29vcmRpbmF0ZXMgb2YgdGhlIHBvaW50IHRvIGJlIHRlc3RlZC5cbiAgICogQHBhcmFtIHtBcnJheTxOdW1iZXI+fSBjZW50ZXIgLSBUaGUgeCwgeSBjb29yZGluYXRlcyBvZiBjZW50ZXIgb2YgdGhlIGNpcmNsZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNxclJhZGl1cyAtIFRoZSBzcXVhcmVkIHJhZGl1cyBvZiB0aGUgY2lyY2xlLlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSAtIGB0cnVlYCBpZiBwb2ludCBpcyBpbiB0aGUgY2lyY2xlLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICovXG4gIGluQXJlYShwb2ludCwgY2VudGVyLCBzcXJSYWRpdXMpIHtcbiAgICBjb25zdCB4ID0gcG9pbnRbMF0gLSBjZW50ZXJbMF07XG4gICAgY29uc3QgeSA9IHBvaW50WzFdIC0gY2VudGVyWzFdO1xuICAgIGNvbnN0IHNxckRpc3RhbmNlID0geCAqIHggKyB5ICogeTtcblxuICAgIHJldHVybiBzcXJEaXN0YW5jZSA8IHNxclJhZGl1cztcbiAgfVxufVxuIl19