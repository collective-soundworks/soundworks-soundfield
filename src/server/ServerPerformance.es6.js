var serverSide = require('matrix/server');
var ioServer = serverSide.ioServer;

'use strict';

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

class ServerPerformance extends serverSide.PerformanceManager {
  constructor(topologyManager) {
    super(topologyManager);

    this.soloistManager  = new serverSide.SoloistManagerRandomUrn();
    this.fingerRadius = 0.3;
  }

  init(playerManager) {
    super.init(playerManager);
    this.soloistManager.init(playerManager);
  }

  addPlayer(player) {
    this.inputListener(player.socket);
    this.soloistManager.addPlayer(player);
  }

  inputListener(socket) {
    socket.on('touchstart', (fingerPosition, timeStamp) => this.touchHandler('touchstart', fingerPosition, timeStamp, socket));
    socket.on('touchmove', (fingerPosition, timeStamp) => this.touchHandler('touchmove', fingerPosition, timeStamp, socket));
    socket.on('touchend', (fingerPosition, timeStamp) => this.touchHandler('touchend', fingerPosition, timeStamp, socket));
  }

  removePlayer(player) {
    this.soloistManager.removePlayer(player);
  }

  touchHandler(type, fingerPosition, timeStamp, socket) {
    // console.log("\""+ type + "\" received from player " + socket.id + " with:\n" +
    //   "fingerPosition: { x: " + fingerPosition[0] + ", y: " + fingerPosition[1] + " }\n" +
    //   "timeStamp: " + timeStamp
    // );
    var h = this.topologyManager.height;
    var w = this.topologyManager.width;

    // Check if socket.id is still among the soloists.
    // Necessary because of network latency: sometimes,
    // the matrix is still on the display of the player,
    // he is no longer a performer on the server.)
    var index = this.soloistManager.soloists.map((s) => s.socket.id).indexOf(socket.id);
    
    if (index > -1) {
      let io = ioServer.io;
      let player = this.playerManager.sockets[socket.id];
      let soloistId = player.publicState.soloistId;
      let dSub = 1;
      let s = 0;

      switch (type) {

        case 'touchstart':
          player.privateState.inputArray = [{
            position: fingerPosition,
            timeStamp: timeStamp
          }];

          for (let i = 0; i < this.playerManager.playing.length; i++) {
            let anyPlayer = this.playerManager.playing[i];
            let place = anyPlayer.place;
            let position = this.topologyManager.positions[place];
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
          for (let i = 0; i < this.playerManager.playing.length; i++) {
            let anyPlayer = this.playerManager.playing[i];
            let place = anyPlayer.place;
            let position = this.topologyManager.positions[place];
            let d = scaleDistance(calculateNormalizedDistance(position, fingerPosition, h, w), this.fingerRadius);

            anyPlayer.socket.emit('perf_control', soloistId, d, s);

            if (dSub > d) 
              dSub = d; // subwoofer distance calculation
          }

          io.of('/env').emit('perf_control', soloistId, fingerPosition, dSub, s);
          break;

        case 'touchend':
          io.of('/play').in('performance').emit('perf_control', soloistId, 1, s);
          io.of('/env').emit('perf_control', soloistId, fingerPosition, 1, s);
          break;
      }
    }
  }
}

module.exports = ServerPerformance;