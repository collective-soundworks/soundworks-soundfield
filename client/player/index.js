// Import Soundworks library modules (client side)
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _soundworksClient = require('soundworks/client');

// Import Soundfield modules (client side)

var _PlayerPerformanceJs = require('./PlayerPerformance.js');

var _PlayerPerformanceJs2 = _interopRequireDefault(_PlayerPerformanceJs);

// Initiliaze the client type
_soundworksClient.client.init('player');

// Where the magic happens
window.addEventListener('load', function () {
  // Instantiate the modules
  var welcome = new _soundworksClient.Dialog({
    name: 'welcome',
    text: '<p>Welcome to <b>Soundfield</b>.</p>\n           <p>Touch the screen to join!</p>',
    activateAudio: true
  });
  var setup = new _soundworksClient.Setup();
  var space = new _soundworksClient.Space();
  var locator = new _soundworksClient.Locator({ setup: setup, space: space });
  var performance = new _PlayerPerformanceJs2['default']();

  // Start the scenario and order the modules.
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
  _soundworksClient.client.start(function (serial, parallel) {
    return serial(
    // Initialization step
    parallel(welcome, // Welcome screen
    serial(setup, locator) // Get the location (setup first, locator then)
    ),
    // Performance step
    performance);
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2JpL0Rldi9jb2xsZWN0aXZlLXNvdW5kd29ya3MtZGV2ZWxvcC9zb3VuZGZpZWxkL3NyYy9jbGllbnQvcGxheWVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O2dDQU1zQixtQkFBbUI7Ozs7bUNBR1gsd0JBQXdCOzs7OztBQUd0RCx5QkFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUd0QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFlBQU07O0FBRXBDLE1BQU0sT0FBTyxHQUFHLDZCQUFXO0FBQ3pCLFFBQUksRUFBRSxTQUFTO0FBQ2YsUUFBSSxxRkFDb0M7QUFDeEMsaUJBQWEsRUFBRSxJQUFJO0dBQ3BCLENBQUMsQ0FBQztBQUNILE1BQU0sS0FBSyxHQUFHLDZCQUFXLENBQUM7QUFDMUIsTUFBTSxLQUFLLEdBQUcsNkJBQVcsQ0FBQztBQUMxQixNQUFNLE9BQU8sR0FBRyw4QkFBWSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDNUQsTUFBTSxXQUFXLEdBQUcsc0NBQXVCLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBYzVDLDJCQUFPLEtBQUssQ0FBQyxVQUFDLE1BQU0sRUFBRSxRQUFRO1dBQzVCLE1BQU07O0FBRUosWUFBUSxDQUNOLE9BQU87QUFDUCxVQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQztLQUN2Qjs7QUFFRCxlQUFXLENBQ1o7R0FBQSxDQUNGLENBQUM7Q0FDSCxDQUFDLENBQUMiLCJmaWxlIjoiL1VzZXJzL3JvYmkvRGV2L2NvbGxlY3RpdmUtc291bmR3b3Jrcy1kZXZlbG9wL3NvdW5kZmllbGQvc3JjL2NsaWVudC9wbGF5ZXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbXBvcnQgU291bmR3b3JrcyBsaWJyYXJ5IG1vZHVsZXMgKGNsaWVudCBzaWRlKVxuaW1wb3J0IHsgY2xpZW50LFxuICAgICAgICAgYXVkaW9Db250ZXh0LFxuICAgICAgICAgRGlhbG9nLFxuICAgICAgICAgTG9jYXRvcixcbiAgICAgICAgIFNldHVwLFxuICAgICAgICAgU3BhY2UgfSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5cbi8vIEltcG9ydCBTb3VuZGZpZWxkIG1vZHVsZXMgKGNsaWVudCBzaWRlKVxuaW1wb3J0IFBsYXllclBlcmZvcm1hbmNlIGZyb20gJy4vUGxheWVyUGVyZm9ybWFuY2UuanMnO1xuXG4vLyBJbml0aWxpYXplIHRoZSBjbGllbnQgdHlwZVxuY2xpZW50LmluaXQoJ3BsYXllcicpO1xuXG4vLyBXaGVyZSB0aGUgbWFnaWMgaGFwcGVuc1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gIC8vIEluc3RhbnRpYXRlIHRoZSBtb2R1bGVzXG4gIGNvbnN0IHdlbGNvbWUgPSBuZXcgRGlhbG9nKHtcbiAgICBuYW1lOiAnd2VsY29tZScsXG4gICAgdGV4dDogYDxwPldlbGNvbWUgdG8gPGI+U291bmRmaWVsZDwvYj4uPC9wPlxuICAgICAgICAgICA8cD5Ub3VjaCB0aGUgc2NyZWVuIHRvIGpvaW4hPC9wPmAsXG4gICAgYWN0aXZhdGVBdWRpbzogdHJ1ZVxuICB9KTtcbiAgY29uc3Qgc2V0dXAgPSBuZXcgU2V0dXAoKTtcbiAgY29uc3Qgc3BhY2UgPSBuZXcgU3BhY2UoKTtcbiAgY29uc3QgbG9jYXRvciA9IG5ldyBMb2NhdG9yKHsgc2V0dXA6IHNldHVwLCBzcGFjZTogc3BhY2UgfSk7XG4gIGNvbnN0IHBlcmZvcm1hbmNlID0gbmV3IFBsYXllclBlcmZvcm1hbmNlKCk7XG5cbiAgLy8gU3RhcnQgdGhlIHNjZW5hcmlvIGFuZCBvcmRlciB0aGUgbW9kdWxlcy5cbiAgLy9cbiAgLy8gVGhlIHNjZW5hcmlvIGNvbnNpc3RzIGluIHR3byBtYWpvciBzdGVwczpcbiAgLy8gLSB0aGUgaW5pdGlhbGl6YXRpb247XG4gIC8vIC0gdGhlIHBlcmZvcm1hbmNlLlxuICAvL1xuICAvLyBUaGUgaW5pdGlhbGl6YXRpb24gc3RlcCBjb25zaXN0cyBpbiB3ZWxjb21pbmcgdGhlIHBsYXllciBhbmQgZ2V0dGluZyBoaXMgL1xuICAvLyBoZXIgbG9jYXRpb24uIFRoZXNlIHR3byBzdWItc3RlcHMgY2FuIGhhcHBlbiBpbiBwYXJhbGxlbC4gVGhlIOKAnEdldHRpbmcgdGhlXG4gIC8vIGxvY2F0aW9u4oCdIHN0ZXAgcmVxdWlyZXMgdG8ga25vdyB0aGUgc2V0dXAgYmVmb3JlaGFuZCwgc28gd2UgbGF1bmNoIGluXG4gIC8vIHNlcmlhbCB0aGUgc2V0dXAgbW9kdWxlIHRvIGdldCB0aGUgc2V0dXAsIGFuZCB0aGVuIHRoZSBsb2NhdG9yLlxuICAvL1xuICAvLyBUaGUgcGVyZm9ybWFuY2Ugc3RlcCBjYW4gc3RhcnQgd2hlbiB0aGUgaW5pdGlhbGl6YXRpb24gc3RlcCBpcyBkb25lLlxuICBjbGllbnQuc3RhcnQoKHNlcmlhbCwgcGFyYWxsZWwpID0+XG4gICAgc2VyaWFsKFxuICAgICAgLy8gSW5pdGlhbGl6YXRpb24gc3RlcFxuICAgICAgcGFyYWxsZWwoXG4gICAgICAgIHdlbGNvbWUsIC8vIFdlbGNvbWUgc2NyZWVuXG4gICAgICAgIHNlcmlhbChzZXR1cCwgbG9jYXRvcikgLy8gR2V0IHRoZSBsb2NhdGlvbiAoc2V0dXAgZmlyc3QsIGxvY2F0b3IgdGhlbilcbiAgICAgICksXG4gICAgICAvLyBQZXJmb3JtYW5jZSBzdGVwXG4gICAgICBwZXJmb3JtYW5jZVxuICAgIClcbiAgKTtcbn0pO1xuIl19