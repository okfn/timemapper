assert = require('assert');
util = require('../util.js');
var testCase = require('nodeunit').testCase;

exports.test_distanceOfTimeInWords = function(test) {
  var from = new Date('2011-08-01');
  var to = new Date('2011-09-01');
  var out = util.distanceOfTimeInWords(from, to);
  test.equal(out, '1 month ago');
  test.done();
}

