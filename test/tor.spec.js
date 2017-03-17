'use strict';

const { expect } = require('chai');

const {
  sendCommand, sendSignal, signalNewNYM,
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

  describe('signalNewNYM', () => {
    it('should signal new nym', (done) => {
      const connection = new ConnectionMock();
      signalNewNYM(connection)
        .then((res) => {
          expect(res).to.deep.equal({
            code: 250,
            text: 'SIGNAL NEWNYM',
          });
          done();
        });
    });
  });
});

