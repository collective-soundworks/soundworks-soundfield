var matrixServer = require('matrix/server');
var ServerPlayerManager = matrixServer.PlayerManager;
var ServerConnectionManager = matrixServer.ConnectionManager;
var ServerPlacementManagerAssignedPlaces = matrixServer.PlacementManagerAssignedPlaces;
var ServerPreparationManagerPlacementAndSync = matrixServer.PreparationManagerPlacementAndSync;
var ServerSoloistManagerRandomUrn = matrixServer.SoloistManagerRandomUrn;
var ServerTopologyModelSimpleMatrix = matrixServer.TopologyModelSimpleMatrix;
var WanderingSoundServerPerformanceManager = require('./WanderingSoundServerPerformanceManager');

'use strict';

class WanderingSoundServerSetup {
  constructor(params) {
    var topologyModel = new ServerTopologyModelSimpleMatrix(params, this.setup);
  }

  setup() {
    var topologyModel = this;
    var playerManager = new ServerPlayerManager();
    var connectionManager = new ServerConnectionManager();
    var soloistManager = new ServerSoloistManagerRandomUrn(playerManager);
    var performanceManager = new WanderingSoundServerPerformanceManager(playerManager, topologyModel, soloistManager); // TODO: Revise in generic class.
    var placementManager = new ServerPlacementManagerAssignedPlaces(topologyModel);
    var preparationManager = new ServerPreparationManagerPlacementAndSync(placementManager, null);

    connectionManager.on('connected', (socket) => {
      topologyModel.sendToClient(socket);
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
  }
}

module.exports = WanderingSoundServerSetup;