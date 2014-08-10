var assert = require('assert')
  , authz = require('../lib/authz.js')
  , dao = require('../lib/dao.js')
  ;

describe('Authz', function() {
  it('isAuthorized correctly', function() {
    var note = dao.DataView.create({
      'name': 'xyz',
      'owner': 'joe'
    });
    assert.equal(authz.isAuthorized('joe', 'update', note), true);
    assert.equal(authz.isAuthorized(null, 'read', note), true);

    var account = dao.Account.create({
      'id': 'joe'
    });
    assert.equal(authz.isAuthorized(null, 'create', account), true);
    assert.equal(authz.isAuthorized('joe', 'update', account), true);
    assert.equal(authz.isAuthorized(null, 'update', account), false);
    assert.equal(authz.isAuthorized(null, 'read', account), true);
  });

  var note = dao.DataView.create({
    'name': 'xyz',
    'owner': 'anon'
  });
  it('isAuthorized anon correctly', function() {
    assert(authz.isAuthorized(null, 'create', note), 'anon can create view');
    assert(authz.isAuthorized('anon', 'create', note), 'anon can create view');

    assert(authz.isAuthorized('anon', 'read', note), 'anon can read');

    assert(!authz.isAuthorized(null, 'update', note), 'anon cannot update');
    assert(!authz.isAuthorized('anon', 'update', note), 'anon cannot update view');

    assert(!authz.isAuthorized(null, 'delete', note), 'anon cannot delete view');
    assert(!authz.isAuthorized('anon', 'delete', note), 'anon cannot delete view');
  });
});
