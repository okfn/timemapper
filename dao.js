nodees = require('elasticsearchclient');

var serverOptions = {
    host: 'localhost',
    port: 9200,
};

var esclient = new nodees(serverOptions);

function search(indexName, objectType, qryObj) {
  return esclient.search(indexName, objectType, qryObj)
}

function get(indexName, objectType, id) {
  return esclient.get(indexName, objectType, id)
}

function upsert(indexName, objectType, data, callback) {
  esclient.index(indexName, objectType, data)
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

module.exports = {
  esclient: esclient
  , search: search
  , get: get
  , upsert: upsert
};

