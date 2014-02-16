var authz = require('./authz')
  , _ = require('underscore')
  , dao = require('./dao')
  ;

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
    obj.save(function(outData) {
      cb(null, outData);
    });
  } else {
    msg = {
      message: 'Access not allowed'
      , code: 401
    };
    cb(msg);
  }
};
