var express = require('express')
  , nunjucks = require('nunjucks')
  , config = require('./lib/config.js')
  , passport = require('passport-twitter')
  , passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy

  , dao = require('./lib/dao.js')
  , util = require('./lib/util.js')
  , authz = require('./lib/authz.js')
  , routes = require('./routes/index.js')
  ;

var app = module.exports = express();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: config.get('express:secret')}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
env.express(app);

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

// app.dynamicHelpers({
//   messages: function(req,res) {
//     return getFlashMessages(req);
//   }
// });
// 
// app.helpers({
//   distanceOfTimeInWords: util.distanceOfTimeInWords
// });

app.all('*', function(req, res, next) {
  function setup(req) {
    app.locals.currentUser = req.user ? req.user.toJSON() : null; 
    next();
  }
  if (config.get('test:testing') === true && config.get('test:user')) {
    var userid = config.get('test:user');
    var acc = dao.Account.create({id: userid});
    acc.fetch(function() {
      req.user = acc;
      setup(req);
    });
  } else {
    setup(req);
  }
});

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
  if (req.user) {
    routes.dashboard(req, res);
  } else {
    res.render('index.html', {title: 'Home'});
  }
});

app.get('/create', function(req, res) {
  res.render('create.html', {title: 'TimeMapper'});
});

app.post('/create', function(req, res) {
  var url = req.body.source;
  var name = 'xyz';
  var userid = req.user ? req.user.id : 'tester';
  var viz = dao.Viz.create({
    name: name,
    title: 'xyz',
    owner: userid,
    resources: [{
      backend: 'gdocs',
      url: url,
      sources: [{
        type: 'gdocs',
        web: url
      }]
    }]
  });
  viz.save(function(err) {
    console.log(err);
    res.redirect('/' + userid + '/' + name);
  });
});

// ======================================
// User Accounts
// ======================================

app.get('/account/login', passport.authenticate('twitter'));

app.get('/account/auth/twitter/callback', 
      passport.authenticate('twitter', { successRedirect: '/',
                                             failureRedirect: '/login' }));

var siginOrRegister = function(token, tokenSecret, profile, done) {
  // twitter does not provide access to user email so this is always null :-(
  var email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
  var photo = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
  account = dao.Account.create({
    id: profile.username,
    fullname: profile.displayName,
    // hackish
    description: profile._json.description,
    provider: 'twitter',
    email: email,
    image: photo,
    manifest_version: 1 });
  account.save(function(err) {
    if (err) { return done(err); }
    // req.flash('success', 'Thanks for signing-up');
    done(null, account);
  });
};

passport.use(new TwitterStrategy({
    consumerKey: config.get('twitter:key'),
    consumerSecret: config.get('twitter:secret'),
    callbackURL: config.get('twitter:url')
  },
  siginOrRegister
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  var account = dao.Account.create({
    id: id
  });
  account.fetch(function(err, user) {
    done(err, account);
  });
});

app.get('/account/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// ======================================
// User Pages and Dashboards
// ======================================

app.get('/:userId', routes.userShow);

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
  var viz = dao.Viz.create({owner: userId, name: threadName});
  viz.fetch(function(error) {
    if (error) {
      res.send('Not found ' + error.message, 404);
      return;
    }
    var threadData = viz.toTemplateJSON();
    var isOwner = (req.currentUser && req.currentUser.id == threadData.owner);
    res.render('viz/timemap.html', {
      title: threadData.title
      , viz: threadData
      , vizJSON: JSON.stringify(threadData)
      , isOwner: isOwner
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

app.listen(config.get('express:port'), function() {
  console.log("Express server listening on port " + config.get('express:port') + " in mode " + app.get('env'));
});
