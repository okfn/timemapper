var recline = recline || {};
recline.Backend = recline.Backend || {};
recline.Backend.GDocs = recline.Backend.GDocs || {};

// note module is *defined* in qunit tests :-(
if (typeof module !== 'undefined' && module != null && typeof require !== 'undefined') {
  var _ = require('underscore');
  module.exports = recline;
}

(function(my) {
  my.__type__ = 'gdocs';

  var Deferred = (typeof jQuery !== "undefined" && jQuery.Deferred) || _.Deferred;

  // Fetch data from a Google Docs spreadsheet.
  //
  // For details of config options and returned values see the README in
  // the repo at https://github.com/Recline/backend.gdocs/
  my.fetch = function(config) {
    var dfd  = new Deferred(); 
    var urls = my.getGDocsApiUrls(config.url);
    var data = []

    $.ajax({
          type: "GET",  
          url: urls.worksheetAPI,
          dataType: "text",       
          success: function(response)  
          {
                data = $.csv.toArrays(response);
                var result = my.parseData(data);
                var fields = _.map(result.fields, function(fieldId) {
                  return {id: fieldId};
                });
                var metadata = _.extend(urls, {
                      title: response.spreadsheetTitle +" - "+ result.worksheetTitle,
                      spreadsheetTitle: response.spreadsheetTitle,
                      worksheetTitle  : result.worksheetTitle
                })
                dfd.resolve({
                  metadata: metadata,
                  records       : result.records,
                  fields        : fields,
                  useMemoryStore: true
                });

          }   
        });


                return dfd.promise();
  };

  // ## parseData
  //
  // Parse data from Google Docs API into a reasonable form
  //
  // :options: (optional) optional argument dictionary:
  // columnsToUse: list of columns to use (specified by field names)
  // colTypes: dictionary (with column names as keys) specifying types (e.g. range, percent for use in conversion).
  // :return: tabular data object (hash with keys: field and data).
  // 
  // Issues: seems google docs return columns in rows in random order and not even sure whether consistent across rows.
  my.parseData = function(gdocsWorksheet, options) {
    var options  = options || {};
    var colTypes = options.colTypes || {};
    var results = {
      fields : [],
      records: []
    };
    var entries = gdocsWorksheet;
    var key;
    var colName;
    // percentage values (e.g. 23.3%)
    var rep = /^([\d\.\-]+)\%$/;

    for(key of entries[0]) {
      results.fields.push(key.toLowerCase());
    }
    
    // converts non numberical values that should be numerical (22.3%[string] -> 0.223[float])
    results.records = _.map(entries.slice(1), function(entry) {
      var row = {};

      _.each(results.fields, function(col, i) {
        var value = entry[i];
        var num;
 
        // TODO cover this part of code with test
        // TODO use the regexp only once
        // if labelled as % and value contains %, convert
        if(colTypes[col] === 'percent' && rep.test(value)) {
          num   = rep.exec(value)[1];
          value = parseFloat(num) / 100;
        }

        row[col] = value;
      });

      return row;
    });

    results.worksheetTitle = '';
    return results;
  };

  // Convenience function to get GDocs JSON API Url from standard URL
  // 
  // @param url: url to gdoc to the GDoc API (or just the key/id for the Google Doc)
  my.getGDocsApiUrls = function(url, worksheetIndex) {
    console.log('THE URL', url)
    let url_without_csv = /https:\/\/docs.google.com\/spreadsheets\/d\/(\w+)$/g
    if (url.indexOf('/edit') > 0) {
        url = url.split('/edit')[0] + '/pub?output=csv'
    } else if (url.indexOf('key=') > 0) {
        let doc_id = url.split('key=')[1].split('&')[0]
        if (doc_id.indexOf('#')) {
            doc_id = doc_id.split('#')[0]
        }
        url = `https://docs.google.com/spreadsheets/d/${doc_id}/pub?output=csv`
    } else if (url_without_csv.test(url)) {
        let back_slash = '/'
        if (url[url.length - 1] == '/') {
            back_slash = ''             
        }
        url = url + back_slash + 'pub?output=csv'
    }
    console.log('NEW URL', url)
    return {
      worksheetAPI: url,
      spreadsheetAPI: url,
      spreadsheetKey: '',
      worksheetIndex: 0
    };
  };
}(recline.Backend.GDocs));

