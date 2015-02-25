'use strict';

var clientSide = require('soundworks/client');
var client = clientSide.client;
var input = clientSide.input;
var audioContext = require('audio-context');
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

class Performance extends clientSide.Module {
  constructor(topology, checkin, params = {}) {
    super(params);

    this.topology = topology;
    this.checkin = checkin;
    this.synths = [new SimpleSynth(false), new SimpleSynth(true)];

    // place info display
    var infoDiv = document.createElement('div');
    infoDiv.setAttribute('id', 'info');
    infoDiv.classList.add('centered-content');
    infoDiv.classList.add('info');

    this.infoDiv = infoDiv;
    this.displayDiv.appendChild(this.infoDiv);

    // topology display
    var topologyDiv = document.createElement('div');
    topologyDiv.setAttribute('id', 'topology');

    this.topologyDiv = topologyDiv;
    this.displayDiv.appendChild(this.topologyDiv);

    // setup liteners
    this.__inputListener();
    this.__performanceControlListener();

    var socket = client.socket;

    socket.on('players_init', (playerList) => {
      this.__initPlayers(playerList);
    });

    socket.on('player_add', (player) => {
      this.__addPlayer(player);
    });

    socket.on('player_remove', (player) => {
      this.__removePlayer(player);
    });

    socket.on('soloists_init', (soloistList) => {
      this.__initSoloists(soloistList);
    });

    socket.on('soloist_add', (soloist) => {
      this.__addSoloist(soloist);
    });

    socket.on('soloist_remove', (soloist) => {
      this.__removeSoloist(soloist);
    });
  }

  __initPlayers(playerList) {
    for (let i = 0; i < playerList.length; i++)
      this.topology.changeTileClass(this.topologyDiv, playerList[i].index, true);
  }

  __addPlayer(player) {
    this.topology.changeTileClass(this.topologyDiv, player.index, true);
  }

  __removePlayer(player) {
    this.topology.changeTileClass(this.topologyDiv, player.index, false);

    var soloistId = player.soloistId;

    if (soloistId) {
      this.synths[soloistId].update(1, 0);
      this.__changeBackgroundColor(1);
    }
  }

  __initSoloists(soloistList) {
    // for (let i = 0; i < soloistList.length; i++)
    //   this.topology.changeTileClass(this.topologyDiv, soloistList[i].index, true, 'soloist');
  }

  __addSoloist(soloist) {
    // this.topology.changeTileClass(this.topologyDiv, soloist.index, true, 'soloist');

    var socket = client.socket;

    if (soloist.socketId === socket.io.engine.id) {
      input.enableTouch(this.topologyDiv);

      this.infoDiv.classList.add('hidden');
      this.topologyDiv.classList.remove('hidden');

      beep();
    }
  }

  __removeSoloist(soloist) {
    var soloistId = soloist.soloistId;

    // this.topology.changeTileClass(this.topologyDiv, soloist.index, false, 'soloist');

    this.synths[soloistId].update(1, 0);
    this.__changeBackgroundColor(1); // TODO: incorrect

    var socket = client.socket;

    if (soloist.socketId === socket.io.engine.id) {
      input.disableTouch(this.topologyDiv);

      this.topologyDiv.classList.add('hidden');
      this.infoDiv.classList.remove('hidden');
    }
  }

  __changeBackgroundColor(d) {
    var value = Math.floor(Math.max(1 - d, 0) * 255);
    this.displayDiv.style.backgroundColor = 'rgb(' + value + ', ' + value + ', ' + value + ')';
  }

  __inputListener() {
    input.on('touchstart', this.__touchHandler.bind(this));
    input.on('touchmove', this.__touchHandler.bind(this));
    input.on('touchend', this.__touchHandler.bind(this));
  }

  __performanceControlListener() {
    var socket = client.socket;

    socket.on('perf_control', (soloistId, d, s) => {
      this.synths[soloistId].update(d, s);
      this.__changeBackgroundColor(d);
    });
  }

  __touchHandler(touchData) {
    var socket = client.socket;
    var x = (touchData.coordinates[0] - this.topologyDiv.offsetLeft + window.scrollX) / this.topologyDiv.offsetWidth;
    var y = (touchData.coordinates[1] - this.topologyDiv.offsetTop + window.scrollY) / this.topologyDiv.offsetHeight;

    socket.emit(touchData.event, [x, y], touchData.timestamp); // TODO: might be a good idea to send the time in sever clock. (Requires sync module.)
  }

  start() {
    super.start();

    client.socket.emit('perf_start');

    if (this.displayDiv) {
      this.infoDiv.innerHTML = "<p class='small'>You are at position</p>" + "<div class='checkin-label'><span>" + this.checkin.label + "</span></div>";
      this.infoDiv.classList.remove('hidden');
    }

    this.topology.displayTopology(this.topologyDiv);
    this.topology.changeTileClass(this.topologyDiv, this.checkin.index, true, 'me');
    super.start();
  }
}

module.exports = Performance;