import { ServerExperience } from 'soundworks/server';


/**
 * The `PlayerExperience` class manages the `'player'` connections and
 * disconnections, and informs the `'soloist'` clients about them so that they
 * can update the performance visualization accordingly.
 */
export default class PlayerExperience extends ServerExperience {
  constructor() {
    super('player-experience');
  }

  /**
   * Retrieve informations (uid and coordinates) of the client.
   * @param {Client} client
   * @return {Object}
   * @property {Number} uid - Unique id of the client.
   * @property {Array<Number>} coordinates - Coordinates of the client (`[x:Number,
   * y:Number]` array).
   */
  _getInfo(client) {
    return { uid: client.uid, coordinates: client.coordinates };
  }

  /**
   * Called when a client starts the performance.
   * The method relays that information to the `'soloist'` clients.
   * @param {Client} client Client that enters the performance.
   */
  enter(client) {
    super.enter(client);
    // Inform the soloist that a new player entered the performance
    this.broadcast('soloist', null, 'player-add', this._getInfo(client));
  }

  /**
   * Called when a client ends the performance (disconnection).
   * The method relays the information to the `'soloist'` clients.
   * @param {Client} client Client who exits the performance.
   */
  exit(client) {
    super.exit(client);
    // Inform the soloist that a player exited the performance
    this.broadcast('soloist', null, 'player-remove', this._getInfo(client));
  }
}
