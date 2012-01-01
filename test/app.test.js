var testCase = require('nodeunit').testCase;

var http = require('http');
var httputil = require('nodeunit').utils.httputil;

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
    callback();
  }
  , tearDown: function(callback) {
    callback();
  }
  , testNoteListGET: function(test) {
    test.expect(2);
    client.fetch('GET', '/api/v1/note', {}, function(res) {
      test.equal(200, res.statusCode);
      test.ok(res.bodyAsObject.results.length > 0);
      test.done();
    });
  }
});

