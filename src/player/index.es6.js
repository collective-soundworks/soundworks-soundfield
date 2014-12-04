var clientSide = require('matrix/client');
var PlayerPerform = require('./PlayerPerform');

var ioClient = clientSide.ioClient;
ioClient.init('/play');

window.addEventListener('load', () => {
  var socket = ioClient.socket;

  socket.on('topology', (topology) => {
    var inputManager = new clientSide.InputManager();
    var syncManager = new clientSide.SyncManager();
    var placementManager = new clientSide.PlacementManagerAssignedPlaces();
    var setupManager = new clientSide.SetupManagerPlacementAndSync(placementManager, syncManager);
    var performanceManager = new PlayerPerform(inputManager, topology);

    setupManager.start();

    setupManager.on('setup_ready', (placeInfo) => {
      performanceManager.start(placeInfo);
    });
  });

});