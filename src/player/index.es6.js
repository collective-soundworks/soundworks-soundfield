'use strict';

var clientSide = require('soundworks/client');
var Performance = require('./Performance');
var client = clientSide.client;

client.init('/player');

window.addEventListener('load', () => {
  var topology = new clientSide.Topology({'display': true});
  var welcome = new clientSide.Dialog({
    id: 'welcome',
    text: "<p>Welcome to <b>Wandering Sound</b>.</p> <p>Touch the screen to join!</p>",
    activateAudio: true
  });
  // var sync = new clientSide.Sync();
  var placement = new clientSide.Placement({'display': true});
  var performance = new Performance(topology, placement);

  client.start(
    client.serial(
      client.parallel(
        welcome,
        topology
      ),
      placement,
      performance
    )
  );

});