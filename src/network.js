'use strict';

const assert = require('assert');
const _ = require('lodash');
const process = require('./process');

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

async function getSocksProxyInfo(network = 'Wi-Fi') {
  assert(_.isString(network), 'network must be a string');
  const info = await process.exec(`networksetup -getsocksfirewallproxy "${network}"`);
  return parseSocksProxyInfo(info);
}

module.exports = {
  getSocksProxyInfo,
};

