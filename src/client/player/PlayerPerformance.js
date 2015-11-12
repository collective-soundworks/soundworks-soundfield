// Import Soundworks modules (client side)
import clientSide from 'soundworks/client';
const client = clientSide.client;

// PlayerPerformance class
export default class PlayerPerformance extends clientSide.Performance {
  constructor(options = {}) {
    super(options);
  }

  start() {
    super.start(); // don't forget this

    console.log("hey, welcome to the performance");
  }
}
