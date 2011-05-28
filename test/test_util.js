module("Util");

var utils = HyperNotes.Util;

test("Parse note summary", function () {
  var _data = [
    {
      input: "A test note",
      output: {
        title: "A test note",
        tags: []
      }
    }
    , {
      input: "A test note #abc",
      output: {
        title: "A test note",
        tags: ['abc']
      }
    }
    , {
      input: "A test note #abc #xyz",
      output: {
        title: "A test note",
        tags: ['abc', 'xyz']
      }
    }
    , {
      input: "A test note #abc @London@",
      output: {
        title: "A test note",
        tags: ['abc'],
        location: {
          unparsed: 'London'
        }
      }
    }
    , {
      input: "@London@ #abc A test note",
      output: {
        title: "A test note",
        tags: ['abc'],
        location: {
          unparsed: 'London'
        }
      }
    }
    , {
      input: "A test note #abc ^1st January 1900^ ^1st January 2010^",
      output: {
        title: "A test note",
        tags: ['abc'],
        start: {
          unparsed: '1st January 1900'
        },
        end: {
          unparsed: '1st January 2010'
        }
      }
    }
  ];
  for(idx in _data) {
    var _exp = _data[idx].output;
    var _out = utils.parseNoteSummary(_data[idx].input);
    same(_out, _exp);
  }
});

test('lookupLocation', function() {
  // Pause the test  
  stop();  

  utils.lookupLocation('London, UK', function(data) {
    equals(data.geonameId, 2643743);
  })  

  utils.lookupLocation('London, Canada', function(data) {  
    equals(data.geonameId, 6058560);
  })  

  setTimeout(function() {  
      start();  
  }, 1000);  
});
