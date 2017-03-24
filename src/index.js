'use strict';

const tor = require('./tor');
const socks = require('./socks');
const { connect, disconnect } = require('./connection');

module.exports = {
  tor,
  socks,
  connect,
  disconnect,
};

