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
  it('makeDefaultConfig works', function() {
    dfg = util.makeDefaultConfig({'BACKEND': 's3'});
    assert.deepEqual(dfg, {'backend': 's3'});

    dfg = util.makeDefaultConfig({'TWITTER_KEY': 'twkey'});
    assert.deepEqual(dfg, {'twitter':{'key': 'twkey'}});

    dfg = util.makeDefaultConfig({'TWITTER_KEY': 'twkey', 
                                  'TWITTER_SECURITY': 'twsec'});
    assert.deepEqual(dfg, {'twitter':{'key': 'twkey', 
    	                              'security': 'twsec'}});

    dfg = util.makeDefaultConfig({'BACKEND': 's3', 
    							  'TWITTER_KEY': 'twkey', 
                                  'TWITTER_SECURITY': 'twsec'});

    assert.deepEqual(dfg, {'backend': 's3', 
    	                   'twitter':{'key': 'twkey', 
    	                              'security': 'twsec'}});

    // test for config by environment var.
    process.env.BACKEND = 'fs';
    process.env.TWITTER_KEY = 'yooo';
    dfg = util.makeDefaultConfig({'BACKEND': 's3',
    							  'TWITTER_KEY': 'twkey'});
	assert.deepEqual(dfg, {'backend': 'fs', 
                           'twitter': {'key': 'yooo'}});
  });  
});

