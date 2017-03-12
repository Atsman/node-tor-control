'use strict';

const {
  connect, disconnect, signalNewNYM,
} = require('./tor');

class TorControl {
  constructor(connection) {
    this.connection = connection;
  }

  signalNewNYM() {
    return signalNewNYM(this.connection);
  }

  disconnect() {
    return disconnect(this.connection);
  }
}

async function createTorControl(options) {
  try {
    const connection = await connect(options);
    return new TorControl(connection);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

module.exports = {
  TorControl,
  createTorControl,
}

