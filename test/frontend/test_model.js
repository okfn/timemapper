module("Model");

test("Create note and note list", function () {
  var indata = {
    title: 'My New Note',
    body: '## Xyz',
    tags: ['abc', 'efg']
  };
  var note = new HyperNotes.Model.Note(indata);
  equals(note.get('title'), indata.title);

  // test we can persist
  note.save();
  var outnote = new HyperNotes.Model.Note({id: note.id});
  equals(outnote.get('title'), '');
  outnote.fetch();
  // TODO: reinstate once have stub backend
  // equals(outnote.get('title'), indata.title);

  // test collection
  indata2 = {
    title: 'My New Note 2'
  }
  var notelist = new HyperNotes.Model.NoteList();
  notelist.add([note]);
  equals(notelist.length, 1);
});

test("createNoteFromSummary", function () {
  var note = null;
  HyperNotes.Model.createNoteFromSummary('^1st August 1914^', function(out) {
    note = out;
  });
  console.log(note);
  equals(note.get('start_parsed'), '1914-08-01');
});
