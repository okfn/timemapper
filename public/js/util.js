var HyperNotes = HyperNotes || {};

HyperNotes.Util = function() {
  my = {};

  // Parse a summary to extract title, tags, location and start and end
  my.parseNoteSummary = function(text) {
    var result = {
      title: '',
      tags: []
    };
    var ourtext = text;
    regex = / #([\w-\.]+)/;
    while(ourtext.search(regex)!=-1) {
      var out = ourtext.match(regex)[1];
      result.tags.push(out);
      ourtext = ourtext.replace(regex, '');
    }
    regex = / ?@([^@]+)@/;
    if(ourtext.search(regex)!=-1) {
      var out = ourtext.match(regex)[1];
      result['location'] = { unparsed: out };
      ourtext = ourtext.replace(regex, '');
    }
    regex = / ?\^([^^]+)\^/;
    var tmp = [];
    while(ourtext.search(regex)!=-1) {
      var out = ourtext.match(regex)[1];
      tmp.push(out);
      ourtext = ourtext.replace(regex, '');
    }
    if (tmp.length>=1) {
      result['start'] = tmp[0];
    }
    if (tmp.length>=2) {
      result['end'] = tmp[1];
    }

    result.title = $.trim(ourtext);
    return result;
  };

  // Parse a date into ISO 8601 format (yyyy-mm-dd) using datejs library
  // 
  // @return: parsed date in yyyy-mm-dd format or null if could not parse.
  //
  // TODO: at the moment will always provide mm and dd even if not in input
  my.parseDate = function(date) {
    if (date) {
      var parsedDate = Date.parse(date);
      if (parsedDate) {
        return parsedDate.toString('yyyy-MM-dd');
      }
    }
  }

  my.lookupLocation = function(name, callback) {
    var geonamesApi = 'http://api.geonames.org/searchJSON?maxRows=1&username=okfn&q=';
    var queryUrl = geonamesApi + name;
    $.getJSON(queryUrl, function(data) {
      // strip off stuff
      if (data.totalResultsCount >= 1) {
        var result = data.geonames[0];
      } else {
        // TODO: raise error?
      }
      callback(result);
    });
  };

  return my;
}();

