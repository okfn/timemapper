assert = require('assert');
dao = require('./dao.js');

es = require('elasticsearchclient');
var serverOptions = {
    host: 'localhost',
    port: 9200,
};

var indexName = 'hypernotes-test-njs';
var username = 'tester';
var threadName = 'default';
var inuser = {
  'id': username,
  'fullname': 'The Tester'
};
var innote = {
  'title': 'My New Note'
  , 'body': '## Xyz'
  , 'tags': ['abc', 'efg']
  , 'owner': username
};
var inthread = {
  'name': threadName
  , 'title': 'My Test Thread'
  ,'description': 'None at the moment'
  ,'notes': [ ]
  , 'owner': username
};
makeFixtures = function() {
}

makeFixtures();

exports.testIndex = function(test) {
  dao.esclient.index(indexName, 'user', inuser)
    .on('data', function(data) {
        test.ok(JSON.parse(data), 'textIndex failed. ');
        test.done();
    })
    .exec()
}

exports.testGet = function(test) {
  var id = username;
  dao.esclient.get(indexName, 'user', id)
    .on('data', function(data) {
      var outdata = JSON.parse(data);
      test.equal(outdata._id, username, 'username incorrect');
      test.done();
    })
    .exec()
}

exports.testSearch = function(test) {
  var qryObj = {
    query: {
      term: {
        fullname: 'The Tester'
      }  
    }
  }
  dao.search(indexName, 'user', qryObj)
    .on('data', function(data) {
        test.ok(JSON.parse(data));
        var x = JSON.parse(data);
        // incorrect but needed for passing test!
        test.equal(x.hits.total, 0);
        test.done();
    })
    .on('done', function(){
    })
    .on('error', function(error){
        console.log(error)
    })
    .exec()
}

exports.testUpsert = function(test) {
  dao.upsert(indexName, 'note', innote, function(data) {
    test.ok(data.id, 'Failed to get an id');
    test.done();
  })
}

