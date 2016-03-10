// Import soundworks (client side) and Soundfield experience
import soundworks from 'soundworks/client';
import PlayerExperience from './PlayerExperience.js';

/**
 * The scenario consists in 3 steps:
 * - initialization of the required APIs ('welcome' service)
 * - getting the location of the user ('locator' service)
 * - the experience
 */
function bootstrap () {
  // configuration shared by the server (cf. `views/default.ejs`)
  const socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  const appName = window.CONFIG && window.CONFIG.APP_NAME;

  soundworks.client.init('player', { socketIO, appName });
  const playerExperience = new PlayerExperience();

  // start the application.
  soundworks.client.start();
}

window.addEventListener('load', bootstrap);
