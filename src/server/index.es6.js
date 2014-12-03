/**
 * setup server
 */
var serverSide = require('matrix/server');
var express = require('express');
var app = express();

// serverSide.setupServer(app);

var http = require('http');
var path = require('path');
var httpServer = http.createServer(app);

serverSide.ioServer.init(httpServer);

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

httpServer.listen(app.get('port'), function() {
  console.log('Server listening on port', app.get('port'));
});

/**
 * setup performance
 */
var ServerPerform = require('./ServerPerform');
var topologyManager = new serverSide.TopologyManagerRegularMatrix({
  "X": 3,
  "Y": 2
});

topologyManager.on('topology_ready', () => {
  var connectionManager = new serverSide.ConnectionManager();
  var playerManager = new serverSide.PlayerManager();
  var soloistManager = new serverSide.SoloistManagerRandomUrn(playerManager);
  var placementManager = new serverSide.PlacementManagerAssignedPlaces(topologyManager);
  var syncManager = new serverSide.SyncManager();
  var setupManager = new serverSide.SetupManagerPlacementAndSync(placementManager, syncManager);
  var performanceManager = new ServerPerform(playerManager, topologyManager, soloistManager); // TODO: Revise in generic class.

  // serverSide.createScenario(setupManager, performanceManager);

  connectionManager.on('connected', (socket) => {
    topologyManager.send(socket);
    playerManager.register(socket);
  });

  connectionManager.on('disconnected', (socket) => {
    playerManager.unregister(socket);
  });

  playerManager.on('player_registered', (player) => {
    setupManager.addPlayer(player);
  });

  playerManager.on('player_unregistered', (player) => {
    performanceManager.removePlayer(player);
    setupManager.removePlayer(player);
  });

  setupManager.on('setup_ready', (player) => {
    playerManager.playerReady(player);
  });

  playerManager.on('player_ready', (player) => {
    performanceManager.addPlayer(player);
  });
});