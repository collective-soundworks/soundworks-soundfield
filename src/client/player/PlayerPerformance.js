// Import Soundworks modules (client side)
const clientSide = require('soundworks/client');
const client = clientSide.client;

// PlayerPerformance class
export default class PlayerPerformance extends clientSide.Performance {
  constructor(loader, options = {}) {
    super(options);

    this.loader = loader; // the loader module
  }

  start() {
    super.start(); // don't forget this

    // Play the welcome sound immediately
    let src = audioContext.createBufferSource();
    src.buffer = this.loader.buffers[0]; // get the first audio buffer from the loader
    src.connect(audioContext.destination);
    src.start(audioContext.currentTime);

    this.setCenteredViewContent('Let’s go!'); // display some feedback text in the view

    // Play another sound when we receive the 'play' message from the server
    client.receive('performance:play', () => {
      let src = audioContext.createBufferSource();
      src.buffer = this.loader.buffers[1]; // get the second audioBuffer from the loader
      src.connect(audioContext.destination);
      src.start(audioContext.currentTime);
    });

    /* We would usually call the 'done' method when the module
     * can hand over the control to subsequent modules,
     * however since the performance is the last module to be called
     * in this scenario, we don't need it here.
     */
    // this.done();
  }
}
