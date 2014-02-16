var path = require('path')
  , fs = require('fs')
  , dao = require('../lib/dao.js')
  , wrench = require('wrench')
  ;

var fixtures = path.join(__dirname, 'fixtures', 'db');
var testDir = path.join('test', 'db');
// dao.config.set('database:backend', 's3');
// fs option
if (dao.config.get('database:backend') === 'fs') {
  testDir = path.join(__dirname, 'tmpdb');
}
dao.config.set('database:path', testDir);

// TODO: support for s3
exports.setupDb = function() {
  wrench.mkdirSyncRecursive(testDir);
  wrench.copyDirSyncRecursive(fixtures, testDir, { forceDelete: true });
}

exports.resetDb = function() {
  exports.cleanDb();
  exports.setupDb();
}

exports.cleanDb = function() {
  if (fs.existsSync(testDir)) {
    wrench.rmdirSyncRecursive(testDir);
  }
}

