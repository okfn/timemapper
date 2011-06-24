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
      start: {
        unparsed: ''
      },
      end: {
        unparsed: ''
      }
    },
    localStorage: new Store("note")
  });

  // Create a note from a summary string.
  // Require callback as make calls to remote services for e.g. geolocation
  my.createNoteFromSummary = function(summary, callback) {
    var parsed = HyperNotes.Util.parseNoteSummary(summary);
    if (parsed.start) {
      parsed.start.parsed = Date.parse(parsed.start.unparsed);
    }
    if (parsed.end) {
      parsed.end.parsed = Date.parse(parsed.end.unparsed);
    }
    if (parsed.location && parsed.location.unparsed != '') {
      HyperNotes.Util.lookupLocation(parsed.location.unparsed, function(data) {
        if (!data) {
          alert('Failed to geolocate location: ' + parsed.location.unparsed);
        } else {
          parsed.location.geonames = data;
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
    localStorage: new Store("note")
  });

  my.Thread = Backbone.Model.extend({
    initialize: function() {
      this.notes = new NoteList;
    }
  });

  return my;
}(jQuery);
