nodees = require('elasticsearchclient');

var serverOptions = {
    host: 'localhost',
    port: 9200,
};

var esclient = new nodees(serverOptions);

function search(indexName, table, qryObj) {
  return esclient.search(indexName, table, qryObj)
}


module.exports = {
  esclient: esclient
  , search: search
};

