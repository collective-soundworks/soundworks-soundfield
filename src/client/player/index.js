// Import Soundworks library modules (client side)
import { client,
         audioContext,
         Dialog,
         Locator,
         Setup,
         Space } from 'soundworks/client';

// Import Soundfield modules (client side)
import PlayerPerformance from './PlayerPerformance.js';

// Initiliaze the client type
client.init('player');

// Where the magic happens
window.addEventListener('load', () => {
  // Instantiate the modules
  const welcome = new Dialog({
    name: 'welcome',
    text: `<p>Welcome to <b>Soundfield</b>.</p>
           <p>Touch the screen to join!</p>`,
    activateAudio: true
  });
  const setup = new Setup();
  const space = new Space();
  const locator = new Locator({ setup: setup, space: space });
  const performance = new PlayerPerformance();

  // Start the scenario and order the modules.
  //
  // The scenario consists in two major steps:
  // - the initialization;
  // - the performance.
  //
  // The initialization step consists in welcoming the player and getting his /
  // her location. These two sub-steps can happen in parallel. The “Getting the
  // location” step requires to know the setup beforehand, so we launch in
  // serial the setup module to get the setup, and then the locator.
  //
  // The performance step can start when the initialization step is done.
  client.start((serial, parallel) =>
    serial(
      // Initialization step
      parallel(
        welcome, // Welcome screen
        serial(setup, locator) // Get the location (setup first, locator then)
      ),
      // Performance step
      performance
    )
  );
});
