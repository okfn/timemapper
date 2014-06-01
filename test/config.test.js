var assert = require('assert')
  , config;

describe('config', function() {
  it('should use environment variable if it is given. .', function(done) {
    process.env['DB_PATH'] = 'x'
    process.env['BACKEND'] = 'x'
    process.env['PORT'] = 'x'
    process.env['TWITTER_KEY'] = 'x'
    process.env['TWITTER_SECRET'] = 'x'
    process.env['TWITTER_CALLBACK'] = 'x'
    process.env['S3_KEY'] = 'x'
    process.env['S3_SECRET'] = 'x'
    process.env['S3_BUCKET'] = 'x'

    config = require('../lib/config');

    assert.equal(config.get('database:path'), 'x');
    assert.equal(config.get('database:backend'), 'x');
    assert.equal(config.get('express:port'), 'x');
    assert.equal(config.get('twitter:key'), 'x');
    assert.equal(config.get('twitter:secret'), 'x');
    assert.equal(config.get('twitter:url'), 'x');

    done();
  });
});

