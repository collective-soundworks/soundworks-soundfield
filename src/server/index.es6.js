'use strict';

var serverSide = require('soundworks/server');
var server = serverSide.server;
var WanderingSoundPerformance = require('./WanderingSoundPerformance');

var path = require('path');
var express = require('express');
var app = express();



// start server side



// if (topology)
//   topology.init();









/* ============================================================================== *
 * Scenario                                                                       *
 * ============================================================================== */

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, '../../public')));

var topology = new serverSide.Topology({type: 'matrix', cols: 3, rows: 2});
var placement = new serverSide.Placement({topology: topology, order: 'random'});
var performance = new WanderingSoundPerformance(topology); // TODO

server.start(app);
server.map('/player', 'Wandering Sound', topology, placement, performance);
server.map('/env', 'Wandering Sound — Environment', topology, performance);