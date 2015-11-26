// Import Soundworks library (server side)
import serverSide from 'soundworks/server';
const server = serverSide.server;

/**
 * Retrieve information (index and coordinates) about the client.
 * @param {Client} client Client.
 * @return {Object} Information about the client.
 * @property {Number} index Index of the client.
 * @property {Number[]} coordinates Coordinates of the client (`[x:Number,
 * y:Number]` array).
 */
function getInfo(client) {
  return { index: client.index, coordinates: client.coordinates };
}

/**
 * `PlayerPerformance` class.
 * The `PlayerPerformance` class manages the `'player'` connections and
 * disconnections, and informs the `'soloist'` clients about them so that they
 * can update the performance visualization accordingly.
 */
export default class PlayerPerformance extends serverSide.Performance {
  /**
   * Create an instance of the class.
   * @param {Object} [options={}] Options (same as the base class).
   */
  constructor(options = {}) {
    super(options);
  }

  /**
   * Called when a client starts the performance.
   * The method relays that information to the `'soloist'` clients.
   * @param {Client} client Client that enters the performance.
   */
  enter(client) {
    super.enter(client);

    // Inform the soloist that a new player entered the performance
    server.broadcast('soloist', 'performance:playerAdd', getInfo(client));
  }

  /**
   * Called when a client ends the performance (disconnection).
   * The method relays the information to the `'soloist'` clients.
   * @param {Client} client Client who exits the performance.
   */
  exit(client) {
    super.exit(client);

    // Inform the soloist that a player exited the performance
    server.broadcast('soloist', 'performance:playerRemove', getInfo(client));
  }
}
