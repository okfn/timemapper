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
    this.upsert(this._data, function(data) {
      // TODO: ? set this._data (any way data would have changed?)
      this.id = data.id;
      callback(data);
    });
  }
  , search: function(qryObj) {
    return esclient.search(config.databaseName, this.__type__, qryObj);
  }
  , toJSON: function() {
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
});

var Note = DomainObject.extend({
    __type__: 'note'
});

var Thread = DomainObject.extend({
    __type__: 'thread'
});

module.exports = {
  esclient: esclient
  , config: config 
  , Account: Account
  , Note: Note
  , Thread: Thread
};

