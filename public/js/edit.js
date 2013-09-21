jQuery(function($) {
  var $form = $('.js-dataview-edit')
    ;

  $form.submit(onFormSubmit);
});

function onFormSubmit(e) {
  e.preventDefault();
  var $submit = $('.js-submit')
    ;

  // if form is good to go let's submit it
  if (e.target.checkValidity()) {
    $submit.html('<i class="icon-spinner icon-spin icon-large"></i> Updating - this should only take a moment ...');
    doDataViewUpdate(function(err, url) {
      if (err) {
        alert('Error on saving: ' + err.responseText);
      } else {
        $submit.html('Updated Successfully!').removeClass('btn-primary').addClass('btn-success'); 
        setTimeout(function() {
          // restore original message
          $submit.html('Update &raquo;').removeClass('btn-success').addClass('btn-primary'); 
        }, 2000);
      }
    });
  }
}

var doDataViewUpdate = function(cb) {
  var $form = $('.js-dataview-edit')
    ;
  var formData = _.object(_.map($form.serializeArray(), function(item) {
    return [ item.name, item.value ];
  }));
  function getFormAttr(attr) {
    return formData[attr];
  }
  // defined in main template - passed in from backend
  // dataViewData
  var dataview = _.extend(dataViewData, {
    title: getFormAttr('title'),
    resources: [
      _.extend({}, dataViewData.resources[0], {
        backend: 'gdocs',
        url: getFormAttr('url')
      })
    ],
    tmconfig: _.extend({}, dataViewData.tmconfig, {
      dayfirst: Boolean(formData.dayfirst)
    })
  });
  $.ajax({
    url: '/api/v1/dataview/' + dataview.owner + '/' + dataview.name,
    type: 'post',
    data: dataview,
    success: function() {
      cb(null)
    },
    error: function(err) {
      cb(err);
    }
  });
}
