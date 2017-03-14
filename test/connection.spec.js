'use strict';

const net = require('net');
const sinon = require('sinon');
const { expect } = require('chai');
const conn = require('../src/connection');

const {
  prepareConnectOptions,
  isStatusOk,
  disconnect,
  authenticate,
  connect,
} = conn;

const ConnectionMock = require('./connection-mock');

describe('connection', () => {
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
    const connection = new ConnectionMock();
    connection.onWrite(function onWriteCb(msg) {
      if (msg === 'AUTHENTICATE "password"\r\n') {
        return this.callDataCb('250');
      } else {
        return this.callDataCb('error');
      }
    });
    it('should authenticate and return promise', (done) => {
      authenticate(connection, 'password')
        .then(() => {
          done();
        })
        .catch((err) => { throw err });
    });

    it('should return rejected promise if auth failed', (done) => {
      authenticate(connection, 'wrongPassword')
        .catch((err) => {
          expect(err).to.be.equal('Authentication failed with message: error');
          done();
        });
    });
  });

  describe('connect', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should prepare options and connect', async () => {
      sandbox.stub(net, 'connect', (connectOptions) => {
        const connection = new ConnectionMock();
        connection.options = connectOptions;
        connection.onWrite(function onWriteCb(msg) {
          expect(msg).to.be.equal('AUTHENTICATE ""\r\n');
          this.callDataCb('250');
        });
        return connection;
      });

      const connection = await connect();
      expect(connection.options).to.deep.equal({
        port: 9051,
        host: 'localhost',
        password: '',
      });
    });
  });
});

