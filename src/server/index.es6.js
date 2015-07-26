'use strict';

// Soundworks library and Wandering Sound files
var serverSide = require('soundworks/server');
var server = serverSide.server;
var Performance = require('./Performance');

// Express application
var express = require('express');
var app = express();
var path = require('path');
var dir = path.join(__dirname, '../../public');

/*
 *  Scenario
 * ======================================================================= */

var setup = new serverSide.Setup();
setup.generate('matrix', {cols: 3, rows: 2});

var checkin = new serverSide.Checkin({
  setup: setup,
  order: 'random'
});

var performance = new Performance(setup, {
  idleDuration: 10,
  soloDuration: 30
});

server.start(app, dir, 3000);
server.map('player', setup, checkin, performance);
