const createTorControl = require('./src');

async function main() {
  const torControl = await createTorControl({ password: 'Blackpanter' });
  const info = await torControl.getConf(['ControlPort']);
  console.log(info);
}

main();

