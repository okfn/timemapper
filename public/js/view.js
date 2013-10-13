(function () {
  "use strict";

jQuery(function($) {
  var reclineDatasetInfo = $.extend({}, true, VIZDATA.resources[0]);
  if (VIZDATA.resources[0].schema && VIZDATA.resources[0].schema.fields) {
    reclineDatasetInfo.fields = VIZDATA.resources[0].schema.fields;
  }
  var dataset = new recline.Model.Dataset(reclineDatasetInfo);
  var timemapper = new TimeMapperView({
    model: dataset,
    datapackage: VIZDATA,
    el: $('.data-views')
  });
  // TODO: move this stuff into a proper view
  $('.js-embed').on('click', function(e) {
    e.preventDefault();
    var url = window.location.href.replace(/#.*$/, "") + '?embed=1'; // for now, just remove any fragment id
    var val = '<iframe src="' + url + '" frameborder="0" style="border: none;" width="100%" height="780;"></iframe>';
    $('.embed-modal textarea').val(val);
    $('.embed-modal').modal();  
  });
});

var TimeMapperView = Backbone.View.extend({
  events: {
    'click .controls .js-show-toolbox': '_onShowToolbox',
    'submit .toolbox form': '_onSearch'
  },

  initialize: function(options) {
    var self = this;
    this._setupOnHashChange();

    this.datapackage = options.datapackage;
    // fix up for datapackage without right structure
    if (!this.datapackage.tmconfig) {
      this.datapackage.tmconfig = {};
    }
    var timelineState = _.extend({}, this.datapackage.tmconfig.timeline, {
      nonUSDates: this.datapackage.tmconfig.dayfirst,
      timelineJSOptions: _.extend({}, this.datapackage.tmconfig.timelineJSOptions, {
        "hash_bookmark": true
      })
    });

    // Create subviews (timeline and map)
    this.timeline = new recline.View.Timeline({
      model: this.model,
      el: this.$el.find('.timeline'),
      state: timelineState
    });

    // Timeline will sort the entries by timestamp, and we need the order to be
    // the same for the map which runs off the model
    this.model.records.comparator = function (a, b) {
      // VMM.Date.parse is the timelinejs date parser
      var a = VMM.Date.parse(self.timeline._parseDate(a.get("start")));
      var b = VMM.Date.parse(self.timeline._parseDate(b.get("start")));
      return a - b;
    };

    // now load the data
    this.model.fetch()
      .done(function() {
        // HACK: We postpone rendering until now, because otherwise timeline
        // might try to navigate to a non-existent marker
        self.render();
        self.timeline.render();
        // Nasty hack. Timeline ignores hashchange events unless is_moving ==
        // True. However, once it's True, it can never become false again. The
        // callback associated with the UPDATE event sets it to True, but is
        // otherwise a no-op.
        $("div.slider").trigger("UPDATE");
        // set up twitter share button
        // do this here rather than in page so it picks up title correctly
        !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
      });
  },

  _setupOnHashChange: function() {
    var self = this;
    // listen for hashchange to update map
    $(window).on("hashchange", function () {
      var hash = window.location.hash.substring(1);
      if (parseInt(hash, 10)) {
        var record = self.model.records.at(hash);
        if (record && record.marker) {
          record.marker.openPopup();
        }
      }
    });
  },

  _onShowToolbox: function(e) {
    e.preventDefault();
    if (this.$el.find('.toolbox').hasClass('hideme')) {
      this.$el.find('.toolbox').removeClass('hideme');
    } else {
      this.$el.find('.toolbox').addClass('hideme');
    }
  },

  _onSearch: function(e) {
    e.preventDefault();
    var query = this.$el.find('.text-query input').val();
    this.model.query({q: query});
  },

  render: function() {
    var self = this;
    var state = {};
    this.timeline.convertRecord = function(record, fields) {
      if (record.attributes.start[0] == "'") {
        record.attributes.start = record.attributes.start.slice(1);
      }
      if (record.attributes.end && record.attributes.end[0] == "'") {
        record.attributes.end = record.attributes.end.slice(1);
      }
      try {
        var out = this._convertRecord(record, fields);
      } catch (e) {
        out = null;
      }
      if (!out) {
        if (typeof console !== "undefined" && console.warn) console.warn('Failed to extract date from: ' + JSON.stringify(record.toJSON()));
        return null;
      }
      if (record.get('image')) {
        out.asset = {
          media: record.get('image'),
          thumbnail: record.get('icon')
        };
      }
      out.text = record.get('description');
      if (record.get('source')) {
        var s = record.get('source');
        if (record.get('sourceurl')) {
          s = '<a href="' + record.get('sourceurl') + '">' + s + '</a>';
        }
        out.text += '<p class="source">Source: ' + s + '</p>';
      }

      return out;
    };

    this.map = new recline.View.Map({
      model: this.model
    });
    this.$el.find('.map').append(this.map.el);

    // customize with icon column
    this.map.infobox = function(record) {
      if (record.icon !== undefined) {
        return '<img src="' + record.get('icon') + '" width="100px"> ' +record.get('title');
      }
      return record.get('title');
    };

    this.map.geoJsonLayerOptions.pointToLayer = function(feature, latlng) {
      var marker = new L.Marker(latlng);
      var record = this.model.records.get(feature.properties.cid);
      var recordAttr = record.toJSON();
      marker.bindLabel(recordAttr.title);

      // customize with icon column
      if (recordAttr.icon !== undefined) {
        var eventIcon = L.icon({
            iconUrl: recordAttr.icon,
            iconSize:     [100, 20], // size of the icon
            iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
            shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });
        marker.setIcon(eventIcon);
      }
      
      // this is for cluster case
      this.markers.addLayer(marker);

      // When a marker is clicked, update the fragment id, which will in turn update the timeline
      marker.on("click", function (e) {
        var i = _.indexOf(record.collection.models, record);
        window.location.hash = "#" + i.toString();
      });

      // Stored so that we can get from record to marker in hashchange callback
      record.marker = marker;

      return marker;
    };
    this.map.render();
  }
});

})();
