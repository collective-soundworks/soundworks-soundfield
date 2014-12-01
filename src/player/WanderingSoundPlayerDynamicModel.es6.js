var matrix = require('matrix/client');
var matrixSynths = require('matrix/synths');

var AudioCue = matrix.AudioCue;
var ClientDynamicModel = matrix.DynamicModel;
var ClientInput = matrix.Input;
var ClientTopologyDisplayMatrix = matrix.TopologyDisplayMatrix;
var SynthNoise = matrixSynths.Noise;
var SynthDrone = matrixSynths.Drone;
var SynthJodlowski = matrixSynths.Jodlowski;
var SynthBirds = matrixSynths.Birds;
var WanderingSoundPlayerDisplayInterface = require('./WanderingSoundPlayerDisplayInterface');

'use strict';

class WanderingSoundPlayerDynamicModel extends ClientDynamicModel {
  constructor(input, topology) {
    super(input);

    this.__displayInterface = new WanderingSoundPlayerDisplayInterface(topology);

    this.__label = null;
    this.__place = null;
    this.__position = null;

    this.__synths = [ new SynthNoise(), new SynthDrone() ];
    // this.__synths = [ new SynthJodlowski("sounds/water.mp3"), new SynthJodlowski("sounds/stone.mp3") ];
    // this.__synths = [ 
    //   new SynthBirds("sounds/turdus_merula.mp3", "sounds/turdus_merula-markers.json"), 
    //   new SynthBirds("sounds/vanellus_vanellus.mp3", "sounds/vanellus_vanellus-markers.json") ];

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
      console.log("update_synth", soloistId, d, s);
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
        matrix.AudioCue.beep();
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

module.exports = WanderingSoundPlayerDynamicModel;