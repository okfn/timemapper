var HyperNotes = HyperNotes || {};

HyperNotes.View = function($) {
  var my = {};

  my.getPermissions = function(model) {
    var isOwner = (Boolean(model.get('owner')) && model.get('owner') == HyperNotes.environ.account.id);
    return permissions = {
      edit: isOwner
      , delete: isOwner
    };
  },

  my.NoteView = Backbone.View.extend({
    template: ' \
      <div class="note-summary"> \
        <div class="display"> \
          {{if permissions.edit}} \
          <div class="action"> \
            <a href="#edit" class="action-edit">Edit</a> \
            <span class="note-destroy"></span> \
          </div> \
          {{/if}} \
          <h3 class="title"> \
            ${note.title} \
          </h3> \
          {{if note.image}} \
          <div class="image"> \
            <img src="${note.image}" alt="image" class="thumbnail" /> \
          </div> \
          {{/if}} \
          <div class="description snippet"> \
            ${note.description} \
          </div> \
          <div class="location"> \
            {{if note.location.unparsed}} \
            @${note.location.unparsed} \
            {{/if}} \
          </div> \
          <div class="temporal"> \
            ${note.start} \
            {{if note.end}} \
             - ${note.end} \
            {{/if}} \
          </div> \
          <div class="tags"> \
            {{if note.tags.length}} \
            <ul class="tags"> \
              {{each note.tags}} \
                <li>${$value}</li> \
              {{/each}} \
            </ul> \
            {{/if}} \
          </div> \
          <div> \
            <a href="#more" class="show-more">More &raquo;</a> \
          </div> \
        </div> \
      </div> \
    ',

    events: {
      'click .show-more' : 'onShowMore'
    },

    initialize: function() {
      this.el = $(this.el);
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);
      this.permissions = my.getPermissions(this.model);
    },

    render: function() {
      var tmplData = {
        note: this.model.toJSON(),
        permissions: this.permissions
      }
      var templated = $.tmpl(this.template, tmplData);
      $(this.el).html(templated);
      this.input = this.$('.note-input');
      this.input.bind('blur', this.close);
      return this;
    },

    remove: function() {
      $(this.el).remove();
    },

    onShowMore: function(e) {
      e.preventDefault();
      this.el.removeClass('summary');
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
      var $li = $('<li />').append(view.render().el);
      this.el.find('> ul').append($li);
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
      var permissions = my.getPermissions(this.model);
      var tmplData = {
        thread: this.model.toJSON()
        , permissions: permissions
      };
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
      e.preventDefault();
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

