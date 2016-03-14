// import soundworks (client side) and Soundfield experience
import * as soundworks from 'soundworks/client';
import SoloistExperience from './SoloistExperience';


function bootstrap () {
  // configuration shared by the server (cf. `html/default.ejs`)
  const socketIO = window.CONFIG && window.CONFIG.SOCKET_CONFIG;
  const appName = window.CONFIG && window.CONFIG.APP_NAME;

  // initialize client side `soloist` application
  soundworks.client.init('soloist', { socketIO, appName });
  // instanciate the experience of the `soloist`
  const soloistExperience = new SoloistExperience();
  // start the application
  soundworks.client.start();
}

window.addEventListener('load', bootstrap);
