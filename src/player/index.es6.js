var clientSide = require('matrix/client');
var PlayerPerformanceManager = require('./WsPlayerPerformanceManager');

window.socket = window.socket || io('/play'); // TODO: make a module

window.addEventListener('load', () => {

  socket.on('topology', (topology) => {
    var input = new clientSide.Input();
    var placementManager = new clientSide.PlacementManagerAssignedPlaces();
    var performanceManager = new PlayerPerformanceManager(input, topology);

    placementManager.on('ready', (placeInfo) => {
      performanceManager.start(placeInfo);
    });
  });

});