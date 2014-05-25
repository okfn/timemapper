jQuery(function($) {
  var $form = $('.js-connect form')
    , $input = $('.js-connect input[name="url"]')
    ;

  $(".gdrive-import").click(onGdriveImportClick);
  $input.change(onUrlChange);
  $('.js-demo-sheet').click(onDemoSheetClick);

  // we will assume this always loads prior to anyone hitting the drive button
  // (if not we would need to double-checker picker is loaded in drive stuff)
  gapi.load('picker');
});

var getGDrivePickerOauth = function(callback) {
  // Use the API Loader script to load google.picker and gapi.auth.
  gapi.load('auth', {'callback': onAuthApiLoad});

  // The Client ID obtained from the Google Developers Console.
  var clientId = '1670524553-8saihco706hv7ilehume7g8a2fnj1ug5.apps.googleusercontent.com';
  // Scope to use to access user's photos.
  var scope = ['https://www.googleapis.com/auth/drive.readonly'];

  function onAuthApiLoad() {
    window.gapi.auth.authorize(
      {
        'client_id': clientId,
        'scope': scope,
        'immediate': false
      },
      handleAuthResult);
  }

  function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
      oauthToken = authResult.access_token;
      callback(oauthToken);
    } else {
      alert('Error authorizing: ' + authResult.error);
    }
  }
};

var gDriveOauth = null;
var onGdriveImportClick = function(e) {
  e.preventDefault();

  if (!gDriveOauth) {
    // we call ourselves again when ready
    getGDrivePickerOauth(function(oauth) {
      gDriveOauth = oauth;
      createPicker();
    });
    return;
  } else {
    createPicker();
  }

  function createPicker() {
    // The API developer key obtained from the Google Developers Console.
    var developerKey = 'AIzaSyBxklz1xd_L-whw-k2vR4pjWkgO6cqfLG0';

    // Create and render a Picker object for picking user Photos.
    var picker = new google.picker.PickerBuilder()
      .disableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .addView(google.picker.ViewId.SPREADSHEETS)
      .setOAuthToken(gDriveOauth)
      .setDeveloperKey(developerKey)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  }

  function pickerCallback(data) {
    var $input = $('.js-connect input[name="url"]');
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
