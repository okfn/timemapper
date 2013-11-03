var assert = require('assert')
  , util = require('../lib/util.js')
  ;

describe('util', function() {
  it('distanceOfTimeInWords works', function() {
    var from = new Date('2011-08-01');
    var to = new Date('2011-09-01');
    var out = util.distanceOfTimeInWords(from, to);
    assert.equal(out, '1 month ago');
  });
});

