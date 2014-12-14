'use strict';

var clientSide = require('matrix/client');
var PlayerPerformance = require('./PlayerPerformance');
var ioClient = clientSide.ioClient;

ioClient.init('/play');

window.addEventListener('load', () => {
  var topology = new clientSide.TopologyGeneric();
  var sync = new clientSide.SetupSync();
  var placement = new clientSide.SetupPlacementAssigned();
  var performance = new PlayerPerformance(topology, placement);
  var manager = new clientSide.Manager([sync, placement], performance, topology);

  ioClient.start(() => {
    manager.start();
  });
});