import { Experience } from 'soundworks/server';


/**
 * The `SoundfieldExperience` makes the connection between the `soloist`
 * and the `player` client types.
 * More specifically, the module listens for messages containing the touch
 * coordinates from the `soloist` clients, calculates the distances from the
 * touch to every `player`, and sends a `play` or `stop`
 * message to the relevant `player` clients.
 */
export default class SoundfieldExperience extends Experience {
  /**
   * @param {Array} clientTypes - The client types the experience should be binded.
   */
  constructor(clientTypes) {
    super(clientTypes);

    /**
     * List of the connected players along with their formatted informations.
     * @type {Map<Object, Object>}
     */
    this.players = new Map();

    /**
     * List of the currently active players.
     * @type {Set}
     */
    this.activePlayers = new Set();

    // the `shared-config` service is used by the `soloist` clients to get
    // informations from the server configuration
    this.sharedConfig = this.require('shared-config');
    // this instruction adds the sharing of the `setup` entry of the server
    // configuration as a requirement for `soloist`
    this.sharedConfig.share('setup', 'soloist');

    // the `locator` service is required by the `player` clients to get their
    // approximative position into the defined area
    this.locator = this.require('locator');
  }

  /**
   * Function called whenever a client enters its `Experience`. When called, the
   * given `client` can be assumed to be fully configured.
   * @param {Client} client
   */
  enter(client) {
    super.enter(client);

    // define what to do ccording to the `client` type (i.e. `player` or `soloist`)
    switch (client.type) {
      case 'soloist':
        this.onSoloistEnter(client);
        break;
      case 'player':
        this.onPlayerEnter(client);
        break;
    }
  }

  /**
   * Function called whenever a client exists its `Experience`.
   */
  exit(client) {
    if (client.type === 'player')
      this.onPlayerExit(client);
  }

  /**
   * Specific `enter` routine for clients of type `soloist`.
   */
  onSoloistEnter(client) {
    // send the list of connected players
    const playerInfos = Array.from(this.players.values())
    this.send(client, 'player:list', playerInfos);

    // listen touch inputs from the `soloist` client
    this.receive(client, 'input:change', (radius, coordinates) => {
      this.onInputChange(radius, coordinates);
    });
  }

  /**
   * Specific `enter` routine for clients of type `player`.
   */
  onPlayerEnter(client) {
    // format infos from the player to be consmumed by the solist
    const infos = this.formatClientInformations(client);
    // keep track of the informations
    this.players.set(client, infos);
    // send the informations of the new client to all the connected soloists
    this.broadcast('soloist', null, 'player:add', infos);
  }

  /**
   * Specific `exit` routine for clients of type `player`.
   */
  onPlayerExit(client) {
    // retrieve stored informations from the client
    const infos = this.players.get(client);
    // delete it from the stack of client `player`
    this.players.delete(client);
    // send the informations of the exited client to all the connected soloists
    this.broadcast('soloist', null, 'player:remove', infos);
  }

  /**
   * Format informations the given player in order to be simply comsumed by soloists.
   * @param {Client} client - The client object.
   * @return {Object}
   * @property {Number} id - Unique id of the client.
   * @property {Array<Number>} coordinates - Coordinates of the client.
   */
  formatClientInformations(client) {
    return {
      id: client.uuid,
      x: client.coordinates[0],
      y: client.coordinates[1],
    };
  }

  /**
   * This method is called whenever a `soloist` client send the coordinates of
   * its touches on the screen.
   * @param {Number} radius - The radius of the excited zone as defined in the
   *  client-side `SoloistExperience`.
   * @param {Array<Array<Number>>} - List of the coordinates (relative to the
   *  `area`) of the touch events.
   */
  onInputChange(radius, coordinates) {
    const sqrRadius = radius * radius;
    const activePlayers = this.activePlayers;
    const players = new Set(this.players.keys());

    // if coordinates are empty, stop all players, else defines if a client
    // should be sent a `start` or `stop` message according to its previous
    // state and if it is or not in an zone that is excited by the soloist
    if (Object.keys(coordinates).length === 0) {
      activePlayers.forEach((player) => this.send(player, 'stop'));
      activePlayers.clear();
    } else {
      players.forEach((player) => {
        let inArea = false;
        const isActive = activePlayers.has(player);

        for (let id in coordinates) {
          const center = coordinates[id];
          inArea = inArea || this.inArea(player.coordinates, center, sqrRadius);

          if (inArea) {
            if (!isActive) {
              this.send(player, 'start');
              activePlayers.add(player);
            }

            break;
          }
        }

        if (isActive && !inArea) {
          this.send(player, 'stop');
          activePlayers.delete(player);
        }
      });
    }
  }

  /**
   * Defines if `point` is inside the circle defined by `center` and `sqrRadius`.
   * The computation is done in squared space in order to save square root
   * computation on each call.
   * @param {Array<Number>} point - The x, y coordinates of the point to be tested.
   * @param {Array<Number>} center - The x, y coordinates of center of the circle.
   * @param {Number} sqrRadius - The squared radius of the circle.
   * @return {Boolean} - `true` if point is in the circle, `false` otherwise.
   */
  inArea(point, center, sqrRadius) {
    const x = point[0] - center[0];
    const y = point[1] - center[1];
    const sqrDistance = x * x + y * y;

    return sqrDistance < sqrRadius;
  }
}
