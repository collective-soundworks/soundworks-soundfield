'use strict';

// Soundworks library and Wandering Sound files
var serverSide = require('soundworks/server');
var server = serverSide.server;
var WanderingSoundPerformance = require('./WanderingSoundPerformance');

// Express application
var express = require('express');
var app = express();
var path = require('path');
var dir = path.join(__dirname, '../../public');

/*
 *  Scenario
 * ======================================================================= */

var seatmap = new serverSide.Seatmap({type: 'matrix', cols: 3, rows: 2});
var checkin = new serverSide.Checkin({seatmap: seatmap, order: 'random'});
var performance = new WanderingSoundPerformance(seatmap);

server.start(app, dir, 3000);
server.map('/player', 'Wandering Sound', seatmap, checkin, performance);
server.map('/env', 'Wandering Sound — Environment', seatmap, performance);