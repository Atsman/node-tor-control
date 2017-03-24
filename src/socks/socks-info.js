'use strict';

const _ = require('lodash');
const {
  OK, DEFAULT_NETWORK, DEFAULT_PORT, LOCALHOST,
} = require('./constants');
const process = require('../process');

const LINE_REGEX = /(.+): (.+)/;

function isParseSockProxyLine(line) {
  return LINE_REGEX.test(line);
}

function parseSocksProxyInfoLine(line) {
  const [, key, value] = line.match(LINE_REGEX);
  return { key, value };
}

function convertSocksProxyInfoValues({ key, value }) {
  switch (key) {
    case 'Enabled': return { enabled: value === 'Yes' };
    case 'Server': return { server: value };
    case 'Port': return { port: Number(value) };
    case 'Authenticated Proxy Enabled': return { authEnabled: value === '1' };
    default: return { [key]: value };
  }
}

function parseSocksProxyInfo(info) {
  return info.split('\n')
    .filter(isParseSockProxyLine)
    .map(
      _.flow([
        str => str.trim(),
        parseSocksProxyInfoLine,
        convertSocksProxyInfoValues,
      ])
    )
    .reduce((res, pair) => Object.assign({}, res, pair), {});
}

/*
 * @function getSocksProxyInfo
 * @param {String} network - network name on mac system (Wi-Fi, Ethernet)
 * @returns {Promise} - error message or information about
 * socks proxy (enabled, server, port, authEnabled)
 */
async function getSocksProxyInfo(network = DEFAULT_NETWORK) {
  try {
    const info = await process.exec(`networksetup -getsocksfirewallproxy "${network}"`);
    return parseSocksProxyInfo(info);
  } catch (e) {
    throw e.stdout;
  }
}

/*
 * @function setSocksProxyInfo
 * @param {String} network - network name on mac system (Wi-Fi, Ethernet)
 * @param {String} host - host of the socks proxy, default: 127.0.0.1
 * @param {Number} port - port of the socks proxy, default: 9050
 * @returns {Promise} - response from external command - error message or OK.
 */
async function setSocksProxyInfo(network = DEFAULT_NETWORK, host = LOCALHOST, port = DEFAULT_PORT) {
  try {
    await process.exec(`networksetup -setsocksfirewallproxy ${network} ${host} ${port}`);
    return OK;
  } catch (e) {
    throw e.stdout;
  }
}

module.exports = {
  getSocksProxyInfo,
  setSocksProxyInfo,
};

