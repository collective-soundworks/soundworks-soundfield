window.socket = window.socket || io('/play'); // TODO: make a module

var matrix = require('matrix/client');

var ClientPlacementManagerAssignedPlaces = matrix.PlacementManagerAssignedPlaces;
var ClientInput = matrix.Input;
var WanderingSoundPlayerDynamicModel = require('./WanderingSoundPlayerDynamicModel.js');


window.addEventListener('load', () => {

  socket.on('topology', (topology) => {
    var input = new ClientInput();
    var placementManager = new ClientPlacementManagerAssignedPlaces();
    var dynamicModel = new WanderingSoundPlayerDynamicModel(input, topology);

    placementManager.on('ready', (placeInfo) => {
      dynamicModel.start(placeInfo);
    });
  });

})