/**
 * setup server 
 */
var serverSide = require('matrix/server');
var http = require('http');
var express = require('express');
var path = require('path');
var app = express();
var httpServer = http.createServer(app);

serverSide.ioServer.init(httpServer);

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, '../../public')));

app.get('/', function(req, res) {
	res.render('player', {
		title: 'The Matrix'
	});
});

app.get('/env', function(req, res) {
	res.render('env', {
		title: 'The Matrix — Environment'
	});
});

httpServer.listen(app.get('port'), function() {
	console.log('Server listening on port', app.get('port'));
});

/**
 * setup performance 
 */
var WsServerPerformanceManager = require('./WsServerPerformanceManager');
var topologyManager = new serverSide.TopologyManagerSimpleMatrix({"X": 3, "Y": 2});
var playerManager = new serverSide.PlayerManager();
var connectionManager = new serverSide.ConnectionManager();
var soloistManager = new serverSide.SoloistManagerRandomUrn(playerManager);
var placementManager = new serverSide.PlacementManagerAssignedPlaces(topologyManager);
var preparationManager = new serverSide.PreparationManagerPlacementAndSync(placementManager, null);
var performanceManager = new WsServerPerformanceManager(playerManager, topologyManager, soloistManager); // TODO: Revise in generic class.

connectionManager.on('connected', (socket) => {
	topologyManager.sendToClient(socket);
	playerManager.connect(socket);
});

connectionManager.on('disconnected', (socket) => {
	playerManager.disconnect(socket);
});

playerManager.on('connected', (client) => {
	placementManager.requestPlace(client);
});

playerManager.on('disconnected', (client) => {
	performanceManager.removeParticipant(client);
	soloistManager.removePlayer(client);
	placementManager.releasePlace(client);
});

preparationManager.on('ready', (client) => {
	playerManager.clientReady(client);
});

playerManager.on('playing', (client) => {
	performanceManager.addParticipant(client);
	soloistManager.addPlayer(client);
});