import { Experience } from 'soundworks/server';


/**
 * `SoloistPerformance` class.
 * The `SoloistPerformance` class makes the connection between the `'soloist'`
 * clients and the `'player'` clients. More specifically, the module listens for
 * the messages from the `'soloist'` clients (with the touch coordinates),
 * calculates the distances from the touch to every `'player'` client, and sends
 * a 'play' or 'mute' message to the relevant `'player'` clients.
 */
export default class SoloistExperience extends Experience {
  /**
   * @param {Array} clientTypes - Bind the experience to the given client types.
   */
  constructor(clientTypes) {
    super(clientTypes);

    /**
     * List of the connected players along with their formatted informations.
     * @type {Map<Object, Object>}
     */
    this._players = new Map();

    /**
     * List of currently active players.
     * @type {Set}
     */
    this._activePlayers = new Set();

    this._sharedConfig = this.require('shared-config');
    this._locator = this.require('locator');
    // `soloist` clients also need `setup` informations
    this._sharedConfig.addItem('setup', 'soloist');

    /**
     * Setup module.
     * @type {Setup}
     */
    this._setup = this._sharedConfig.get('setup');
  }

  /**
   * Format informations (uuid and coordinates) of the given player
   * to be comsumed simply by the client.
   * @param {Client} client
   * @return {Object}
   * @property {Number} uuid - Unique id of the client.
   * @property {Array<Number>} coordinates - Coordinates of the client (`[x:Number,
   * y:Number]` array).
   */
  _getPlayerInfo(client) {
    return {
      id: client.uuid,
      x: client.coordinates[0],
      y: client.coordinates[1],
    };
  }

  /**
   * Called when a soloist starts the (soloist) performance.
   * The method sends the player list, and listens for touch messages.
   * @param {Client} soloist Soloist that enters the performance.
   */
  enter(client) {
    super.enter(client);

    switch (client.type) {
      case 'soloist':
        this.onSoloistEnter(client);
        break;
      case 'player':
        this.onClientEnter(client);
        break;
    }
  }

  exit(client) {
    if (client.type === 'player')
      this.onPlayerExit(client);
  }

  onSoloistEnter(client) {
    // send the list of connected players
    const playerInfos = Array.from(this._players.values())
    this.send(client, 'player:list', playerInfos);

    // listen touch inputs from the soloist client
    this.receive(client, 'input:change', (radius, coordinates) => {
      this.onInputChange(radius, coordinates);
    });
  }

  onClientEnter(client) {
    // format infos from the player to be consmumed by the solist
    const infos = this._getPlayerInfo(client);
    // keep track of the informations
    this._players.set(client, infos);
    // send the informations of the new client to all the connected soloists
    this.broadcast('soloist', null, 'player:add', infos);
  }

  onPlayerExit(client) {
    // retrieve stored informations from the client
    const infos = this._players.get(client);
    // delete it from the stack of client `player`
    this._players.delete(client);
    // send the informations of the exited client to all the connected soloists
    this.broadcast('soloist', null, 'player:remove', infos);
  }

  onInputChange(radius, coordinates) {
    const squaredRadius = radius * radius;
    const activePlayers = this._activePlayers;

    // if coordinates are empty, stop all players
    if (Object.keys(coordinates).length === 0) {
      for (let player of this._players.keys()) {
        activePlayers.delete(player);
        this.send(player, 'stop');
      }
    } else {
      for (let id in coordinates) {
        const center = coordinates[id];

        for (let player of this._players.keys()) {
          const inArea = this.inArea(player.coordinates, center, squaredRadius);
          const isActive = activePlayers.has(player);

          if (inArea && !isActive) {
            // weirdo
            activePlayers.add(player);
            this.send(player, 'start');
          } else if (!inArea && isActive) {
            // weirdo
            activePlayers.delete(player);
            this.send(player, 'stop');
          }
        }
      }
    }
  }

  // could probably be done stay in square space...
  inArea(point, center, squaredRadius) {
    const x = point[0] - center[0];
    const y = point[1] - center[1];
    const squaredDistance = x * x + y * y;

    return squaredDistance < squaredRadius;
  }
}
