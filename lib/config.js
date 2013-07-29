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
    'host': 'localhost'
    , 'port': 9200
    , 'name': 'hypernotes'
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
});

module.exports = nconf;

