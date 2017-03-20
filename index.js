'use strict';

const { network } = require('./src');

async function main() {
  try {
    const res = await network.getSockProxyInfo();
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}

main();

