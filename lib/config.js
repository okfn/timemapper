var fs    = require('fs');
var nconf = require('nconf');
var path = require('path');

nconf.argv()
     .env()
     .file({file: path.join(
       path.dirname(__dirname), '/settings.json')
     })

nconf.defaults({
  'database': {
    'path': '',
    // s3 or fs
    'backend': 's3'
  }
  , 'express': {
    'secret': 'a random session secret'
    , 'port': process.env.PORT || 5000
  }
  , 'twitter': {
    'key': process.env.TWITTER_KEY,
    'secret': process.env.TWITTER_SECRET,
    'url': 'http://hypernotes.herokuapp.com/account/auth/twitter/callback'
  }
  , 's3': {
    'key': process.env.S3_KEY,
    'secret': process.env.S3_SECRET,
    'bucket': process.env.S3_BUCKET || 'timemapper-data.okfnlabs.org'
  }
});

module.exports = nconf;

