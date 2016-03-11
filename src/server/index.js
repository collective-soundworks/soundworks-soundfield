// Enable sourceMaps in node
import 'source-map-support/register';
// Import soundworks (server-side) and experiences
import * as soundworks from 'soundworks/server';
// import PlayerExperience from './PlayerExperience';
import SoundfieldExperience from './SoundfieldExperience';

// sets the size of the area, orther setup informations are not needed
const area = { height: 5, width: 8 };
// initialize the server with configuration informations
soundworks.server.init({ setup: { area }, appName: 'Soundfield' });

// create the common server experience for both the soloists and the players
const soundfieldExperience = new SoundfieldExperience(['player', 'soloist']);

soundworks.server.start();


// Map modules to client types:
// - the `'player'` clients need to communicate with the `setup`, the `locator`
//   and the `playerPerformance` on the server side;
// - the `'soloist'` clients need to communicate with the `setup` and the
//   `soloistPerformance` on the server side.
// server.map('player', setup, locator, playerPerformance);
// server.map('soloist', setup, soloistPerformance);
