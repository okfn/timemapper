assert = require('assert');
var testCase = require('nodeunit').testCase;

var base = require('../test/base.js');
var dao = require('../dao.js');
var loader = require('../loader.js');

exports.Loader = testCase({
  setUp: function(callback) {
    callback();
  }
  , tearDown: function(callback) {
    dao.esclient.deleteIndex(dao.config.get('database:name'))
      .on('done', callback)
      .exec();
  }
  , test_load: function(test) {
    var filepath = 'test/data/napoleon.js';
    var owner = 'tester';
    var threadId = 'testdata-napoleon';
    loader.load(filepath, owner, checkOk);
    function checkOk() {
      dao.Thread.get(threadId, function(thread) {
        var threadData = thread.toJSON();
        test.ok(thread && thread.id == threadId, 'Should have found thread');
        test.equal(threadData.owner, owner);
        test.equal(threadData.notes.length, 6);
        threadData.notes.forEach(function(item, idx) {
          if (!item) {
            console.log(threadData.notes);
          }
          test.ok(item);
        });
        var noteId = 'a880106e-ce43-4463-8884-bafe67270aa8';
        test.equal(threadData.notes[0], noteId);
        dao.Note.get(noteId, function(note1) {
          note1 = note1.toJSON();
          test.equal(note1.start, '1805-12-02');
          test.deepEqual(note1.location.centroid, [16.7622, 49.1281]);
          test.done();
        });
      });
    };
  }
});
