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
    assert.equal(authz.isAuthorized(null, 'update', note), false);
    assert.equal(authz.isAuthorized(null, 'read', note), true);

    var account = dao.Account.create({
      'id': 'joe'
    });
    assert.equal(authz.isAuthorized(null, 'create', account), true);
    assert.equal(authz.isAuthorized('joe', 'update', account), true);
    assert.equal(authz.isAuthorized(null, 'update', account), false);
    assert.equal(authz.isAuthorized(null, 'read', account), true);
  });
});
