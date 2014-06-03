var fs = require('fs')
    path = require('path')
  , request = require('supertest')
  , express = require('express')
  , assert = require('assert')
  , dao = require('../lib/dao.js')
  , config = require('../lib/config.js')
  , _ = require('underscore')
  , base = require('./base');
  ;

// make sure we are in testing mode
config.set('test:testing', true);
config.set('twitter:key', 'test');
config.set('twitter:secret', 'test');
config.set('database:backend', 'fs');

var app = require('../app.js').app;

describe('API', function() {
  before(function(done) {
    base.resetDb();
    done();
  });

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
    title: 'My Test DataView',
    tmconfig: {
      // note a string false - this is what we will get via API (POSTs stringify all values!)
      dayfirst: 'false',
      startfrom: 'first'
    }
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
          assert.equal(obj.get('tmconfig').dayfirst, false);
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
  before(function(done) {
    base.resetDb();
    done();
  });
  after(function(done) {
    base.resetDb();
    done();
  });

  it('DataView Edit OK', function(done) {
    request(app)
      .get('/tester/napoleon/edit')
      .end(function(err, res) {
        assert.ok(res.text.indexOf('Edit') != -1);
        done();
      });
  });
  it('(Pre)view OK', function(done) {
    var url = 'https://docs.google.com/a/okfn.org/spreadsheet/ccc?key=0AqR8dXc6Ji4JdERlNXQ3ekttQk5USmFRaTFMYUNJTkE';
    var title = 'Abc is the title';
    request(app)
      .get('/view?url=' + url + '&title=' + title)
      .end(function(err, res) {
        assert.ok(res.text.indexOf(title) != -1);
        done();
      });
  });

  var dataViewData = {
    name: 'test-api-create',
    title: 'My Test DataView',
    'tmconfig[dayfirst]': 'false',
    'tmconfig[startfrom]': 'first'
  };
  // owner will be set to logged in user
  var owner = 'tester'

  it('DataView Create POST OK', function(done) {
    request(app)
      .post('/create')
      .type('form')
      .send(dataViewData)
      .expect(302)
      .end(function(err, res) {
        assert(!err, err);
        assert.equal(res.header['location'], '/' + owner + '/' + dataViewData.name);
        var obj = dao.DataView.create({
          owner: owner,
          name: dataViewData.name
        });
        obj.fetch(function(err) {
          assert(!err, 'New DataView exists');
          assert.equal(obj.get('title'), dataViewData.title);
          assert.equal(obj.get('tmconfig').dayfirst, false);
          var lic = obj.get('licenses');
          assert.equal(lic[0].type, 'cc-by');
          done();
        });
      })
      ;
  });

  it('DataView Update POST OK', function(done) {
    var dataViewData = {
      title: 'Updated Data View',
      'tmconfig[viewtype]': 'map',
      'tmconfig[dayfirst]': 'false',
      'tmconfig[startfrom]': 'first'
    };
    var owner = 'tester';
 
    request(app)
      .post('/tester/napoleon/edit')
      .type('form')
      .send(dataViewData)
      .expect(302)
      .end(function(err, res) {
        assert(!err, err);
        assert.equal(res.header['location'], '/tester/napoleon');
        var obj = dao.DataView.create({
          owner: owner,
          name: 'napoleon'
        });
        obj.fetch(function(err) {
          assert(!err, 'DataView exists');
          assert.equal(obj.get('title'), dataViewData.title);
          assert.equal(obj.get('tmconfig').dayfirst, false);
          assert.equal(obj.get('tmconfig').viewtype, 'map');
          // existing data unchanged
          var lic = obj.get('licenses');
          assert.equal(lic[0].type, 'cc-by-sa');
          done();
        });
      })
      ;
  });
});

describe('Site - Anonymous Mode', function() {
  before(function(done) {
    base.resetDb();
    // unset testing mode so that we are not logged in
    config.set('test:testing', false);
    done();
  });
  after(function(done) {
    // set back to testing
    config.set('test:testing', true);
    done();
  });

  var dataViewData = {
    title: 'My Test DataView',
    'tmconfig[dayfirst]': 'false',
    'tmconfig[startfrom]': 'first'
  };
  // owner will be set to logged in user
  var owner = 'anon'
  it('Create POST OK', function(done) {
    request(app)
      .post('/create')
      .type('form')
      .send(dataViewData)
      .expect(302)
      .end(function(err, res) {
        assert(!err, err);
        assert.equal(res.header['location'].indexOf('/' + owner), 0);
        var name = res.header['location'].split('/')[2]
        var obj = dao.DataView.create({
          owner: owner,
          name: name
        });
        obj.fetch(function(err) {
          assert(!err, 'New DataView exists');
          assert.equal(obj.get('title'), dataViewData.title);
          assert.equal(obj.get('tmconfig').dayfirst, false);
          var lic = obj.get('licenses');
          assert.equal(lic[0].type, 'cc-by');
          done();
        });
      })
      ;
  });
});
