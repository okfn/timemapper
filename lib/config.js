var fs    = require('fs');
var nconf = require('nconf');
var path = require('path');
var util = require('../lib/util.js');

nconf.argv()
     .env()
     .file({file: path.join(
       path.dirname(__dirname), '/settings.json')
     })

// commenting this out as not working on heroku I think
// in particular heroku sets port variable in PORT var not EXPRESS_PORT
// nconf.defaults(util.makeDefaultConfig({
//     'DATABASE_PATH': 'db',
//     'DATABASE_BACKEND': 's3',
//     'EXPRESS_SECRET': "a random session secret",
//     'EXPRESS_PORT': 5000,
//     'TWITTER_KEY' : null,
//     'TWITTER_SECRET': null,
//     'TWITTER_CALLBACK': "http://timemapper.okfnlabs.org/account/auth/twitter/callback",
//     'S3_KEY': null,
//     'S3_SECRET': null,
//     'S3_BUCKET': "timemapper-data.okfnlabs.org",
//     'TEST_TESTING': false,
//     'TEST_USER': 'tester'
//   }));

nconf.defaults({
  "database": {
    // WARNING: for s3 this must *not* have a leading '/' and *should* have a
    // trailing slash
    "path": process.env.DB_PATH || "db",
    // s3 or fs
    "backend": process.env.BACKEND || "s3"
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

