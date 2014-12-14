'use strict';

var clientSide = require('matrix/client');
var audioContext = require('audio-context');
var SimpleSynth = require('./SimpleSynth');
var ioClient = clientSide.ioClient;
var inputModule = clientSide.inputModule;

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

function changeBackgroundColor(d) {
  var value = Math.floor(Math.max(1 - d, 0) * 255);
  document.body.style.backgroundColor = 'rgb(' + value + ', ' + value + ', ' + value + ')';
}

class PlayerPerformance extends clientSide.PerformanceSoloists {
  constructor(topology, placement, params = {}) {
    super(params);

    this.topology = topology;
    this.placement = placement;
    this.synths = [new SimpleSynth(false), new SimpleSynth(true)];

    // setup GUI
    var informationDiv = document.createElement('div');
    informationDiv.setAttribute('id', 'information');
    informationDiv.classList.add('info');
    informationDiv.classList.add('grayed');
    this.informationDiv = informationDiv;

    var topologyDiv = topology.displayDiv;
    this.topologyDiv = topologyDiv;

    this.displayDiv.appendChild(informationDiv);
    this.displayDiv.appendChild(topologyDiv);

    // setup liteners
    this.__inputListener();
    this.__performanceControlListener();
  }

  initPlayers(playerList) {
    super.initPlayers(playerList);

    for (let i = 0; i < playerList.length; i++)
      this.topology.displayPlayer(playerList[i].place, true);
  }

  addPlayer(player) {
    super.addPlayer(player);
    this.topology.displayPlayer(player.place, true);
  }

  removePlayer(player) {
    super.removePlayer(player);

    this.topology.displayPlayer(player.place, false);

    var soloistId = player.state.soloistId;

    if (soloistId) {
      this.synths[soloistId].update(1, 0);
      changeBackgroundColor(1);
    }

    super.removePlayer(player);
  }

  initSoloists(soloistList) {
    super.initSoloists(soloistList);

    // for (let i = 0; i < soloistList.length; i++)
    //   this.topology.displayPlayer(soloistList[i].place, true, 'soloist');
  }

  addSoloist(soloist) {
    super.addSoloist(soloist);

    // this.topology.displayPlayer(soloist.place, true, 'soloist');

    var socket = ioClient.socket;

    if (soloist.socketId === socket.io.engine.id) {
      inputModule.enableTouch(this.topologyDiv);

      this.informationDiv.classList.add('hidden');
      this.topologyDiv.classList.remove('hidden');

      beep();
    }
  }

  removeSoloist(soloist) {
    var soloistId = soloist.state.soloistId;

    // this.topology.displayPlayer(soloist.place, false, 'soloist');

    this.synths[soloistId].update(1, 0);
    changeBackgroundColor(1);

    var socket = ioClient.socket;

    if (soloist.socketId === socket.io.engine.id) {
      inputModule.disableTouch(this.topologyDiv);

      this.topologyDiv.classList.add('hidden');
      this.informationDiv.classList.remove('hidden');
    }

    super.removeSoloist(soloist);
  }

  start() {
    var place = this.placement.place;
    var label = this.placement.label;

    this.topology.displayPlayer(place, true, 'me');

    this.informationDiv.innerHTML = "<p class='small'>You are at position</p>" + "<div class='position'><span>" + label + "</span></div>";
    this.informationDiv.classList.remove('hidden');
    this.displayDiv.classList.remove('hidden');
  }

  __inputListener() {
    inputModule.on('touchstart', this.__touchHandler.bind(this));
    inputModule.on('touchmove', this.__touchHandler.bind(this));
    inputModule.on('touchend', this.__touchHandler.bind(this));
  }

  __performanceControlListener() {
    var socket = ioClient.socket;

    socket.on('perf_control', (soloistId, d, s) => {
      this.synths[soloistId].update(d, s);
      changeBackgroundColor(d);
    });
  }

  __touchHandler(touchData) {
    var socket = ioClient.socket;
    var x = (touchData.coordinates[0] - this.topologyDiv.offsetLeft + window.scrollX) / this.topologyDiv.offsetWidth;
    var y = (touchData.coordinates[1] - this.topologyDiv.offsetTop + window.scrollY) / this.topologyDiv.offsetHeight;

    socket.emit(touchData.event, [x, y], touchData.currentTime); // TODO: might be a good idea to send the time in sever clock. (Requires sync module.)
  }
}

module.exports = PlayerPerformance;