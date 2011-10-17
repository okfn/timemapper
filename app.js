var express = require('express');

var dao = require('./dao.js');

var app = module.exports = express.createServer();

var indexName = 'hypernotes';

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set("view engine", "html");
  app.register(".html", require("jqtpl").express);
  app.set("jsonp callback");
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

// ======================================
// Pre-preparation for views
// ======================================

function getFlashMessages(req) {
  var messages = req.flash()
    , types = Object.keys(messages)
    , len = types.length
    , result = [];
  
  for (var i = 0; i < len; ++i) {
    var type = types[i]
      , msgs = messages[type];
    for (var j = 0, l = msgs.length; j < l; ++j) {
      var msg = msgs[j];
      result.push({
          category: type
        , text: msg
      });
    }
  }
  return result;
}

app.dynamicHelpers({
  messages: function(req,res) {
    return getFlashMessages(req);
  }
});

app.all('*', function(req, res, next) {
  var currentUser = null;
  setCurrentUser(req, function(currentUser) {
    res.local('currentUser', currentUser);
    req.currentUser = currentUser;
    next();
  });
});

function setCurrentUser(req, callback) {
  if (req.session && req.session.hypernotesIdentity) {
    var userid = req.session.hypernotesIdentity;
    dao.Account.get(userid, callback);
  } else {
    var currentUser = null;
    callback(currentUser);  
  }
}

// ======================================
// Main pages
// ======================================

app.get('/', function(req, res){
  if (req.currentUser) {
    res.send('');
  } else {
    res.render('index.html', {});
  }
});


// ======================================
// User Accounts
// ======================================

app.get('/account/register', function(req, res){
  res.render('account/register.html', {});
});

app.post('/account/register', function(req, res){
  // TODO: check form validates (e.g. password valid etc)
  account = dao.Account.create({
      id: req.body.username
    , email: req.body.email
  });
  account.setPassword(req.body.password);
  account.save(function() {
    req.flash('success', 'Thanks for signing-up');
    // log them in
    req.session.hypernotesIdentity = account.id;
    res.redirect('/');
  });
});

app.get('/account/login', function(req, res){
  res.render('account/login.html', {});
});

app.post('/account/login', function(req, res){
  var userid = req.body.username;
  var password = req.body.password;
  dao.Account.get(userid, function(account) {
    if (account && account.checkPassword(password)) {
      req.flash('success', 'Welcome, you are now logged in.');
      req.session.hypernotesIdentity = account.id;
      res.redirect('/');
    } else {
      req.flash('error', 'Bad username or password');
      res.render('account/login.html', {});
    }
  });
});

app.get('/account/logout', function(req, res){
  delete req.session.hypernotesIdentity;
  res.redirect('/');
});

// ======================================
// Threads
// ======================================

app.get('/:userId/:threadName', function(req, res, next) {
  var userId = req.params.userId;
  // HACK: we only want to handle threads and not other stuff
  if (userId in {
      'js': ''
    , 'css': ''
    , 'vendor': ''
    , 'img': ''
    , 'account': ''
    , 'dashboard': ''
    }) {
    next();
    return;
  }
  var threadName = req.params.threadName;
  dao.Thread.getByOwnerAndName(userId, threadName, function(thread) {
    if (!thread) {
      res.send('Not found', 404);
      return;
    }
    var threadData = thread.toTemplateJSON();
    res.render('thread/view.html', {
      thread: threadData
      , threadJSON: JSON.stringify(threadData)
    });
  });
});

// ======================================
// API
// ======================================

app.get('/api/v1/:objecttype/:id', function(req, res, next) {
  var objName = req.params.objecttype[0].toUpperCase() + req.params.objecttype.slice(1); 
  var klass = dao[objName];
  klass.get(req.params.id, function(domainObj) {
    if (domainObj===null) {
      // next(new Error('Cannot find ' + req.params.objecttype + ' with id ' + req.params.id));
      var msg = 'Cannot find ' + req.params.objecttype + ' with id ' + req.params.id;
      res.send(msg, 404);
    } else {
      res.send(domainObj.toJSON());
    }
  })
});

var apiUpsert = function(req, res) {
    var objName = req.params.objecttype[0].toUpperCase() + req.params.objecttype.slice(1); 
    var klass = dao[objName];
    var data = req.body;
    if (req.params.id) {
      data.id = req.params.id;
    }
    klass.upsert(data, function(outData) {
      res.send(outData)
    });
};

app.post('/api/v1/:objecttype', apiUpsert);
app.put('/api/v1/:objecttype/:id?', apiUpsert);
    
app.get('/api/v1/:objecttype', function(req,res) {
  var objName = req.params.objecttype[0].toUpperCase() + req.params.objecttype.slice(1); 
  var klass = dao[objName];
  q = req.params.q;
  qryObj = {
  }
  klass.search(qryObj, function(queryResult) {
    res.send(queryResult.toJSON());
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
