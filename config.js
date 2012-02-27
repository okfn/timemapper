var fs    = require('fs');
var nconf = require('nconf');
var path = require('path');

nconf.argv()
     .env()
     .file({file: path.join(__dirname, '/settings.json')})

nconf.defaults({
  'database': {
    'host': 'localhost'
    , 'port': 9200
    , 'name': 'hypernotes'
  }
  , 'express': {
    'secret': 'a random session secret'
    , 'port': 3000
  }
});

module.exports = nconf;

