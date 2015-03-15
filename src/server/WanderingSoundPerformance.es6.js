'use strict';

var serverSide = require('soundworks/server');
var server = serverSide.server;

function calculateNormalizedDistance(a, b, h, w) {
  if (w / h < 1)
    return Math.sqrt(Math.pow((a[0] - b[0]) * w / h, 2) + Math.pow(a[1] - b[1], 2));
  else
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow((a[1] - b[1]) * h / w, 2));
}

function calculateVelocity(a, b, h, w) {
  return calculateNormalizedDistance(a.position, b.position, h, w) / Math.abs(a.timeStamp - b.timeStamp);
}

function scaleDistance(d, m) {
  return Math.min(d / m, 1);
}

function clearArray(a) {
  while (a.length > 0)
    a.pop();
}

function createIdentityArray(n) {
  var a = [];
  for (let i = 0; i < n; i++) {
    a.push(i);
  }
  return a;
}

function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

class WanderingSoundPerformance extends serverSide.Performance {
  constructor(seatmap, options = {}) {
    super();

    this.idleDuration = options.idleDuration || 2000; // in milliseconds
    this.numSoloists = options.numSoloists || 2;
    this.soloistDuration = options.soloDuration || 4000; // in milliseconds

    this.seatmap = seatmap;
    this.fingerRadius = 0.3;

    // Soloists management
    this.availableSoloists = createIdentityArray(this.numSoloists);
    this.soloists = [];
    this.unselectable = [];
    this.urn = [];

    Array.observe(this.urn, (changes) => {
      if (changes[0].addedCount > 0 && this.__needSoloist())
        this.__addSoloist();

      if (changes[0].removed.length > 0 && this.urn.length === 0 && this.unselectable.length > 0)
        this.__transferUnselectableToUrn();
    });

    Array.observe(this.unselectable, (changes) => {
      if (changes[0].addedCount > 0 && this.__needSoloist() && this.urn.length === 0)
        this.__transferUnselectableToUrn();
    });

    Array.observe(this.soloists, (changes) => {
      if (changes[0].removed.length > 0 && this.__needSoloist() && this.urn.length > 0)
        this.__addSoloist();
    });
  }

  connect(client) {
    super.connect(client);

    client.data.performance = {};

    client.receive('performance:start', () => {
      // Send list of clients performing to the client
      var playerList = this.players.map((c) => this.__getInfo(c));
      client.send('performance:playersInit', playerList);
      // Send information about the newly connected client to all other clients

      var info = this.__getInfo(client);
      client.broadcast('performance:playerAdd', info); // ('/player' namespace)
      server.broadcast('/env', 'performance:playerAdd', info); // TODO: generalize with list of namespaces Object.keys(io.nsps)

      // Soloists management
      this.urn.push(client);
      this.__addSocketListener(client);
      client.send('performance:soloistsInit', this.soloists.map((s) => this.__getInfo(s)));

      this.__inputListener(client);
    });
  }

  disconnect(client) {
    var indexUrn = this.urn.indexOf(client);
    var indexSoloist = this.soloists.indexOf(client);
    var indexUnselectable = this.unselectable.indexOf(client);

    // Send disconnection information to the other clients
    var info = this.__getInfo(client);
    client.broadcast('performance:playerRemove', info); // ('/player' namespace)
    server.broadcast('/env', 'performance:playerRemove', info); // TODO: generalize with list of namespaces Object.keys(io.nsps)

    // Soloists management
    if (indexUrn > -1)
      this.urn.splice(indexUrn, 1);
    else if (indexUnselectable > -1)
      this.unselectable.splice(indexUnselectable, 1);
    else if (indexSoloist > -1) {
      let soloist = this.soloists.splice(indexSoloist, 1)[0];
      server.broadcast('/player', 'performance:soloistRemove', this.__getInfo(soloist));
      this.availableSoloists.push(soloist.data.performance.soloistId);
      soloist.data.performance.soloistId = null;
    } else {
      console.log('[WanderingSoundPerformance][disconnect] Player ' + client.socket.id + ' not found.');
    }

    super.disconnect(client);
  }

  __getInfo(client) {
    var clientInfo = {
      socketId: client.socket.id,
      index: client.index,
      soloistId: client.data.performance.soloistId
    };

    return clientInfo;
  }

  __addSocketListener(client) {
    client.receive('touchstart', () => {
      clearTimeout(client.data.performance.timeout);
      client.data.performance.timeout = setTimeout(() => {
        this.__removeSoloist(client);
      }, this.soloistDuration);
    });
  }

  __addSoloist() {
    if (this.__needSoloist() && this.urn.length > 0) {
      let soloistId = this.availableSoloists.splice(0, 1)[0];
      let index = getRandomInt(0, this.urn.length - 1);
      let client = this.urn.splice(index, 1)[0];

      client.data.performance.soloistId = soloistId;
      client.data.performance.timeout = setTimeout(() => {
        this.__removeSoloist(client);
      }, this.idleDuration);

      this.soloists.push(client);

      server.broadcast('/player', 'performance:soloistAdd', this.__getInfo(client));

      // console.log("[WanderingSoundPerformance][__addSoloist]\n" +
      //   "this.urn: " + this.urn.map((c) => c.socket.id) + "\n" +
      //   "this.soloists: " + this.soloists.map((c) => c.socket.id) + "\n" +
      //   "this.unselectable: " + this.unselectable.map((c) => c.socket.id) + "\n" +
      //   "---------------------------------------------"
      // );
    } else {
      console.log("[WanderingSoundPerformance][__addSoloist] No soloist to add.");
    }
  }

