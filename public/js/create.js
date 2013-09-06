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
    $('.stage2').show('slow');
    // NB: setCustomValidity primes the error messages ready for form submission,
    //     it doesn't show them immediately.
    var url = recline.Backend.GDocs.getGDocsApiUrls(e.target.value).spreadsheetAPI;

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

  $('.connect form').submit(function(e) {
    // var apiurl = recline.Backend.GDocs.getGDocsApiUrls(url).spreadsheetAPI;
    e.preventDefault();
    // TODO: notify user we are doing something
    // TODO: get title, make slug and let user edit

    // jQuery.getJSON(url, function (d) {
    //  console.log(d);
    //  var title = d.feed.title.$t;
    // });

    _createDataView();
  });

  _createDataView = function() {
    var currentUser = $('.username').text();
    var dataview = {
      name: $('input[name="slug"]').val(),
      owner: currentUser,
      title: $('input[name="title"]').val(),
      licenses: [{
        id: 'cc-by',
        name: 'Creative Commons Attribution',
        version: '3.0',
        url: 'http://creativecommons.org/licenses/by/3.0/'
      }],
      resources: [{
        backend: 'gdocs',
        url: $input.val()
      }]
    };
    // TODO: some validation?
    $.ajax({
      url: '/api/v1/account/' + currentUser + '/dataview/',
      type: 'post',
      data: dataview,
      success: function() {
        // TODO: notify success and then redirect ...
      },
      error: function(err) {
        alert('Error on saving: ' + err.responseText);
      }
    });
  }

  // bit of UX to allow users to use a demo spreadsheet as a way to get started
  $('.js-demo-sheet').click(function(e) {
    e.preventDefault();
    var url = $(e.target).data('url');
    $input.val(url);
    // highlight the input so people realize it ahs changed
    $input.stop().css("background-color", "#FFFF9C");
  });
});

