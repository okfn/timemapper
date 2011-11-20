var HyperNotes = HyperNotes || {};

HyperNotes.Controller = function($) {
  var my = {};

  var Workspace = Backbone.Router.extend({
    routes: {
      "": "index",
      "thread/view/:id": "threadView",
      "dashboard": "dashboard"
    },

    initialize: function(environ) {
      this.environ = environ;
      this.environ.account = new HyperNotes.Model.Account(this.environ.config.account);
    },

    switchView: function(view) {
      $('.page-view').hide();
      $('#' + view + '-page').show();
    },

    index: function(query, page) {
    },

    threadView: function(thread) {
      var $leftpane = $('.left-pane');
      this.$thread = $('<div />').attr('class', '.page-view').attr('id', 'thread-page');
      $leftpane.append(this.$thread);
      var thread = new HyperNotes.Model.Thread({
        id: thread.id,
      });
      // hacky but best way to boot it i think
      thread.fetch({
        success: function() {
          thread.updateNoteList();
        }
      });
      my.threadView = new HyperNotes.View.ThreadView({
        el: this.$thread,
        model: thread
        });
      my.timemap = new HyperNotes.View.TimeMapView({
        el: $('#timemap'),
        collection: thread.notes
      });
      my.timemap.render();
    },

    accountView: function() {
      var thread = new HyperNotes.Model.Thread({
        owner: this.environ.account.id
      });
      my.threadCreateView = new HyperNotes.View.ThreadCreate({
        el: $('.thread-create-form') 
        , model: thread
      });
    }
  });
  
  my.initialize = function(config) {
    var environ = HyperNotes.Environ(config);
    HyperNotes.environ = environ;
    my.workspace = new Workspace(environ);
    Backbone.history.start()
    return my.workspace;
  };

  return my;
}(jQuery);
