'use strict';

var clientSide = require('soundworks/client');
var Performance = require('./Performance');
var client = clientSide.client;

client.init('player');

window.addEventListener('load', () => {
  var setup = new clientSide.Setup();
  var welcome = new clientSide.Dialog({
    id: 'welcome',
    text: "<p>Welcome to <b>Wandering Sound</b>.</p> <p>Touch the screen to join!</p>",
    activateAudio: true
  });
  var checkin = new clientSide.Checkin({
    select: 'automatic',
    order: 'random'
  });
  var performance = new Performance(setup, checkin);

  client.start(
    client.serial(
      client.parallel(
        welcome,
        setup
      ),
      checkin,
      performance
    )
  );
});