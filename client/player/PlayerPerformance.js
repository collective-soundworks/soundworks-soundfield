// Import Soundworks modules (client side)
"use strict";

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _soundworksClient = require('soundworks/client');

var _soundworksClient2 = _interopRequireDefault(_soundworksClient);

var client = _soundworksClient2["default"].client;

// PlayerPerformance class

var PlayerPerformance = (function (_clientSide$Performance) {
  _inherits(PlayerPerformance, _clientSide$Performance);

  function PlayerPerformance() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, PlayerPerformance);

    _get(Object.getPrototypeOf(PlayerPerformance.prototype), "constructor", this).call(this, options);
  }

  _createClass(PlayerPerformance, [{
    key: "start",
    value: function start() {
      _get(Object.getPrototypeOf(PlayerPerformance.prototype), "start", this).call(this); // don't forget this

      console.log("hey, welcome to the performance");
    }
  }]);

  return PlayerPerformance;
})(_soundworksClient2["default"].Performance);

exports["default"] = PlayerPerformance;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvcGxheWVyL1BsYXllclBlcmZvcm1hbmNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O2dDQUN1QixtQkFBbUI7Ozs7QUFDMUMsSUFBTSxNQUFNLEdBQUcsOEJBQVcsTUFBTSxDQUFDOzs7O0lBR1osaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFDekIsV0FEUSxpQkFBaUIsR0FDVjtRQUFkLE9BQU8seURBQUcsRUFBRTs7MEJBREwsaUJBQWlCOztBQUVsQywrQkFGaUIsaUJBQWlCLDZDQUU1QixPQUFPLEVBQUU7R0FDaEI7O2VBSGtCLGlCQUFpQjs7V0FLL0IsaUJBQUc7QUFDTixpQ0FOaUIsaUJBQWlCLHVDQU1wQjs7QUFFZCxhQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7S0FDaEQ7OztTQVRrQixpQkFBaUI7R0FBUyw4QkFBVyxXQUFXOztxQkFBaEQsaUJBQWlCIiwiZmlsZSI6Ii9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvcGxheWVyL1BsYXllclBlcmZvcm1hbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW1wb3J0IFNvdW5kd29ya3MgbW9kdWxlcyAoY2xpZW50IHNpZGUpXG5pbXBvcnQgY2xpZW50U2lkZSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5jb25zdCBjbGllbnQgPSBjbGllbnRTaWRlLmNsaWVudDtcblxuLy8gUGxheWVyUGVyZm9ybWFuY2UgY2xhc3NcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllclBlcmZvcm1hbmNlIGV4dGVuZHMgY2xpZW50U2lkZS5QZXJmb3JtYW5jZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTsgLy8gZG9uJ3QgZm9yZ2V0IHRoaXNcblxuICAgIGNvbnNvbGUubG9nKFwiaGV5LCB3ZWxjb21lIHRvIHRoZSBwZXJmb3JtYW5jZVwiKTtcbiAgfVxufVxuIl19