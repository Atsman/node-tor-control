'use strict';

const {
  getSocksProxyInfo,
  setSocksProxyInfo,
} = require('./socks-info');

const {
  enableSocksProxy,
  disableSocksProxy,
} = require('./socks-state');

module.exports = {
  getSocksProxyInfo,
  setSocksProxyInfo,
  enableSocksProxy,
  disableSocksProxy,
};

