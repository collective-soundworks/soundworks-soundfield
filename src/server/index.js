// enable source-maps in node
import 'source-map-support/register';
// import soundworks (server-side) and experience
import * as soundworks from 'soundworks/server';
import SoundfieldExperience from './SoundfieldExperience';
import defaultConfig from './config/default';

let config = null;

switch(process.env.ENV) {
  default:
    config = defaultConfig;
    break;
}

// configure express environment ('production' enables cache systems)
process.env.NODE_ENV = config.env;

// initialize application with configuration options
soundworks.server.init(config);

// define the configuration object to be passed to the `.ejs` template
soundworks.server.setClientConfigDefinition((clientType, config, httpRequest) => {
  return {
    clientType: clientType,
    env: config.env,
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
