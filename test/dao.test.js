var assert = require('assert')
  , path = require('path')
  , dao = require('../lib/dao.js')
  , _ = require('underscore')
  ;

var indexName = 'hypernotes-test-njs';
var username = 'tester';
var threadName = 'my-test-thread';
var inuser = {
  'id': username,
  'fullname': 'The Tester'
};
var inthread = {
  'name': threadName
  , 'title': 'My Test Thread'
  ,'description': 'None at the moment'
  , 'owner': username
};

var testDir = path.join('test', 'db');
// dao.config.set('database:backend', 's3');
// fs option
if (dao.config.get('database:backend') === 'fs') {
  testDir = path.join(__dirname, 'data', 'db');
}
dao.config.set('database:path', testDir);

describe('DAO Basics', function() {
  it('getDomainObjectClass', function(done) {
    var out = dao.getDomainObjectClass('account');
    assert.equal(out, dao.Account);
    done();
  });
  it('Create Account DomainObject', function() {
    var account = dao.Account.create({
      fullname: 'myname'
      , email: 'mytest@email.xyz'
    });
    assert.equal(account.get('fullname'), 'myname');
    var raw = account.toJSON();
    assert.equal(raw.fullname, 'myname');
    assert.equal(raw.password, undefined, 'password should not be in Account.toJSON');
    assert.equal(raw.email, undefined, 'email should not be in Account.toJSON');
  });
});

describe('DAO Storage', function() {
  it('FETCH Account', function(done) {
    var acc = dao.Account.create({id: username});
    acc.fetch(function(error, account) {
      assert.equal(error, null);
      assert.equal(account.id, username, 'username incorrect');
      var res = account.toJSON();
      assert.equal(res.fullname, inuser.fullname);
      done();
    });
  });
  it('FETCH DataView', function(done) {
    var viz = dao.DataView.create({owner: username, name: 'napoleon'});
    viz.fetch(function(error) {
      var res = viz.toJSON();
      assert.equal(res.title, 'Battles in the Napoleonic Wars');
      done();
    });
  });
  it('SAVE Account', function(done) {
    var account = dao.Account.create({
      id: 'xyz'
      , fullname: 'myname'
      , email: 'mytest@email.xyz'
    });
    account.save(function(error) {
      var _now = new Date().toISOString();
      assert.equal(account.get('_created').slice(0,4), _now.slice(0,4));
      done();
    });
  });
  it('Upsert DataView', function(done) {
    var viz = dao.DataView.create(inthread);
    viz.upsert(function(error) {
      assert(error === null);
      done();
    })
  });
  it('List DataView', function(done) {
    // tester has at least napoleon as a subdirectory
    this.timeout(5000);
    var viz = dao.DataView.getByOwner(username, function(err, data) {
      assert.equal(err, null);
      var names = _.pluck(data, 'name');
      // console.log(data[0]);
      assert(names.indexOf('napoleon') != -1, names);
      assert.equal(names.indexOf('data.json'), -1, 'data.json should not be in list');
      done();
    });
  });
});

