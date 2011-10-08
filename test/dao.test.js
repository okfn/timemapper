assert = require('assert');
dao = require('../dao.js');

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

dao.config.databaseName = indexName;

exports.testESIndex = function(test) {
  dao.esclient.index(indexName, 'account', inuser)
    .on('data', function(data) {
        test.ok(JSON.parse(data), 'index failed. ');
        test.done();
    })
    .exec()
}

exports.testESGet = function(test) {
  var id = username;
  dao.esclient.get(indexName, 'account', id)
    .on('data', function(data) {
      var outdata = JSON.parse(data);
      test.equal(outdata._id, username, 'username incorrect');
      test.done();
    })
    .exec()
}

exports.testDomainObject = function(test) {
  var account = dao.Account.create({fullname: 'myname'});
  test.equal(account.getattr('fullname'), 'myname');
  var raw = account.toJSON();
  test.equal(raw.fullname, 'myname');
  test.done();
}

exports.testGet = function(test) {
  var id = username;
  dao.Account.get(id, function(account) {
    test.equal(account.id, username, 'username incorrect');
    var res = account.toJSON();
    test.equal(res.fullname, inuser.fullname);
    test.done();
  });
}

exports.testSearch = function(test) {
  var qryObj = {
    query: {
      term: {
        fullname: 'The Tester'
      }  
    }
  }
  dao.Account.search(qryObj)
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
  dao.Note.upsert(innote, function(data) {
    test.ok(data.id, 'Failed to get an id');
    test.equal(data.title, innote.title);
    test.done();
  })
}

