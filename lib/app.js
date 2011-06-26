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

    initialize: function(environ) {
      this.environ = environ;
      if (this.environ.config.account) {
        this.environ.account = new HyperNotes.Model.Account(this.environ.config.account);
      }
      var self = this;
      var thread = new HyperNotes.Model.Thread();
      my.notelistview = new HyperNotes.View.NoteListView({
        el: $('#noteapp'),
        collection: thread.notes
        });
      my.timemap = new HyperNotes.View.TimeMapView({
        el: $('#timemap'),
        collection: thread.notes
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
  
  my.initialize = function(config) {
    var environ = HyperNotes.Environ(config);
    my.workspace = new Workspace(environ);
    Backbone.history.start()
  };

  return my;
}(jQuery);
