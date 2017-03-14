'use strict';

const { isStatusOk } = require('./connection');

function sendCommand(connection, command, keepConnection) {
  return new Promise((resolve, reject) => {
    connection.once('data', (data) => {
      const message = data.toString();
      if (!isStatusOk(message)) {
        return reject(new Error(message));
      }
      return resolve(message);
    });
    connection.write(`${command} \r\n`);
  });
}

/*
 * Change the value of one or more configuration variables.
 *
 * The syntax is:
 *   "SETCONF" 1*(SP keyword ["=" value]) CRLF
 *   value = String / QuotedString
 *
 * Use resetConf if you want to set configuration back to its default.
 *
 * Example:
 *
 * SETCONF ORPort=443 ORListenAddress=9001
 *
 * @function setConf
 * @param connection - connection to tor control
 * @param request - configuration params
 * @returns {Promise} - result
 */
function setConf(connection, request) {
  return sendCommand(`SETCONF ${request}`);
}

function resetConf(connection, request) {
  return sendCommand(`RESETCONF ${request}`);
}

/*
 * Request the value of a configuration variable. The syntax is:
 *
 *   "GETCONF" 1*(SP keyword) CRLF
 *
 * Chapter 3.3.
 *
 */
function getConf(connection, params) {
  return sendCommand(connection, `GETCONF ${params.join(' ')}`);
}

function getEvents(connection, request) {
  return sendCommand(connection, `GETEVENTS ${request}`);
}

function saveConf(connection, request) {
  return sendCommand(`SAVECONF ${request}`);
}

function sendSignal(connection, signal) {
  return sendCommand(connection, `SIGNAL ${signal}`);
}

function signalReload(connection) {
  return sendSignal(connection, 'RELOAD', true);
}

function signalHup(connection) {
  return sendSignal(connection, 'HUP');
}

function signalShutdown(connection) {
  return sendSignal(connection, 'SHUTDOWN', true);
}

function signalDump(connection) {
  return sendSignal(connection, 'DUMP');
}

function signalUsr1(connection) {
  return sendSignal(connection, 'USR1');
}

function signalDebug(connection) {
  return sendSignal(connection, 'DEBUG');
}

function signalUsr2(connection) {
  return sendSignal(connection, 'USR2');
}

function signalHalt(connection) {
  return sendSignal(connection, 'HALT');
}

function signalTerm(connection) {
  return sendSignal(connection, 'TERM');
}

function signalInt(connection) {
  return sendSignal(connection, 'INT');
}

function signalNewNYM(connection) {
  return sendSignal(connection, 'NEWNYM');
}

function signalClearDnsCache(connection) {
  return sendSignal(connection, 'CLEARDNSCACHE');
}

function mapAddress(address) {
  return sendCommand(`MAPADDRESS ${address}`);
}

function getInfo(request) {
  const config = Array.isArray(request) ? request.join(' ') : request;
  return sendCommand(`GETCONFIG ${config}`);
}

function extendCircuit(id, superspec, purpose) {
  let config = `EXTENDCIRCUIT ${id}`;
  if (superspec) {
    config += ` ${superspec}`;
  }
  if (purpose) {
    config += ` ${purpose}`;
  }
  return sendCommand(config);
}

function setCircuitPurpose(id, purpose) {
  return sendCommand(`SETCIRCUITPURPOSE ${id} purpose=${purpose}`);
}

function setRouterPurpose(nicknameOrKey, purpose) {
  return sendCommand(`SETROUTERPURPOSE ${nicknameOrKey} ${purpose}`);
}

function attachStream(streamId, circuitId, hop) {
  let config = `ATTACHSTREAM ${streamId} ${circuitId}`;

  if (hop) {
    config += ` ${hop}`;
  }

  return sendCommand(config);
}

module.exports = {
  sendCommand,
  setConf,
  resetConf,
  getConf,
  getEvents,
  saveConf,
  sendSignal,
  signalReload,
  signalHup,
  signalShutdown,
  signalDump,
  signalUsr1,
  signalDebug,
  signalUsr2,
  signalHalt,
  signalTerm,
  signalInt,
  signalNewNYM,
  signalClearDnsCache,
  mapAddress,
  getInfo,
  extendCircuit,
  setCircuitPurpose,
  setRouterPurpose,
  attachStream,
};

