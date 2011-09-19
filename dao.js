nodees = require('elasticsearchclient');

var serverOptions = {
    host: 'localhost',
    port: 9200,
};

var esclient = new nodees(serverOptions);

function search(indexName, table, qryObj) {
  return esclient.search(indexName, table, qryObj)
}

function get(indexName, objectType, id) {
  return esclient.get(indexName, objectType, id)
}

function upsert(indexName, objectType, data, callback) {
  dao.esclient.index(indexName, objectType, data)
    .on('data', function(data) {
        var out = JSON.parse(data);
        callback(out);
    })
    .exec()
}

module.exports = {
  esclient: esclient
  , search: search
  , get: get
};

