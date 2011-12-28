var HyperNotes = HyperNotes || {};

HyperNotes.Model = function($) {
  var my = {};

  my.Account = Backbone.Model.extend({
    defaults: {
      username: '',
      api_key: ''
    }
  });

  // Note objects
  my.Note = Backbone.Model.extend({
    defaults: {
      title: '',
      tags: [],
      location: {
        unparsed: '',
        centroid: [null, null]
      },
      start: null,
      end: null,
    },
    urlRoot: '/api/v1/note',
    toTemplateJSON: function() {
      function renderDate(date) {
        return date ? date : 'unparsed';
      }
      var _data = this.toJSON();
      _data.start_parsed = renderDate(_data.start_parsed);
      _data.end_parsed = renderDate(_data.end_parsed);
      return _data;
    }
  });

  // Create a note from a summary string.
  // Require callback as make calls to remote services for e.g. geolocation
  my.createNoteFromSummary = function(summary, callback) {
    var parsed = HyperNotes.Util.parseNoteSummary(summary);
    if (parsed.start) {
      parsed.start_parsed = HyperNotes.Util.parseDate(parsed.start);
    }
    if (parsed.end) {
      parsed.end_parsed = HyperNotes.Util.parseDate(parsed.end);
    }
    if (parsed.location && parsed.location.unparsed != '') {
      HyperNotes.Util.lookupLocation(parsed.location.unparsed, function(data) {
        if (!data) {
          alert('Failed to geolocate location: ' + parsed.location.unparsed);
        } else {
          parsed.location.centroid = [
            data.lng,
            data.lat
          ];
        }
        callback(new my.Note(parsed));
      });
    } else {
      callback(new my.Note(parsed));
    }
  },

  my.NoteList = Backbone.Collection.extend({
    model: my.Note,
    url: '/api/v1/note'
  });

  my.Thread = Backbone.Model.extend({
    urlRoot: '/api/v1/thread',

    initialize: function() {
      _.bindAll(this, 'updateNoteList', 'notesAddRemove');
      this.notes = new my.NoteList();
      this.notes.bind('add', this.notesAddRemove);
      this.notes.bind('remove', this.notesAddRemove);
    },

    updateNoteList: function() {
      var self = this;
      $.each(this.get('notes'), function(idx, value) {
        // add silently because we do not want to trigger change on this thread
        var newNote = new my.Note({id: value});
        newNote.fetch();
        self.notes.add(newNote, {
          silent: true
          });
      });
      this.notes.trigger('reset');
    },

    notesAddRemove: function() {
      this.set({'notes': this.notes.pluck('id')}, {
        silent: true
      });
      this.save();
    }
  });

  return my;
}(jQuery);
