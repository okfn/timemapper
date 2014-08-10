var config = require('../lib/config.js')
  , dao = require('../lib/dao.js')
  , util = require('../lib/util.js')
  , authz = require('../lib/authz.js')
  ;

exports.getAccount = function(req, res) {
  var obj = dao.Account.create({id: req.params.id});
  logic.getObject(obj, req.user, function(err, domainObj) {
    if(err) {
      res.json(err.message, err.code);
    } else {
      res.json(domainObj.toJSON());
    }
  });
};

exports.getDataView = function(req, res) {
  var dataViewInfo = {
    owner: req.params.owner,
    name: req.params.name
  };
  logic.getDataView(dataViewInfo, req.user, function(err, dataViewObj) {
    if(err) {
      res.json(err.message, err.code);
    } else {
      res.json(dataViewObj.toJSON());
    }
  });
};

var apiUpsert = function(obj, action, req, res) {
  var userId = req.user ? req.user.id : null;
  var isAuthz = authz.isAuthorized(userId, action, obj);
  if (isAuthz) {
    obj.save(function(outData) {
      res.json(outData)
    });
  } else {
    msg = {
      error: 'Access not allowed'
      , status: 401
    };
    res.json(msg, 401);
  }
};

// app.post('/api/v1/:objecttype', apiUpsert);
exports.createDataView = function(req, res) {
  var data = req.body;
  var obj = dao.DataView.create(data);
  // check whether already exists
  obj.fetch(function(err) {
    // TODO: we assume error is 404 but could be something else ...
    if (!err) {
      res.json(409, {message: 'Conflict - Object already exists'});
    }
    else {
      apiUpsert(obj, 'create', req, res);
    }
  });
};

exports.updateDataView = function(req, res) {
  var data = req.body;
  var obj = dao.DataView.create(data);
  // TODO: ? check whether it exists?
  apiUpsert(obj, 'update', req, res);
};

