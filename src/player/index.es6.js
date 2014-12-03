var clientSide = require('matrix/client');
var PlayerPerform = require('./PlayerPerform');

window.socket = window.socket || io('/play'); // TODO: make a module

window.addEventListener('load', () => {

  socket.on('topology', (topology) => {
    var input = new clientSide.Input();
    var preparationManager = new clientSide.PlacementManagerAssignedPlaces();
    var performanceManager = new PlayerPerform(input, topology);

    preparationManager.on('ready', (placeInfo) => {
      performanceManager.start(placeInfo);
    });
  });

});