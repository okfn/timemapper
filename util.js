// Convert distance in time between two dates into words (e.g. '1 month ago')
//
// All arguments other than first are optional (if ref_date omitted we automatically computed against present).
// 
// Inspired by python webhelpers.distance_of_time_in_words(from_time, to_time=0, granularity='second', round=False)
//
// Directly based (with some minor modifications) on https://github.com/layam/js_humanized_time_span - Copyright (C) 2011 by Will Tomlins. Licensed under MIT license.
exports.distanceOfTimeInWords = function(date, ref_date) {
  //Date Formats must be be ordered smallest -> largest and must end in a format with ceiling of null
  date_formats = {
    past: [
      { ceiling: 60, text: "$seconds seconds ago" },
      { ceiling: 3600, text: "$minutes minutes ago" },
      { ceiling: 86400, text: "$hours hours ago" },
      { ceiling: 2629744, text: "$days days ago" },
      { ceiling: 31556926, text: "$months months ago" },
      { ceiling: null, text: "$years years ago" }      
    ],
    future: [
      { ceiling: 60, text: "in $seconds seconds" },
      { ceiling: 3600, text: "in $minutes minutes" },
      { ceiling: 86400, text: "in $hours hours" },
      { ceiling: 2629744, text: "in $days days" },
      { ceiling: 31556926, text: "in $months months" },
      { ceiling: null, text: "in $years years" }
    ]
  };
  //Time units must be be ordered largest -> smallest
  time_units = [
    [31556926, 'years'],
    [2629744, 'months'],
    [86400, 'days'],
    [3600, 'hours'],
    [60, 'minutes'],
    [1, 'seconds']
  ];
  
  date = new Date(date);
  ref_date = ref_date ? new Date(ref_date) : new Date();
  var seconds_difference = (ref_date - date) / 1000;
  
  var tense = 'past';
  if (seconds_difference < 0) {
    tense = 'future';
    seconds_difference = 0-seconds_difference;
  }
  
  function get_format() {
    for (var i=0; i<date_formats[tense].length; i++) {
      if (date_formats[tense][i].ceiling == null || seconds_difference <= date_formats[tense][i].ceiling) {
        return date_formats[tense][i];
      }
    }
    return null;
  }
  
  function get_time_breakdown() {
    var seconds = seconds_difference;
    var breakdown = {};
    for(var i=0; i<time_units.length; i++) {
      var occurences_of_unit = Math.floor(seconds / time_units[i][0]);
      seconds = seconds - (time_units[i][0] * occurences_of_unit);
      breakdown[time_units[i][1]] = occurences_of_unit;
    }
    return breakdown;
  }

  function render_date(date_format) {
    var breakdown = get_time_breakdown();
    var time_ago_text = date_format.text.replace(/\$(\w+)/g, function() {
      return breakdown[arguments[1]];
    });
    return depluralize_time_ago_text(time_ago_text, breakdown);
  }
  
  function depluralize_time_ago_text(time_ago_text, breakdown) {
    for(var i in breakdown) {
      if (breakdown[i] == 1) {
        var regexp = new RegExp("\\b"+i+"\\b");
        time_ago_text = time_ago_text.replace(regexp, function() {
          return arguments[0].replace(/s\b/g, '');
        });
      }
    }
    return time_ago_text;
  }
          
  return render_date(get_format());
}

// Password hashing utilities
// 
// Derived from https://github.com/davidwood/node-password-hash/blob/master/lib/password-hash.js
// Which is copyright 2011 David Wood and licensed under the MIT license
var crypto = require('crypto');

var saltChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var saltCharsCount = saltChars.length;

function generateSalt(len) {
  if (typeof len != 'number' || len <= 0 || len !== parseInt(len, 10)) throw new Error('Invalid salt length');
  for (var i = 0, salt = ''; i < len; i++) {
    salt += saltChars.charAt(Math.floor(Math.random() * saltCharsCount));
  }
  return salt;
}

function generateHash(algorithm, salt, password) {
  try {
    var hash = crypto.createHmac(algorithm, salt).update(password).digest('hex');
    return algorithm + '$' + salt + '$' + hash;
  } catch (e) {
    throw new Error('Invalid message digest algorithm');
  }
}

module.exports.hashPassword = function(password, options) {
  if (typeof password != 'string') throw new Error('Invalid password');
  options || (options = {});
  options.algorithm || (options.algorithm = 'sha1');
  options.saltLength || options.saltLength == 0 || (options.saltLength = 8);
  var salt = generateSalt(options.saltLength);
  return generateHash(options.algorithm, salt, password);
};

module.exports.verifyPasswordHash = function(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  var parts = hashedPassword.split('$');
  if (parts.length != 3) return false;
  try {
    return generateHash(parts[0], parts[1], password) == hashedPassword;
  } catch (e) {}
  return false;
};

// UUID v4 Generator
// Returns a random v4 UUID of the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx, where each x is replaced with a random hexadecimal digit from 0 to f, and y is replaced with a random hexadecimal digit from 8 to b.
//
// From https://gist.github.com/1308368
exports.uuidv4 = function(a,b) {
  for(               // loop :)
    b=a='';        // b - result , a - numeric variable
    a++<36;        // 
    b+=a*51&52  // if "a" is not 9 or 14 or 19 or 24
                ?  //  return a random number or 4
       (
         a^15      // if "a" is not 15
            ?      // genetate a random number from 0 to 15
         8^Math.random()*
         (a^20?16:4)  // unless "a" is 20, in which case a random number from 8 to 11
            :
         4            //  otherwise 4
         ).toString(16)
                :
       '-'            //  in other cases (if "a" is 9,14,19,24) insert "-"
    );
  return b
};

