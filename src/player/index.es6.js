'use strict';

var clientSide = require('matrix/client');
var PlayerPerformance = require('./PlayerPerformance');

clientSide.ioClient.init('/play');

window.addEventListener('load', () => {
  var topologyManager = new clientSide.TopologyManagerGeneric({display: true});
  var placementManager = new clientSide.PlacementManagerAssignedPlaces({dialog: true});
  var syncManager = new clientSide.SyncManager();
  var setupManager = new clientSide.SetupManagerPlacementAndSync(placementManager, syncManager);
  var performanceManager = new PlayerPerformance(topologyManager);

  clientSide.start(setupManager, performanceManager, topologyManager);
});