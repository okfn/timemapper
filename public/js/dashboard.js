jQuery(function($) {
  // handle deletion nicely
  $('.js-delete').on('click', function(e) {
    e.preventDefault();
    var $a = $(e.target)
      , $view = $a.closest('li.view-summary')
      , owner = $a.data('owner')
      , name = $a.data('name')
      , url = '/api/dataview/' + owner + '/' + name
      ;
    $.ajax({
      url: url,
      type: 'DELETE',
      beforeSend: function() {
        $view.animate({'backgroundColor':'#fb6c6c'},300);
      },
      success: function() {
        // remove element from dom
        $view.slideUp(300, function() {
          $view.remove();
        });
      },
      error: function(err) {
        alert(err);
      }
    });
  });
});

