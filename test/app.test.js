var fs = require('fs')
    path = require('path')
  , request = require('supertest')
  , express = require('express')
  , assert = require('assert')
  , dao = require('../lib/dao.js')
  , config = require('../lib/config.js')
  , _ = require('underscore')
  // , base = require('../test/base.js');
  ;

var app = require('../app.js').app;

// make sure we are in testing mode
config.set('test:testing', true);

describe('API', function() {
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
      .get('/api/v1/dataview/tester/napoleon')
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        // console.log(res);
        assert.equal(res.body.name, 'napoleon');
        assert.equal(res.body.title, 'Battles in the Napoleonic Wars');
        done();
      });
  });
  it('DataView Create Conflict if object with name already exists', function(done) {
    request(app)
      .post('/api/v1/dataview/')
      .send({
        owner: 'tester',
        name: 'napoleon'
      })
      .expect('Content-Type', /json/)
      .expect(409, done)
      ;
  });
  it('DataView not Authz', function(done) {
    var data = {
      owner: 'not-tester',
      name: 'test-api-create'
    };
    request(app)
      .post('/api/v1/dataview/')
      .send(data)
      .expect('Content-Type', /json/)
      .expect(401, done)
      ;
  });
  var dataViewData = { owner: 'tester',
    name: 'test-api-create',
    title: 'My Test DataView'
  };
  it('DataView Create and Update OK', function(done) {
    request(app)
      .post('/api/v1/dataview/')
      .send(dataViewData)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        assert.deepEqual(res.body, {}, 'Error on API create: ' + JSON.stringify(res.body));
        var obj = dao.DataView.create({
          owner: dataViewData.owner,
          name: dataViewData.name
        });
        obj.fetch(function(err) {
          // console.log(obj);
          // console.log(err);
          assert(!err, 'New DataView exists');
          assert.equal(obj.get('title'), dataViewData.title);
          testUpdate(obj, done);
        });
      })
      ;
  });

  function testUpdate(obj, done) {
    var newData = {
      title: 'my new title'
    };
    var newobj = _.extend(obj.toJSON(), newData);
    request(app)
      .post('/api/v1/dataview/tester/test-api-create')
      .send(newobj)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        assert.deepEqual(res.body, {}, 'Error on API update: ' + JSON.stringify(res.body));
        var obj = dao.DataView.create({
          owner: dataViewData.owner,
          name: dataViewData.name
        });
        obj.fetch(function(err) {
          assert(!err)
          assert.equal(obj.get('title'), newData.title);
          done();
        });
      })
      ;
  }

  after(function(done) {
    var obj = dao.DataView.create(dataViewData);
    obj.delete(function() {
      var dir = path.join(dao.getBackend().root,
        path.dirname(obj.offset())
        );
      fs.rmdirSync(dir);
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

describe('Site', function() {
  it('DataView Edit OK', function(done) {
    request(app)
      .get('/tester/napoleon/edit')
      .end(function(err, res) {
        assert.ok(res.text.indexOf('Edit') != -1);
        done();
      });
  });
});

