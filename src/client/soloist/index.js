// Import Soundworks modules (client side)
import clientSide from 'soundworks/client';
const client = clientSide.client;
const audioContext = clientSide.audioContext;

// Import Soundfield modules (client side)
import SoloistPerformance from './SoloistPerformance.js';

// Initialize the client type
client.init('soloist');

// Where the magic happens
window.addEventListener('load', () => {
  // Instantiate the modules
  const setup = new clientSide.Setup();
  const space = new clientSide.Space();
  const performance = new SoloistPerformance(setup, space);

  // Start the scenario
  client.start((serial, parallel) =>
    serial(
      setup,
      performance
    )
  );
});
