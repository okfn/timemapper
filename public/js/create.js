jQuery(function($) {
  var $form = $('.js-connect form')
    , $input = $('.js-connect input[name="url"]')
    ;

  $(".gdrive-import").click(onGdriveImportClick);
  $input.change(onUrlChange);
  $('.js-demo-sheet').click(onDemoSheetClick);
});

var onGdriveImportClick = function(e) {
  var $input = $('.js-connect input[name="url"]');
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
}

var onUrlChange = function(e) {
  var $form = $('.js-connect form')
    , $submit = $form.find('.js-submit')
    , $name = $('.js-connect input[name="name"]')
    , $title = $('.js-connect input[name="title"]')
    ;
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
}

// bit of UX to allow users to use a demo spreadsheet as a way to get started
var onDemoSheetClick = function(e) {
  e.preventDefault();
  var $input = $('.js-connect input[name="url"]')

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
}
