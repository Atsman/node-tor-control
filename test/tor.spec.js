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
          this.callDataCb(`250 ${msg}`);
        }
      });
      sendCommand(connectionMock, 'test-command')
        .then((responce) => {
          expect(responce).to.be.equal('250 test-command \r\n');
          done();
        })
        .catch(done);
    });

    it('should reject promise if non ok response', (done) => {
      const connectionMock = new ConnectionMock();
      connectionMock.onWrite(function onWriteCb(msg) {
        if (msg.startsWith('error')) {
          this.callDataCb(msg);
        }
      });
      sendCommand(connectionMock, 'error command')
        .catch((err) => {
          expect(err.message).to.be.equal('error command \r\n');
          done();
        });
    });
  });

  describe('sendSignal', () => {
    it('should send signal', (done) => {
      const connectionMock = new ConnectionMock();
      sendSignal(connectionMock, 'TEST SIGNAL')
        .then((res) => {
          expect(res).to.be.equal('250 SIGNAL TEST SIGNAL \r\n');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });

  describe('signalNewNYM', () => {
    it('should signal new nym', (done) => {
      const connection = new ConnectionMock();
      signalNewNYM(connection)
        .then((res) => {
          expect(res).to.be.equal('250 SIGNAL NEWNYM \r\n');
          done();
        });
    });
  });
});

