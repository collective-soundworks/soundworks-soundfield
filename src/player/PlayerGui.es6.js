var matrixClient = require('matrix/client');
var ClientTopologyDisplayMatrix = matrixClient.TopologyDisplayMatrix;

window.container = window.container || document.getElementById('container');

'use strict';

class PlayerGui {
  constructor(topology) {
    this.__informationDiv = this.createInformationDiv();

    this.__topology = topology;
    this.__topologyDiv = this.createTopologyDiv();
    this.__topologyDisplay = new ClientTopologyDisplayMatrix(this.__topology, this.__topologyDiv);
  }

  addClassToTile(place, className) {
    this.__topologyDisplay.addClassToTile(place, className);
  }

  addPlayer(player) {
    this.__topologyDisplay.addClassToTile(player.place, 'player');
  }

  addSoloist(soloist) {
    this.__topologyDisplay.addClassToTile(soloist.place, 'soloist');
  }

  changeBackgroundColor(d) {
    var value = Math.floor(Math.max(1 - d, 0) * 255);
    document.body.style.backgroundColor = 'rgb(' + value + ', ' + value + ', ' + value + ')';
  }

  createInformationDiv() {
    var informationDiv = document.createElement('div');

    informationDiv.setAttribute('id', 'information');
    informationDiv.classList.add('info');
    informationDiv.classList.add('grayed');
    informationDiv.classList.add('hidden');
    
    container.appendChild(informationDiv);

    this.__informationDiv = informationDiv;
    
    return informationDiv;
  }

  createTopologyDiv() {
    var topologyDiv = document.createElement('div');

    topologyDiv.setAttribute('id', 'topology');
    topologyDiv.classList.add('topology');
    topologyDiv.classList.add('hidden');
    
    container.appendChild(topologyDiv);

    this.__topologyDiv = topologyDiv;
    
    return topologyDiv;
  }

  displayInformationDiv() {
    this.__informationDiv.classList.remove('hidden');
  }

  displayTopologyDiv() {
    this.__topologyDiv.classList.remove('hidden');
  }

  hideInformationDiv() {
    this.__informationDiv.classList.add('hidden');
  }

  hideTopologyDiv() {
    this.__topologyDiv.classList.add('hidden');
  }

  removeClassFromTile(place, className) {
    this.__topologyDisplay.removeClassFromTile(place, className);
  }

  removePlayer(player) {
    this.__topologyDisplay.removeClassFromTile(player.place, 'player');
  }

  removeSoloist(soloist) {
    this.__topologyDisplay.removeClassFromTile(soloist.place, 'soloist');
  }

  setInformation(label) {
    this.__informationDiv.innerHTML = "<p class='small'>You are at position</p>" + 
      "<div class='position'><span>" + label + "</span></div>";
  }

}

module.exports = PlayerGui;