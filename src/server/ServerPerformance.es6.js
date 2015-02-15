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


class ServerPerformance extends serverSide.PerformanceSoloists {
  constructor(topology, params = {}) {
    super(params);

    this.idleDuration = params.idleDuration || 2000; // in milliseconds
    this.numSoloists = params.numSoloists || 2;
    this.soloistDuration = params.soloDuration || 4000; // in milliseconds

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

    this.topology = topology;
    this.fingerRadius = 0.3;
  }

  connect(socket, player) {
    socket.join('performing');

    var playerList = this.playing.map((c) => c.getInfo());
    socket.emit('players_init', playerList);
    socket.broadcast.emit('player_add', player.getInfo()); // ('/play' namespace)
    server.io.of('/env').emit('player_add', player.getInfo()); // TODO: generalize with list of namespaces Object.keys(io.nsps)

    this.urn.push(player);
    this.__addSocketListener(player);
    player.socket.emit('soloists_init', this.soloists.map((s) => s.getInfo()));

    this.__inputListener(player.socket); /// TODO: use client/player instead

    // console.log(
    //   '[ServerPerformanceSoloist][connect] Player ' + player.socket.id + ' added.\n' +
    //   'this.urn: ' + this.urn.map((c) => c.socket.id) + '\n' +
    //   'this.soloists: ' + this.soloists.map((c) => c.socket.id) + '\n' +
    //   'this.unselectable: ' + this.unselectable.map((c) => c.socket.id)
    // );
  }

  disconnect(socket, player) {
    var io = server.io;
    var indexUrn = this.urn.indexOf(player);
    var indexSoloist = this.soloists.indexOf(player);
    var indexUnselectable = this.unselectable.indexOf(player);

    socket.broadcast.emit('player_remove', player.getInfo()); // ('/play' namespace)
    io.of('/env').emit('player_remove', player.getInfo()); // TODO: generalize with list of namespaces Object.keys(io.nsps)

    this.players.splice(index, 1); // remove player from pending or playing array

    if (indexUrn > -1)
      this.urn.splice(indexUrn, 1);
    else if (indexUnselectable > -1)
      this.unselectable.splice(indexUnselectable, 1);
    else if (indexSoloist > -1) {
      let soloist = this.soloists.splice(indexSoloist, 1)[0];
      this.availableSoloists.push(soloist.publicState.soloistId);
      soloist.publicState.soloist = null;
      io.of('/play').emit('soloist_remove', soloist.getInfo());
    } else {
      // console.log('[ServerPerformanceSoloist][disconnect] Player ' + player.socket.id + 'not found.');
    }

    // console.log("this.availableSoloists", this.availableSoloists);

    // console.log(
    //   '[ServerPerformanceSoloist][disconnect] Player ' + player.socket.id + ' removed.\n' +
    //   'this.urn: ' + this.urn.map((c) => c.socket.id) + '\n' +
    //   'this.soloists: ' + this.soloists.map((c) => c.socket.id) + '\n' +
    //   'this.unselectable: ' + this.unselectable.map((c) => c.socket.id)
    // );

    socket.leave('performing');
  }

  __addSocketListener(player) {
    player.socket.on('touchstart', () => {
      if (!player.publicState.hasPlayed) {
        clearTimeout(player.privateState.timeout);
        player.privateState.timeout = setTimeout(() => {
          this.__removeSoloist(player);
        }, this.soloistDuration);
      }
    });
  }

