jQuery(function($) {
  $('form.js-load-url').submit(function(e) {
    e.preventDefault();
    var $form = $(e.target);
    var source = $form.find('input[name="source"]').val();
    var path = window.location.href.replace('/index.html', '');
    if (path[path.length - 1] != '/') {
      path += '/';
    }
    path +=  'view/?url=' + encodeURIComponent(source);
    window.location.href = path;
  });

  var $input = $('input[name="source"]');
  $(".gdrive-import").click(function (e) {
    e.preventDefault();
    
    var picker = new google.picker.PickerBuilder()
      .disableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .addView(google.picker.ViewId.SPREADSHEETS)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);

    function pickerCallback(data) {
      var url = 'nothing';
      if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
        var doc = data[google.picker.Response.DOCUMENTS][0];
        url = doc[google.picker.Document.URL];
        $input.val(url).trigger("change");
      }
    }
  });

  $input.change(function (e) {

    // NB: setCustomValidity primes the error messages ready for form submission,
    //     it doesn't show them immediately.
    var url = recline.Backend.GDocs.getGDocsAPIUrls(e.target.value).spreadsheet;

    $.ajax(url, {
      type: "HEAD",
      success: function (jqXHR) {
        e.target.setCustomValidity("");
      },
      error: function (jqXHR, textStatus) {
        var error;
        if (jqXHR.status === 404) {
          error = "That URL doesn't exist";
        } else {
          error = "We could not retrieve this URL. Have you published this spreadsheet?";
        }
        e.target.setCustomValidity(error);
      }
    });
  });

});

// Backwards compatability (pre Feb 2013)
// Redirect from old timeliner urls to new ones
if (window.location.search) {
  var path = window.location.href.replace(/\/index.html/, '');
  path = path.replace(/\?.*/g, '');
  if (path[path.length - 1] != '/') {
    path += '/';
  }
  path +=  'view/' + window.location.search;
  window.location.href = path;
}

