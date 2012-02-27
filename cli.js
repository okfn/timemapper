var step = require('step');

var config = require('./config.js');
var dao = require('./dao.js');
var loader = require('./loader.js');

// removes 'node' and this script
args = process.argv.splice(2);

// Create some fixtures (e.g. for demoing)
if (args && args[0] == 'fixtures') {
  var username = 'tester';
  var noteIds = [];
  step(
    function makeAccount() {
      var acc = dao.Account.create({
        id: 'tester'
        , email: 'tester@okfn.org'
        , fullname: 'The Tester'
        , api_key: 'tester'
      });
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
      dao.Thread.upsert({
        id:'testerdefault',
        name:'default',
        title:'Default Thread',
        description:'Default thread - where notes go by default.',
        owner:username,
        notes:noteIds
      }, function(data) {
        self(null, data);
      });
    }
    , function report(err, thread) {
      if (err) throw err;
      console.log('Fixtures created (tester@okfn.org / pass)');
    }
  );
} else if (args && args[0] == 'rebuild_db') {
  var mappings = {
    mappings: {
      note: {
        properties: {
            start: { type: 'string' }
          , end: { type: 'string' }
        }
      }
    }
  };
  dao.esclient.deleteIndex(config.get('database:name'))
    .on('done', function() {
        dao.esclient.createIndex(dao.config.get('database:name'), mappings)
          .on('done', function() {
            console.log('DB rebuilt');
          })
          .exec()
      })
    .exec();
} else if (args && args[0] == 'load') {
  if (args.length < 3) {
    console.log('Usage: load {filepath} {owner-user-id}');
    return;
  }
  var filepath = args[1];
  var owner = args[2];
  loader.load(filepath, owner, function(thread) {
    console.log('Successfully loaded thread: ' + thread.id + ' (' + thread.title + ')');
  });

} else {
  console.log('Commands are: fixtures | rebuild_db | load ');
}

