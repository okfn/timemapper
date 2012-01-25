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

  my.alert = function(msg, category) {
    var _category = category || 'info';
    var _template = '<div class="alert-message ${category}" data-alert="alert"><a class="close" href="#">×</a><p>${msg}</p></div>';
    var _templated = $.tmpl(_template, {
      msg: msg,
      category: _category
      });
    $('.alert-messages').append(_templated);
  }

  my.NoteView = Backbone.View.extend({
    className: 'note view summary',
    template: ' \
          {{if permissions.edit}} \
          <div class="action"> \
            <a href="#edit" class="action-edit btn">Edit</a> \
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
          <div class="temporal"> \
            {{if note.start}} \
              ${note.start} (${note.start_parsed}) \
              {{if note.end}} \
               &ndash; ${note.end} (${note.end_parsed}) \
              {{/if}} \
           {{/if}} \
          </div> \
          <div class="location"> \
            {{if note.location.unparsed}} \
            @${note.location.unparsed} \
            {{/if}} \
          </div> \
          <div class="tags"> \
            {{if note.tags.length}} \
            <ul class="tags"> \
              {{each note.tags}} \
                <li>#${$value}</li> \
              {{/each}} \
            </ul> \
            {{/if}} \
          </div> \
          <div class="description"> \
            ${note.description} \
          </div> \
          <div> \
            <a href="#more" class="show-more">More &raquo;</a> \
            <a href="#less" class="show-less">Less &laquo;</a> \
          </div> \
    ',

    events: {
      'click .show-more' : 'onShowMore',
      'click .show-less' : 'onShowLess',
      'click .action-edit': 'onEdit'
    },

    initialize: function() {
      this.el = $(this.el);
      _.bindAll(this, 'render', 'onEditComplete');
      this.model.bind('change', this.render);
    },

    render: function() {
      var permissions = my.getPermissions(this.model);
      var tmplData = {
        note: this.model.toTemplateJSON(),
        permissions: permissions
      }
      var templated = $.tmpl(this.template, tmplData);
      this.el.html(templated);
      this.el.addClass('summary');
      this.el.show();
      return this;
    },

    remove: function() {
      $(this.el).remove();
    },

    onShowMore: function(e) {
      e.preventDefault();
      this.el.removeClass('summary');
    },

    onShowLess: function(e) {
      e.preventDefault();
      this.el.addClass('summary');
    },

    onEdit: function(e) {
      e.preventDefault();
      var editView = new my.NoteEdit({
        model: this.model
      });
      editView.bind('edit:complete', this.onEditComplete)
      editView.render();
      this.el.hide();
      this.el.after(editView.el);
    },

    onEditComplete: function() {
      this.el.show();
    },

    clear: function() {
      // TODO: decide whether we destory or put in deleted state or just
      // remove from collection
      // this.model.destroy();
      this.remove();
      this.model.trigger('destroy', this.model);
    }
  });

  my.NoteEdit = Backbone.View.extend({
    className: 'note edit',
    template: ' \
      <h3><em>Editing</em> &ndash; ${note.title}</h3> \
      <form> \
        <fieldset> \
          <legend> \
          </legend> \
          <div class="clearfix"> \
            <label for="title">Title</label> \
            <div class="input"> \
              <input \
                name="title" \
                type="text" \
                value="${note.title}" \
                class="xlarge" \
                /> \
            </div> \
          </div> \
             \
          <div class="clearfix"> \
            <label for="start">Start&ndash;End</label> \
            <div class="input"> \
              <div class="inline-inputs"> \
                <input \
                  name="start" \
                  type="text" \
                  value="${note.start}" \
                  class="small" \
                  /> \
                &ndash; \
                <input \
                  name="end" \
                  type="text" \
                  value="${note.end}" \
                  class="small" \
                  /> \
              </div> \
            </div> \
          </div> \
          <div class="clearfix"> \
            <label for="start_parsed">Start&ndash;End (parsed)</label> \
            <div class="input"> \
              <div class="inline-inputs"> \
                <input \
                  name="start_parsed" \
                  type="text" \
                  value="${note.start_parsed}" \
                  class="small" \
                  /> \
                &ndash; \
                <input \
                  name="end_parsed" \
                  type="text" \
                  value="${note.end_parsed}" \
                  class="small" \
                  /> \
              </div> \
            </div> \
          </div> \
             \
          <div class="clearfix"> \
            <label for="description">Description</label> \
            <div class="input"> \
              <textarea \
                name="description" \
                type="text" \
                class="xlarge" \
                rows="15" \
                >${note.description}</textarea> \
            </div> \
          </div> \
        </fieldset> \
        <div class="actions"> \
          <button type="submit" class="btn primary">Save changes</button> \
          <button type="reset" class="btn danger">Cancel</button> \
        </div> \
      </form> \
    ',
    events: {
      'submit form': 'onSubmitForm',
      'reset form': 'onResetForm'
    },

    initialize: function() {
      this.el = $(this.el);
      _.bindAll(this, 'onSubmitForm');
    },

    render: function() {
      var tmplData = {
        note: this.model.toJSON(),
      }
      var templated = $.tmpl(this.template, tmplData);
      this.el.html(templated);
    },

    onSubmitForm: function(e) {
      var self = this;
      e.preventDefault();
      // TODO: save data ...
      var _data = this.el.find('form').serializeArray();
      modelData = {};
      $.each(_data, function(idx, value) {
        // ignore empty strings and other null values
        if (value.value!=null && value.value!='') {
          modelData[value.name] = value.value
        }
      });
      this.model.set(modelData);
      this.model.save({}, {
        success: function(model) {
          my.alert('Saved note.', 'success');
          self.trigger('edit:complete');
          self.remove();
        },
        error: function(model, error) {
          // TODO: Flash error ...
          my.alert('Error saving note' + error.responseText, 'error');
        }
      });
    },

    onResetForm: function(e) {
      e.preventDefault();
      this.trigger('edit:complete');
      this.remove();
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
        var modelJS = model.toJSON();
        var view = new my.NoteView({
          model: model
        });
        view.render();
        view.el.removeClass('summary');
        var viewHtml = view.el.clone().wrap('<div>').parent().html();
        var timemapObj = {
          title : modelJS.title,
          start : modelJS.start_parsed || modelJS.start,
          point: {
              lon : modelJS.location.centroid[0],
              lat : modelJS.location.centroid[1]
           },
          options : {
            infoHtml: viewHtml
          }
        };
        // timemap behaves oddly if you give it a null end date
        if (modelJS.end) {
          timemapObj.end = modelJS.end_parsed || modelJS.end;
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
    template: ' \
      <div class="thread-nav"> \
        <a href="${thread.name}" class="btn disabled">Overview</a> \
        <a href="${thread.name}/timemap" class="btn">TimeMap</a> \
      </div> \
      <h1 class="title">${thread.title}</h1> \
      <div class="thread-info"> \
        <p class="description snippet">${thread.description}</p> \
      </div> \
      <div class="row"> \
        <div class="span8 left-pane"> \
          <div class="note-list"> \
            <ul></ul> \
          </div> \
          &nbsp; \
        </div> \
        <div class="span8 right-pane"> \
          {{if permissions.edit}} \
          <div class="note quick-add"> \
            <form> \
              <label for="new-note">Quick Add</label> \
              <div class="input"> \
                <input \
                  name="new-note" \
                  placeholder="My note title #my-tag ^1st September 1939^ @New York@" \
                  type="text" /> \
              </div> \
              <span class="help-block"> \
                Add note then enter to save. Use #... for tags, ^...^ for dates, @...@ for location \
              </span> \
            </form> \
          </div> \
          {{/if}} \
          <div id="timemap"></div> \
        </div> \
      </div> \
    ',
    events: {
      "submit .note.quick-add form":  "createOnEnter",
    },

    initialize: function() {
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);
      var permissions = my.getPermissions(this.model);
      var tmplData = {
        thread: this.model.toJSON()
        , permissions: permissions
      };
      var templated = $.tmpl(this.template, tmplData);
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
      e.preventDefault();
      var $form = $(e.target);
      var $input = $form.find('input[name="new-note"]');
      var summary = $input.val();
      HyperNotes.Model.createNoteFromSummary(summary, function(newNote) {
        newNote.set({'owner': HyperNotes.environ.account.id});
        // only add once we have saved and have id ...
        newNote.save(null, {
          success: function(data) {
            self.model.notes.add(newNote);
            my.alert('New note created and added to thread.', 'success');
          },
          error: function(data) {
            my.alert('Failed to create note.' + data, 'error');
          }
        });
      });
      $input.val('');
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
          my.alert('Failed ' + arguments, 'error');
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

