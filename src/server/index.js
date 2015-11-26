// Import external libraries
const express = require('express');
const path = require('path');

// Import Soundworks library modules (server side)
import { server, Locator, Setup } from 'soundworks/server';

// Import Soundfield modules (server side)
import PlayerPerformance from './PlayerPerformance.js';
import SoloistPerformance from './SoloistPerformance.js';

// Instantiate the modules
const setup = new Setup();
setup.generate('surface', { height: 1, width: 1 });
const locator = new Locator({ setup: setup });
const playerPerformance = new PlayerPerformance();
const soloistPerformance = new SoloistPerformance(playerPerformance, setup);

// Launch server
const app = express();
const dir = path.join(process.cwd(), 'public');
server.start(app, dir, process.env.PORT || 3000);

// Map modules to client types:
// - the `'player'` clients need to communicate with the `setup`, the `locator`
//   and the `playerPerformance` on the server side;
// - the `'soloist'` clients need to communicate with the `setup` and the
//   `soloistPerformance` on the server side.
server.map('player', setup, locator, playerPerformance);
server.map('soloist', setup, soloistPerformance);
