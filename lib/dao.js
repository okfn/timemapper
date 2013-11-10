var fs = require('fs')
  , path = require('path')
  , util = require('./util')
  , config = require('./config')
  , knox = require('knox')
  , async = require('async')
  ; 

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
// Backend

var FSBackend = function(options) {
  var DBPATH = config.get('database:path');
  this.root = DBPATH;
}

FSBackend.prototype.read = function(offset, callback) {
  var dest = path.join(this.root, offset);
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
      callback(error, data);
    }
  });
};

FSBackend.prototype.readdir = function(offset, callback) {
  var dest = path.join(this.root, offset);
  fs.readdir(dest, callback);
};

FSBackend.prototype.write = function(data, offset, callback) {
  var dest = path.join(this.root, offset);
  var parentDir = path.dirname(dest);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir);
  }

  fs.writeFile(dest, JSON.stringify(data, null, 2), 'utf8', function(error, content) {
    if (error) {
      callback(error)
    } else {
      callback(null);
    }
  });
};

FSBackend.prototype.deleteFile = function(offset, callback) {
  var dest = path.join(this.root, offset);
  fs.exists(dest, function(exists) {
    if (exists) {
      return fs.unlink(dest, callback);
    } else {
      callback(null)
    }
  });
}

// FSBackend.prototype.exists = function(offset, cb) {
//  return fs.exists(cb);
// }

var S3Backend = function(options) {
  var DBPATH = config.get('database:path');
  this.root = DBPATH;
  this.client = knox.createClient({
      key: config.get('s3:key')
      , secret: config.get('s3:secret')
      , bucket: config.get('s3:bucket')
  });
}

S3Backend.prototype.read = function(offset, callback) {
  var dest = path.join(this.root, offset);
  this.client.getFile(dest, function(error, res) {
    if (error) {
      callback(error)
    } else if (res.statusCode != 200) {
      callback({
        statusCode: res.statusCode,
        message: 'Error: response got code ' + res.statusCode
      });
    } else {
      var content = '';
      res.on('data', function(data) {
        content += data;
      });
      res.on('end', function() {
        try {
          var data = JSON.parse(content);
          callback(error, data);
        } catch(e) {
          callback(e, content);
        }
      });
      res.resume();
    }
  });
};

S3Backend.prototype.readdir = function(offset, callback) {
  var dest = path.join(this.root, offset);
  // make sure we add a trailing / since s3 is picky on this
  // searching for test/db/tester with delimiter / will yield nothing
  dest = dest.replace(/\/$/, '') + '/';
  this.client.list({ prefix: dest, delimiter: '/' }, function(err, data) {
    if (err) {
      callback(err, data)
      return;
    }
    // should be same as dest btw ...
    var prefix = data.Prefix;
    // files
    var out = data.Contents.map(function(item) {
      return item.Key.slice(prefix.length);
    });

    // note hack for case where empty results in which case CommonPrefixes does
    // not even exist as a key
    if (data.CommonPrefixes === undefined) data.CommonPrefixes = [];

    // directories
    out = out.concat(data.CommonPrefixes.map(function(item) {
      return item.Prefix.slice(prefix.length).replace(/\/$/, '');
    }));
    callback(err, out);
  });
};

S3Backend.prototype.write = function(data, offset, callback) {
  var dest = path.join(this.root, offset);
  var json = JSON.stringify(data, null, 2);
  var buffer = new Buffer(json, 'utf8');
  this.client.putBuffer(buffer, dest, function(error, content) {
    if (error) {
      callback(error)
    } else {
      callback(null);
    }
  });
};

function getBackend() {
  if (config.get('database:backend') === 's3') {
    return new S3Backend();
  } else {
    return new FSBackend();
  }
}

// =================================
// Domain Objects / Data Access Objects

function getPath(obj) {
  if (obj.__type__ === 'account') {
    var dest = [obj.id, 'data.json'].join('/');
  } else if (obj.__type__ === 'dataview') {
    var dest = [
        obj.get('owner'),
        obj.get('name'),
        'datapackage.json'
      ].join('/');
  }
  return dest;
}

var DomainObject = {
    __type__: null
  , construct: function(data) {
    this._data = data;
    this.backend = getBackend();
    if(data.id) {
      this.id = data.id;
    }
    if (typeof this._construct == "function") {
      this._construct();
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
  , offset: function() {
    return getPath(this);
  }
  , fetch: function(callback) {
    var self = this;
    self.backend.read(self.offset(), function(error, data) {
      if (!error) {
        // TODO: should this be extend rather than reset
        self._data = data;
      }
      callback(error, self);
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
    self.backend.write(self._data, dest, function(error) {
      callback(error, self);
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

var DataView = DomainObject.extend({
    __type__: 'dataview'
  // delete this dataview
  , delete: function(cb) {
    // TODO: do we want to check it exists first?
    var backend = getBackend();
    var dest = getPath(this);
    backend.deleteFile(dest, cb);
  },
  _construct: function() {
    if (this._data.tmconfig && this._data.tmconfig.dayfirst !== undefined) {
      this._data.tmconfig.dayfirst = !(this._data.tmconfig.dayfirst === 'false');
    }
  }
  // Return list of DataView objects (toJSON'd) owned by this user
  , getByOwner: function(ownerId, callback) {
    var backend = getBackend();
    backend.readdir(ownerId, function(err, data) {
      var out = [];
      var data = data.filter(function(fileOrDirName) {
        return (fileOrDirName !== 'data.json');
      });
      function extract(vizName, cb) {
        var viz = DataView.create({owner: ownerId, name: vizName});
        viz.fetch(function(err, data) {
          if (err === null) out.push(data.toJSON());
          cb(err);
        });
      }
      async.eachSeries(data, extract, function(err, done) {
        callback(err, out);
      });
    });
  }
});

module.exports = {
  config: config
  , getDomainObjectClass: getDomainObjectClass
  , QueryResult: QueryResult
  , Account: Account
  , DataView: DataView 
  , getBackend: getBackend
};

