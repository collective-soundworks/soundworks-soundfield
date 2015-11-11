// Import Soundworks modules (client side)
const clientSide = require('soundworks')('client');
const client = clientSide.client;
const audioContext = clientSide.audioContext;

// Import modules written for Soundfield
import PlayerPerformance from './PlayerPerformance.js';

// Initiliaze the client type
client.init('player');

// Constants
const files = ['sounds/sound-welcome.mp3', 'sounds/sound-others.mp3'];

// Where the magic happens
window.addEventListener('load', () => {
  // Instantiate the modules
  const welcome = new clientSide.Dialog({
    name: 'welcome',
    text: `<p>Welcome to <b>Soundfield</b>.</p>
    <p>Touch the screen to join!</p>`,
    activateAudio: true
  });
  const checkin = new clientSide.Checkin();
  const loader = new clientSide.Loader({ files: files });
  const performance = new PlayerPerformance(loader);

  // Start the scenario and link the modules
  client.start((serial, parallel) =>
    serial(
      parallel(
        // We launch in parallel the welcome module, the loader and the checkin…
        welcome,
        loader,
        checkin
      ),
      performance // … and when all of them are done, we launch the performance.
    )
  );
});
