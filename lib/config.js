var fs    = require('fs');
var nconf = require('nconf');
var path = require('path');

nconf.argv()
     .env()
     .file({file: path.join(
       path.dirname(__dirname), '/settings.json')
     })

nconf.defaults({
  "database": {
    // WARNING: for s3 this must *not* have a leading '/' and *should* have a
    // trailing slash
    "path": process.env.DB_PATH || "db",
    // s3 or fs
    "backend": "s3"
  }
  , "express": {
    "secret": "a random session secret"
    , "port": process.env.PORT || 5000
  }
  , "twitter": {
    "key": process.env.TWITTER_KEY,
    "secret": process.env.TWITTER_SECRET,
    "url": process.env.TWITTER_CALLBACK || "http://timemapper.okfnlabs.org/account/auth/twitter/callback"
  }
  , "s3": {
    "key": process.env.S3_KEY,
    "secret": process.env.S3_SECRET,
    "bucket": process.env.S3_BUCKET || "timemapper-data.okfnlabs.org"
  }
  // config for testing mode
  , "test": {
    "testing": "false"
    // test user to use
    , "user": "tester"
  }
});

module.exports = nconf;

