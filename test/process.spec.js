'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const cp = require('child_process');
const { exec } = require('../src/process');

describe('process', () => {
  describe('exec', () => {
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should throw error if command is not provided', () => {
      expect(() => exec()).to.throw('command must be provided');
    });

    it('should execute command and return output', async () => {
      sandbox.stub(cp, 'exec', (command, options, cb) => {
        cb(null, 'result');
      });

      const res = await exec('command');
      expect(res).to.be.equal('result');
    });

    it('should throw error and error output in case of error', async () => {
      sandbox.stub(cp, 'exec', (command, options, cb) => {
        cb(new Error('error'), null, 'error output');
      });

      try {
        await exec('command');
      } catch (e) {
        expect(e).to.be.deep.equal({
          err: new Error('error'),
          stderr: 'error output',
          stdout: null,
        });
      }
    });
  });
});

