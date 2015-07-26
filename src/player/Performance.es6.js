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

    // display
    var soloistView = document.createElement('div');
    soloistView.setAttribute('id', 'setup');
    soloistView.classList.add('hidden');

    this.soloistView = soloistView;
    this.view.appendChild(this.soloistView);

    // setup liteners
    this._inputListener();
    this._performanceControlListener();

    client.receive('performance:playersInit', (playerList) => {
      this._initPlayers(playerList);
    });

    client.receive('performance:playerAdd', (player) => {
      this._addPlayer(player);
    });

    client.receive('performance:playerRemove', (player) => {
      this._removePlayer(player);
    });

    client.receive('performance:soloistsInit', (soloistList) => {
      this._initSoloists(soloistList);
    });

    client.receive('performance:soloistAdd', (soloist) => {
      this._addSoloist(soloist);
    });

    client.receive('performance:soloistRemove', (soloist) => {
      this._removeSoloist(soloist);
    });
  }

  _display() {
    var div = this.soloistView;
    var setup = this.setup;

    div.classList.add('setup');

    var heightWidthRatio = setup.height / setup.width;
    var screenHeight = window.innerHeight;
    var screenWidth = window.innerWidth;
    var screenRatio = screenHeight / screenWidth;
    var heightPx, widthPx;

    if (screenRatio > heightWidthRatio) { // TODO: refine sizes, with container, etc.
      heightPx = screenWidth * heightWidthRatio;
      widthPx = screenWidth;
    } else {
      heightPx = screenHeight;
      widthPx = screenHeight / heightWidthRatio;
    }

    var tileWidth = widthPx / setup.width * setup.spacing;
    var tileHeight = heightPx / setup.height * setup.spacing;
    var tileSize = Math.min(tileWidth, tileHeight);

    var tileMargin = tileSize / 10;

    div.style.height = heightPx + "px";
    div.style.width = widthPx + "px";

    var coordinates = setup.coordinates;

    for (let i = 0; i < coordinates.length; i++) {
      let tile = document.createElement('div');
      tile.classList.add('tile');

      tile.setAttribute('data-index', i);
      tile.setAttribute('data-x', coordinates[i][0]);
      tile.setAttribute('data-y', coordinates[i][1]);
      tile.style.height = tileSize - 2 * tileMargin + "px";
      tile.style.width = tileSize - 2 * tileMargin + "px";
      tile.style.left = coordinates[i][0] * widthPx - (tileSize - 2 * tileMargin) / 2 + "px";
      tile.style.top = coordinates[i][1] * heightPx - (tileSize - 2 * tileMargin) / 2 + "px";

      div.appendChild(tile);
    }
  }

  _addClassToPosition(index, className) {
    var div = this.soloistView;
    var tiles = Array.prototype.slice.call(div.childNodes); // .childNode returns a NodeList
    var tileIndex = tiles.map((t) => parseInt(t.dataset.index)).indexOf(index);
    var tile = tiles[tileIndex];

    if (tile)
      tile.classList.add(className);
  }

  _removeClassFromPosition(index, className) {
    var div = this.soloistView;
    var tiles = Array.prototype.slice.call(div.childNodes); // .childNode returns a NodeList
    var tileIndex = tiles.map((t) => parseInt(t.dataset.index)).indexOf(index);
    var tile = tiles[tileIndex];

    if (tile)
      tile.classList.remove(className);
  }

  _initPlayers(playerList) {
    for (let i = 0; i < playerList.length; i++)
      this._addClassToPosition(playerList[i].index, 'player');
  }

  _addPlayer(player) {
    this._addClassToPosition(player.index, 'player');
  }

  _removePlayer(player) {
    this._removeClassFromPosition(player.index, 'player');

    var soloistId = player.soloistId;

    if (soloistId) {
      this.synths[soloistId].update(1, 0);
      this._changeBackgroundColor(1);
    }
  }

  _initSoloists(soloistList) {
    // for (let i = 0; i < soloistList.length; i++)
    //   this._addClassToPosition(this.soloistView, soloistList[i].index, 'soloist');
  }

  _addSoloist(soloist) {
    // this._addClassToPosition(this.soloistView, soloist.index, 'soloist');

    if (soloist.index === this.checkin.index) {
      input.enableTouch(this.soloistView);

      this._centeredViewContent.classList.add('hidden');
      this.soloistView.classList.remove('hidden');

      beep();
    }
  }

  _removeSoloist(soloist) {
    var soloistId = soloist.soloistId;

    // this._removeClassFromPosition(soloist.index, 'soloist');

    this.synths[soloistId].update(1, 0);
    this._changeBackgroundColor(1); // TODO: incorrect

    if (soloist.index === this.checkin.index) {
      input.disableTouch(this.soloistView);

      this.soloistView.classList.add('hidden');
      this._centeredViewContent.classList.remove('hidden');
    }
  }

  _changeBackgroundColor(d) {
    var value = Math.floor(Math.max(1 - d, 0) * 255);
    this.view.style.backgroundColor = 'rgb(' + value + ', ' + value + ', ' + value + ')';
  }

  _inputListener() {
    input.on('touchstart', this._touchHandler.bind(this));
    input.on('touchmove', this._touchHandler.bind(this));
    input.on('touchend', this._touchHandler.bind(this));
  }

  _performanceControlListener() {
    client.receive('performance:control', (soloistId, d, s) => {
      this.synths[soloistId].update(d, s);
      this._changeBackgroundColor(d);
    });
  }

  _touchHandler(touchData) {
    var x = (touchData.coordinates[0] - this.soloistView.offsetLeft + window.scrollX) / this.soloistView.offsetWidth;
    var y = (touchData.coordinates[1] - this.soloistView.offsetTop + window.scrollY) / this.soloistView.offsetHeight;

    client.send('performance:' + touchData.event, [x, y], touchData.timestamp); // TODO: might be a good idea to send the time in sever clock. (Requires sync module.)
  }

  start() {
    super.start();

    let htmlContent = "<p><small>You are at position</small></p>" + "<div class='checkin-label'><span>" + this.checkin.label + "</span></div>";
    this.setCenteredViewContent(htmlContent);
    this._centeredViewContent.classList.add('info');

    this._display();
    this._addClassToPosition(this.checkin.index, 'me');
  }
}

module.exports = Performance;