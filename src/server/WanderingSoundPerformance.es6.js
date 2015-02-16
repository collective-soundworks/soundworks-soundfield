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

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

class WanderingSoundPerformance extends serverSide.Module {
  constructor(topology, params = {}) {
    super(params);

    this.idleDuration = params.idleDuration || 2000; // in milliseconds
    this.numSoloists = params.numSoloists || 2;
    this.soloistDuration = params.soloDuration || 4000; // in milliseconds

    this.topology = topology;
    this.fingerRadius = 0.3;

    // Players management
    this.players = [];
    this.sockets = []

    // Soloists management
    this.availableSoloists = createIdentityArray(this.numSoloists);

    this.soloists = [];
    this.unselectable = [];
    this.urn = [];

    Array.observe(this.urn, (changes) => {
      if (changes[0].addedCount > 0 && this.__needSoloist())
        this.__addSoloist();

      if (changes[0].removed.length > 0 && this.urn.length === 0 && this.unselectable.length > 0)
        this.__transferUnselectedToUrn();
    });

    Array.observe(this.unselectable, (changes) => {
      if (changes[0].addedCount > 0 && this.__needSoloist() && this.urn.length === 0)
        this.__transferUnselectedToUrn();
    });

    Array.observe(this.soloists, (changes) => {
      if (changes[0].removed.length > 0 && this.__needSoloist())
        this.__addSoloist();
    });
  }

  connect(client) {
    var socket = client.socket;
    socket.join('performing');

    socket.on('perf_start', () => {
      this.players.push(client);
      this.sockets[socket.id] = client;

      // Send list of clients performing to the client
      var playerList = this.players.map((c) => c.getInfo());
      socket.emit('players_init', playerList);
      // Send information about the newly connected client to all other clients
      socket.broadcast.emit('player_add', client.getInfo()); // ('/player' namespace)
      server.io.of('/env').emit('player_add', client.getInfo()); // TODO: generalize with list of namespaces Object.keys(io.nsps)

      // Soloists management
      this.urn.push(client);
      this.__addSocketListener(client);
      socket.emit('soloists_init', this.soloists.map((s) => s.getInfo()));

      this.__inputListener(socket); /// TODO: use client/player instead
    })
  }

  disconnect(client) {
    var socket = client.socket;
    var io = server.io;
    var indexUrn = this.urn.indexOf(client);
    var indexSoloist = this.soloists.indexOf(client);
    var indexUnselectable = this.unselectable.indexOf(client);

    // Send disconnection information to the other clients
    socket.broadcast.emit('player_remove', client.getInfo()); // ('/player' namespace)
    io.of('/env').emit('player_remove', client.getInfo()); // TODO: generalize with list of namespaces Object.keys(io.nsps)

    // Remove client from this.players array
    arrayRemove(this.players, client);
    delete this.sockets[client.socket.id]

    // Soloists management
    if (indexUrn > -1)
      this.urn.splice(indexUrn, 1);
    else if (indexUnselectable > -1)
      this.unselectable.splice(indexUnselectable, 1);
    else if (indexSoloist > -1) {
      let soloist = this.soloists.splice(indexSoloist, 1)[0];
      this.availableSoloists.push(soloist.publicState.soloistId);
      soloist.publicState.soloist = null;
      io.of('/player').emit('soloist_remove', soloist.getInfo());
    } else {
      console.log('[ServerPerformanceSoloist][disconnect] Player ' + client.socket.id + 'not found.');
    }

    socket.leave('performing');
  }

  __addSocketListener(client) {
    client.socket.on('touchstart', () => {
      if (!client.publicState.hasPlayed) {
        clearTimeout(client.privateState.timeout);
        client.privateState.timeout = setTimeout(() => {
          this.__removeSoloist(client);
        }, this.soloistDuration);
      }
    });
  }

  __addSoloist() {
    var io = server.io;
    if (this.__needSoloist() && this.urn.length > 0) {
      let soloistId = this.availableSoloists.splice(0, 1)[0];
      let index = getRandomInt(0, this.urn.length - 1);
      let client = this.urn.splice(index, 1)[0];
      io.of('/player').emit('soloist_add', client.getInfo());

      client.publicState.soloistId = soloistId;
      client.privateState.timeout = setTimeout(() => {
        this.__removeSoloist(client);
      }, this.idleDuration);

      this.soloists.push(client);
    } else {
      console.log("[ServerPerformanceSoloist][addSoloist] No soloist to add.")
    }
  }

