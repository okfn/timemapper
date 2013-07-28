jQuery(function($) {
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

