var dao = require('./dao.js');
var step = require('step');

// removes 'node' and this script
args = process.ARGV.splice(2);

// Create some fixtures (e.g. for demoing)
if (args && args[0] == 'fixtures') {
  var username = 'tester';
  var noteIds = [];
  step(
    function makeAccount() {
      dao.Account.upsert({
        id: 'tester'
        , email: 'tester@okfn.org'
        }
        , this
      );
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
  dao.esclient.deleteIndex(dao.config.databaseName)
    .on('done', function() {
        console.log('DB rebuilt');
      })
    .exec();
} else {
  console.log('Commands are: fixtures | rebuild_db');
}

