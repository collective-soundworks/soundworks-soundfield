'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _PlayerExperience = require('./PlayerExperience');

var _PlayerExperience2 = _interopRequireDefault(_PlayerExperience);

var _serviceViews = require('../shared/serviceViews');

var _serviceViews2 = _interopRequireDefault(_serviceViews);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bootstrap() {
  // configuration received from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  var config = (0, _assign2.default)({ appContainer: '#container' }, window.soundworksConfig);
  soundworks.client.init(config.clientType, config);

  // register hook that populate service's views
  soundworks.client.setServiceInstanciationHook(function (id, instance) {
    if (_serviceViews2.default.has(id)) instance.view = _serviceViews2.default.get(id, config);
  });

  // create client side (player) experience and start the client
  var experience = new _PlayerExperience2.default();
  soundworks.client.start();
} // import soundworks (client side) and Soundfield experience


window.addEventListener('load', bootstrap);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJib290c3RyYXAiLCJjb25maWciLCJhcHBDb250YWluZXIiLCJ3aW5kb3ciLCJzb3VuZHdvcmtzQ29uZmlnIiwiY2xpZW50IiwiaW5pdCIsImNsaWVudFR5cGUiLCJzZXRTZXJ2aWNlSW5zdGFuY2lhdGlvbkhvb2siLCJpZCIsImluc3RhbmNlIiwiaGFzIiwidmlldyIsImdldCIsImV4cGVyaWVuY2UiLCJzdGFydCIsImFkZEV2ZW50TGlzdGVuZXIiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBOztJQUFZQSxVOztBQUNaOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsU0FBU0MsU0FBVCxHQUFxQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxTQUFTLHNCQUFjLEVBQUVDLGNBQWMsWUFBaEIsRUFBZCxFQUE4Q0MsT0FBT0MsZ0JBQXJELENBQWY7QUFDQUwsYUFBV00sTUFBWCxDQUFrQkMsSUFBbEIsQ0FBdUJMLE9BQU9NLFVBQTlCLEVBQTBDTixNQUExQzs7QUFFQTtBQUNBRixhQUFXTSxNQUFYLENBQWtCRywyQkFBbEIsQ0FBOEMsVUFBQ0MsRUFBRCxFQUFLQyxRQUFMLEVBQWtCO0FBQzlELFFBQUksdUJBQWFDLEdBQWIsQ0FBaUJGLEVBQWpCLENBQUosRUFDRUMsU0FBU0UsSUFBVCxHQUFnQix1QkFBYUMsR0FBYixDQUFpQkosRUFBakIsRUFBcUJSLE1BQXJCLENBQWhCO0FBQ0gsR0FIRDs7QUFLQTtBQUNBLE1BQU1hLGFBQWEsZ0NBQW5CO0FBQ0FmLGFBQVdNLE1BQVgsQ0FBa0JVLEtBQWxCO0FBQ0QsQyxDQXJCRDs7O0FBdUJBWixPQUFPYSxnQkFBUCxDQUF3QixNQUF4QixFQUFnQ2hCLFNBQWhDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IHNvdW5kd29ya3MgKGNsaWVudCBzaWRlKSBhbmQgU291bmRmaWVsZCBleHBlcmllbmNlXG5pbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCBQbGF5ZXJFeHBlcmllbmNlIGZyb20gJy4vUGxheWVyRXhwZXJpZW5jZSc7XG5pbXBvcnQgc2VydmljZVZpZXdzIGZyb20gJy4uL3NoYXJlZC9zZXJ2aWNlVmlld3MnO1xuXG5mdW5jdGlvbiBib290c3RyYXAoKSB7XG4gIC8vIGNvbmZpZ3VyYXRpb24gcmVjZWl2ZWQgZnJvbSB0aGUgc2VydmVyIHRocm91Z2ggdGhlIGBpbmRleC5odG1sYFxuICAvLyBAc2VlIHt+L3NyYy9zZXJ2ZXIvaW5kZXguanN9XG4gIC8vIEBzZWUge34vaHRtbC9kZWZhdWx0LmVqc31cbiAgY29uc3QgY29uZmlnID0gT2JqZWN0LmFzc2lnbih7IGFwcENvbnRhaW5lcjogJyNjb250YWluZXInIH0sIHdpbmRvdy5zb3VuZHdvcmtzQ29uZmlnKTtcbiAgc291bmR3b3Jrcy5jbGllbnQuaW5pdChjb25maWcuY2xpZW50VHlwZSwgY29uZmlnKTtcblxuICAvLyByZWdpc3RlciBob29rIHRoYXQgcG9wdWxhdGUgc2VydmljZSdzIHZpZXdzXG4gIHNvdW5kd29ya3MuY2xpZW50LnNldFNlcnZpY2VJbnN0YW5jaWF0aW9uSG9vaygoaWQsIGluc3RhbmNlKSA9PiB7XG4gICAgaWYgKHNlcnZpY2VWaWV3cy5oYXMoaWQpKVxuICAgICAgaW5zdGFuY2UudmlldyA9IHNlcnZpY2VWaWV3cy5nZXQoaWQsIGNvbmZpZyk7XG4gIH0pO1xuXG4gIC8vIGNyZWF0ZSBjbGllbnQgc2lkZSAocGxheWVyKSBleHBlcmllbmNlIGFuZCBzdGFydCB0aGUgY2xpZW50XG4gIGNvbnN0IGV4cGVyaWVuY2UgPSBuZXcgUGxheWVyRXhwZXJpZW5jZSgpO1xuICBzb3VuZHdvcmtzLmNsaWVudC5zdGFydCgpO1xufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGJvb3RzdHJhcCk7XG4iXX0=