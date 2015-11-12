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
    text: '<p>Welcome to <b>Soundfield</b>.</p>\n    <p>Touch the screen to join!</p>',
    activateAudio: true
  });
  var checkin = new _soundworksClient2['default'].Checkin();
  var performance = new _PlayerPerformanceJs2['default']();

  // Start the scenario and link the modules
  client.start(function (serial, parallel) {
    return serial(parallel(
    // We launch in parallel the welcome module, the loader and the checkin…
    welcome, checkin), performance // … and when all of them are done, we launch the performance.
    );
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvcGxheWVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O2dDQUN1QixtQkFBbUI7Ozs7OzttQ0FLWix3QkFBd0I7Ozs7OztBQUp0RCxJQUFNLE1BQU0sR0FBRyw4QkFBVyxNQUFNLENBQUM7QUFDakMsSUFBTSxZQUFZLEdBQUcsOEJBQVcsWUFBWSxDQUFDLEFBTTdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUd0QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFlBQU07O0FBRXBDLE1BQU0sT0FBTyxHQUFHLElBQUksOEJBQVcsTUFBTSxDQUFDO0FBQ3BDLFFBQUksRUFBRSxTQUFTO0FBQ2YsUUFBSSw4RUFDNkI7QUFDakMsaUJBQWEsRUFBRSxJQUFJO0dBQ3BCLENBQUMsQ0FBQztBQUNILE1BQU0sT0FBTyxHQUFHLElBQUksOEJBQVcsT0FBTyxFQUFFLENBQUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsc0NBQXVCLENBQUM7OztBQUc1QyxRQUFNLENBQUMsS0FBSyxDQUFDLFVBQUMsTUFBTSxFQUFFLFFBQVE7V0FDNUIsTUFBTSxDQUNKLFFBQVE7O0FBRU4sV0FBTyxFQUNQLE9BQU8sQ0FDUixFQUNELFdBQVc7S0FDWjtHQUFBLENBQ0YsQ0FBQztDQUNILENBQUMsQ0FBQyIsImZpbGUiOiJzcmMvY2xpZW50L3BsYXllci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEltcG9ydCBTb3VuZHdvcmtzIG1vZHVsZXMgKGNsaWVudCBzaWRlKVxuaW1wb3J0IGNsaWVudFNpZGUgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuY29uc3QgY2xpZW50ID0gY2xpZW50U2lkZS5jbGllbnQ7XG5jb25zdCBhdWRpb0NvbnRleHQgPSBjbGllbnRTaWRlLmF1ZGlvQ29udGV4dDtcblxuLy8gSW1wb3J0IG1vZHVsZXMgd3JpdHRlbiBmb3IgU291bmRmaWVsZFxuaW1wb3J0IFBsYXllclBlcmZvcm1hbmNlIGZyb20gJy4vUGxheWVyUGVyZm9ybWFuY2UuanMnO1xuXG4vLyBJbml0aWxpYXplIHRoZSBjbGllbnQgdHlwZVxuY2xpZW50LmluaXQoJ3BsYXllcicpO1xuXG4vLyBXaGVyZSB0aGUgbWFnaWMgaGFwcGVuc1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gIC8vIEluc3RhbnRpYXRlIHRoZSBtb2R1bGVzXG4gIGNvbnN0IHdlbGNvbWUgPSBuZXcgY2xpZW50U2lkZS5EaWFsb2coe1xuICAgIG5hbWU6ICd3ZWxjb21lJyxcbiAgICB0ZXh0OiBgPHA+V2VsY29tZSB0byA8Yj5Tb3VuZGZpZWxkPC9iPi48L3A+XG4gICAgPHA+VG91Y2ggdGhlIHNjcmVlbiB0byBqb2luITwvcD5gLFxuICAgIGFjdGl2YXRlQXVkaW86IHRydWVcbiAgfSk7XG4gIGNvbnN0IGNoZWNraW4gPSBuZXcgY2xpZW50U2lkZS5DaGVja2luKCk7XG4gIGNvbnN0IHBlcmZvcm1hbmNlID0gbmV3IFBsYXllclBlcmZvcm1hbmNlKCk7XG5cbiAgLy8gU3RhcnQgdGhlIHNjZW5hcmlvIGFuZCBsaW5rIHRoZSBtb2R1bGVzXG4gIGNsaWVudC5zdGFydCgoc2VyaWFsLCBwYXJhbGxlbCkgPT5cbiAgICBzZXJpYWwoXG4gICAgICBwYXJhbGxlbChcbiAgICAgICAgLy8gV2UgbGF1bmNoIGluIHBhcmFsbGVsIHRoZSB3ZWxjb21lIG1vZHVsZSwgdGhlIGxvYWRlciBhbmQgdGhlIGNoZWNraW7igKZcbiAgICAgICAgd2VsY29tZSxcbiAgICAgICAgY2hlY2tpblxuICAgICAgKSxcbiAgICAgIHBlcmZvcm1hbmNlIC8vIOKApiBhbmQgd2hlbiBhbGwgb2YgdGhlbSBhcmUgZG9uZSwgd2UgbGF1bmNoIHRoZSBwZXJmb3JtYW5jZS5cbiAgICApXG4gICk7XG59KTtcbiJdfQ==