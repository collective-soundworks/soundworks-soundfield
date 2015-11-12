// Import Soundworks modules (client side)
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _soundworksClient = require('soundworks/client');

var _soundworksClient2 = _interopRequireDefault(_soundworksClient);

// Import modules written for Soundfield

var _PlayerPerformanceJs = require('./PlayerPerformance.js');

var _PlayerPerformanceJs2 = _interopRequireDefault(_PlayerPerformanceJs);

// Initiliaze the client type

var client = _soundworksClient2['default'].client;
var audioContext = _soundworksClient2['default'].audioContext;client.init('player');

// Where the magic happens
window.addEventListener('load', function () {
  // Instantiate the modules
  var welcome = new _soundworksClient2['default'].Dialog({
    name: 'welcome',
    text: '<p>Welcome to <b>Soundfield</b>.</p>\n           <p>Touch the screen to join!</p>',
    activateAudio: true
  });
  var setup = new _soundworksClient2['default'].Setup();
  var space = new _soundworksClient2['default'].Space();
  var locator = new _soundworksClient2['default'].Locator({ setup: setup, space: space });
  var performance = new _PlayerPerformanceJs2['default']();

  // Start the scenario
  client.start(function (serial, parallel) {
    return serial(parallel(welcome, serial(setup, locator)), performance);
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvcGxheWVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O2dDQUN1QixtQkFBbUI7Ozs7OzttQ0FLWix3QkFBd0I7Ozs7OztBQUp0RCxJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7QUFDakMsSUFBTSxZQUFZLEdBQUcsOEJBQVcsWUFBWSxDQUFDLEFBTTdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUd0QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFlBQU07O0FBRXBDLE1BQU0sT0FBTyxHQUFHLElBQUksOEJBQVcsTUFBTSxDQUFDO0FBQ3BDLFFBQUksRUFBRSxTQUFTO0FBQ2YsUUFBSSxxRkFDb0M7QUFDeEMsaUJBQWEsRUFBRSxJQUFJO0dBQ3BCLENBQUMsQ0FBQztBQUNILE1BQU0sS0FBSyxHQUFHLElBQUksOEJBQVcsS0FBSyxFQUFFLENBQUM7QUFDckMsTUFBTSxLQUFLLEdBQUcsSUFBSSw4QkFBVyxLQUFLLEVBQUUsQ0FBQztBQUNyQyxNQUFNLE9BQU8sR0FBRyxJQUFJLDhCQUFXLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDdkUsTUFBTSxXQUFXLEdBQUcsc0NBQXVCLENBQUM7OztBQUc1QyxRQUFNLENBQUMsS0FBSyxDQUFDLFVBQUMsTUFBTSxFQUFFLFFBQVE7V0FDNUIsTUFBTSxDQUNKLFFBQVEsQ0FDTixPQUFPLEVBQ1AsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FDdkIsRUFDRCxXQUFXLENBQ1o7R0FBQSxDQUNGLENBQUM7Q0FDSCxDQUFDLENBQUMiLCJmaWxlIjoiL1VzZXJzL3JvYmkvRGV2L2NvbGxlY3RpdmUtc291bmR3b3Jrcy1kZXZlbG9wL3NvdW5kZmllbGQvc3JjL2NsaWVudC9wbGF5ZXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbXBvcnQgU291bmR3b3JrcyBtb2R1bGVzIChjbGllbnQgc2lkZSlcbmltcG9ydCBjbGllbnRTaWRlIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmNvbnN0IGNsaWVudCA9IGNsaWVudFNpZGUuY2xpZW50O1xuY29uc3QgYXVkaW9Db250ZXh0ID0gY2xpZW50U2lkZS5hdWRpb0NvbnRleHQ7XG5cbi8vIEltcG9ydCBtb2R1bGVzIHdyaXR0ZW4gZm9yIFNvdW5kZmllbGRcbmltcG9ydCBQbGF5ZXJQZXJmb3JtYW5jZSBmcm9tICcuL1BsYXllclBlcmZvcm1hbmNlLmpzJztcblxuLy8gSW5pdGlsaWF6ZSB0aGUgY2xpZW50IHR5cGVcbmNsaWVudC5pbml0KCdwbGF5ZXInKTtcblxuLy8gV2hlcmUgdGhlIG1hZ2ljIGhhcHBlbnNcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAvLyBJbnN0YW50aWF0ZSB0aGUgbW9kdWxlc1xuICBjb25zdCB3ZWxjb21lID0gbmV3IGNsaWVudFNpZGUuRGlhbG9nKHtcbiAgICBuYW1lOiAnd2VsY29tZScsXG4gICAgdGV4dDogYDxwPldlbGNvbWUgdG8gPGI+U291bmRmaWVsZDwvYj4uPC9wPlxuICAgICAgICAgICA8cD5Ub3VjaCB0aGUgc2NyZWVuIHRvIGpvaW4hPC9wPmAsXG4gICAgYWN0aXZhdGVBdWRpbzogdHJ1ZVxuICB9KTtcbiAgY29uc3Qgc2V0dXAgPSBuZXcgY2xpZW50U2lkZS5TZXR1cCgpO1xuICBjb25zdCBzcGFjZSA9IG5ldyBjbGllbnRTaWRlLlNwYWNlKCk7XG4gIGNvbnN0IGxvY2F0b3IgPSBuZXcgY2xpZW50U2lkZS5Mb2NhdG9yKHsgc2V0dXA6IHNldHVwLCBzcGFjZTogc3BhY2UgfSk7XG4gIGNvbnN0IHBlcmZvcm1hbmNlID0gbmV3IFBsYXllclBlcmZvcm1hbmNlKCk7XG5cbiAgLy8gU3RhcnQgdGhlIHNjZW5hcmlvXG4gIGNsaWVudC5zdGFydCgoc2VyaWFsLCBwYXJhbGxlbCkgPT5cbiAgICBzZXJpYWwoXG4gICAgICBwYXJhbGxlbChcbiAgICAgICAgd2VsY29tZSxcbiAgICAgICAgc2VyaWFsKHNldHVwLCBsb2NhdG9yKVxuICAgICAgKSxcbiAgICAgIHBlcmZvcm1hbmNlXG4gICAgKVxuICApO1xufSk7XG4iXX0=