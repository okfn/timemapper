var express = require('express');

var config = require('./lib/config.js');
var dao = require('./lib/dao.js');
var util = require('./lib/util.js');
var authz = require('./lib/authz.js');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set("view engine", "html");
  app.register(".html", require("jqtpl").express);
  app.set("jsonp callback");
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: config.get('express:secret')}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('testuser', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('test', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  // TODO: repeats test/base.js (have to because runs independently of base.js for tests ...)
  var dbName = 'hypernotes-test-njs';
  config.set('database:name', dbName);
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

app.helpers({
  distanceOfTimeInWords: util.distanceOfTimeInWords
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
  } else if (app.settings.env === 'testuser' ) {
    var userid = 'tester';
    dao.Account.get(userid, callback);
  } else {
    var currentUser = null;
    callback(currentUser);  
  }
}

// ======================================
// Main pages
// ======================================

var routePrefixes = {
    'js': ''
  , 'css': ''
  , 'vendor': ''
  , 'img': ''
  , 'account': ''
  , 'dashboard': ''
};

app.get('/', function(req, res){
  res.render('index.html', {});
});

app.get('/about', function(req, res){
  res.render('about.html', {});
});

app.get('/search', function(req, res){
  var qryObj = {};
  var q = '';
  if (req.query.q) {
    q = req.query.q;
    var qryObj = {
      query: {
        query_string: {
          query: req.query.q
        }
      }
    };
  }
  dao.Thread.search(qryObj, null, function(queryResult) {
    res.render('search.html', {
      threads: queryResult.toJSON()
      , q: q
    });
  });
});

// ======================================
// User Accounts
// ======================================

app.get('/account', function(req, res){
  var qryObj = {};
  dao.Account.search(qryObj, function(queryResult) {
    res.render('account/list.html', {accounts: queryResult.toJSON()});
  });
});

app.get('/account/register', function(req, res){
  res.render('account/register.html', {});
});

app.post('/account/register', function(req, res){
  // TODO: check form validates (e.g. password valid etc)
  account = dao.Account.create({
      id: req.body.username
    , fullname: req.body.fullname
    , email: req.body.email
    , api_key: util.uuidv4()
  });
  account.setPassword(req.body.password);
  account.save(function() {
    req.flash('success', 'Thanks for signing-up');
    // log them in
    req.session.hypernotesIdentity = account.id;
    res.redirect('/' + account.id);
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
      res.redirect('/' + account.id);
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

app.get('/:userId', function(req, res, next) {
  var userId = req.params.userId;
  // HACK: we only want to handle threads and not other stuff
  if (userId in routePrefixes) {
    next();
    return;
  }
  var account = null;
  dao.Account.get(userId, function(acc) {
    account = acc;
    if (!account) {
      res.send('Not found', 404);
      return;
    }
    dao.Thread.getByOwner(userId, function(queryResult) {
      var threads = [];
      queryResult.results.forEach(function(item, idx) {
        threads.push(item.toTemplateJSON());
      });
      var isOwner = (req.currentUser && req.currentUser.id == userId);
      res.render('account/view.html', {
        account: account.toTemplateJSON()
        , threads: threads
        , threadCount: queryResult.total
        , isOwner: isOwner
      });
    });
  });
});

// ======================================
// Threads
// ======================================

app.get('/:userId/:threadName', function(req, res, next) {
  var userId = req.params.userId;
  // HACK: we only want to handle threads and not other stuff
  if (userId in routePrefixes) {
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
    var isOwner = (req.currentUser && req.currentUser.id == threadData.owner);
    res.render('thread/view.html', {
      thread: threadData
      , threadJSON: JSON.stringify(threadData)
      , isOwner: isOwner
    });
  });
});

app.get('/:userId/:threadName/timemap', function(req, res, next) {
  var userId = req.params.userId;
  var threadName = req.params.threadName;
  dao.Thread.getByOwnerAndName(userId, threadName, function(thread) {
    if (!thread) {
      res.send('Not found', 404);
      return;
    }
    var threadData = thread.toTemplateJSON();
    res.render('thread/timemap.html', {
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
      var msg = {
        error: 'Cannot find ' + req.params.objecttype + ' with id ' + req.params.id
        , status: 500
      };
      res.json(msg, 404);
      return;
    }
    var userId = req.currentUser ? req.currentUser.id : null;
    var isAuthz = authz.isAuthorized(userId, 'read', domainObj);
    if (isAuthz) {
      res.json(domainObj.toJSON());
    } else {
      msg = {
        error: 'Access not allowed'
        , status: 401
      };
      res.json(msg, 401);
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
  var obj = klass.create(data);
  var action = req.params.id ? 'update' : 'create';
  var userId = req.currentUser ? req.currentUser.id : null;
  var isAuthz = authz.isAuthorized(userId, action, obj);
  if (isAuthz) {
    obj.save(function(outData) {
      res.json(outData)
    });
  } else {
    msg = {
      error: 'Access not allowed'
      , status: 401
    };
    res.json(msg, 401);
  }
};

app.post('/api/v1/:objecttype', apiUpsert);
app.put('/api/v1/:objecttype/:id?', apiUpsert);
    
app.get('/api/v1/:objecttype', function(req,res) {
  var objName = req.params.objecttype[0].toUpperCase() + req.params.objecttype.slice(1); 
  var klass = dao[objName];
  var queryObj = req.body;
  var queryObj = null;
  klass.search(queryObj, req.query, function(queryResult) {
    res.json(queryResult.toJSON());
  });
});

app.listen(config.get('express:port'));
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
