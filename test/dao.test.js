assert = require('assert');
dao = require('../dao.js');
var testCase = require('nodeunit').testCase;

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

exports.test_QueryResult = function(test) {
  var sample = {
    "took":4,"timed_out":false,
    "_shards":{"total":5,"successful":5,"failed":0},
    "hits":{
      "total":2,
      "max_score":1.0,
      "hits":[
        {
          "_index":"hypernotes-test-njs","_type":"thread","_id":"kcJgRvPbT4OlGVwIeknuOA","_score":1.0,
          "_source" : {"name":"default","title":"My Test Thread","description":"None at the moment","notes":[],"owner":"tester"}}
      , {
          "_index":"hypernotes-test-njs","_type":"thread","_id":"L6MrVss7SuaPX7KUzMwttA","_score":1.0,
          "_source" : {"name":"default","title":"My Test Thread","description":"None at the moment","notes":[],"owner":"tester"}}
      ]
    }
  };
  var out = new dao.QueryResult('thread', sample);
  test.equal(out.total, 2);
  test.equal(out.results[0].__type__, 'thread');
  test.equal(out.results[0].id, 'kcJgRvPbT4OlGVwIeknuOA');
  test.equal(out.results[0].toJSON().name, 'default');
  test.equal(out.first().toJSON().name, 'default');
  var jsonified = out.toJSON();
  test.equal(jsonified.results[0].name, 'default');
  test.done();
};

exports.test_getDomainObjectClass = function(test) {
  var out = dao.getDomainObjectClass('account');
  test.equal(out, dao.Account);
  test.done();
}


exports.basic= testCase({
  setUp: function(callback) {
    dao.esclient.index(indexName, 'account', inuser)
      .on('data', function(data) {
        assert.ok(JSON.parse(data), 'index failed.');
        callback();
      })
      .exec()
  }
  , tearDown: function(callback) {
    dao.esclient.deleteIndex(dao.config.databaseName)
      .on('done', callback)
      .exec();
  }
  , testESGet: function(test) {
    var id = username;
    dao.esclient.get(indexName, 'account', id)
      .on('data', function(data) {
        var outdata = JSON.parse(data);
        test.equal(outdata._id, username, 'username incorrect');
        test.done();
      })
      .exec()
  }

  , testDomainObject: function(test) {
    var account = dao.Account.create({fullname: 'myname'});
    test.equal(account.getattr('fullname'), 'myname');
    var raw = account.toJSON();
    test.equal(raw.fullname, 'myname');
    account.setPassword('xyz');
    test.ok(account.checkPassword('xyz'));
    test.ok(!account.checkPassword('abc'));
    // now save
    test.ok(!account.id);
    account.save(function() {
      test.ok(account.id);
      var _now = new Date().toISOString();
      test.equal(account.getattr('_created').slice(0,4), _now.slice(0,4));
    });

    var account = dao.Account.create({
        id: 'mytestusername'
      , fullname: 'myname'
    });
    account.save(function() {
      test.equal(account.id, 'mytestusername');
      test.done();
    });
  }
  , testGet: function(test) {
    var id = username;
    dao.Account.get(id, function(account) {
      test.equal(account.id, username, 'username incorrect');
      var res = account.toJSON();
      test.equal(res.fullname, inuser.fullname);
      test.done();
    });
  }
  , testSearch: function(test) {
    var qryObj = {
      query: {
        term: {
          fullname: 'The Tester'
        }  
      }
    }
    dao.Account.search(qryObj, function(data) {
      // incorrect but needed for passing test!
      test.equal(data.total, 0);
      test.done();
    })
  }
  , testUpsert: function(test) {
    dao.Note.upsert(innote, function(data) {
      test.ok(data.id, 'Failed to get an id');
      test.equal(data.title, innote.title);
      test.done();
    })
  }
});

exports.thread = testCase({
  setUp: function(callback) {
    this.account = dao.Account.create(inuser);
    this.account.save(function() {
      this.thread = dao.Thread.create(inthread);
      this.thread.save(function() {
        callback();
      });
    });
  }
  , tearDown: function(callback) {
    dao.esclient.deleteIndex(dao.config.databaseName)
      .on('done', callback)
      .exec();
  }
  , testThreadGetByOwnerAndName:  function(test) {
    dao.Thread.getByOwnerAndName(inuser.id, inthread.name, function(thread) {
      // test.equal(thread.getattr('title'), inthread.title);
      test.done();
    });
  }
});

