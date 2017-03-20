'use strict';

const _ = require('lodash');
const { CRLF, STATUS, parseReply } = require('./reply');

const DEFAULT_PASSWORD = '';

function sendCommand(connection, command) {
  return new Promise((resolve, reject) => {
    connection.once('data', (data) => {
      const message = _.last(parseReply(data.toString()));
      if (message && message.code !== STATUS.OK) {
        return reject(message);
      }
      return resolve(message);
    });
    connection.write(`${command}${CRLF}`);
  });
}

/*
 * Authenticates connection
 * @function authenticate
 * @param {Object} connection
 * @param {String} password
 * @returns {Promise}
 */
async function authenticate(connection, password = DEFAULT_PASSWORD) {
  try {
    return await sendCommand(connection, `AUTHENTICATE "${password}"`);
  } catch (e) {
    throw new Error(`Authentication failed with message: ${e.text}`);
  }
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
 *
function setConf(connection, request) {
  return sendCommand(`SETCONF ${request}`);
}
*/

/*
function resetConf(connection, request) {
  return sendCommand(`RESETCONF ${request}`);
}
*/

/*
 * Request the value of a configuration variable. The syntax is:
 *
 *   "GETCONF" 1*(SP keyword) CRLF
 *
 * Chapter 3.3.
 *
 */
/*
function getConf(connection, params) {
  return sendCommand(connection, `GETCONF ${params.join(' ')}`);
}

function getEvents(connection, request) {
  return sendCommand(connection, `GETEVENTS ${request}`);
}

function saveConf(connection, request) {
  return sendCommand(`SAVECONF ${request}`);
}
*/

function sendSignal(connection, signal) {
  return sendCommand(connection, `SIGNAL ${signal}`);
}

/*
function signalReload(connection) {
  return sendSignal(connection, 'RELOAD', true);
}

function signalHup(connection) {
  return sendSignal(connection, 'HUP');
}

function signalShutdown(connection) {
  return sendSignal(connection, 'SHUTDOWN', true);
}
*/
/*
 * Dump stats: log information about open connections and circuits.
 * @function signalDump
 * @param {Object} connection
 * @returns {Promise} - reply
 */
function signalDump(connection) {
  return sendSignal(connection, 'DUMP');
}
/*
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
*/

/*
 * Switch to clean circuits, so new application
 * requests don't share any circuits with old ones.
 * Also clears the client-side DNS cache.
 * @function signalNewNYM
 * @param {Object} connection
 * @returns {Promise}
 */
function signalNewNYM(connection) {
  return sendSignal(connection, 'NEWNYM');
}

/*
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

/*
  if (hop) {
    config += ` ${hop}`;
  }

  return sendCommand(config);
}
*/

function quit(connection) {
  return sendCommand(connection, 'QUIT');
}

module.exports = {
  sendCommand,
  authenticate,
  /*
  setConf,
  resetConf,
  getConf,
  getEvents,
  saveConf,
  */
  sendSignal,
  /*
  signalReload,
  signalHup,
  signalShutdown,
  */
  signalDump,
  /*
  signalUsr1,
  signalDebug,
  signalUsr2,
  signalHalt,
  signalTerm,
  signalInt,
  */
  signalNewNYM,
  /*
  signalClearDnsCache,
  mapAddress,
  getInfo,
  extendCircuit,
  setCircuitPurpose,
  setRouterPurpose,
  attachStream,
  */
  quit,
};

