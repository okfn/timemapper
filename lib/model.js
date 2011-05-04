var HyperNotes = HyperNotes || {};

HyperNotes.Model = function($) {
  var my = {};

  // Note objects
  my.Note = Backbone.Model.extend({
    localStorage: new Store("note")
  });

  my.NoteList = Backbone.Collection.extend({
    model: my.Note,
    localStorage: new Store("note")
  });

  return my;
}(jQuery);
