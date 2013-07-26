var fs = require('fs')
  , path = require('path')
  , util = require('./util')
  , config = require('./config')
  ; 

// =================================
// DB helpers

function rebuildDb(callback) {
}

// =================================
// Object oriented helpers

function clone(object) {
  function OneShotConstructor(){}
  OneShotConstructor.prototype = object;
  return new OneShotConstructor();
}

function forEachIn(object, action) {
  for (var property in object) {
  if (object.hasOwnProperty(property))
    action(property, object[property]);
  }
}

// =================================
// DAO Helpers

// QueryResult object
//
// Encapsulate result from ElasticSearch queries and providing helper methods
// (like toJSON)
var QueryResult = function(type, data) {
  this.type = getDomainObjectClass(type);
  this.data = data;
  this.total = this.data.hits.total;
  this.results = [];
  for (i=0;i<data.hits.hits.length;i++) {
    var objdata = data.hits.hits[i]._source;
    objdata.id = data.hits.hits[i]._id;
    var obj = this.type.create(objdata);
    this.results.push(obj);
  }
};

QueryResult.prototype.first = function() {
  if (this.total > 0) {
    return this.results[0];
  } else {
    return null;
  }
}

QueryResult.prototype.toJSON = function() {
  var out = {
    total: this.total
    , results: []
  };
  for (i=0;i<this.results.length;i++) {
    out.results.push(this.results[i].toJSON());
  }
  return out;
}

function getDomainObjectClass(name) {
  var objName = name[0].toUpperCase() + name.slice(1);
  var klass = module.exports[objName];
  return klass;
}


// =================================
// Domain Objects / Data Access Objects

function getPath(obj) {
  var DBPATH = config.get('database:path');
  if (obj.__type__ === 'account') {
    var dest = path.join(DBPATH, obj.id, 'data.json');
  } else if (obj.__type__ === 'viz') {
    var dest = path.join(
        DBPATH,
        obj.get('owner'),
        obj.get('name'),
        'datapackage.json'
      );
  }
  return dest;
}

var DomainObject = {
    __type__: null
  , construct: function(data) {
    this._data = data;
    if(data.id) {
      this.id = data.id;
    }
  }
  , extend: function(properties) {
    var result = clone(this);
    forEachIn(properties, function(name, value) {
      result[name] = value;
    });
    return result;
  }
  , create: function() {
    var object = clone(this);
    if (typeof object.construct == "function")
      object.construct.apply(object, arguments);
    return object;
  }
  , fetch: function(callback) {
    var self = this;
    var dest = getPath(self);
    fs.readFile(dest, 'utf8', function(error, content) {
      if (error) {
        callback(error)
      } else {
        try {
          var data = JSON.parse(content);
        } catch(e) {
          callback(e, content);
          return;
        }
        self._data = data;
        callback(error, self);
      }
    });
  }
  , upsert: function(callback) {
    var self = this;
    // creation (insert)
    var _now = new Date();
    self._data._last_modified = _now.toISOString();
    if (!self._data._created) {
      self._data._created = _now.toISOString();
    }
    var dest = getPath(self);
    var parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir);
    }

    fs.writeFile(dest, JSON.stringify(self._data, null, 2), 'utf8', function(error, content) {
      if (error) {
        callback(error)
      } else {
        callback(null, self);
      }
    });
  }
  , save: function(callback) {
    return this.upsert(callback);
  }
  // Search on this domain object
  , search: function(qryObj, options, callback) {
    var self = this;
    // TODO
  }
  , toJSON: function() {
    return this._data;
  }
  , toTemplateJSON: function() {
    return this._data;
  }
  , get: function(attrName) {
    return this._data[attrName];
  }
  , setattr: function(attrName, value) {
    this._data[attrName] = value;
  }
};

var Account = DomainObject.extend({
    __type__: 'account'
  , toJSON: function() {
    // crude deep copy
    var _data = JSON.parse(JSON.stringify(this._data));
    delete _data['password'];
    delete _data['email'];
    delete _data['api_key'];
    return _data;
  }
});

var Viz = DomainObject.extend({
    __type__: 'viz'
  , getByOwner: function(ownerId, callback) {
    // TODO
  }
});

module.exports = {
  config: config
  , getDomainObjectClass: getDomainObjectClass
  , QueryResult: QueryResult
  , Account: Account
  , Viz: Viz 
  , rebuildDb: rebuildDb
};

