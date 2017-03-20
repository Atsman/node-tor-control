'use strict';

const { expect } = require('chai');

const {
  sendCommand, authenticate, sendSignal, signalDump, signalNewNYM,
  getInfo,
} = require('../src/tor');

const ConnectionMock = require('./connection-mock');

describe('tor', () => {
  describe('sendCommand', () => {
    it('should send command and return promise', (done) => {
      const connectionMock = new ConnectionMock();
      connectionMock.onWrite(function onWriteCb(msg) {
        if (msg.startsWith('test')) {
          this.callDataCb(`250 ${msg}\r\n`);
        }
      });
      sendCommand(connectionMock, 'test-command')
        .then((responce) => {
          expect(responce).to.deep.equal({
            code: 250,
            text: 'test-command',
          });
          done();
        })
        .catch(done);
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
      console.log(msg);
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
    it('should send signal', (done) => {
      const connectionMock = new ConnectionMock();

      sendSignal(connectionMock, 'TEST SIGNAL')
        .then((res) => {
          expect(res).to.deep.equal({
            code: 250,
            text: 'SIGNAL TEST SIGNAL',
          });
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe('signalDump', () => {
    it('should signal dump', async () => {
      const connection = new ConnectionMock();
      const res = await signalDump(connection);
      expect(res).to.deep.equal({
        code: 250,
        text: 'SIGNAL DUMP',
      });
    });
  });

  describe('signalNewNYM', () => {
    it('should signal new nym', async () => {
      const connection = new ConnectionMock();
      const res = await signalNewNYM(connection);
      expect(res).to.deep.equal({
        code: 250,
        text: 'SIGNAL NEWNYM',
      });
    });
  });
});

