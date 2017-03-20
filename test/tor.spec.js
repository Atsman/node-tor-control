'use strict';

const { expect } = require('chai');

const {
  sendCommand, authenticate, sendSignal, signalDump, signalNewNYM,
  getInfo,
} = require('../src/tor');

const ConnectionMock = require('./connection-mock');

describe('tor', () => {
  describe('sendCommand', () => {
    it('should send command and return result', async () => {
      const connectionMock = new ConnectionMock();
      connectionMock.onWrite(function onWriteCb(msg) {
        if (msg === 'test-single-line') {
          this.callDataCb(`250 ${msg}\r\n`);
        } else if (msg === 'test-multi-line') {
          this.callDataCb(`
            250+third line data\r\n
            250-second line data\r\n
            250 OK\r\n
          `);
        }
      });

      const testCases = [{
        input: 'test-single-line',
        output: [{
          code: 250,
          text: 'second line response',
        }, {
          code: 250,
          text: 'OK',
        }],
      }, {
        input: 'test-multi-line',
        output: [{
          code: 250,
          text: 'third line data',
        }, {
          code: 250,
          text: 'second line data',
        }, {
          code: 250,
          text: 'third line data',
        }],
      }];

      testCases.forEach(async (testCase) => {
        const response = await sendCommand(connectionMock, testCase.input);
        expect(response).to.deep.equal(testCase.output);
      });
    });

    it('should reject promise if non ok response', (done) => {
      const connectionMock = new ConnectionMock();
      connectionMock.onWrite(function onWriteCb(msg) {
        if (msg.startsWith('error')) {
          this.callDataCb(`400 ${msg}\r\n`);
        }
      });
      sendCommand(connectionMock, 'error command')
        .catch((err) => {
          expect(err).to.deep.equal({
            code: 400,
            text: 'error command',
          });
          done();
        });
    });
  });

  describe('authenticate', () => {
    const connection = new ConnectionMock();
    connection.onWrite(function onWriteCb(msg) {
      return msg === 'AUTHENTICATE "password"\r\n'
        ? this.callDataCb('250 OK\r\n')
        : this.callDataCb('515 error\r\n');
    });

    it('should authenticate and return promise', async () => {
      try {
        await authenticate(connection, 'password');
      } catch (e) {
        throw e;
      }
    });

    it('should return rejected promise if auth failed', async () => {
      try {
        await authenticate(connection, 'wrongPassword');
      } catch (e) {
        expect(e.message).to.be.equal('Authentication failed with message: error');
      }
    });
  });

  describe('sendSignal', () => {
    it('should send signal', async () => {
      const connectionMock = new ConnectionMock();
      const res = await sendSignal(connectionMock, 'TEST SIGNAL');
      expect(res).to.deep.equal([{
        code: 250,
        text: 'SIGNAL TEST SIGNAL',
      }]);
    });
  });

  describe('signalDump', () => {
    it('should signal dump', async () => {
      const connection = new ConnectionMock();
      const res = await signalDump(connection);
      expect(res).to.deep.equal([{
        code: 250,
        text: 'SIGNAL DUMP',
      }]);
    });
  });

  describe('signalNewNYM', () => {
    it('should signal new nym', async () => {
      const connection = new ConnectionMock();
      const res = await signalNewNYM(connection);
      expect(res).to.deep.equal([{
        code: 250,
        text: 'SIGNAL NEWNYM',
      }]);
    });
  });

  describe('getInfo', () => {
    it('should throw error if arguments are not valid', () => {
      const connection = new ConnectionMock();
      expect(getInfo()).to.be.rejectedWith('connection must be provided');
      expect(getInfo(connection)).to.be.rejectedWith('keys must be provided');
      expect(getInfo(connection, {})).to.be.rejectedWith('keys must be an array');
    });

    it('should return info', async () => {
      const connection = new ConnectionMock();
      connection.onWrite(function onWriteCb(msg) {
        if (msg.startsWith('GETINFO version')) {
          this.callDataCb(`
            250-version=0.2.9.9 (git-56788a2489127072)\r\n
            250 OK\r\n
          `);
        }
      });
      const res = await getInfo(connection, ['version']);
      expect(res).to.deep.equal({
        version: '0.2.9.9 (git-56788a2489127072)',
      });
    });
  });
});

