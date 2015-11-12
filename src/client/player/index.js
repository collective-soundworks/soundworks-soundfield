// Import Soundworks modules (client side)
import clientSide from 'soundworks/client';
const client = clientSide.client;
const audioContext = clientSide.audioContext;

// Import modules written for Soundfield
import PlayerPerformance from './PlayerPerformance.js';

// Initiliaze the client type
client.init('player');

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
  const performance = new PlayerPerformance();

  // Start the scenario and link the modules
  client.start((serial, parallel) =>
    serial(
      parallel(
        // We launch in parallel the welcome module, the loader and the checkin…
        welcome,
        checkin
      ),
      performance // … and when all of them are done, we launch the performance.
    )
  );
});