  __removeSoloist(soloist) {
    var io = server.io;
    var index = this.soloists.indexOf(soloist);

    if (index > -1) {
      soloist = this.soloists.splice(index, 1)[0];
      this.availableSoloists.push(soloist.publicState.soloistId);
      soloist.publicState.soloist = null;
      this.unselectable.push(soloist);
      io.of('/player').emit('soloist_remove', soloist.getInfo());
    } else {
      console.log("[ServerPerformanceSoloist][removeSoloist] Player " + soloist.socket.id + "not found in this.soloists.");
    }
  }

  __transferUnselectedToUrn() {
    while (this.unselectable.length > 0) // TODO: change this push the whole array at once
      this.urn.push(this.unselectable.pop());
    // this.urn.splice(0, 0, this.unselectable[0]);
    // clearArray(this.unselectable);
  }

  __needSoloist() {
    return this.availableSoloists.length > 0;
  }

  __inputListener(socket) {
    socket.on('touchstart', (fingerPosition, timeStamp) => this.__touchHandler('touchstart', fingerPosition, timeStamp, socket));
    socket.on('touchmove', (fingerPosition, timeStamp) => this.__touchHandler('touchmove', fingerPosition, timeStamp, socket));
    socket.on('touchend', (fingerPosition, timeStamp) => this.__touchHandler('touchend', fingerPosition, timeStamp, socket));
  }

  __touchHandler(type, fingerPosition, timeStamp, socket) {
    // console.log("\""+ type + "\" received from player " + socket.id + " with:\n" +
    //   "fingerPosition: { x: " + fingerPosition[0] + ", y: " + fingerPosition[1] + " }\n" +
    //   "timeStamp: " + timeStamp
    // );
    var h = this.topology.height;
    var w = this.topology.width;

    // Check if socket.id is still among the soloists.
    // Necessary because of network latency: sometimes,
    // the matrix is still on the display of the player,
    // he is no longer a performer on the server.)
    var index = this.soloists.map((s) => s.socket.id).indexOf(socket.id);

    if (index > -1) {
      let io = server.io;
      let client = this.sockets[socket.id];
      let soloistId = client.publicState.soloistId;
      let dSub = 1;
      let s = 0;

      switch (type) {
        case 'touchstart':
          client.privateState.inputArray = [{
            position: fingerPosition,
            timeStamp: timeStamp
          }];

          for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            let index = player.index;
            let position = this.topology.positions[index];
            let d = scaleDistance(calculateNormalizedDistance(position, fingerPosition, h, w), this.fingerRadius);

            player.socket.emit('perf_control', soloistId, d, 0);

            if (dSub > d)
              dSub = d; // subwoofer distance calculation
          }

          io.of('/env').emit('perf_control', soloistId, fingerPosition, dSub, s);
          break;

        case 'touchmove':
          var inputArray = client.privateState.inputArray;

          inputArray.push({
            position: fingerPosition,
            timeStamp: timeStamp
          });

          s = calculateVelocity(inputArray[inputArray.length - 1], inputArray[inputArray.length - 2], h, w);
          s = Math.min(1, s / 2); // TODO: have a better way to set the threshold
          for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            let index = player.index;
            let position = this.topology.positions[index];
            let d = scaleDistance(calculateNormalizedDistance(position, fingerPosition, h, w), this.fingerRadius);

            player.socket.emit('perf_control', soloistId, d, s);

            if (dSub > d)
              dSub = d; // subwoofer distance calculation
          }

          io.of('/env').emit('perf_control', soloistId, fingerPosition, dSub, s);
          break;

        case 'touchend':
          io.of('/player').in('performing').emit('perf_control', soloistId, 1, s);
          io.of('/env').emit('perf_control', soloistId, fingerPosition, 1, s);
          break;
      }
    }
  }
}

module.exports = WanderingSoundPerformance;