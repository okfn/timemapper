var assert = require('assert')
  , path = require('path')
  , logic = require('../lib/logic.js')
  , dao = require('../lib/dao.js')
  // sets up db path
  , base = require('./base')
  ;

describe('createDataView', function() {
  before(function(done) {
    base.resetDb();
    done();
  });
  it('conflict', function(done) {
    var data = {
      name: 'napoleon',
      owner: 'tester'
    };
    logic.createDataView(data, {id: 'tester'}, function(err, out) {
      assert(err);
      assert.equal(err.code, 409);
      done();
    });
  });

  var data = {
    name: 'createdataview',
    title: 'Create Data View',
    owner: 'tester',
    url: 'xxxxx'
  };
  it('OK', function(done) {
    logic.createDataView(data, {id: 'tester'}, function(err, out) {
      assert(!err, err);
      var view = dao.DataView.create({
        owner: data.owner,
        name: data.name
      });
      view.fetch(function() {
        var lic = view.get('licenses');
        var exp = [{
          type: 'cc-by',
          name: 'Creative Commons Attribution',
          version: '3.0',
          url: 'http://creativecommons.org/licenses/by/3.0/'
        }];
        assert.deepEqual(lic, exp);
        assert.equal(view.get('title'), data.title);
        assert(!view.get('url'));
        assert(view.get('resources')[0].url, data.url);
        done();
      });
    });
  });
  it('anonymous - OK', function(done) {
    var data = {
      title: 'Xyz',
      url: 'xxxx'
    };
    logic.createDataView(data, null, function(err, out) {
      var out = out.toJSON();
      assert(!err, err);
      assert.equal(out.title, data.title);
      assert.equal(out.name.substr(7), data.title.toLowerCase());
      done();
    });
  });
});

describe('upsertDataView', function() {
  before(function(done) {
    base.resetDb();
    done();
  });

  var data = {
      name: 'createdataview',
      title: 'Create Data View',
      owner: 'tester'
    }
    , obj = dao.DataView.create(data)
    , user = { id: 'tester' }
    , wrongUser = { id: 'wrong' }


  it('should get 401 with anon', function(done) {
    logic.upsertDataView(obj, 'update', null, function(err, out) {
      assert(err);
      assert.equal(err.code, 401);
      done();
    });
  });
  it('should get 401 with wrong user', function(done) {
    logic.upsertDataView(obj, 'update', wrongUser, function(err, out) {
      assert(err);
      assert.equal(err.code, 401);
      done();
    });
  });
  it('should work', function(done) {
    logic.upsertDataView(obj, 'create', user, function(err, out) {
      assert(!err, err);
      done();
    });
  });
});

