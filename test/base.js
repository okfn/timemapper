process.env.NODE_ENV = 'test';

var step = require('step');

var dao = require('../dao.js');

var dbName = 'hypernotes-test-njs';
dao.config.set('database:name', dbName);

var username = 'tester';
var threadName = 'default';

exports.fixturesData = {
  user: {
      'id': username
    , email: 'tester@okfn.org'
    , 'fullname': 'The Tester'
  },
  note: {
    'title': 'My New Note'
    , 'body': '## Xyz'
    , 'tags': ['abc', 'efg']
    , 'owner': username
  },
  thread: {
    'name': threadName
    , 'title': 'My Test Thread'
    ,'description': 'None at the moment'
    ,'notes': [ ]
    , 'owner': username
  }
}

exports.createFixtures = function(callback) { 
  var username = 'tester';
  var noteIds = [];
  step(
    function makeAccount() {
      var acc = dao.Account.create(exports.fixturesData.user);
      acc.setPassword('tester');
      acc.save(this);
    }
    , function makeNotes(account) {
      var group = this.group();
      groupCallbacks = [];
      var count = 0;
      for (x=1;x<4;x++) {
        groupCallbacks.push(group());
        dao.Note.upsert({
            owner: username
            , title: 'Note ' + x
          }
          , function(data) {
            var err = null;
            groupCallbacks[count](err, data.id);
            count += 1;
          }
        );
      }
    }
    , function makeThread(err, noteIds) {
      if (err) throw err;
      var self = this;
      var thread = dao.Thread.create(exports.fixturesData.thread);
      thread.notes = noteIds;
      thread.save(function(data) {
        self(null, data);
      });
    }
    , function report(err, thread) {
      if (err) throw err;
      console.log('Fixtures created');
      callback();
    }
  );
};

