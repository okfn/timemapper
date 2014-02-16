var logic = require('./lib/logic')
  , config = require('./lib/config.js')
  , app = require('./app').app
  ;

// ======================================
// Boot the Server
// ======================================

logic.ensureAnonAccountExists(function(err) {
  if (err) {
    console.error(err);
    throw err;
  }
  app.listen(config.get('express:port'), function() {
    console.log("Express server listening on port " + config.get('express:port') + " in mode " + app.get('env'));
  });
});

