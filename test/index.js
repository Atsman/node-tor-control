'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

require('./connection.spec');
require('./tor.spec');

