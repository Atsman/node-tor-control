'use strict';

class ConnectionMock {
  constructor() {
    this.eventCallbackMap = {};
  }

  write(msg) {
    if (this.onWriteCb) {
      this.onWriteCb(msg);
    }

    let res;
    if (msg.startsWith('SIGNAL')) {
      res = this.callDataCb(`250 ${msg}`);
    } else if (msg === 'QUIT\r\n') {
      res = this.callEndCb();
    }
    return res;
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
    const endCb = this.eventCallbackMap.end;
    if (endCb) {
      this.isEndCbCalled = true;
      endCb();
    }
  }

  callDataCb(msg) {
    const dataCb = this.eventCallbackMap.data;
    if (dataCb) {
      dataCb(msg);
    }
  }
}

module.exports = ConnectionMock;

