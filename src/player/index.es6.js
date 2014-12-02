var matrixClient = require('matrix/client');
var ClientPlacementManagerAssignedPlaces = matrixClient.PlacementManagerAssignedPlaces;
var ClientInput = matrixClient.Input;
var WanderingSoundPlayerPerformanceManager = require('./WanderingSoundPlayerPerformanceManager.js');

window.socket = window.socket || io('/play'); // TODO: make a module

window.addEventListener('load', () => {

  socket.on('topology', (topology) => {
    var input = new ClientInput();
    var placementManager = new ClientPlacementManagerAssignedPlaces();
    var performanceManager = new WanderingSoundPlayerPerformanceManager(input, topology);

    placementManager.on('ready', (placeInfo) => {
      performanceManager.start(placeInfo);
    });
  });

});