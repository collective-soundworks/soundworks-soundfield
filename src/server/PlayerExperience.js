import { Experience } from 'soundworks/server';


/**
 * The `PlayerExperience` class manages the `'player'` connections and
 * disconnections, and informs the `'soloist'` clients about them so that they
 * can update the performance visualization accordingly.
 */
export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this._locator = this.require('locator');
  }

  /**
   * Called when a client starts the performance.
   * The method relays that information to the `'soloist'` clients.
   * @param {Client} client Client that enters the performance.
   */
  enter(client) {
    super.enter(client);
    // Inform the soloist that a new player entered the performance
    // both server-side and client-side
    this.emit('enter:player', client);
  }

  /**
   * Called when a client ends the performance (disconnection).
   * The method relays the information to the `'soloist'` clients.
   * @param {Client} client Client who exits the performance.
   */
  exit(client) {
    super.exit(client);
    // Inform the soloist that a player exited the performance
    // both server-side and client-side
    this.emit('exit:player', client);
  }
}
