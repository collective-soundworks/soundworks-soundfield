var clientSide = require('matrix/client');
var audioContext = require('audio-context');
var PerformanceGui = require('./PerformanceGui');
var SimpleSynth = require('./SimpleSynth');

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

class PlayerPerform extends clientSide.PerformanceManager {
  constructor(inputManager, topology) {
    super(inputManager);

    this.__performanceGui = new PerformanceGui(topology);

    this.__label = null;
    this.__place = null;
    this.__position = null;

    this.__synths = [ new SimpleSynth(false), new SimpleSynth(true) ];

    this.topologyListener();
    this.clientManagementListener();
    this.inputListener();
    this.serverInstructionsListener();
    this.soloistManagerListener();
  }

  clientManagementListener() {
    socket.on('new_player', (player) => {
      this.__performanceGui.addPlayer(player);
    });

    socket.on('remove_player', (player) => {
      this.__performanceGui.removePlayer(player);
      var soloistId = player.state.soloistId;
      if (soloistId) {
        this.__synths[soloistId].update(1, 0);
        this.__performanceGui.changeBackgroundColor(1);
      }
    });
  }

  inputListener() {
    this.__inputManager.on('touchstart', this.touchHandler.bind(this));
    this.__inputManager.on('touchmove', this.touchHandler.bind(this));
    this.__inputManager.on('touchend', this.touchHandler.bind(this));
  }

  serverInstructionsListener() {
    socket.on('update_synth', (soloistId, d, s) => {
      this.__synths[soloistId].update(d, s);
      this.__performanceGui.changeBackgroundColor(d);
    });
  }

  soloistManagerListener() {
    socket.on('current_soloists', (soloists) => {
      for (let i = 0; i < soloists.length; i++) {
        // this.__performanceGui.addSoloist(soloists[i]);
      }
    });

    socket.on('new_soloist', (soloist) => {
      // this.__performanceGui.addSoloist(soloist);
      if (soloist.socketId === socket.io.engine.id) {
        this.__inputManager.enableTouch(this.__performanceGui.__topologyDiv);
        this.__performanceGui.displayTopologyDiv();
        this.__performanceGui.hideInformationDiv();
        beep();
      }
    });

    socket.on('remove_soloist', (soloist) => {
      var soloistId = soloist.userData.soloistId;
      // this.__performanceGui.removeSoloist(soloist);
      this.__synths[soloistId].update(1, 0);
      this.__performanceGui.changeBackgroundColor(1);
      if (soloist.socketId === socket.io.engine.id) {
        this.__inputManager.disableTouch(this.__performanceGui.__topologyDiv);
        this.__performanceGui.hideTopologyDiv();
        this.__performanceGui.displayInformationDiv();
      }
    });
  }

  start(placeInfo) {
    super.start(placeInfo);

    this.__performanceGui.addClassToTile(this.__place, "me");
    this.__performanceGui.setInformation(this.__label);
    this.__performanceGui.displayInformationDiv();
  }

  topologyListener() {
    socket.on('current_state', (currentState) => {
      for(let i = 0; i < currentState.length; i++) {
        let player = currentState[i];
        this.__performanceGui.addPlayer(player);
      }
    });
  }

  touchHandler(touchData) {
    var fingerPosition = [
      (touchData.coordinates[0] - this.__performanceGui.__topologyDiv.offsetLeft + window.scrollX) / this.__performanceGui.__topologyDiv.offsetWidth,
      (touchData.coordinates[1] - this.__performanceGui.__topologyDiv.offsetTop + window.scrollY) / this.__performanceGui.__topologyDiv.offsetHeight
    ];
    socket.emit(touchData.event, fingerPosition, touchData.currentTime); // TODO: might be a good idea to send the time in sever clock. (Requires sync module.)
  }

}

module.exports = PlayerPerform;