var matrixServer = require('matrix/server');
var ServerDynamicModel = matrixServer.DynamicModel;
var io = matrixServer.IOSingleton.io;

'use strict';

class WanderingSoundServerDynamicModel extends ServerDynamicModel {
  constructor(clientManager, topologyModel, soloistManager) {
    super(clientManager, topologyModel);

    this.__soloistManager = soloistManager;

    this.fingerRadius = 0.3;
  }

  calculateDistance(a, b) { // TODO: move to utils module?
    var h = this.__topologyModel.height;
    var w = this.__topologyModel.width;
    if (w / h < 1)
      return Math.sqrt(Math.pow((a[0] - b[0]) * w / h, 2) + Math.pow(a[1] - b[1], 2));
    else
      return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow((a[1] - b[1]) * h / w, 2));
  }

  calculateVelocity(a, b) { // TODO: move to utils module?
    return this.calculateDistance(a.position, b.position) / Math.abs(a.timeStamp - b.timeStamp);
  }

  inputListener(socket) {
    socket.on('touchend', (fingerPosition, timeStamp) => this.touchHandler('touchend', fingerPosition, timeStamp, socket));
    socket.on('touchmove', (fingerPosition, timeStamp) => this.touchHandler('touchmove', fingerPosition, timeStamp, socket));
    socket.on('touchstart', (fingerPosition, timeStamp) => this.touchHandler('touchstart', fingerPosition, timeStamp, socket));    
  }

  scaleDistance(d, m) {
    return Math.min(d / m, 1);
  }

  touchHandler(type, fingerPosition, timeStamp, socket) {
    console.log("\""+ type + "\" received from client " + socket.id + " with:\n" +
      "fingerPosition: { x: " + fingerPosition[0] + ", y: " + fingerPosition[1] + " }\n" +
      "timeStamp: " + timeStamp
    );
    // Check if socket.id is still among the soloists.
    // Necessary because of network latency: sometimes,
    // the matrix is still on the display of the client,
    // he is no longer a performer on the server.)
    var index = this.__soloistManager.__soloists.map((s) => s.socket.id).indexOf(socket.id);
    if (index > -1) {
      let client = this.__clientManager.__sockets[socket.id];
      let soloistId = client.userData.soloistId;
      let dSub = 1;
      let s = 0;
      switch(type) {

        case 'touchend':
          io.of('/play').in('playing').emit('update_synth', soloistId, 1, s);
          io.of('/room').emit('update_synth', soloistId, fingerPosition, 1, s);
        break;

        case 'touchmove':
          client.userData.inputArray.push({ position: fingerPosition, timeStamp: timeStamp });
          s = this.calculateVelocity(client.userData.inputArray[client.userData.inputArray.length - 1], client.userData.inputArray[client.userData.inputArray.length - 2]);
          s = Math.min(1, s / 2); // TODO: have a better way to set the threshold
          for (let i = 0; i < this.__clientManager.__playing.length; i++) {
            let d = this.scaleDistance(this.calculateDistance(this.__clientManager.__playing[i].position, fingerPosition), this.fingerRadius);
            this.__clientManager.__playing[i].socket.emit('update_synth', soloistId, d, s);
            if (dSub > d) dSub = d; // subwoofer distance calculation
          }
          io.of('/room').emit('update_synth', soloistId, fingerPosition, dSub, s);
        break;

        case 'touchstart':
          client.userData.inputArray = [{ position: fingerPosition, timeStamp: timeStamp }];
          for (let i = 0; i < this.__clientManager.__playing.length; i++) {
            let d = this.scaleDistance(this.calculateDistance(this.__clientManager.__playing[i].position, fingerPosition), this.fingerRadius);
            this.__clientManager.__playing[i].socket.emit('update_synth', soloistId, d, 0);
            if (dSub > d) dSub = d; // subwoofer distance calculation
          }
          io.of('/room').emit('update_synth', soloistId, fingerPosition, dSub, s);
        break;

      }
    }
  }
}



module.exports = WanderingSoundServerDynamicModel;