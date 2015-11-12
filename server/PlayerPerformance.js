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

// Helper function
function getInfo(client) {
  return { index: client.index, coordinates: client.coordinates };
}

// PlayerPerformance class

var PlayerPerformance = (function (_serverSide$Performance) {
  _inherits(PlayerPerformance, _serverSide$Performance);

  function PlayerPerformance() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, PlayerPerformance);

    _get(Object.getPrototypeOf(PlayerPerformance.prototype), 'constructor', this).call(this, options);
  }

  _createClass(PlayerPerformance, [{
    key: 'enter',
    value: function enter(client) {
      _get(Object.getPrototypeOf(PlayerPerformance.prototype), 'enter', this).call(this, client);

      // Inform the soloist that a new player entered the performance
      server.broadcast('soloist', 'performance:playerAdd', getInfo(client));
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9zZXJ2ZXIvUGxheWVyUGVyZm9ybWFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBQ3VCLG1CQUFtQjs7OztBQUMxQyxJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7OztBQUdqQyxTQUFTLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDdkIsU0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7Q0FDakU7Ozs7SUFHb0IsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFDekIsV0FEUSxpQkFBaUIsR0FDVjtRQUFkLE9BQU8seURBQUcsRUFBRTs7MEJBREwsaUJBQWlCOztBQUVsQywrQkFGaUIsaUJBQWlCLDZDQUU1QixPQUFPLEVBQUU7R0FDaEI7O2VBSGtCLGlCQUFpQjs7V0FLL0IsZUFBQyxNQUFNLEVBQUU7QUFDWixpQ0FOaUIsaUJBQWlCLHVDQU10QixNQUFNLEVBQUU7OztBQUdwQixZQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSx1QkFBdUIsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztLQUN2RTs7O1dBRUcsY0FBQyxNQUFNLEVBQUU7QUFDWCxpQ0FiaUIsaUJBQWlCLHNDQWF2QixNQUFNLEVBQUU7OztBQUduQixZQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSwwQkFBMEIsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztLQUMxRTs7O1NBakJrQixpQkFBaUI7R0FBUyw4QkFBVyxXQUFXOztxQkFBaEQsaUJBQWlCIiwiZmlsZSI6Ii9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9zZXJ2ZXIvUGxheWVyUGVyZm9ybWFuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbXBvcnQgU291bmR3b3JrcyBsaWJyYXJ5IChzZXJ2ZXIgc2lkZSlcbmltcG9ydCBzZXJ2ZXJTaWRlIGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcbmNvbnN0IHNlcnZlciA9IHNlcnZlclNpZGUuc2VydmVyO1xuXG4vLyBIZWxwZXIgZnVuY3Rpb25cbmZ1bmN0aW9uIGdldEluZm8oY2xpZW50KSB7XG4gIHJldHVybiB7IGluZGV4OiBjbGllbnQuaW5kZXgsIGNvb3JkaW5hdGVzOiBjbGllbnQuY29vcmRpbmF0ZXMgfTtcbn1cblxuLy8gUGxheWVyUGVyZm9ybWFuY2UgY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllclBlcmZvcm1hbmNlIGV4dGVuZHMgc2VydmVyU2lkZS5QZXJmb3JtYW5jZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuICB9XG5cbiAgZW50ZXIoY2xpZW50KSB7XG4gICAgc3VwZXIuZW50ZXIoY2xpZW50KTtcblxuICAgIC8vIEluZm9ybSB0aGUgc29sb2lzdCB0aGF0IGEgbmV3IHBsYXllciBlbnRlcmVkIHRoZSBwZXJmb3JtYW5jZVxuICAgIHNlcnZlci5icm9hZGNhc3QoJ3NvbG9pc3QnLCAncGVyZm9ybWFuY2U6cGxheWVyQWRkJywgZ2V0SW5mbyhjbGllbnQpKTtcbiAgfVxuXG4gIGV4aXQoY2xpZW50KSB7XG4gICAgc3VwZXIuZXhpdChjbGllbnQpO1xuXG4gICAgLy8gSW5mb3JtIHRoZSBzb2xvaXN0IHRoYXQgYSBwbGF5ZXIgZXhpdGVkIHRoZSBwZXJmb3JtYW5jZVxuICAgIHNlcnZlci5icm9hZGNhc3QoJ3NvbG9pc3QnLCAncGVyZm9ybWFuY2U6cGxheWVyUmVtb3ZlJywgZ2V0SW5mbyhjbGllbnQpKTtcbiAgfVxufVxuIl19