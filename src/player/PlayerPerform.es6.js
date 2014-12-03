var clientSide = require('matrix/client');
var audioContext = require('audio-context');
var PlayerGui = require('./PlayerGui');
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
  constructor(input, topology) {
    super(input);

    this.__displayInterface = new PlayerGui(topology);

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
      this.__displayInterface.addPlayer(player);
    });

    socket.on('remove_player', (player) => {
      this.__displayInterface.removePlayer(player);
      var soloistId = player.userData.soloistId;
      if (soloistId) {
        this.__synths[soloistId].update(1, 0);
        this.__displayInterface.changeBackgroundColor(1);
      }
    });
  }

  inputListener() {
    this.__input.on('touchstart', this.touchHandler.bind(this));
    this.__input.on('touchmove', this.touchHandler.bind(this));
    this.__input.on('touchend', this.touchHandler.bind(this));
  }

  serverInstructionsListener() {
    socket.on('update_synth', (soloistId, d, s) => {
      this.__synths[soloistId].update(d, s);
      this.__displayInterface.changeBackgroundColor(d);
    });
  }

  soloistManagerListener() {
    socket.on('current_soloists', (soloists) => {
      for (let i = 0; i < soloists.length; i++) {
        // this.__displayInterface.addSoloist(soloists[i]);
      }
    });

    socket.on('new_soloist', (soloist) => {
      // this.__displayInterface.addSoloist(soloist);
      if (soloist.socket.id === socket.io.engine.id) {
        this.__input.enableTouch(this.__displayInterface.__topologyDiv);
        this.__displayInterface.displayTopologyDiv();
        this.__displayInterface.hideInformationDiv();
        beep();
      }
    });

    socket.on('remove_soloist', (soloist) => {
      var soloistId = soloist.userData.soloistId;
      // this.__displayInterface.removeSoloist(soloist);
      this.__synths[soloistId].update(1, 0);
      this.__displayInterface.changeBackgroundColor(1);
      if (soloist.socket.id === socket.io.engine.id) {
        this.__input.disableTouch(this.__displayInterface.__topologyDiv);
        this.__displayInterface.hideTopologyDiv();
        this.__displayInterface.displayInformationDiv();
      }
    });
  }

  start(placeInfo) {
    this.__place = placeInfo.place;
    this.__position = placeInfo.position;
    this.__label = placeInfo.label;

    this.__displayInterface.addClassToTile(this.__place, "me");

    this.__displayInterface.setInformation(this.__label);
    this.__displayInterface.displayInformationDiv();
  }

  topologyListener() {
    socket.on('current_state', (currentState) => {
      for(let i = 0; i < currentState.length; i++) {
        let player = currentState[i];
        this.__displayInterface.addPlayer(player);
      }
    });
  }

  touchHandler(touchData) {
    var fingerPosition = [
      (touchData.coordinates[0] - this.__displayInterface.__topologyDiv.offsetLeft + window.scrollX) / this.__displayInterface.__topologyDiv.offsetWidth,
      (touchData.coordinates[1] - this.__displayInterface.__topologyDiv.offsetTop + window.scrollY) / this.__displayInterface.__topologyDiv.offsetHeight
    ];
    socket.emit(touchData.event, fingerPosition, touchData.currentTime); // TODO: might be a good idea to send the time in sever clock. (Requires sync module.)
  }

}

module.exports = PlayerPerform;