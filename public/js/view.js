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
    this.timelineState = _.extend({}, this.datapackage.tmconfig.timeline, {
      nonUSDates: this.datapackage.tmconfig.dayfirst,
      timelineJSOptions: _.extend({}, this.datapackage.tmconfig.timelineJSOptions, {
        "hash_bookmark": true
      })
    });
    this._setupTwitter();

    // now load the data
    this.model.fetch().done(function() {
      self.model.query({size: self.model.recordCount})
      .done(function() {
        self._dataChanges();
        self._setStartPosition();
        self._onDataLoaded();
      });
    });
  },

  _setStartPosition: function() {
    var startAtSlide = 0;
    switch (this.datapackage.tmconfig.startfrom) {
      case 'start':
        // done
        break;
      case 'end':
        startAtSlide = this.model.recordCount - 1;
        break;
      case 'today':
        var dateToday = new Date();
        this.model.records.each(function(rec, i) {
          if (rec.get('startParsed') < dateToday) {
            startAtSlide = i;
          }
        });
        break;
    }
    this.timelineState.timelineJSOptions = _.extend(this.timelineState.timelineJSOptions, {
        "start_at_slide": startAtSlide
      }
    );
  },

  _onDataLoaded: function() {
    $('.js-loading').hide();

    // Note: We *have* to postpone setup until now as otherwise timeline
    // might try to navigate to a non-existent marker
    if (this.datapackage.tmconfig.viewtype === 'timeline') {
      // timeline only
      $('body').addClass('viewtype-timeline');
      // fix height of timeline to be window height minus navbar and footer
      $('.timeline-pane').height($(window).height() - 42 - 41);
      this._setupTimeline();
    } else if (this.datapackage.tmconfig.viewtype === 'map') {
      $('body').addClass('viewtype-map');
      this._setupMap();
    } else {
      $('body').addClass('viewtype-timemap');
      this._setupTimeline();
      this._setupMap();
    }

    // Nasty hack. Timeline ignores hashchange events unless is_moving ==
    // True. However, once it's True, it can never become false again. The
    // callback associated with the UPDATE event sets it to True, but is
    // otherwise a no-op.
    $("div.slider").trigger("UPDATE");
  },

  _setupTwitter: function(e) {
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
  },

  _dataChanges: function() {
    var self = this;
    this.model.records.each(function(record) {
      // normalize date field names
      if (record.get('startdate') && !record.get('start')) {
        record.set({
          start: record.get('startdate'),
          end: record.get('enddate')
        }, {silent: true}
        );
      }
      var startDate = VMM.Date.parse(normalizeDate(record.get("start"), self.datapackage.tmconfig.dayfirst));
      var data = {
        // VMM.Date.parse is the timelinejs date parser
        startParsed: startDate,
        title: record.get('title') || record.get('headline'),
        description: record.get('description') || record.get('text') || '',
        url: record.get('url') || record.get('webpage'),
        media: record.get('image') || record.get('media'),
        mediacaption: record.get('caption') || record.get('mediacaption') || record.get('imagecaption'),
        mediacredit: record.get('imagecredit') || record.get('mediacredit'),
      };
      if (record.get('size') || record.get('size') === 0) {
        data.size = parseFloat(record.get('size'));
      }
      record.set(data, { silent: true });
    });

    var starts = this.model.records.pluck('startParsed')
      , minDate = _.min(starts)
      , maxDate =  _.max(starts)
      , dateRange = maxDate - minDate
      , sizes = this.model.records.pluck('size')
      , maxSize = _.max(sizes)
      ;
    // set opacity - we compute opacity between 0.1 and 1 based on distance from most recent date
    var minOpacity = 0.3
      , opacityRange = 1.0 - minOpacity
      ;
    this.model.records.each(function(rec) {
      var temporalRangeLocation = (rec.get('startParsed') - minDate) / dateRange;
      rec.set({
        temporalRangeLocation: temporalRangeLocation,
        opacity: minOpacity + (opacityRange * temporalRangeLocation),
        relativeSize: parseFloat(rec.get('size')) / maxSize
      });
    });

    // Timeline will sort the entries by timestamp, and we need the order to be
    // the same for the map which runs off the model
    this.model.records.comparator = function (a, b) {
      return a.get('startParsed') - b.get('startParsed');
    };
    this.model.records.sort();
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

  _setupTimeline: function() {
    this.timeline = new recline.View.Timeline({
      model: this.model,
      el: this.$el.find('.timeline'),
      state: this.timelineState
    });

    // convert the record to a structure suitable for timeline.js
    this.timeline.convertRecord = function(record, fields) {
      if (record.get('startParsed') == 'Invalid Date') {
        if (typeof console !== "undefined" && console.warn) {
          console.warn('Failed to extract date from record');
          console.warn(record.toJSON());
        }
        return null;
      }
      try {
        var out = this._convertRecord(record, fields);
      } catch (e) {
        out = null;
      }
      if (!out) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn('Failed to extract timeline entry from record');
          console.warn(record.toJSON());
        }
        return null;
      }
      if (record.get('media')) {
        out.asset = {
          media: record.get('media'),
          caption: record.get('mediacaption'),
          credit: record.get('mediacredit'),
          thumbnail: record.get('icon')
        };
      }
      out.headline = record.get('title');
      if (record.get('url')) {
        out.headline = '<a href="%url" class="title-link" title="%url">%headline <i class="icon-external-link title-link"></i></a>'
          .replace(/%url/g, record.get('url'))
          .replace(/%headline/g, out.headline)
          ;
      }
      out.text = record.get('description');
      if (record.get('source') || record.get('sourceurl')) {
        var s = record.get('source') || record.get('sourceurl');
        if (record.get('sourceurl')) {
          s = '<a href="' + record.get('sourceurl') + '">' + s + '</a>';
        }
        out.text += '<p class="source">Source: ' + s + '</p>';
      }

      return out;
    };
    this.timeline.render();
  },

  _setupMap: function() {
    this.map = new recline.View.Map({
      model: this.model
    });
    this.$el.find('.map').append(this.map.el);

    // customize with icon column
    this.map.infobox = function(record) {
      if (record.icon !== undefined) {
        return '<img src="' + record.get('icon') + '" width="100px"> ' + record.get('title');
      }
      return record.get('title');
    };

    this.map.geoJsonLayerOptions.pointToLayer = function(feature, latlng) {
      var record = this.model.records.get(feature.properties.cid);
      var recordAttr = record.toJSON();
      var maxSize = 400;
      var radius = parseInt(Math.sqrt(maxSize * recordAttr.relativeSize));
      if (radius) {
        var marker = new L.CircleMarker(latlng, {
          radius: radius,
          fillcolor: '#fe9131',
          color: '#fe9131',
          opacity: recordAttr.opacity,
          fillOpacity: recordAttr.opacity * 0.9
        });
      } else {
        var marker = new L.Marker(latlng, {
          opacity: recordAttr.opacity
        });
      }
      var label = recordAttr.title + '<br />Date: ' + recordAttr.start;
      if (recordAttr.size) {
        label += '<br />Size: ' + recordAttr.size;
      }
      marker.bindLabel(label);

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
      // this.markers.addLayer(marker);

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

// convert dates into a format TimelineJS will handle
// TimelineJS does not document this at all so combo of read the code +
// trial and error
// Summary (AFAICt):
// Preferred: [-]yyyy[,mm,dd,hh,mm,ss]
// Supported: mm/dd/yyyy
var normalizeDate = function(date, dayfirst) {
  if (!date) {
    return '';
  }
  var out = $.trim(date);
  // HACK: support people who put '2013-08-20 in gdocs (to force gdocs to
  // not attempt to parse the date)
  if (out.length && out[0] === "'") {
    out = out.slice(1);
  }
  out = out.replace(/(\d)th/g, '$1');
  out = out.replace(/(\d)st/g, '$1');
  out = $.trim(out);
  if (out.match(/\d\d\d\d-\d\d-\d\d(T.*)?/)) {
    out = out.replace(/-/g, ',').replace('T', ',').replace(':',',');
  }
  if (out.match(/\d\d-\d\d-\d\d.*/)) {
    out = out.replace(/-/g, '/');
  }
  if (dayfirst) {
    var parts = out.match(/(\d\d)\/(\d\d)\/(\d\d.*)/);
    if (parts) {
      out = [parts[2], parts[1], parts[3]].join('/');
    }
  }
  return out;
}

})();
