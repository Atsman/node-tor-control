'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const process = require('../src/process');
const {
  getSocksProxyInfo,
} = require('../src/socks');

describe('socks', () => {
  describe('getSocksProxyInfo', () => {
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should throw an error if network is not a number', async () => {
      expect(getSocksProxyInfo([])).to.be.rejectedWith('network must be a string');
    });

    it('should parse socks info', async () => {
      sandbox.stub(process, 'exec', () => (`
        Enabled: Yes\n
        Server: 127.0.0.1\n
        Port: 9050\n
        Authenticated Proxy Enabled: 0\n
        Unknown key: value\n
      `));

      const info = await getSocksProxyInfo();
      expect(info)
        .to.be.deep.equal({
          enabled: true,
          server: '127.0.0.1',
          port: 9050,
          authEnabled: false,
          'Unknown key': 'value',
        });
    });

    it('should return stdout form external command error', async () => {
      sandbox.stub(process, 'exec', () =>
        Promise.reject({ err: 'err', stdout: 'stdout', stderr: 'stderr' }));

      try {
        await getSocksProxyInfo();
      } catch (e) {
        expect(e).to.be.equal('stdout');
      }
    });
  });

  describe('setSocksProxyInfo', () => {
    // TODO: write tests
  });
});

