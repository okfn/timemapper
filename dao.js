nodees = require('elasticsearchclient');

var serverOptions = {
    host: 'localhost',
    port: 9200,
};

var config = {
  databaseName: 'hypernotes'
};

esclient = new nodees(serverOptions);

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
    esclient.get(config.databaseName, this.__type__, id)
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
    esclient.index(config.databaseName, this.__type__, data)
      .on('data', function(outData) {
          // TODO: deep copy?
          var out = data;
          var esOut = JSON.parse(outData);
          // TODO: copy over _version as well?
          out.id = esOut._id;
          callback(out);
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
  , search: function(qryObj, callback) {
    var self = this;
    esclient.search(config.databaseName, this.__type__, qryObj)
      .on('data', function(data) {
        var parsed = JSON.parse(data);
        var out = new QueryResult(self.__type__, parsed);
        callback(out);
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
    this._data['password'] = password;
  }
  , checkPassword: function(password) {
    return (password === this._data['password']);
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
    this.search(qryObj, callback);
  }
  , getByOwnerAndName: function(ownerId, threadName, callback) {
    var qryObj = {
      query: {
        bool: {
          must: [
            {
              term: {
                owner: ownerId
              }
            }
            , {
              term: {
                name: threadName
              }
            }
          ]
        }
      }
    };
    this.search(qryObj, function(queryResult) {
      callback(queryResult.first());
    })
  }
});

module.exports = {
  esclient: esclient
  , config: config
  , getDomainObjectClass: getDomainObjectClass
  , QueryResult: QueryResult
  , Account: Account
  , Note: Note
  , Thread: Thread
};