  __addSoloist() {
    var io = server.io;
    if (this.__needSoloist() && this.urn.length > 0) {
      let soloistId = this.availableSoloists.splice(0, 1)[0];
      let index = getRandomInt(0, this.urn.length - 1);
      let player = this.urn.splice(index, 1)[0];
      io.of('/play').emit('soloist_add', player.getInfo());

      player.publicState.soloistId = soloistId;
      player.privateState.timeout = setTimeout(() => {
        this.__removeSoloist(player);
      }, this.idleDuration);

      this.soloists.push(player);

      // console.log(
      //   '[ServerPerformanceSoloist][addSoloist] Soloist ' + player.socket.id + ' added.\n' +
      //   'this.urn: ' + this.urn.map((c) => c.socket.id) + '\n' +
      //   'this.soloists: ' + this.soloists.map((c) => c.socket.id) + '\n' +
      //   'this.unselectable: ' + this.unselectable.map((c) => c.socket.id)
      // );
    } else {
      // console.log("[ServerPerformanceSoloist][addSoloist] No soloist to add.")
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
      io.of('/play').emit('soloist_remove', soloist.getInfo());

      // console.log(
      //   '[ServerPerformanceSoloist][removeSoloist] Soloist ' + soloist.socket.id + ' removed.\n' +
      //   'this.urn: ' + this.urn.map((c) => c.socket.id) + '\n' +
      //   'this.soloists: ' + this.soloists.map((c) => c.socket.id) + '\n' +
      //   'this.unselectable: ' + this.unselectable.map((c) => c.socket.id)
      // );

    } else {
      // console.log("[ServerPerformanceSoloist][removeSoloist] Player " + soloist.socket.id + "not found in this.soloists.");
    }
  }

  __transferUnselectedToUrn() {
    while (this.unselectable.length > 0) // TODO: change this push the whole array at once
      this.urn.push(this.unselectable.pop());
    // this.urn.splice(0, 0, this.unselectable[0]);
    // clearArray(this.unselectable);

    // console.log(
    //   '[ServerPerformanceSoloist][transferUnselectedToUrn]\n' +
    //   'this.urn: ' + this.urn.map((c) => c.socket.id) + '\n' +
    //   'this.soloists: ' + this.soloists.map((c) => c.socket.id) + '\n' +
    //   'this.unselectable: ' + this.unselectable.map((c) => c.socket.id)
    // );
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
      let player = this.managers['/play'].sockets[socket.id];
      let soloistId = player.publicState.soloistId;
      let dSub = 1;
      let s = 0;

      var players = this.managers['/play'].playing;

      switch (type) {
        case 'touchstart':
          player.privateState.inputArray = [{
            position: fingerPosition,
            timeStamp: timeStamp
          }];

          for (let i = 0; i < players.length; i++) {
            let anyPlayer = players[i];
            let place = anyPlayer.place;
            let position = this.topology.positions[place];
            let d = scaleDistance(calculateNormalizedDistance(position, fingerPosition, h, w), this.fingerRadius);

            anyPlayer.socket.emit('perf_control', soloistId, d, 0);

            if (dSub > d)
              dSub = d; // subwoofer distance calculation
          }

          io.of('/env').emit('perf_control', soloistId, fingerPosition, dSub, s);
          break;

        case 'touchmove':
          var inputArray = player.privateState.inputArray;

          inputArray.push({
            position: fingerPosition,
            timeStamp: timeStamp
          });

          s = calculateVelocity(inputArray[inputArray.length - 1], inputArray[inputArray.length - 2], h, w);
          s = Math.min(1, s / 2); // TODO: have a better way to set the threshold
          for (let i = 0; i < players.length; i++) {
            let anyPlayer = players[i];
            let place = anyPlayer.place;
            let position = this.topology.positions[place];
            let d = scaleDistance(calculateNormalizedDistance(position, fingerPosition, h, w), this.fingerRadius);

            anyPlayer.socket.emit('perf_control', soloistId, d, s);

            if (dSub > d)
              dSub = d; // subwoofer distance calculation
          }

          io.of('/env').emit('perf_control', soloistId, fingerPosition, dSub, s);
          break;

        case 'touchend':
          io.of('/play').in('performing').emit('perf_control', soloistId, 1, s);
          io.of('/env').emit('perf_control', soloistId, fingerPosition, 1, s);
          break;
      }
    }
  }
}

module.exports = ServerPerformance;