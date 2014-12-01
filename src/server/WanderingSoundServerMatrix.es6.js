var matrixServer = require('matrix/server');
var ServerPlayerManager = matrixServer.PlayerManager;
var ServerConnectionManager = matrixServer.ConnectionManager;
var ServerPlacementManagerAssignedPlaces = matrixServer.PlacementManagerAssignedPlaces;
var ServerPreparationManagerPlacement = matrixServer.PreparationManagerPlacement;
var ServerSoloistManagerRandomUrn = matrixServer.SoloistManagerRandomUrn;
var ServerTopologyModelSimpleMatrix = matrixServer.TopologyModelSimpleMatrix;
var WanderingSoundServerDynamicModel = require('./WanderingSoundServerDynamicModel');

'use strict';

class WanderingSoundServerMatrix {
  constructor(matrixParameters) {
    var topologyModel = new ServerTopologyModelSimpleMatrix(matrixParameters, this.setup);
  }

  setup() {
    var topologyModel = this;
    var playerManager = new ServerPlayerManager();
    var connectionManager = new ServerConnectionManager();
    var soloistManager = new ServerSoloistManagerRandomUrn(playerManager);
    var dynamicModel = new WanderingSoundServerDynamicModel(playerManager, topologyModel, soloistManager); // TODO: Revise in generic class.
    var placementManager = new ServerPlacementManagerAssignedPlaces(topologyModel);
    var preparationManager = new ServerPreparationManagerPlacement(placementManager);

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
      dynamicModel.removeParticipant(client);
      soloistManager.removePlayer(client);
      placementManager.releasePlace(client);
    });

    preparationManager.on('ready', (client) => {
      playerManager.clientReady(client);
    });

    playerManager.on('playing', (client) => {
      dynamicModel.addParticipant(client);
      soloistManager.addPlayer(client);
    });
  }
}

module.exports = WanderingSoundServerMatrix;