jQuery(function($) {
  var $form = $('.js-connect form')
    , $input = $('.js-connect input[name="source"]')
    , $submit = $form.find('.js-submit')
    , $name = $('.js-connect input[name="slug"]')
    , $title = $('.js-connect input[name="title"]')
    , currentUser = TM.locals.currentUser
    ;

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
  // on entering the gdoc url we do several things ...
  // 1. Check we can access the gdoc - if not we'll set an error that will show
  // when you try to submit
    var url = recline.Backend.GDocs.getGDocsApiUrls(e.target.value).spreadsheetAPI;

    $.ajax(url, {
      type: "GET",
      success: function (data) {
        e.target.setCustomValidity("");
        var sheetTitle = data.feed.title.$t;
        var name = sheetTitle
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/--+/g, '-')
          .replace(/[^\w-]+/g, '')
          ;
        $title.val(sheetTitle);
        $name.val(name);
        $('.stage2').show('slow');
      },
      error: function (jqXHR, textStatus) {
        var error;
        if (jqXHR.status === 404) {
          error = "That URL doesn't exist";
        } else {
          error = "Spreadsheet is not accessible (via API). Have you published it?";
        }
        e.target.setCustomValidity(error);
        // setCustomValidity primes the error messages ready for form
        // submission it doesn't show them immediately.
        // so let's trigger the submit so we see the error show up immediately
        // Note you have to actually click the submit button rather than call submit event!
        $submit.click()
      }
    });
  });

  $form.submit(function(e) {
    e.preventDefault();

    // if form is good to go let's submit it
    if (e.target.checkValidity()) {
      $submit.html('<i class="icon-spinner icon-spin icon-large"></i> Saving and publishing - this should only take a moment ...');
      _createDataView(function(err, url) {
        if (err) {
          alert('Error on saving: ' + err.responseText);
        } else {
          $submit.html('All done! About to redirect to you to your new view ...').removeClass('btn-primary').addClass('btn-success'); 
          setTimeout(function() {window.location = url}, 2000);
        }
      });
    }
  });

  _createDataView = function(cb) {
    var dataview = {
      name: $name.val(),
      owner: currentUser,
      title: $title.val(),
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
    $.ajax({
      url: '/api/v1/dataview/',
      type: 'post',
      data: dataview,
      success: function() {
        cb(null, '/' + currentUser + '/' + dataview.name);
      },
      error: function(err) {
        cb(err);
      }
    });
  }

  // bit of UX to allow users to use a demo spreadsheet as a way to get started
  $('.js-demo-sheet').click(function(e) {
    e.preventDefault();

    $('html,body').animate({
      scrollTop: $('#connect').offset().top
      },
      'fast'
    );

    var url = $(e.target).data('url');
    $input.val(url);
    // highlight the input so people realize it ahs changed
    $input.stop().css("background-color", "#FFFF9C");
    $input.change();
  });
});

