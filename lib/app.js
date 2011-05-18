$(function() {
  HyperNotes.Controller.initialize();
});

var HyperNotes = HyperNotes || {};

HyperNotes.Controller = function($) {
  var my = {};

  var Workspace = Backbone.Controller.extend({
    routes: {
      "": "index",
      "dashboard": "dashboard"
    },

    initialize: function(options) {
      var self = this;
      var notes = new HyperNotes.Model.NoteList();
      my.notelistview = new HyperNotes.View.NoteListView({
        el: $('#noteapp'),
        collection: notes
        });
      my.timemap = new HyperNotes.View.TimeMapView({
        el: $('#timemap'),
        collection: notes
      });
      my.timemap.render();
    },

    switchView: function(view) {
      $('.page-view').hide();
      $('#' + view + '-page').show();
    },

    index: function(query, page) {
    }
  });
  
  my.initialize = function() {
    my.workspace = new Workspace();
    Backbone.history.start()
  };

  return my;
}(jQuery);
