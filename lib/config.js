var fs    = require('fs');
var nconf = require('nconf');
var path = require('path');
var util = require('../lib/util.js');

nconf.argv()
     .env()
     .file({file: path.join(
       path.dirname(__dirname), '/settings.json')
     })

nconf.defaults(util.makeDefaultConfig({
    'DATABASE_PATH': 'db',
    'DATABASE_BACKEND': 's3',
    'EXPRESS_SECRET': "a random session secret",
    'EXPRESS_PORT': 5000,
    'TWITTER_KEY' : null,
    'TWITTER_SECRET': null,
    'TWITTER_CALLBACK': "http://timemapper.okfnlabs.org/account/auth/twitter/callback",
    'S3_KEY': null,
    'S3_SECRET': null,
    'S3_BUCKET': "timemapper-data.okfnlabs.org",
    'TEST_TESTING': false,
    'TEST_USER': 'tester'
  }));

module.exports = nconf;

