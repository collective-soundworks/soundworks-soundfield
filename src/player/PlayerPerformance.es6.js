var clientSide = require('matrix/client');
var audioContext = require('audio-context');
var SimpleSynth = require('./SimpleSynth');
var ioClient = clientSide.ioClient;
var inputModule = clientSide.inputModule;

'use strict';

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

class PlayerPerformance extends clientSide.PerformanceManager {
  constructor(topologyManager) {
    super(topologyManager);

    this.label = null;
    this.place = null;
    this.position = null;

    this.synths = [new SimpleSynth(false), new SimpleSynth(true)];

    // setup GUI
    var informationDiv = document.createElement('div');
    informationDiv.setAttribute('id', 'information');
    informationDiv.classList.add('info');
    informationDiv.classList.add('grayed');
    informationDiv.classList.add('hidden');
    this.informationDiv = informationDiv;

    var topologyDiv = topologyManager.parentDiv;
    this.topologyDiv = topologyDiv;

    this.parentDiv.appendChild(informationDiv);
    this.parentDiv.appendChild(topologyDiv);

    // setup liteners
    this.inputListener();
    this.performanceControlListener();
    this.soloistManagerListener();
  }

  setPlayers(playerList) {
    //TODO: clear players
    for (let i = 0; i < playerList.length; i++)
      this.topologyManager.addClassToTile(playerList[i].place, 'player');
  }

  addPlayer(player) {
    this.topologyManager.addClassToTile(player.place, 'player');
  }

  removePlayer(player) {
    this.topologyManager.removeClassFromTile(player.place, 'player');

    var soloistId = player.state.soloistId;

    if (soloistId) {
      this.synths[soloistId].update(1, 0);
      changeBackgroundColor(1);
    }
  }

  inputListener() {
    inputModule.on('touchstart', this.touchHandler.bind(this));
    inputModule.on('touchmove', this.touchHandler.bind(this));
    inputModule.on('touchend', this.touchHandler.bind(this));
  }

  performanceControlListener() {
    var socket = ioClient.socket;

    socket.on('perf_control', (soloistId, d, s) => {
      this.synths[soloistId].update(d, s);
      changeBackgroundColor(d);
    });
  }

  soloistManagerListener() {
    var socket = ioClient.socket;

    socket.on('soloists_set', (soloistList) => {
      for (let i = 0; i < soloistList.length; i++) {
        // this.topologyManager.addClassToTile(place, className);
      }
    });

    socket.on('soloist_add', (soloist) => {
      // this.topologyManager.addClassToTile(soloist.place, 'soloist');

      if (soloist.socketId === socket.io.engine.id) {
        inputModule.enableTouch(this.topologyDiv);
        this.topologyDiv.classList.remove('hidden');
        this.informationDiv.classList.add('hidden');
        beep();
      }
    });

    socket.on('soloist_remove', (soloist) => {
      var soloistId = soloist.state.soloistId;

      // this.topologyManager.removeClassFromTile(soloist.place, 'soloist');
      this.synths[soloistId].update(1, 0);
      changeBackgroundColor(1);

      if (soloist.socketId === socket.io.engine.id) {
        inputModule.disableTouch(this.topologyDiv);
        this.topologyDiv.classList.add('hidden');
        this.informationDiv.classList.remove('hidden');
      }
    });
  }

  start(placeInfo) {
    super.start(placeInfo);

    // setup GUI
    this.topologyManager.addClassToTile(this.place, "me");
    this.informationDiv.innerHTML = "<p class='small'>You are at position</p>" + "<div class='position'><span>" + placeInfo.label + "</span></div>";
    this.informationDiv.classList.remove('hidden');
    this.parentDiv.classList.remove('hidden');
  }

  touchHandler(touchData) {
    var socket = ioClient.socket;
    var fingerPosition = [
      (touchData.coordinates[0] - this.topologyDiv.offsetLeft + window.scrollX) / this.topologyDiv.offsetWidth, (touchData.coordinates[1] - this.topologyDiv.offsetTop + window.scrollY) / this.topologyDiv.offsetHeight
    ];

    socket.emit(touchData.event, fingerPosition, touchData.timestamp); // TODO: might be a good idea to send the time in sever clock. (Requires sync module.)
  }
}

module.exports = PlayerPerformance;