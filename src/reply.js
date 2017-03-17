'use strict';

const assert = require('assert');

const CRLF = '\r\n';
const lineRegex = /^(\d{3}) (.*)$/;
const STATUS = {
  OK: 250,
};

/*
 * Checks if line is valid response line.
 * Chapter 2.3.
 * @function isValidLine
 * @param {String} line - line from reply
 * @returns {Boolean}
 */
function isValidLine(line) {
  return lineRegex.test(line);
}

/*
 * Parses tor reply line.
 * Chapter 2.3.
 * @function parseLine
 * @param {String} line - line from reply
 * @returns {Object} - parsed line
 */
function parseLine(line) {
  const [, code, text] = line.match(lineRegex);
  return { code: Number(code), text };
}

/*
 * Parses tor reply string.
 * Chapter 2.3.
 * @function parseReply
 * @param {String} reply - reply from tor
 * @returns {Array} - parsed reply
 */
function parseReply(reply) {
  assert(reply);

  const parsedReply = reply
    .split(CRLF)
    .map(str => str.trim())
    .filter(isValidLine)
    .map(parseLine);

  return (parsedReply.length === 1) ? parsedReply[0] : parsedReply;
}

module.exports = {
  CRLF,
  STATUS,
  parseLine,
  parseReply,
};

