'use strict';

const net = require('net');
const sinon = require('sinon');
const { expect } = require('chai');
const conn = require('../src/connection');

const {
  prepareConnectOptions,
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
      });
    });

    it('should use defailt port and host, if path is not provided', () => {
      const res = prepareConnectOptions({});
      expect(res).to.be.deep.equal({
        port: 9051,
        host: 'localhost',
      });
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
      return (msg === 'AUTHENTICATE "password"\r\n')
        ? this.callDataCb('250 OK')
        : this.callDataCb('error');
    });
    it('should authenticate and return promise', (done) => {
      authenticate(connection, 'password')
        .then(() => {
          done();
        })
        .catch((err) => { throw err; });
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
      sandbox.stub(net, 'connect', (connectOptions) => {
        const connection = new ConnectionMock();
        connection.options = connectOptions;
        connection.onWrite(function onWriteCb() {
          this.callDataCb('250 OK');
        });
        return connection;
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should use default options and connect', async () => {
      const connection = await connect();
      expect(connection.options).to.deep.equal({
        port: 9051,
        host: 'localhost',
      });
    });

    it('should use provided options and connect', async () => {
      const connection = await connect({
        port: 1234,
        host: '192.168.1.1',
      });
      expect(connection.options).to.be.deep.equal({
        port: 1234,
        host: '192.168.1.1',
      });
    });
  });
});

