// Import Soundworks modules (client side)
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _soundworksClient = require('soundworks/client');

var _soundworksClient2 = _interopRequireDefault(_soundworksClient);

// Import modules written for Soundfield

var _SoloistPerformanceJs = require('./SoloistPerformance.js');

var _SoloistPerformanceJs2 = _interopRequireDefault(_SoloistPerformanceJs);

// Initialize the client type

var client = _soundworksClient2['default'].client;
var audioContext = _soundworksClient2['default'].audioContext;client.init('soloist');

// Where the magic happens
window.addEventListener('load', function () {
  // Instantiate the modules
  var welcome = new _soundworksClient2['default'].Dialog({
    name: 'welcome',
    text: '<p>Welcome to <b>Soundfield</b>.</p>\n    <p>Touch the screen to join!</p>',
    activateAudio: true
  });
  var checkin = new _soundworksClient2['default'].Checkin();
  var loader = new _soundworksClient2['default'].Loader({ files: files });
  var performance = new _SoloistPerformanceJs2['default'](loader);

  // Start the scenario and link the modules
  client.start(function (serial, parallel) {
    return serial(parallel(
    // We launch in parallel the welcome module, the loader and the checkin…
    welcome, loader, checkin), performance // … and when all of them are done, we launch the performance.
    );
  });
});