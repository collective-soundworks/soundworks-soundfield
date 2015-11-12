// Import Soundworks library (server side)
import serverSide from 'soundworks/server';
const server = serverSide.server;

// Helper function
function getInfo(client) {
  return { index: client.index, coordinates: client.coordinates };
}

// PlayerPerformance class
export default class PlayerPerformance extends serverSide.Performance {
  constructor(options = {}) {
    super(options);
  }

  enter(client) {
    super.enter(client);

    // Inform the soloist that a new player entered the performance
    server.broadcast('soloist', 'performance:playerAdd', getInfo(client));
  }

  exit(client) {
    super.exit(client);

    // Inform the soloist that a player exited the performance
    server.broadcast('soloist', 'performance:playerRemove', getInfo(client));
  }
}
