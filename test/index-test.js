var vows = require('vows');
var assert = require('assert');
var ping = require('index');


vows.describe('junction-ping').addBatch({
  
  'module': {
    'should export middleware': function () {
      assert.isFunction(ping);
    },
  },
  
}).export(module);
