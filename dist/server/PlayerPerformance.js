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

// Import Soundworks library (server side)
var serverSide = require('soundworks')('server');
var server = serverSide.server;

// Helper function
function getInfo(client) {
  return { index: client.index, coordinates: client.coordinates };
}

// PlayerPerformance class

var PlayerPerformance = (function (_serverSide$Performan) {
  (0, _inherits3.default)(PlayerPerformance, _serverSide$Performan);

  function PlayerPerformance() {
    (0, _classCallCheck3.default)(this, PlayerPerformance);
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayerPerformance).call(this, options));
  }

  (0, _createClass3.default)(PlayerPerformance, [{
    key: 'enter',
    value: function enter(client) {
      (0, _get3.default)((0, _getPrototypeOf2.default)(PlayerPerformance.prototype), 'enter', this).call(this, client);

      // Inform the soloist that a new player entered the performance
      server.broadcast('soloist', 'performance:playerAdd', getInfo(client));
    }
  }, {
    key: 'exit',
    value: function exit(client) {
      (0, _get3.default)((0, _getPrototypeOf2.default)(PlayerPerformance.prototype), 'exit', this).call(this, client);

      // Inform the soloist that a player exited the performance
      server.broadcast('soloist', 'performance:playerRemove', getInfo(client));
    }
  }]);
  return PlayerPerformance;
})(serverSide.Performance);

exports.default = PlayerPerformance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllclBlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNuRCxJQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTTs7O0FBQUMsQUFHakMsU0FBUyxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ3ZCLFNBQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0NBQ2pFOzs7QUFBQTtJQUdvQixpQkFBaUI7MEJBQWpCLGlCQUFpQjs7QUFDcEMsV0FEbUIsaUJBQWlCLEdBQ1Y7d0NBRFAsaUJBQWlCO1FBQ3hCLE9BQU8seURBQUcsRUFBRTt3RkFETCxpQkFBaUIsYUFFNUIsT0FBTztHQUNkOzs2QkFIa0IsaUJBQWlCOzswQkFLOUIsTUFBTSxFQUFFO0FBQ1osdURBTmlCLGlCQUFpQix1Q0FNdEIsTUFBTTs7O0FBQUUsQUFHcEIsWUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsdUJBQXVCLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7S0FDdkU7Ozt5QkFFSSxNQUFNLEVBQUU7QUFDWCx1REFiaUIsaUJBQWlCLHNDQWF2QixNQUFNOzs7QUFBRSxBQUduQixZQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSwwQkFBMEIsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztLQUMxRTs7U0FqQmtCLGlCQUFpQjtHQUFTLFVBQVUsQ0FBQyxXQUFXOztrQkFBaEQsaUJBQWlCIiwiZmlsZSI6IlBsYXllclBlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW1wb3J0IFNvdW5kd29ya3MgbGlicmFyeSAoc2VydmVyIHNpZGUpXG5jb25zdCBzZXJ2ZXJTaWRlID0gcmVxdWlyZSgnc291bmR3b3JrcycpKCdzZXJ2ZXInKTtcbmNvbnN0IHNlcnZlciA9IHNlcnZlclNpZGUuc2VydmVyO1xuXG4vLyBIZWxwZXIgZnVuY3Rpb25cbmZ1bmN0aW9uIGdldEluZm8oY2xpZW50KSB7XG4gIHJldHVybiB7IGluZGV4OiBjbGllbnQuaW5kZXgsIGNvb3JkaW5hdGVzOiBjbGllbnQuY29vcmRpbmF0ZXMgfTtcbn1cblxuLy8gUGxheWVyUGVyZm9ybWFuY2UgY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllclBlcmZvcm1hbmNlIGV4dGVuZHMgc2VydmVyU2lkZS5QZXJmb3JtYW5jZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuICB9XG5cbiAgZW50ZXIoY2xpZW50KSB7XG4gICAgc3VwZXIuZW50ZXIoY2xpZW50KTtcblxuICAgIC8vIEluZm9ybSB0aGUgc29sb2lzdCB0aGF0IGEgbmV3IHBsYXllciBlbnRlcmVkIHRoZSBwZXJmb3JtYW5jZVxuICAgIHNlcnZlci5icm9hZGNhc3QoJ3NvbG9pc3QnLCAncGVyZm9ybWFuY2U6cGxheWVyQWRkJywgZ2V0SW5mbyhjbGllbnQpKTtcbiAgfVxuXG4gIGV4aXQoY2xpZW50KSB7XG4gICAgc3VwZXIuZXhpdChjbGllbnQpO1xuXG4gICAgLy8gSW5mb3JtIHRoZSBzb2xvaXN0IHRoYXQgYSBwbGF5ZXIgZXhpdGVkIHRoZSBwZXJmb3JtYW5jZVxuICAgIHNlcnZlci5icm9hZGNhc3QoJ3NvbG9pc3QnLCAncGVyZm9ybWFuY2U6cGxheWVyUmVtb3ZlJywgZ2V0SW5mbyhjbGllbnQpKTtcbiAgfVxufVxuIl19