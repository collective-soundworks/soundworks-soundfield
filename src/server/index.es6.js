'use strict';

var serverSide = require('soundworks/server');
var ServerPerformance = require('./ServerPerformance');
var path = require('path');
var express = require('express');
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, '../../public')));

app.get('/', function(req, res) {
	res.render('player', {
		title: 'Wandering Sound'
	});
});

app.get('/env', function(req, res) {
	res.render('env', {
		title: 'Wandering Sound — Environment'
	});
});

// init socket io server
serverSide.ioServer.init(app);

// start server side
var topology = new serverSide.TopologyMatrix({cols: 3, rows: 2});
var sync = new serverSide.SetupSync({iterations: 10});
var placement = new serverSide.SetupPlacementAssigned({topology: topology, order: 'random'});
var performance = new ServerPerformance(topology);
var manager = new serverSide.ManagerPlayers([sync, placement], performance, topology);

if (topology)
  topology.init();
