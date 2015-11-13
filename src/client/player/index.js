// Import Soundworks modules (client side)
import clientSide from 'soundworks/client';
const client = clientSide.client;
const audioContext = clientSide.audioContext;

// Import Soundfield modules (client side)
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
  const setup = new clientSide.Setup();
  const space = new clientSide.Space();
  const locator = new clientSide.Locator({ setup: setup, space: space });
  const performance = new PlayerPerformance();

  // Start the scenario
  client.start((serial, parallel) =>
    serial(
      parallel(
        welcome,
        serial(setup, locator)
      ),
      performance
    )
  );
});
