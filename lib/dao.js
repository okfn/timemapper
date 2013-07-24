var util = require('./util');
var config = require('./config'); 

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

Object.prototype.create = function() {
  var object = clone(this);
  if (typeof object.construct == "function")
    object.construct.apply(object, arguments);
  return object;
};

Object.prototype.extend = function(properties) {
  var result = clone(this);
  forEachIn(properties, function(name, value) {
    result[name] = value;
  });
  return result;
};


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

var DomainObject = {
    __type__: null
  , construct: function(data) {
    this._data = data;
    if(data.id) {
      this.id = data.id;
    }
  }
  , get: function(id, callback) {
    var self = this;
    esclient.get(config.get('database:name'), this.__type__, id)
      .on('data', function(data) {
        var out = JSON.parse(data);
        // not found
        if(!out.exists) {
          callback(null);
          return;
        }
        // add id just in case (should be there anyway?)
        if (out._source.id===undefined) {
          out._source.id = id;
        }
        var obj = self.create(out._source);
        callback(obj);
      })
      .exec()
  }
  , upsert: function(data, callback) {
    // creation (insert)
    var _now = new Date();
    data._last_modified = _now.toISOString();
    if (!data._created) {
      data._created = _now.toISOString();
    }
    // auto refresh index so we immediately get access to new doc
    esclient.index(config.get('database:name'), this.__type__, data, {refresh: 'true'})
      .on('data', function(outData) {
          // TODO: deep copy?
          var out = data;
          var esOut = JSON.parse(outData);
          if (esOut.status != undefined) {
            var msg = '*********** ERROR\nError on upsert: ' + esOut.error;
            console.log(msg);
            console.log(data);
            throw msg;
          } else {
            // TODO: copy over _version as well?
            out.id = esOut._id;
            callback(out);
          }
      })
      .exec()
  }
  , save: function(callback) {
    var self = this;
    this.upsert(this._data, function(data) {
      self.id = data.id;
      // set self._data e.g. for _created and _last_modified
      self._data = data;
      callback(data);
    });
  }
  // Search on this domain object
  //
  // :param qryObj: ES query object (data in POST or GET request as per ES client specs).
  // :param options: query string data as dictionary
  , search: function(qryObj, options, callback) {
    var self = this;
    esclient.search(config.get('database:name'), this.__type__, qryObj, options)
      .on('data', function(data) {
        var parsed = JSON.parse(data);
        if (parsed.status != undefined) {
          var msg = '*********** ERROR\nError on search: ' + parsed.error;
          console.log(msg);
          console.log(parsed);
          throw msg;
        } else {
          var out = new QueryResult(self.__type__, parsed);
          callback(out);
        }
      })
      .exec();
  }
  , toJSON: function() {
    return this._data;
  }
  , toTemplateJSON: function() {
    return this._data;
  }
  , getattr: function(attrName) {
    return this._data[attrName];
  }
  , setattr: function(attrName, value) {
    this._data[attrName] = value;
  }
};

var Account = DomainObject.extend({
    __type__: 'account'
  , setPassword: function(password) {
    this._data['password'] = util.hashPassword(password);
  }
  , checkPassword: function(password) {
    return util.verifyPasswordHash(password, this.getattr('password'));
  }
  , toJSON: function() {
    // crude deep copy
    var _data = JSON.parse(JSON.stringify(this._data));
    delete _data['password'];
    delete _data['email'];
    delete _data['api_key'];
    return _data;
  }
});

var Note = DomainObject.extend({
    __type__: 'note'
});

var Thread = DomainObject.extend({
    __type__: 'thread'
  , getByOwner: function(ownerId, callback) {
    var qryObj = {
      query: {
        term: {
          owner: ownerId
        }
      }
    };
    this.search(qryObj, null, callback);
  }
  , getByOwnerAndName: function(ownerId, threadName, callback) {
    var qryObj = {
      query: {
        filtered: {
          query: { match_all: {} },
          filter: {
            and: [
              {
                term: {
                  owner: ownerId,
                }
              },
              {
                term: {
                  name: threadName
                }
              }
            ]
          }
        }
      }
    };
    this.search(qryObj, null, function(queryResult) {
      callback(queryResult.first());
    })
  }
});

module.exports = {
  config: config
  , getDomainObjectClass: getDomainObjectClass
  , QueryResult: QueryResult
  , Account: Account
  , Note: Note
  , Thread: Thread
  , rebuildDb: rebuildDb
};

