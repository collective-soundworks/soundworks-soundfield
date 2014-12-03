var serverSide = require('matrix/server');
var ioServer = serverSide.ioServer;

'use strict';

function calculateDistance(a, b) {
  var h = this.__topologyManager.height;
  var w = this.__topologyManager.width;
  if (w / h < 1)
    return Math.sqrt(Math.pow((a[0] - b[0]) * w / h, 2) + Math.pow(a[1] - b[1], 2));
  else
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow((a[1] - b[1]) * h / w, 2));
}

function calculateVelocity(a, b) {
  return calculateDistance(a.position, b.position) / Math.abs(a.timeStamp - b.timeStamp);
}

class ServerPerform extends serverSide.PerformanceManager {
  constructor(clientManager, topologyManager, soloistManager) {
    super(clientManager, topologyManager);

    this.__soloistManager = soloistManager;

    this.fingerRadius = 0.3;
  }

  addPlayer(player) {
    this.inputListener(player.socket);
    this.__soloistManager.addPlayer(player);
  }

  inputListener(socket) {
    socket.on('touchend', (fingerPosition, timeStamp) => this.touchHandler('touchend', fingerPosition, timeStamp, socket));
    socket.on('touchmove', (fingerPosition, timeStamp) => this.touchHandler('touchmove', fingerPosition, timeStamp, socket));
    socket.on('touchstart', (fingerPosition, timeStamp) => this.touchHandler('touchstart', fingerPosition, timeStamp, socket));
  }

  removePlayer(player) {
    this.__soloistManager.removePlayer(player);
  }

  scaleDistance(d, m) {
    return Math.min(d / m, 1);
  }

  touchHandler(type, fingerPosition, timeStamp, socket) {
    // console.log("\""+ type + "\" received from client " + socket.id + " with:\n" +
    //   "fingerPosition: { x: " + fingerPosition[0] + ", y: " + fingerPosition[1] + " }\n" +
    //   "timeStamp: " + timeStamp
    // );

    // Check if socket.id is still among the soloists.
    // Necessary because of network latency: sometimes,
    // the matrix is still on the display of the client,
    // he is no longer a performer on the server.)
    var index = this.__soloistManager.__soloists.map((s) => s.socket.id).indexOf(socket.id);
    if (index > -1) {
      let io = ioServer.io;
      let client = this.__clientManager.__sockets[socket.id];
      let soloistId = client.userData.soloistId;
      let dSub = 1;
      let s = 0;

      switch (type) {

        case 'touchend':
          io.of('/play').in('performance').emit('update_synth', soloistId, 1, s);
          io.of('/room').emit('update_synth', soloistId, fingerPosition, 1, s);
          break;

        case 'touchmove':
          client.userData.inputArray.push({
            position: fingerPosition,
            timeStamp: timeStamp
          });
          s = calculateVelocity(client.userData.inputArray[client.userData.inputArray.length - 1], client.userData.inputArray[client.userData.inputArray.length - 2]);
          s = Math.min(1, s / 2); // TODO: have a better way to set the threshold
          for (let i = 0; i < this.__clientManager.__playing.length; i++) {
            let d = this.scaleDistance(calculateDistance(this.__clientManager.__playing[i].position, fingerPosition), this.fingerRadius);
            this.__clientManager.__playing[i].socket.emit('update_synth', soloistId, d, s);
            if (dSub > d) dSub = d; // subwoofer distance calculation
          }
          io.of('/room').emit('update_synth', soloistId, fingerPosition, dSub, s);
          break;

        case 'touchstart':
          client.userData.inputArray = [{
            position: fingerPosition,
            timeStamp: timeStamp
          }];
          for (let i = 0; i < this.__clientManager.__playing.length; i++) {
            let d = this.scaleDistance(calculateDistance(this.__clientManager.__playing[i].position, fingerPosition), this.fingerRadius);
            this.__clientManager.__playing[i].socket.emit('update_synth', soloistId, d, 0);
            if (dSub > d) dSub = d; // subwoofer distance calculation
          }
          io.of('/room').emit('update_synth', soloistId, fingerPosition, dSub, s);
          break;

      }
    }
  }
}

module.exports = ServerPerform;