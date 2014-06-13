var assert = require('assert')
  , config;

describe('config', function() {
  afterEach(function(done){
    delete require.cache[require.resolve('../lib/config')]
    done();
    });
  it('should use default variable if config.json or env variables are not present.', function(done){
    config = require('../lib/config');    
    assert.equal(config.get('database:path'), 'db');
    assert.equal(config.get('database:backend'), 's3');
    assert.equal(config.get('express:secret'), 'a random session secret');
    assert.equal(config.get('express:port'), 5000);
    assert.equal(config.get('twitter:key'), undefined);
    assert.equal(config.get('twitter:secret'), undefined);
    assert.equal(config.get('twitter:callback'), 
      "http://timemapper.okfnlabs.org/account/auth/twitter/callback");
    assert.equal(config.get('s3:key'), undefined);
    assert.equal(config.get('s3:secret'), undefined);
    assert.equal(config.get('s3:bucket'), "timemapper-data.okfnlabs.org");    
    assert.equal(config.get('test:testing'), false);
    assert.equal(config.get('test:user'), 'tester');
    done();
  });
  it('should use environment variable if it is given. .', function(done) {
    var bk_process = process
    process = {'env': {}}
    process.env['DATABASE_PATH'] = 'x'
    process.env['DATABASE_BACKEND'] = 'x'
    process.env['EXPRESS_PORT'] = 'x'
    process.env['EXPRESS_SECRET'] = 'x'
    process.env['TWITTER_KEY'] = 'x'
    process.env['TWITTER_SECRET'] = 'x'
    process.env['TWITTER_CALLBACK'] = 'x'
    process.env['S3_KEY'] = 'x'
    process.env['S3_SECRET'] = 'x'
    process.env['S3_BUCKET'] = 'x'

    config = require('../lib/config');
    assert.equal(config.get('database:path'), 'x');
    assert.equal(config.get('database:backend'), 'x');
    assert.equal(config.get('express:secret'), 'x');
    assert.equal(config.get('express:port'), 'x');
    assert.equal(config.get('twitter:key'), 'x');
    assert.equal(config.get('twitter:secret'), 'x');
    assert.equal(config.get('twitter:callback'), 'x');
    assert.equal(config.get('s3:key'), 'x');
    assert.equal(config.get('s3:secret'), 'x');
    assert.equal(config.get('s3:bucket'), 'x');
    process = bk_process;
    done();
  });
});

