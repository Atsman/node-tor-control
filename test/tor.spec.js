'use strict';

const net = require('net');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");

const { expect } = chai;

chai.use(sinonChai);

const {
  prepareConnectOptions, isStatusOk,
  disconnect, authenticate, sendCommand,
  sendSignal, signalNewNYM, connect,
} = require('../src/tor');

class ConnectionMock {
  constructor() {
    this.eventCallbackMap = {};
  }

  write(msg) {
    if (msg.startsWith('test')) {
      return this.callDataCb(`250 ${msg}`);
    }
    if (msg.startsWith('error')) {
      return this.callDataCb(msg);
    }
    if (msg === 'QUIT\r\n') {
      return this.callEndCb();
    }

    if (msg.startsWith('SIGNAL')) {
      return this.callDataCb(`250 ${msg}`);
    }

    if (msg === `AUTHENTICATE "password"\r\n`) {
      return this.callDataCb('250');
    } else {
      return this.callDataCb('error');
    }
  }

  end() {
    this.isEndCalled = true;
    this.callEndCb();
  }

  once(eventName, cb) {
    this.eventCallbackMap[eventName] = cb;
  }

  callEndCb() {
    const endCb = this.eventCallbackMap['end'];
    if (endCb) {
      this.isEndCbCalled = true;
      endCb();
    }
  }

  callDataCb(msg) {
    const dataCb = this.eventCallbackMap['data'];
    if (dataCb) {
      dataCb(msg);
    }
  }
}

describe('tor', () => {
  describe('prepareConnectOptions', () => {
    it('should use path if it is provided', () => {
      const res = prepareConnectOptions({
        path: 'path',
      });
      expect(res).to.be.deep.equal({
        path: 'path',
        password: '',
      });
    });

    it('should use defailt port and host, if path is not provided', () => {
      const res = prepareConnectOptions({});
      expect(res).to.be.deep.equal({
        port: 9051,
        host: 'localhost',
        password: '',
      });
    });
  });

  describe('isStatusOk', () => {
    it('should return true if status code 250', () => {
      expect(isStatusOk('250')).to.be.equal(true);
      expect(isStatusOk('not a 250')).to.be.equal(false);
    });
  });

  describe('disconnect', () => {
    it('should disconnect and return promise', (done) => {
      const connectionMock = new ConnectionMock();
      const res = disconnect(connectionMock);
      res.then(() => {
        expect(connectionMock.isEndCbCalled).to.be.equal(true);
        done();
      });
    });

    it('should end connection if force = true', (done) => {
      const connectionMock = new ConnectionMock();
      const res = disconnect(connectionMock, true);
      res.then(() => {
        expect(connectionMock.isEndCalled).to.be.equal(true);
        expect(connectionMock.isEndCbCalled).to.be.equal(true);
        done();
      });
    });
  });

  describe('authenticate', () => {
    it('should authenticate and return promise', (done) => {
      const connection = new ConnectionMock();
      authenticate(connection, 'password')
        .then(() => {
          done();
        })
        .catch((err) => { throw err });
    });

    it('should return rejected promise if auth failed', (done) => {
      const connection = new ConnectionMock();
      authenticate(connection, 'wrongPassword')
        .catch((err) => {
          expect(err).to.be.equal(`Authentication failed with message: error`);
          done();
        });
    });
  });

  describe('sendCommand', () => {
    it('should send command and return promise', (done) => {
      const connectionMock = new ConnectionMock();
      sendCommand(connectionMock, 'test-command')
        .then((responce) => {
          expect(responce).to.be.equal('250 test-command \r\n');
          done();
        })
        .catch(done);
    });

    it('should reject promise if non ok response', (done) => {
      const connectionMock = new ConnectionMock();
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

  describe('connect', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(net, 'connect', (connectOptions) => {
        return new ConnectionMock();
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should prepare options and connect', (done) => {
      connect({ password: 'password' }).then(() => {
        done();
      });
    });
  });
});

