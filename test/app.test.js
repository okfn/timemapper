var request = require('supertest')
  , express = require('express')
  , assert = require('assert')
  // , base = require('../test/base.js');
  ;

var app = require('../app.js').app;

describe('GET API', function() {
  it('Account GET', function(done) {
    request(app)
      .get('/api/v1/account/' + 'tester')
      .end(function(err, res) {
        // console.log(res);
        assert.equal(res.body.email, undefined, 'Email should not be in Account object');
        done();
      });
  });
  it('DataView GET', function(done) {
    request(app)
      .get('/api/v1/account/tester/dataview/napoleon')
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        // console.log(res);
        assert.equal(res.body.name, 'napoleon');
        assert.equal(res.body.title, 'Battles in the Napoleonic Wars');
        done();
      });
  });
//   it('Account Create': function(done) {
//     test.expect(1);
//     client.fetch('POST', '/api/v1/account', {id: 'new-test-user'}, function(res) {
//       test.equal(200, res.statusCode);
//       test.done();
//     });
//   }
//   , testAccountUpdate: function(test) {
//     test.expect(2);
//     client.fetch('PUT', '/api/v1/account/' + base.fixturesData.user.id, {id: 'tester', name: 'my-new-name'}, function(res) {
//       test.equal(401, res.statusCode);
//       test.deepEqual(res.bodyAsObject, {"error":"Access not allowed","status":401});
//       test.done();
//     });
//   }
});

