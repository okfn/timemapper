module("Model");

test("Create note", function () {
  var indata = {
    label: 'My New Note',
    body: '## Xyz',
    tags: ['abc', 'efg']
  };
  var pkg = new HyperNote.Model.Note(indata);

  equals(pkg.get('label'), indata.label);
});
