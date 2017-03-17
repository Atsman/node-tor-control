'use strict';

const { tor, connect } = require('./src');

async function main() {
  const conn = await connect({ password: 'Blackpanter' });
  const info = await tor.getConf(conn, ['ControlPort']);
  console.log(info);
}

main();

