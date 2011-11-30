var fs = require('fs');
var step = require('step');

var dao = require('./dao.js');

// Load (and dump) data into (from) Hypernotes
exports.load = function(filepath, owner, callback) {
  var text = fs.readFileSync(filepath);
  var thread = JSON.parse(text);
  // TODO: this should be in dao somewhere
  function normalizeNote(noteIn) {
    // we have geojson
    if (noteIn.location && noteIn.location.type) {
      var _geojson = noteIn.location;
      noteIn.location = {};
      noteIn.location.geojson = _geojson;
      noteIn.location.unparsed = null;
      if (noteIn.location.geojson.type == 'Point') {
        noteIn.location.centroid = noteIn.location.geojson.coordinates;
      } else {
        noteIn.location.centroid = [null, null];
      }
      return noteIn;
    }
  }
  step(
    function makeNotes() {
      var self = this;
      var err = null;
      var noteIds = [];
      nextIdx = 0;
      function next(note) {
        noteIds.push(note.id); 
        nextIdx += 1;
        if (nextIdx == thread.notes.length) {
          // call next stage
          self(err, noteIds);
        } else {
          dao.Note.upsert(normalizeNote(thread.notes[nextIdx]), next);
        }
      }
      dao.Note.upsert(normalizeNote(thread.notes[0]), function(data) {
        next(data);
      });
    }
    , function makeThread(err, noteIds) {
      if (err) throw err;
      var self = this;
      thread.notes = noteIds;
      thread.owner = owner;
      dao.Thread.upsert(thread, function(data) {
        if (callback) {
          callback(data);
        }
      });
    }
  )
}

