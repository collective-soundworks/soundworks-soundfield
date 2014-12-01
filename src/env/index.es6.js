window.socket = window.socket || io('/env');

window.addEventListener('load', () => {

  socket.on('update_synth', (soloistId, pos, d, s) => {
    console.log('update_synth', soloistId, pos, d, s);
  });

});