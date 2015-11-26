// Import Soundworks library (server side)
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _soundworksServer = require('soundworks/server');

var _soundworksServer2 = _interopRequireDefault(_soundworksServer);

var server = _soundworksServer2['default'].server;

/**
 * Retrieve information (index and coordinates) about the client.
 * @param {Client} client Client.
 * @return {Object} Information about the client.
 * @property {Number} index Index of the client.
 * @property {Number[]} coordinates Coordinates of the client (`[x:Number,
 * y:Number]` array).
 */
function getInfo(client) {
  return { index: client.index, coordinates: client.coordinates };
}

/**
 * `PlayerPerformance` class.
 * The `PlayerPerformance` class manages the `'player'` connections and
 * disconnections, and informs the `'soloist'` clients about them so that they
 * can update the performance visualization accordingly.
 */

var PlayerPerformance = (function (_serverSide$Performance) {
  _inherits(PlayerPerformance, _serverSide$Performance);

  /**
   * Create an instance of the class.
   * @param {Object} [options={}] Options (same as the base class).
   */

  function PlayerPerformance() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, PlayerPerformance);

    _get(Object.getPrototypeOf(PlayerPerformance.prototype), 'constructor', this).call(this, options);
  }

  /**
   * Called when a client starts the performance.
   * The method relays that information to the `'soloist'` clients.
   * @param {Client} client Client that enters the performance.
   */

  _createClass(PlayerPerformance, [{
    key: 'enter',
    value: function enter(client) {
      _get(Object.getPrototypeOf(PlayerPerformance.prototype), 'enter', this).call(this, client);

      // Inform the soloist that a new player entered the performance
      server.broadcast('soloist', 'performance:playerAdd', getInfo(client));
    }

    /**
     * Called when a client ends the performance (disconnection).
     * The method relays the information to the `'soloist'` clients.
     * @param {Client} client Client who exits the performance.
     */
  }, {
    key: 'exit',
    value: function exit(client) {
      _get(Object.getPrototypeOf(PlayerPerformance.prototype), 'exit', this).call(this, client);

      // Inform the soloist that a player exited the performance
      server.broadcast('soloist', 'performance:playerRemove', getInfo(client));
    }
  }]);

  return PlayerPerformance;
})(_soundworksServer2['default'].Performance);

