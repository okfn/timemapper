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
    // https://docs.google.com/spreadsheet/ccc?key=XXXX#gid=YYY
    var regex = /.*spreadsheet\/ccc\?.*key=([^#?&+]+)[^#]*(#gid=([\d]+).*)?/,
      // new style is https://docs.google.com/a/okfn.org/spreadsheets/d/16DayFB.../edit#gid=910481729
      regex2 = /.*spreadsheets\/d\/([^\/]+)\/edit(#gid=([\d]+).*)?/
      matches = url.match(regex),
      matches2 = url.match(regex2)
      ;
    
    if (!!matches) {
        key = matches[1];
        // the gid in url is 0-based and feed url is 1-based
        worksheet = parseInt(matches[3]) + 1;
        if (isNaN(worksheet)) {
          worksheet = 1;
        }
    }
    else if (!!matches2) {
      key = matches2[1];
      // force worksheet index always to be 1 since it appears API worksheet
      // index does not follow gid (is always just index of worksheet)
      // e.g. see this worksheet https://docs.google.com/a/okfn.org/spreadsheets/d/1S8NhNf6KsrAzdaY_epSlyc2pHXRLV-z6Ty2jL9hM5A4/edit#gid=406828788
      // gid are large numbers but for actual access use worksheet index 1 and 2 ...
      // https://spreadsheets.google.com/feeds/list/1S8NhNf6KsrAzdaY_epSlyc2pHXRLV-z6Ty2jL9hM5A4/2/public/values?alt=json
      // answer here is that clients will always have to explicitly set worksheet index if they want anything other than first sheet
      // worksheet = parseInt(matches2[3]);
      worksheet = 1;
      if (isNaN(worksheet)) {
        worksheet = 1;
      }
    }
    else if (url.indexOf('spreadsheets.google.com/feeds') != -1) {
        // we assume that it's one of the feeds urls
        key = url.split('/')[5];
        // by default then, take first worksheet
        worksheet = 1;
    } else {
      key = url;
      worksheet = 1;
    }
    worksheet = (worksheetIndex || worksheetIndex ===0) ? worksheetIndex : worksheet;

    return {
      worksheetAPI: url,
      spreadsheetAPI: url,
      spreadsheetKey: key,
      worksheetIndex: worksheet
    };
  };
}(recline.Backend.GDocs));

