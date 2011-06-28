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
      var $content = $('#content');
      var $leftpane = $content.find('.left-pane');
      var $thread = $('<div />').attr('class', '.page-view').attr('id', 'thread-page');
      $leftpane.append($thread);

      var thread = new HyperNotes.Model.Thread({
        title: 'Default Thread',
        description: 'Default thread - where notes go by default.'
        });
      my.threadView = new HyperNotes.View.ThreadView({
        el: $thread,
        model: thread
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