  __removeSoloist(soloist) {
    let index = this.soloists.indexOf(soloist);

    if (index >= 0) {
      let soloistId = soloist.data.performance.soloistId;
      server.broadcast('/player', 'performance:soloistRemove', this.__getInfo(soloist));
      this.availableSoloists.push(soloistId);
      soloist.data.performance.soloistId = null;
      this.soloists.splice(index, 1);
      this.unselectable.push(soloist);

      // console.log("[WanderingSoundPerformance][__removeSoloist]\n" +
      //   "this.urn: " + this.urn.map((c) => c.socket.id) + "\n" +
      //   "this.soloists: " + this.soloists.map((c) => c.socket.id) + "\n" +
      //   "this.unselectable: " + this.unselectable.map((c) => c.socket.id) + "\n" +
      //   "---------------------------------------------"
      // );
    } else {
      console.log("[WanderingSoundPerformance][__removeSoloist] Player " + soloist.socket.id + "not found in this.soloists.");
    }
  }

  __transferUnselectableToUrn() {
    while (this.unselectable.length > 0) // TODO: change this push the whole array at once
      this.urn.push(this.unselectable.pop());

    // console.log("[WanderingSoundPerformance][__transferUnselectableToUrn]\n" +
    //   "this.urn: " + this.urn.map((c) => c.socket.id) + "\n" +
    //   "this.soloists: " + this.soloists.map((c) => c.socket.id) + "\n" +
    //   "this.unselectable: " + this.unselectable.map((c) => c.socket.id) + "\n" +
    //   "---------------------------------------------"
    // );
  }

  __needSoloist() {
    return this.availableSoloists.length > 0;
  }

  __inputListener(client) {
    client.receive('touchstart', (fingerPosition, timeStamp) => this.__touchHandler('touchstart', fingerPosition, timeStamp, client));
    client.receive('touchmove', (fingerPosition, timeStamp) => this.__touchHandler('touchmove', fingerPosition, timeStamp, client));
    client.receive('touchend', (fingerPosition, timeStamp) => this.__touchHandler('touchend', fingerPosition, timeStamp, client));
  }

  __touchHandler(type, fingerPosition, timeStamp, client) {
    // console.log("\""+ type + "\" received from player " + client.socket.id + " with:\n" +
    //   "fingerPosition: { x: " + fingerPosition[0] + ", y: " + fingerPosition[1] + " }\n" +
    //   "timeStamp: " + timeStamp
    // );
    var h = this.seatmap.height;
    var w = this.seatmap.width;

    // Check if client. socket.id is still among the soloists.
    // Necessary because of network latency: sometimes,
    // the matrix is still on the display of the player,
    // he is no longer a performer on the server.)
    var index = this.soloists.map((s) => s.socket.id).indexOf(client.socket.id); // TODO: check compatibility with socket.io abstraction

    if (index > -1) {
      let soloistId = client.data.performance.soloistId;
      let dSub = 1;
      let s = 0;

      switch (type) {
        case 'touchstart':
          client.data.performance.inputArray = [{
            position: fingerPosition,
            timeStamp: timeStamp
          }];

          for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            let index = player.index;
            let position = this.seatmap.positions[index];
            let d = scaleDistance(calculateNormalizedDistance(position, fingerPosition, h, w), this.fingerRadius);

            player.send('performance:control', soloistId, d, 0);

            if (dSub > d)
              dSub = d; // subwoofer distance calculation
          }

          server.broadcast('/env', 'performance:control', soloistId, fingerPosition, dSub, s);
          break;

        case 'touchmove':
          var inputArray = client.data.performance.inputArray;

          inputArray.push({
            position: fingerPosition,
            timeStamp: timeStamp
          });

          s = calculateVelocity(inputArray[inputArray.length - 1], inputArray[inputArray.length - 2], h, w);
          s = Math.min(1, s / 2); // TODO: have a better way to set the threshold
          for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            let index = player.index;
            let position = this.seatmap.positions[index];
            let d = scaleDistance(calculateNormalizedDistance(position, fingerPosition, h, w), this.fingerRadius);

            player.send('performance:control', soloistId, d, s);

            if (dSub > d)
              dSub = d; // subwoofer distance calculation
          }

          server.broadcast('/env', 'performance:control', soloistId, fingerPosition, dSub, s);
          break;

        case 'touchend':
          server.broadcast('/player', 'performance:control', soloistId, 1, s);
          server.broadcast('/env', 'performance:control', soloistId, fingerPosition, 1, s);
          break;
      }
    }
  }
}

module.exports = WanderingSoundPerformance;