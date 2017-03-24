'use strict';

const { OK, DEFAULT_NETWORK } = require('./constants');
const process = require('../process');

async function setSocksProxyState(network = DEFAULT_NETWORK, state) {
  try {
    await process.exec(`networksetup -setsocksfirewallproxystate ${network} ${state}`);
    return OK;
  } catch (e) {
    throw e.stdout;
  }
}

function enableSocksProxy(network) {
  return setSocksProxyState(network, 'on');
}

function disableSocksProxy(network = DEFAULT_NETWORK) {
  return setSocksProxyState(network, 'off');
}

module.exports = {
  enableSocksProxy,
  disableSocksProxy,
};

