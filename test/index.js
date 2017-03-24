'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(sinonChai);
chai.use(chaiAsPromised);

require('./connection.spec');
require('./tor.spec');
require('./reply.spec');
require('./socks.spec');
require('./process.spec');

