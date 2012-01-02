var http = require('http');
var testCase = require('nodeunit').testCase;

var base = require('../test/base.js');
var dao = require('../dao.js');


var hostname = process.env.HOSTNAME || 'localhost';
var port = process.env.PORT || 3000;

// copied (and then modified) from httputil method 
// https://github.com/caolan/nodeunit/blob/master/lib/utils.js
var client = http.createClient(port, hostname);
client.fetch = function (method, path, headers, respReady) {
  var request = this.request(method, path, headers);
  request.end();
  request.on('response', function (response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
        if (response.body) {
            response.body += chunk;
        } else {
            response.body = chunk;
        }
    });
    response.on('end', function () {
        if (response.headers['content-type'].indexOf('application/json') != -1) {
            response.bodyAsObject = JSON.parse(response.body);
        }
        respReady(response);
    });
  });
};

exports.API = testCase({
  setUp: function(callback) {
    base.createFixtures(callback);
  }
  , tearDown: function(callback) {
    // TODO: we must teardown but atm this leads to errors (seem to relate to async-ness (setUp does not seem to have been called yet ...)
    
    // dao.esclient.deleteIndex(dao.config.databaseName)
    //  .on('done', callback)
    //  .exec();
    callback();
  }
  , testNoteListGET: function(test) {
    test.expect(2);
    client.fetch('GET', '/api/v1/note', {}, function(res) {
      test.equal(200, res.statusCode);
      // console.log(res.bodyAsObject);
      test.ok(res.bodyAsObject.results.length > 0);
      test.done();
    });
  }
  , testAccountGET: function(test) {
    test.expect(1);
    client.fetch('GET', '/api/v1/account/' + base.fixturesData.user.id, {}, function(res) {
      test.equal(200, res.statusCode);
      test.done();
    });
  }
  , testAccountCreate: function(test) {
    test.expect(1);
    client.fetch('POST', '/api/v1/account', {id: 'new-test-user'}, function(res) {
      test.equal(200, res.statusCode);
      test.done();
    });
  }
  , testAccountUpdate: function(test) {
    test.expect(2);
    client.fetch('PUT', '/api/v1/account/' + base.fixturesData.user.id, {id: 'tester', name: 'my-new-name'}, function(res) {
      test.equal(401, res.statusCode);
      test.deepEqual(res.bodyAsObject, {"error":"Access not allowed","status":401});
      test.done();
    });
  }
});