exports['default'] = PlayerPerformance;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9zZXJ2ZXIvUGxheWVyUGVyZm9ybWFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBQ3VCLG1CQUFtQjs7OztBQUMxQyxJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7Ozs7Ozs7Ozs7QUFVakMsU0FBUyxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ3ZCLFNBQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0NBQ2pFOzs7Ozs7Ozs7SUFRb0IsaUJBQWlCO1lBQWpCLGlCQUFpQjs7Ozs7OztBQUt6QixXQUxRLGlCQUFpQixHQUtWO1FBQWQsT0FBTyx5REFBRyxFQUFFOzswQkFMTCxpQkFBaUI7O0FBTWxDLCtCQU5pQixpQkFBaUIsNkNBTTVCLE9BQU8sRUFBRTtHQUNoQjs7Ozs7Ozs7ZUFQa0IsaUJBQWlCOztXQWMvQixlQUFDLE1BQU0sRUFBRTtBQUNaLGlDQWZpQixpQkFBaUIsdUNBZXRCLE1BQU0sRUFBRTs7O0FBR3BCLFlBQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQ3ZFOzs7Ozs7Ozs7V0FPRyxjQUFDLE1BQU0sRUFBRTtBQUNYLGlDQTNCaUIsaUJBQWlCLHNDQTJCdkIsTUFBTSxFQUFFOzs7QUFHbkIsWUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsMEJBQTBCLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7S0FDMUU7OztTQS9Ca0IsaUJBQWlCO0dBQVMsOEJBQVcsV0FBVzs7cUJBQWhELGlCQUFpQiIsImZpbGUiOiIvVXNlcnMvcm9iaS9EZXYvY29sbGVjdGl2ZS1zb3VuZHdvcmtzLWRldmVsb3Avc291bmRmaWVsZC9zcmMvc2VydmVyL1BsYXllclBlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW1wb3J0IFNvdW5kd29ya3MgbGlicmFyeSAoc2VydmVyIHNpZGUpXG5pbXBvcnQgc2VydmVyU2lkZSBmcm9tICdzb3VuZHdvcmtzL3NlcnZlcic7XG5jb25zdCBzZXJ2ZXIgPSBzZXJ2ZXJTaWRlLnNlcnZlcjtcblxuLyoqXG4gKiBSZXRyaWV2ZSBpbmZvcm1hdGlvbiAoaW5kZXggYW5kIGNvb3JkaW5hdGVzKSBhYm91dCB0aGUgY2xpZW50LlxuICogQHBhcmFtIHtDbGllbnR9IGNsaWVudCBDbGllbnQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IEluZm9ybWF0aW9uIGFib3V0IHRoZSBjbGllbnQuXG4gKiBAcHJvcGVydHkge051bWJlcn0gaW5kZXggSW5kZXggb2YgdGhlIGNsaWVudC5cbiAqIEBwcm9wZXJ0eSB7TnVtYmVyW119IGNvb3JkaW5hdGVzIENvb3JkaW5hdGVzIG9mIHRoZSBjbGllbnQgKGBbeDpOdW1iZXIsXG4gKiB5Ok51bWJlcl1gIGFycmF5KS5cbiAqL1xuZnVuY3Rpb24gZ2V0SW5mbyhjbGllbnQpIHtcbiAgcmV0dXJuIHsgaW5kZXg6IGNsaWVudC5pbmRleCwgY29vcmRpbmF0ZXM6IGNsaWVudC5jb29yZGluYXRlcyB9O1xufVxuXG4vKipcbiAqIGBQbGF5ZXJQZXJmb3JtYW5jZWAgY2xhc3MuXG4gKiBUaGUgYFBsYXllclBlcmZvcm1hbmNlYCBjbGFzcyBtYW5hZ2VzIHRoZSBgJ3BsYXllcidgIGNvbm5lY3Rpb25zIGFuZFxuICogZGlzY29ubmVjdGlvbnMsIGFuZCBpbmZvcm1zIHRoZSBgJ3NvbG9pc3QnYCBjbGllbnRzIGFib3V0IHRoZW0gc28gdGhhdCB0aGV5XG4gKiBjYW4gdXBkYXRlIHRoZSBwZXJmb3JtYW5jZSB2aXN1YWxpemF0aW9uIGFjY29yZGluZ2x5LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJQZXJmb3JtYW5jZSBleHRlbmRzIHNlcnZlclNpZGUuUGVyZm9ybWFuY2Uge1xuICAvKipcbiAgICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBjbGFzcy5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBPcHRpb25zIChzYW1lIGFzIHRoZSBiYXNlIGNsYXNzKS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgY2xpZW50IHN0YXJ0cyB0aGUgcGVyZm9ybWFuY2UuXG4gICAqIFRoZSBtZXRob2QgcmVsYXlzIHRoYXQgaW5mb3JtYXRpb24gdG8gdGhlIGAnc29sb2lzdCdgIGNsaWVudHMuXG4gICAqIEBwYXJhbSB7Q2xpZW50fSBjbGllbnQgQ2xpZW50IHRoYXQgZW50ZXJzIHRoZSBwZXJmb3JtYW5jZS5cbiAgICovXG4gIGVudGVyKGNsaWVudCkge1xuICAgIHN1cGVyLmVudGVyKGNsaWVudCk7XG5cbiAgICAvLyBJbmZvcm0gdGhlIHNvbG9pc3QgdGhhdCBhIG5ldyBwbGF5ZXIgZW50ZXJlZCB0aGUgcGVyZm9ybWFuY2VcbiAgICBzZXJ2ZXIuYnJvYWRjYXN0KCdzb2xvaXN0JywgJ3BlcmZvcm1hbmNlOnBsYXllckFkZCcsIGdldEluZm8oY2xpZW50KSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBjbGllbnQgZW5kcyB0aGUgcGVyZm9ybWFuY2UgKGRpc2Nvbm5lY3Rpb24pLlxuICAgKiBUaGUgbWV0aG9kIHJlbGF5cyB0aGUgaW5mb3JtYXRpb24gdG8gdGhlIGAnc29sb2lzdCdgIGNsaWVudHMuXG4gICAqIEBwYXJhbSB7Q2xpZW50fSBjbGllbnQgQ2xpZW50IHdobyBleGl0cyB0aGUgcGVyZm9ybWFuY2UuXG4gICAqL1xuICBleGl0KGNsaWVudCkge1xuICAgIHN1cGVyLmV4aXQoY2xpZW50KTtcblxuICAgIC8vIEluZm9ybSB0aGUgc29sb2lzdCB0aGF0IGEgcGxheWVyIGV4aXRlZCB0aGUgcGVyZm9ybWFuY2VcbiAgICBzZXJ2ZXIuYnJvYWRjYXN0KCdzb2xvaXN0JywgJ3BlcmZvcm1hbmNlOnBsYXllclJlbW92ZScsIGdldEluZm8oY2xpZW50KSk7XG4gIH1cbn1cbiJdfQ==