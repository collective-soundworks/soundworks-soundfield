// Import Soundworks modules (client side)
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _soundworksClient = require('soundworks/client');

var _soundworksClient2 = _interopRequireDefault(_soundworksClient);

// Import Soundfield modules (client side)

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

  // Start the scenario.
  //
  // The scenario consists in two major steps:
  // - the initialization;
  // - the performance.
  //
  // The initialization step consists in welcoming the player and getting his /
  // her location. These two sub-steps can happen in parallel. The “Getting the
  // location” step requires to know the setup beforehand, so we launch in
  // serial the setup module to get the setup, and then the locator.
  //
  // The performance step can start when the initialization step is done.
  client.start(function (serial, parallel) {
    return serial(
    // Initialization step
    parallel(welcome, // Welcome screen
    serial(setup, locator) // Get the location (setup first, locator then)
    ),
    // Performance step
    performance);
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvcGxheWVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O2dDQUN1QixtQkFBbUI7Ozs7OzttQ0FLWix3QkFBd0I7Ozs7OztBQUp0RCxJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7QUFDakMsSUFBTSxZQUFZLEdBQUcsOEJBQVcsWUFBWSxDQUFDLEFBTTdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUd0QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFlBQU07O0FBRXBDLE1BQU0sT0FBTyxHQUFHLElBQUksOEJBQVcsTUFBTSxDQUFDO0FBQ3BDLFFBQUksRUFBRSxTQUFTO0FBQ2YsUUFBSSxxRkFDb0M7QUFDeEMsaUJBQWEsRUFBRSxJQUFJO0dBQ3BCLENBQUMsQ0FBQztBQUNILE1BQU0sS0FBSyxHQUFHLElBQUksOEJBQVcsS0FBSyxFQUFFLENBQUM7QUFDckMsTUFBTSxLQUFLLEdBQUcsSUFBSSw4QkFBVyxLQUFLLEVBQUUsQ0FBQztBQUNyQyxNQUFNLE9BQU8sR0FBRyxJQUFJLDhCQUFXLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDdkUsTUFBTSxXQUFXLEdBQUcsc0NBQXVCLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBYzVDLFFBQU0sQ0FBQyxLQUFLLENBQUMsVUFBQyxNQUFNLEVBQUUsUUFBUTtXQUM1QixNQUFNOztBQUVKLFlBQVEsQ0FDTixPQUFPO0FBQ1AsVUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUM7S0FDdkI7O0FBRUQsZUFBVyxDQUNaO0dBQUEsQ0FDRixDQUFDO0NBQ0gsQ0FBQyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvcGxheWVyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW1wb3J0IFNvdW5kd29ya3MgbW9kdWxlcyAoY2xpZW50IHNpZGUpXG5pbXBvcnQgY2xpZW50U2lkZSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5jb25zdCBjbGllbnQgPSBjbGllbnRTaWRlLmNsaWVudDtcbmNvbnN0IGF1ZGlvQ29udGV4dCA9IGNsaWVudFNpZGUuYXVkaW9Db250ZXh0O1xuXG4vLyBJbXBvcnQgU291bmRmaWVsZCBtb2R1bGVzIChjbGllbnQgc2lkZSlcbmltcG9ydCBQbGF5ZXJQZXJmb3JtYW5jZSBmcm9tICcuL1BsYXllclBlcmZvcm1hbmNlLmpzJztcblxuLy8gSW5pdGlsaWF6ZSB0aGUgY2xpZW50IHR5cGVcbmNsaWVudC5pbml0KCdwbGF5ZXInKTtcblxuLy8gV2hlcmUgdGhlIG1hZ2ljIGhhcHBlbnNcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAvLyBJbnN0YW50aWF0ZSB0aGUgbW9kdWxlc1xuICBjb25zdCB3ZWxjb21lID0gbmV3IGNsaWVudFNpZGUuRGlhbG9nKHtcbiAgICBuYW1lOiAnd2VsY29tZScsXG4gICAgdGV4dDogYDxwPldlbGNvbWUgdG8gPGI+U291bmRmaWVsZDwvYj4uPC9wPlxuICAgICAgICAgICA8cD5Ub3VjaCB0aGUgc2NyZWVuIHRvIGpvaW4hPC9wPmAsXG4gICAgYWN0aXZhdGVBdWRpbzogdHJ1ZVxuICB9KTtcbiAgY29uc3Qgc2V0dXAgPSBuZXcgY2xpZW50U2lkZS5TZXR1cCgpO1xuICBjb25zdCBzcGFjZSA9IG5ldyBjbGllbnRTaWRlLlNwYWNlKCk7XG4gIGNvbnN0IGxvY2F0b3IgPSBuZXcgY2xpZW50U2lkZS5Mb2NhdG9yKHsgc2V0dXA6IHNldHVwLCBzcGFjZTogc3BhY2UgfSk7XG4gIGNvbnN0IHBlcmZvcm1hbmNlID0gbmV3IFBsYXllclBlcmZvcm1hbmNlKCk7XG5cbiAgLy8gU3RhcnQgdGhlIHNjZW5hcmlvLlxuICAvL1xuICAvLyBUaGUgc2NlbmFyaW8gY29uc2lzdHMgaW4gdHdvIG1ham9yIHN0ZXBzOlxuICAvLyAtIHRoZSBpbml0aWFsaXphdGlvbjtcbiAgLy8gLSB0aGUgcGVyZm9ybWFuY2UuXG4gIC8vXG4gIC8vIFRoZSBpbml0aWFsaXphdGlvbiBzdGVwIGNvbnNpc3RzIGluIHdlbGNvbWluZyB0aGUgcGxheWVyIGFuZCBnZXR0aW5nIGhpcyAvXG4gIC8vIGhlciBsb2NhdGlvbi4gVGhlc2UgdHdvIHN1Yi1zdGVwcyBjYW4gaGFwcGVuIGluIHBhcmFsbGVsLiBUaGUg4oCcR2V0dGluZyB0aGVcbiAgLy8gbG9jYXRpb27igJ0gc3RlcCByZXF1aXJlcyB0byBrbm93IHRoZSBzZXR1cCBiZWZvcmVoYW5kLCBzbyB3ZSBsYXVuY2ggaW5cbiAgLy8gc2VyaWFsIHRoZSBzZXR1cCBtb2R1bGUgdG8gZ2V0IHRoZSBzZXR1cCwgYW5kIHRoZW4gdGhlIGxvY2F0b3IuXG4gIC8vXG4gIC8vIFRoZSBwZXJmb3JtYW5jZSBzdGVwIGNhbiBzdGFydCB3aGVuIHRoZSBpbml0aWFsaXphdGlvbiBzdGVwIGlzIGRvbmUuXG4gIGNsaWVudC5zdGFydCgoc2VyaWFsLCBwYXJhbGxlbCkgPT5cbiAgICBzZXJpYWwoXG4gICAgICAvLyBJbml0aWFsaXphdGlvbiBzdGVwXG4gICAgICBwYXJhbGxlbChcbiAgICAgICAgd2VsY29tZSwgLy8gV2VsY29tZSBzY3JlZW5cbiAgICAgICAgc2VyaWFsKHNldHVwLCBsb2NhdG9yKSAvLyBHZXQgdGhlIGxvY2F0aW9uIChzZXR1cCBmaXJzdCwgbG9jYXRvciB0aGVuKVxuICAgICAgKSxcbiAgICAgIC8vIFBlcmZvcm1hbmNlIHN0ZXBcbiAgICAgIHBlcmZvcm1hbmNlXG4gICAgKVxuICApO1xufSk7XG4iXX0=