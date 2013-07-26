var assert = require('assert')
  , path = require('path')
  , dao = require('../lib/dao.js')
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

var testDir = path.join(__dirname, 'data', 'db');
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
      assert.equal(account.id, username, 'username incorrect');
      var res = account.toJSON();
      assert.equal(res.fullname, inuser.fullname);
      done();
    });
  });
  it('FETCH Viz', function(done) {
    var viz = dao.Viz.create({owner: username, name: 'napoleon'});
    viz.fetch(function(error) {
      var res = viz.toJSON();
      assert.equal(res.title, 'Napoleon');
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
  it('Upsert Viz', function(done) {
    var viz = dao.Viz.create(inthread);
    viz.upsert(function(error) {
      assert(error === null);
      done();
    })
  });
});

