var HyperNotes = HyperNotes || {};

HyperNotes.Util = function() {
  my = {};

  my.parseNoteSummary = function(text) {
    var result = {
      title: '',
      tags: [],
      location: {
      },
      start: {
      },
      end: {
      }
    };
    var ourtext = text;
    regex = / #([\w-\.]+)/;
    while(ourtext.search(regex)!=-1) {
      var out = ourtext.match(regex)[1];
      result.tags.push(out);
      ourtext = ourtext.replace(regex, '');
    }
    regex = / @([^@]+)@/;
    if(ourtext.search(regex)!=-1) {
      var out = ourtext.match(regex)[1];
      result.location.unparsed = out;
      ourtext = ourtext.replace(regex, '');
    }
    regex = / \^([^^]+)\^/;
    var tmp = [];
    while(ourtext.search(regex)!=-1) {
      var out = ourtext.match(regex)[1];
      tmp.push(out);
      ourtext = ourtext.replace(regex, '');
    }
    if (tmp.length>=1) {
      result.start.unparsed = tmp[0];
    }
    if (tmp.length>=2) {
      result.end.unparsed = tmp[1];
    }

    result.title = ourtext;
    return result;
  };

  return my;
}();

