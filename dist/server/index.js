// Import external libraries
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// Import Soundworks modules (server side)

var _soundworksServer = require('soundworks/server');

var _soundworksServer2 = _interopRequireDefault(_soundworksServer);

// Import modules written for Soundfield

var _PlayerPerformanceJs = require('./PlayerPerformance.js');

var _PlayerPerformanceJs2 = _interopRequireDefault(_PlayerPerformanceJs);

var _SoloistPerformanceJs = require('./SoloistPerformance.js');

var _SoloistPerformanceJs2 = _interopRequireDefault(_SoloistPerformanceJs);

// Instantiate the modules
var express = require('express');
var path = require('path');
var server = _soundworksServer2['default'].server;var setup = new _soundworksServer2['default'].Setup();
setup.generate('surface', { height: 1, width: 1 });
var locator = new _soundworksServer2['default'].Locator({ setup: setup });
var playerPerformance = new _PlayerPerformanceJs2['default']();
var soloistPerformance = new _SoloistPerformanceJs2['default']();

// Launch server
var app = express();
var dir = path.join(__dirname, '../../public');
server.start(app, dir, process.env.PORT || 3000);

// Map modules to client types
server.map('player', setup, locator, playerPerformance);
server.map('soloist', soloistPerformance);