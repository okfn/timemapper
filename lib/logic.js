var authz = require('./authz')
  , _ = require('underscore')
  , dao = require('./dao')
  , util = require('./util')
  ;

// Common aspects of the code
//
// Errors look like
//
// { code: 404, message: ... }

exports.getDataView = function(data, user, cb) {
  var obj = dao.DataView.create(data);
  exports.getObject(obj, user, cb);
};

// get an object doing all the tedious stuff like checking it exists and that you are authorized to view
exports.getObject = function(obj, user, cb) {
  obj.fetch(function(err, domainObj) {
    if (err) {
      cb(err);
      return;
    }
    if (domainObj===null) {
      var err = {
        message: 'Cannot find ' + req.params.objecttype + ' with id ' + req.params.id
        , code: 404
      };
      cb(err);
      return;
    }
    var userId = user ? user.id : null;
    var isAuthz = authz.isAuthorized(userId, 'read', domainObj);
    if (isAuthz) {
      cb(null, domainObj);
    } else {
      cb({
          message: 'Access not allowed'
          , code: 401
        },
        null
      );
    }
  });
};

exports.createDataView = function(data, user, cb) {
  var ourdata = _.extend({
      licenses: [{
        type: 'cc-by',
        name: 'Creative Commons Attribution',
        version: '3.0',
        url: 'http://creativecommons.org/licenses/by/3.0/'
      }],
      resources: [{
        backend: 'gdocs',
        url: data.url
      }],
    }
    , data);
  if (data.url) {
    delete ourdata.url
  }
  ourdata.owner = user ? user.id : 'anon';
  // generate the name
  if (ourdata.owner === 'anon') {
    // 6 character random id
    var randomId = ("000000" + (Math.random()*Math.pow(36,6) << 0).toString(36)).substr(-6)
    ourdata.name = randomId + '-' + util.sluggify(ourdata.title);
  }

  var obj = dao.DataView.create(ourdata);
  // check whether already exists
  obj.fetch(function(err) {
    // TODO: we assume error is 404 but could be something else ...
    if (!err) {
      cb({
        code: 409,
        message: 'Conflict - Object already exists'
      });
    }
    else {
      exports.upsertDataView(obj, 'create', user, cb);
    }
  });
}

exports.upsertDataView = function(obj, action, user, cb) {
  var userId = user ? user.id : null;
  var isAuthz = authz.isAuthorized(userId, action, obj);
  if (isAuthz) {
    obj.save(cb);
  } else {
    msg = {
      message: 'Access not allowed'
      , code: 401
    };
    cb(msg);
  }
};

exports.deleteDataView = function(data, user, cb) {
  exports.getDataView(data, user, function(err, domainObj) {
    if (err) {
      cb(err);
      return;
    }
    var userId = user ? user.id : null;
    var isAuthz = authz.isAuthorized(userId, 'delete', domainObj);
    if (!isAuthz) {
      cb({
          message: 'Access not allowed'
          , code: 401
        },
        null
      );
      return;
    }
    domainObj.setattr('state', 'deleted');
    domainObj.save(cb);
  });
};

exports.ensureAnonAccountExists = function(cb) {
  var obj = dao.Account.create({
    id: 'anon',
    fullname: 'Anonymous'
  });
  // check whether already exists
  obj.fetch(function(err) {
    if (err) { // does not exist yet
      obj.save(cb);
    } else { // already exists so ok
      cb(null);
    }
  });
}

