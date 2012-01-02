var assert = require('assert');
var authz = require('../authz.js');
var dao = require('../dao.js');
var testCase = require('nodeunit').testCase;

exports.test_isAuthorized = function(test) {
  var note = dao.Note.create({
    'owner': 'joe'
  });
  test.equals(authz.isAuthorized('joe', 'update', note), true);
  test.equals(authz.isAuthorized(null, 'update', note), false);
  test.equals(authz.isAuthorized(null, 'read', note), true);

  var account = dao.Account.create({
    'id': 'joe'
  });
  test.equals(authz.isAuthorized(null, 'create', account), true);
  test.equals(authz.isAuthorized('joe', 'update', account), true);
  test.equals(authz.isAuthorized(null, 'update', account), false);
  test.equals(authz.isAuthorized(null, 'read', account), true);
  test.done();
}

