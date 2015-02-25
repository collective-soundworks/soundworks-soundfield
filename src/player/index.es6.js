'use strict';

var clientSide = require('soundworks/client');
var Performance = require('./Performance');
var client = clientSide.client;

client.init('/player');

window.addEventListener('load', () => {
  var seatmap = new clientSide.Seatmap();

  var welcome = new clientSide.Dialog({
    id: 'welcome',
    text: "<p>Welcome to <b>Wandering Sound</b>.</p> <p>Touch the screen to join!</p>",
    activateAudio: true
  });

  var checkin = new clientSide.Checkin({
    'display': true
  });

  var performance = new Performance(seatmap, checkin);

  client.start(
    client.serial(
      client.parallel(
        welcome,
        seatmap
      ),
      checkin,
      performance
    )
  );
});