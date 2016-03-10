// Enable sourceMaps in node
import 'source-map-support/register';
// Import soundworks (server-side) and experiences
import * as soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
import SoloistExperience from './SoloistExperience';

const setup = {
  height: 10,
  width: 10
};

soundworks.server.init({ setup, appName: 'Soundfield' });

// todo - move everything in one experience
// Configure locator
const playerExperience = new PlayerExperience('player');
// the soloist needs to know all the players
const soloistExperience = new SoloistExperience('soloist', playerExperience);

soundworks.server.start();


// Map modules to client types:
// - the `'player'` clients need to communicate with the `setup`, the `locator`
//   and the `playerPerformance` on the server side;
// - the `'soloist'` clients need to communicate with the `setup` and the
//   `soloistPerformance` on the server side.
// server.map('player', setup, locator, playerPerformance);
// server.map('soloist', setup, soloistPerformance);
