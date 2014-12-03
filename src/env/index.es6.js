var ioClient = clientSide.ioClient;
ioClient.init('/env');

window.addEventListener('load', () => {
  var socket = ioClient.socket;

  socket.on('update_synth', (soloistId, pos, d, s) => {
    //console.log('update_synth', soloistId, pos, d, s);
  });

});