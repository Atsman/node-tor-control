'use strict';

const { expect } = require('chai');
const { parseLine, parseReply } = require('../src/reply');

describe('reply', () => {
  describe('parseLine', () => {
    const testCases = [{
      input: '250 message text',
      output: { code: 250, text: 'message text' },
    }];
    it('should parse reply line', () => {
      testCases.forEach(testCase =>
        expect(parseLine(testCase.input))
          .to.be.deep.equal(testCase.output));
    });
  });

  describe('parseReply', () => {
    const testCases = [{
      input: `
        250 message 1\r\n
        450 message 2\r\n
      `,
      output: [{
        code: 250,
        text: 'message 1',
      }, {
        code: 450,
        text: 'message 2',
      }],
    }, {
      input: `
        250+data reply\r\n
        250-version=0.2.9.9 (git-56788a2489127072)\r\n
        250 OK\r\n
      `,
      output: [{
        code: 250,
        text: 'data reply',
      }, {
        code: 250,
        text: 'version=0.2.9.9 (git-56788a2489127072)',
      }, {
        code: 250,
        text: 'OK',
      }],
    }];

    it('should parse reply', () => {
      testCases.forEach(testCase =>
        expect(parseReply(testCase.input))
          .to.be.deep.equal(testCase.output));
    });
  });
});

