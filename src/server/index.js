// enable source-maps in node
import 'source-map-support/register';
// import soundworks (server-side) and experience
import * as soundworks from 'soundworks/server';
import SoundfieldExperience from './SoundfieldExperience';


// sets the size of the area, orther setup informations are not needed
const area = { height: 5, width: 8 };

// initialize the server with configuration informations
soundworks.server.init({ setup: { area }, appName: 'Soundfield' });

// define the configuration object to be passed to the `.ejs` template
soundworks.server.setClientConfigDefinition((clientType, config, httpRequest) => {
  return {
    clientType: clientType,
    socketIO: config.socketIO,
    appName: config.appName,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
  };
});

// create the common server experience for both the soloists and the players
const soundfieldExperience = new SoundfieldExperience(['player', 'soloist']);

// start the application
soundworks.server.start();
