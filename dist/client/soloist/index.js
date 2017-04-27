'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _SoloistExperience = require('./SoloistExperience');

var _SoloistExperience2 = _interopRequireDefault(_SoloistExperience);

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

  // instanciate the experience of the `soloist`
  var soloistExperience = new _SoloistExperience2.default();
  // start the application
  soundworks.client.start();
} // import soundworks (client side) and Soundfield experience


window.addEventListener('load', bootstrap);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJib290c3RyYXAiLCJjb25maWciLCJhcHBDb250YWluZXIiLCJ3aW5kb3ciLCJzb3VuZHdvcmtzQ29uZmlnIiwiY2xpZW50IiwiaW5pdCIsImNsaWVudFR5cGUiLCJzZXRTZXJ2aWNlSW5zdGFuY2lhdGlvbkhvb2siLCJpZCIsImluc3RhbmNlIiwiaGFzIiwidmlldyIsImdldCIsInNvbG9pc3RFeHBlcmllbmNlIiwic3RhcnQiLCJhZGRFdmVudExpc3RlbmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7SUFBWUEsVTs7QUFDWjs7OztBQUNBOzs7Ozs7OztBQUdBLFNBQVNDLFNBQVQsR0FBc0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsU0FBUyxzQkFBYyxFQUFFQyxjQUFjLFlBQWhCLEVBQWQsRUFBOENDLE9BQU9DLGdCQUFyRCxDQUFmO0FBQ0FMLGFBQVdNLE1BQVgsQ0FBa0JDLElBQWxCLENBQXVCTCxPQUFPTSxVQUE5QixFQUEwQ04sTUFBMUM7O0FBRUE7QUFDQUYsYUFBV00sTUFBWCxDQUFrQkcsMkJBQWxCLENBQThDLFVBQUNDLEVBQUQsRUFBS0MsUUFBTCxFQUFrQjtBQUM5RCxRQUFJLHVCQUFhQyxHQUFiLENBQWlCRixFQUFqQixDQUFKLEVBQ0VDLFNBQVNFLElBQVQsR0FBZ0IsdUJBQWFDLEdBQWIsQ0FBaUJKLEVBQWpCLEVBQXFCUixNQUFyQixDQUFoQjtBQUNILEdBSEQ7O0FBS0E7QUFDQSxNQUFNYSxvQkFBb0IsaUNBQTFCO0FBQ0E7QUFDQWYsYUFBV00sTUFBWCxDQUFrQlUsS0FBbEI7QUFDRCxDLENBdkJEOzs7QUF5QkFaLE9BQU9hLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDaEIsU0FBaEMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBpbXBvcnQgc291bmR3b3JrcyAoY2xpZW50IHNpZGUpIGFuZCBTb3VuZGZpZWxkIGV4cGVyaWVuY2VcbmltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IFNvbG9pc3RFeHBlcmllbmNlIGZyb20gJy4vU29sb2lzdEV4cGVyaWVuY2UnO1xuaW1wb3J0IHNlcnZpY2VWaWV3cyBmcm9tICcuLi9zaGFyZWQvc2VydmljZVZpZXdzJztcblxuXG5mdW5jdGlvbiBib290c3RyYXAgKCkge1xuICAvLyBjb25maWd1cmF0aW9uIHJlY2VpdmVkIGZyb20gdGhlIHNlcnZlciB0aHJvdWdoIHRoZSBgaW5kZXguaHRtbGBcbiAgLy8gQHNlZSB7fi9zcmMvc2VydmVyL2luZGV4LmpzfVxuICAvLyBAc2VlIHt+L2h0bWwvZGVmYXVsdC5lanN9XG4gIGNvbnN0IGNvbmZpZyA9IE9iamVjdC5hc3NpZ24oeyBhcHBDb250YWluZXI6ICcjY29udGFpbmVyJyB9LCB3aW5kb3cuc291bmR3b3Jrc0NvbmZpZyk7XG4gIHNvdW5kd29ya3MuY2xpZW50LmluaXQoY29uZmlnLmNsaWVudFR5cGUsIGNvbmZpZyk7XG5cbiAgLy8gcmVnaXN0ZXIgaG9vayB0aGF0IHBvcHVsYXRlIHNlcnZpY2UncyB2aWV3c1xuICBzb3VuZHdvcmtzLmNsaWVudC5zZXRTZXJ2aWNlSW5zdGFuY2lhdGlvbkhvb2soKGlkLCBpbnN0YW5jZSkgPT4ge1xuICAgIGlmIChzZXJ2aWNlVmlld3MuaGFzKGlkKSlcbiAgICAgIGluc3RhbmNlLnZpZXcgPSBzZXJ2aWNlVmlld3MuZ2V0KGlkLCBjb25maWcpO1xuICB9KTtcblxuICAvLyBpbnN0YW5jaWF0ZSB0aGUgZXhwZXJpZW5jZSBvZiB0aGUgYHNvbG9pc3RgXG4gIGNvbnN0IHNvbG9pc3RFeHBlcmllbmNlID0gbmV3IFNvbG9pc3RFeHBlcmllbmNlKCk7XG4gIC8vIHN0YXJ0IHRoZSBhcHBsaWNhdGlvblxuICBzb3VuZHdvcmtzLmNsaWVudC5zdGFydCgpO1xufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGJvb3RzdHJhcCk7XG4iXX0=