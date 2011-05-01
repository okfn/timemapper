module("Model");

// use local test storge 
HyperNotes.Model.Note.localStorage = new Store('test-note');

test("Create note and note list", function () {
  var indata = {
    label: 'My New Note',
    body: '## Xyz',
    tags: ['abc', 'efg']
  };
  var note = new HyperNotes.Model.Note(indata);
  equals(note.get('label'), indata.label);

  // test we can persist
  note.save();
  var outnote = new HyperNotes.Model.Note({id: note.id});
  equals(outnote.get('label'), null);
  outnote.fetch();
  equals(outnote.get('label'), indata.label);

  // test collection
  indata2 = {
    label: 'My New Note 2'
  }
  var notelist = new HyperNotes.Model.NoteList();
  notelist.add([note]);
  notelist.create(indata2);
  equals(notelist.length, 2);
});

