'use strict';

var serverSide = require('matrix/server');
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

// create manangers and start server side
var topologyManager = new serverSide.TopologyManagerRegularMatrix({cols: 3, rows: 2});
var placementManager = new serverSide.PlacementManagerAssignedPlaces({topology: topologyManager, order: 'random'});
var syncManager = new serverSide.SyncManager();
var setupManager = new serverSide.SetupManagerPlacementAndSync(placementManager, syncManager);
var performanceManager = new ServerPerformance(topologyManager);

serverSide.start(setupManager, performanceManager, topologyManager);
