var HyperNotes = HyperNotes || {};

(function($) {
  var defaultConfig = {
    'endpoint': 'http://localhost:5000/'
  };

  HyperNotes.Environ = function(customConfig) {
    var my = {};
    my.config = customConfig || defaultConfig;
    return my;
  }
}(jQuery));
