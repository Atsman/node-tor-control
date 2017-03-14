'use strict';

const tor = require('./tor');
const { connect } = require('./connection');

module.exports = {
  createTorControl,
};

