// Import external libraries
const express = require('express');
const path = require('path');

// Import Soundworks modules (server side)
import serverSide from 'soundworks/server';
const server = serverSide.server;

// Import Soundfield modules (server side)
import PlayerPerformance from './PlayerPerformance.js';
import SoloistPerformance from './SoloistPerformance.js';

// Instantiate the modules
const setup = new serverSide.Setup();
setup.generate('surface', { height: 1, width: 1 });
const locator = new serverSide.Locator({ setup: setup });
const playerPerformance = new PlayerPerformance();
const soloistPerformance = new SoloistPerformance(playerPerformance, setup);

// Launch server
const app = express();
const dir = path.join(process.cwd(), 'public');
server.start(app, dir, process.env.PORT || 3000);

// Map modules to client types
server.map('player', setup, locator, playerPerformance);
server.map('soloist', setup, soloistPerformance);
