'use strict';

class ConnectionMock {
  constructor() {
    this.eventCallbackMap = {};
  }

  write(msg) {
    if (this.onWriteCb) {
      this.onWriteCb(msg);
    }

    if (msg.startsWith('SIGNAL')) {
      return this.callDataCb(`250 ${msg}`);
    }

    if (msg === 'QUIT\r\n') {
      return this.callEndCb();
    }
  }

  onWrite(cb) {
    this.onWriteCb = cb;
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

module.exports = ConnectionMock;

