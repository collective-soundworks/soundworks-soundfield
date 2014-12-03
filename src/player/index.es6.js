var clientSide = require('matrix/client');
var PlayerPerform = require('./PlayerPerform');

var ioClient = clientSide.ioClient;
ioClient.init('/play');

window.addEventListener('load', () => {
  var socket = ioClient.socket;

  socket.on('topology', (topology) => {
    var input = new clientSide.Input();
    var setupManager = new clientSide.SetupManagerPlacementAndSync();
    var performanceManager = new PlayerPerform(input, topology);

    setupManager.start();

    setupManager.on('setup_ready', (placeInfo) => {
      performanceManager.start(placeInfo);
    });
  });

});