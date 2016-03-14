// import soundworks (client side) and Soundfield experience
import * as soundworks from 'soundworks/client';
import PlayerExperience from './PlayerExperience';


function bootstrap() {
  // configuration shared by the server (cf. `html/default.ejs`)
  const socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  const appName = window.CONFIG && window.CONFIG.APP_NAME;

  // initialize client side `player` application
  soundworks.client.init('player', { socketIO, appName });
  // instanciate the experience of the `player`
  const playerExperience = new PlayerExperience();
  // start the application
  soundworks.client.start();
}

window.addEventListener('load', bootstrap);
