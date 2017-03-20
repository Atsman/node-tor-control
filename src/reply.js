'use strict';

const assert = require('assert');

const CRLF = '\r\n';

const MID_REPLY_LINE_REGEX = /^(\d{3})-(.*)$/;
const DATA_REPLY_LINE_REGEX = /^(\d{3})\+(.*)$/;
const END_REPLY_LINE_REGEX = /^(\d{3}) (.*)$/;

const STATUS = {
  OK: 250,
};

function isMidReplyLine(line) {
  return MID_REPLY_LINE_REGEX.test(line);
}

function isDataReplyLine(line) {
  return DATA_REPLY_LINE_REGEX.test(line);
}

function isEndReplyLine(line) {
  return END_REPLY_LINE_REGEX.test(line);
}

/*
 * Checks if line is valid response line.
 * Chapter 2.3.
 * @function isValidLine
 * @param {String} line - line from reply
 * @returns {Boolean}
 */
function isValidLine(line) {
  return isMidReplyLine(line)
    || isDataReplyLine(line)
    || isEndReplyLine(line);
}

function parseGenericLine(line, regex) {
  const [, code, text] = line.match(regex);
  return { code: Number(code), text: text.trim() };
}

/*
 * Parses tor reply line.
 * Chapter 2.3.
 * @function parseLine
 * @param {String} line - line from reply
 * @returns {Object} - parsed line
 */
function parseLine(line) {
  let res;
  if (isMidReplyLine(line)) {
    res = parseGenericLine(line, MID_REPLY_LINE_REGEX);
  } else if (isDataReplyLine(line)) {
    res = parseGenericLine(line, DATA_REPLY_LINE_REGEX);
  } else if (isEndReplyLine(line)) {
    res = parseGenericLine(line, END_REPLY_LINE_REGEX);
  }
  return res;
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

  return parsedReply;
}

module.exports = {
  CRLF,
  STATUS,
  parseLine,
  parseReply,
};

