var HyperNotes = HyperNotes || {};

HyperNotes.View = function($) {
  var my = {};

  my.NoteView = Backbone.View.extend({
    tagName:  "li",

    events: {
      "dblclick div.note-content" : "edit",
      "click span.note-destroy"   : "clear",
      "keypress .note-input"      : "updateOnEnter"
    },

    initialize: function() {
      _.bindAll(this, 'render', 'close');
      this.model.bind('change', this.render);
      this.model.view = this;
    },

    render: function() {
      var tmplData = {
        note: this.model.toJSON()
      }
      var templated = $.tmpl(HyperNotes.Template.noteSummary, tmplData);
      $(this.el).html(templated);
      this.input = this.$('.note-input');
      this.input.bind('blur', this.close);
      return this;
    },

    edit: function() {
      $(this.el).addClass("editing");
      this.input.focus();
    },

    close: function() {
      this.model.save({label: this.input.val()});
      $(this.el).removeClass("editing");
    },

    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    remove: function() {
      $(this.el).remove();
    },

    clear: function() {
      // TODO: decide whether we destory or put in deleted state or just
      // remove from collection
      // this.model.destroy();
      this.remove();
      this.model.trigger('destroy', this.model);
    }
  });

  my.NoteListView = Backbone.View.extend({
    // Delegated events for creating new items, and clearing completed ones.
    initialize: function() {
      _.bindAll(this, 'addOne', 'addAll', 'render', 'removeOne');

      this.collection.bind('add',     this.addOne);
      this.collection.bind('reset', this.addAll);
      this.collection.bind('all',     this.render);
      this.collection.bind('destroy', this.removeOne);
    },

    addOne: function(note) {
      var view = new my.NoteView({model: note});
      this.el.find('> ul').append(view.render().el);
    },

    addAll: function() {
      this.collection.each(this.addOne);
    },

    removeOne: function(note) {
      this.collection.remove(note);
    }
  });

  my.TimeMapView = Backbone.View.extend({
    events: {
    },

    initialize: function() {
      _.bindAll(this, 'render');
      this.collection.bind('all', this.render);
    },

    _getDatasetForTimeMap: function() {
      var datasets = [
        {
          id: "xxxx",
          title: "my dataset",
          theme: "orange",
          type: "basic",
          options: {
            eventIcon: '/vendor/timemap/2.0/images/orange-circle.png',
            items: []
          }
        }
      ];
      $.each(this.collection.models, function(idx, model) {
        model = model.toJSON();
        var timemapObj = {
          title : model.title,
          start : model.start_parsed || model.start,
          point: {
              lon : model.location.centroid[0],
              lat : model.location.centroid[1]
           },
          options : {}
        };
        // timemap behaves oddly if you give it a null end date
        if (model.end) {
          timemapObj.end = model.end_parsed || model.end;
        }
        datasets[0].options.items.push(timemapObj);
      });
      return datasets;
    },

    render: function() {
      var out = $.tmpl(HyperNotes.Template.timeMap, {});
      this.el.html(out);
      var datasets = this._getDatasetForTimeMap();
      var tm;
      try {
        tm = TimeMap.init({
          mapId: "map",
          timelineId: "timeline",
          datasets: datasets,
          options: {
            eventIconPath: "../vendor/timemap/2.0/images/"
          },
          bandIntervals: [
              Timeline.DateTime.DECADE, 
              Timeline.DateTime.CENTURY
          ]
        });
      } catch (e) {
        // console.log(e);
      }

    }
  });

  my.ThreadView = Backbone.View.extend({
    events: {
      "keypress #new-note":  "createOnEnter",
    },

    initialize: function() {
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);
      var tmplData = {
        thread: this.model.toJSON()
      }
      var templated = $.tmpl(HyperNotes.Template.thread, tmplData);
      $(this.el).html(templated);
      this.$notelist = this.el.find('.note-list');
      this.noteListView = new HyperNotes.View.NoteListView({
        el: this.$notelist,
        collection: this.model.notes
        });
      this.timemap = new HyperNotes.View.TimeMapView({
        el: this.el.find('#timemap'),
        collection: this.model.notes
      });
      this.timemap.render();
    },

    render: function() {
      this.el.find('h1.title').html(this.model.get('title'));
      this.el.find('.thread-info .description').html(this.model.get('description'));
      return this;
    },

    createOnEnter: function(e) {
      var self = this;
      // enter key
      if (e.keyCode != 13) return;
      var summary = this.el.find('#new-note').val();
      HyperNotes.Model.createNoteFromSummary(summary, function(newNote) {
        newNote.set({'owner': HyperNotes.environ.account.id});
        // only add once we have saved and have id ...
        newNote.save(null, {
          success: function(data) {
            self.model.notes.add(newNote);
          },
          error: function(data) {
            // TODO
          }
        });
      });
      this.input.val('');
    }
  });

  my.ThreadCreate = Backbone.View.extend({
    initialize: function() {
    },

    events: {
      'submit form': 'onFormSubmit'
      , 'change input[name="title"]': 'onTitleChange'
    },

    onFormSubmit: function(e) {
      e.preventDefault();
      var self = this;
      var _data = $(e.target).serializeArray();
      var modelData = {};
      _.each(_data, function(item) {
        modelData[item.name] = item.value;
      });
      this.model.set(modelData);
      var $createBtn = this.el.find('form .action input');
      $createBtn.val('Saving ...');
      this.model.save()
        .then(function() {
          window.location = window.location + '/' + self.model.get('name');
        })
        .fail(function() {
          alert('Failed ' + arguments);
        });
        ;
    },

    onTitleChange: function(e) {
      var title = $(e.target).val();
      title = title.toLowerCase().replace(/ /g, '-');
      title = title.replace(/[^a-z0-9._-]/g, '');
      var $name = this.el.find('input[name="name"]');
      $name.val(title);
    }
  });

  return my;
}(jQuery);

