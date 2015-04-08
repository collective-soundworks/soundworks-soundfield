'use strict';

var clientSide = require('soundworks/client');
var client = clientSide.client;
var input = clientSide.input;
var audioContext = clientSide.audioContext;
var SimpleSynth = require('./SimpleSynth');

function beep() {
  var time = audioContext.currentTime;
  var duration = 0.2;
  var attack = 0.001;

  var g = audioContext.createGain();
  g.connect(audioContext.destination);
  g.gain.value = 0;
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(0.5, time + attack);
  g.gain.exponentialRampToValueAtTime(0.0000001, time + duration);
  g.gain.setValueAtTime(0, time);

  var o = audioContext.createOscillator();
  o.connect(g);
  o.frequency.value = 600;
  o.start(time);
  o.stop(time + duration);
}

class Performance extends clientSide.Performance {
  constructor(setup, checkin, options = {}) {
    super(options);

    this.setup = setup;
    this.checkin = checkin;
    this.synths = [new SimpleSynth(false), new SimpleSynth(true)];

    // setup display
    var setupDiv = document.createElement('div');
    setupDiv.setAttribute('id', 'setup');
    setupDiv.classList.add('hidden');

    this.setupDiv = setupDiv;
    this.view.appendChild(this.setupDiv);

    // setup liteners
    this.__inputListener();
    this.__performanceControlListener();

    client.receive('performance:playersInit', (playerList) => {
      this.__initPlayers(playerList);
    });

    client.receive('performance:playerAdd', (player) => {
      this.__addPlayer(player);
    });

    client.receive('performance:playerRemove', (player) => {
      this.__removePlayer(player);
    });

    client.receive('performance:soloistsInit', (soloistList) => {
      this.__initSoloists(soloistList);
    });

    client.receive('performance:soloistAdd', (soloist) => {
      this.__addSoloist(soloist);
    });

    client.receive('performance:soloistRemove', (soloist) => {
      this.__removeSoloist(soloist);
    });
  }

  __initPlayers(playerList) {
    for (let i = 0; i < playerList.length; i++)
      this.setup.addClassToPosition(this.setupDiv, playerList[i].index, 'player');
  }

  __addPlayer(player) {
    this.setup.addClassToPosition(this.setupDiv, player.index, 'player');
  }

  __removePlayer(player) {
    this.setup.removeClassFromPosition(this.setupDiv, player.index, 'player');

    var soloistId = player.soloistId;

    if (soloistId) {
      this.synths[soloistId].update(1, 0);
      this.__changeBackgroundColor(1);
    }
  }

  __initSoloists(soloistList) {
    // for (let i = 0; i < soloistList.length; i++)
    //   this.setup.addClassToPosition(this.setupDiv, soloistList[i].index, 'soloist');
  }

  __addSoloist(soloist) {
    // this.setup.addClassToPosition(this.setupDiv, soloist.index, 'soloist');

    if (soloist.index === client.index) {
      input.enableTouch(this.setupDiv);

      this.__centeredViewContent.classList.add('hidden');
      this.setupDiv.classList.remove('hidden');

      beep();
    }
  }

  __removeSoloist(soloist) {
    var soloistId = soloist.soloistId;

    // this.setup.removeClassFromPosition(this.setupDiv, soloist.index, 'soloist');

    this.synths[soloistId].update(1, 0);
    this.__changeBackgroundColor(1); // TODO: incorrect

    if (soloist.index === client.index) {
      input.disableTouch(this.setupDiv);

      this.setupDiv.classList.add('hidden');
      this.__centeredViewContent.classList.remove('hidden');
    }
  }

  __changeBackgroundColor(d) {
    var value = Math.floor(Math.max(1 - d, 0) * 255);
    this.view.style.backgroundColor = 'rgb(' + value + ', ' + value + ', ' + value + ')';
  }

  __inputListener() {
    input.on('touchstart', this.__touchHandler.bind(this));
    input.on('touchmove', this.__touchHandler.bind(this));
    input.on('touchend', this.__touchHandler.bind(this));
  }

  __performanceControlListener() {
    client.receive('performance:control', (soloistId, d, s) => {
      this.synths[soloistId].update(d, s);
      this.__changeBackgroundColor(d);
    });
  }

  __touchHandler(touchData) {
    var x = (touchData.coordinates[0] - this.setupDiv.offsetLeft + window.scrollX) / this.setupDiv.offsetWidth;
    var y = (touchData.coordinates[1] - this.setupDiv.offsetTop + window.scrollY) / this.setupDiv.offsetHeight;

    client.send('performance:' + touchData.event, [x, y], touchData.timestamp); // TODO: might be a good idea to send the time in sever clock. (Requires sync module.)
  }

  start() {
    super.start();

    let htmlContent = "<p><small>You are at position</small></p>" + "<div class='checkin-label'><span>" + this.checkin.label + "</span></div>";
    this.setCenteredViewContent(htmlContent);
    this.__centeredViewContent.classList.add('info');

    this.setup.display(this.setupDiv);
    this.setup.addClassToPosition(this.setupDiv, client.index, 'me');
  }
}

module.exports = Performance;