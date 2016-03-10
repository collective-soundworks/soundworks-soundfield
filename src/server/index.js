// Import soundworks (server-side) and experiences
import soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
import SoloistExperience from './SoloistExperience';

const setup = { height: 10, width: 10 };
soundworks.server.init({ setup, appName: 'Soundfield' });

// Configure locator
soundworks.server.require('locator', { setup, clientType: 'player' });

const playerExperience = new PlayerExperience();
// the soloist needs to know all the clients and the setup
const soloistExperience = new SoloistExperience(playerExperience.clients, setup);

// Add client types to experiences
playerExperience.addClientType('player');
soloistExperience.addClientType('soloist');

soundworks.server.start();


// Map modules to client types:
// - the `'player'` clients need to communicate with the `setup`, the `locator`
//   and the `playerPerformance` on the server side;
// - the `'soloist'` clients need to communicate with the `setup` and the
//   `soloistPerformance` on the server side.
// server.map('player', setup, locator, playerPerformance);
// server.map('soloist', setup, soloistPerformance);
