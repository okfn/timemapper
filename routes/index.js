var config = require('../lib/config.js')
  , dao = require('../lib/dao.js')
  , logic = require('../lib/logic')
  , util = require('../lib/util.js')
  ;

exports.create = function(req, res) {
  // just a stub for form
  var dataview = {
    tmconfig: {
      // default
      viewtype: 'timemap'
    }
  };
  res.render('dataview/create.html', {
    title: 'Create',
    dataview: dataview
  });
}

exports.createPost = function(req, res) {
  var data = req.body;
  // set the owner
  // TODO: anon case
  if (!req.user) {
    res.send(401, 'You are not logged in');
    return;
  }
  data.owner = req.user.id; 
  logic.createDataView(data, req.user, function(err, out) {
    if (err) {
      res.send(err.code, err.message);
    } else {
      // req.flash('Data View Created');
      res.redirect(urlFor(data.owner, data.name));
    }
  });
}

function urlFor(owner, dataView) {
  return '/' + [
    owner,
    dataView
    ].join('/')
}

exports.preview = function(req, res) {
  var threadData = {
    name: 'whatever-you-want',
    title: req.query.title || 'Untitled',
    owner: req.query.owner || 'Anonymous',
    resources: [
      {
        url: req.query.url,
        backend: 'gdocs'
      }
    ],
    tmconfig: {
      dayfirst: req.query.dayfirst,
      startfrom: req.query.startfrom,
      type: req.query.type || 'timemap'
    }
  };
  var isOwner = false;
  res.render('dataview/timemap.html', {
      title: threadData.title
    , embed: (req.query.embed !== undefined)
    , viz: threadData
    , vizJSON: JSON.stringify(threadData)
    , isOwner: isOwner
  });
}

// ======================================
// User Pages and Dashboards
// ======================================

exports.dashboard = function(req, res) {
  var userId = req.user.id;
  getUserInfoFull(req.user.id, function(error, account) {
    if (error) {
      res.send('Not found', 404);
      return;
    }
    res.render('dashboard.html', {
      account: account.toJSON(),
      views: account.views
    });
  });
};

exports.userShow = function(req, res) {
  var userId = req.params.userId;
  var account = dao.Account.create({id: userId});
  getUserInfoFull(userId, function(error, account) {
    if (error) {
      res.send('Not found', 404);
      return;
    }
    var isOwner = (req.currentUser && req.currentUser.id == userId);
    var accountJson = account.toTemplateJSON();
    accountJson.createdNice = new Date(accountJson._created).toDateString();
    res.render('account/view.html', {
        account: accountJson
      , views: account.views 
      , isOwner: isOwner
      , bodyclass: 'account'
    });
  });
};

function getUserInfoFull(userId, cb) {
  var account = dao.Account.create({id: userId});
  account.fetch(function(error) {
    if (error) {
      cb(error);
      return;
    }
    dao.DataView.getByOwner(userId, function(error, views) {
      account.views = views;
      cb(error, account);
    });
  });
}

// ======================================
// Data Views
// ======================================

var routePrefixes = {
    'js': ''
  , 'css': ''
  , 'vendor': ''
  , 'img': ''
  , 'account': ''
  , 'dashboard': ''
};

exports.timeMap = function(req, res, next) {
  var userId = req.params.userId;
  // HACK: we only want to handle threads and not other stuff
  if (userId in routePrefixes) {
    next();
    return;
  }
  var threadName = req.params.threadName;
  var viz = dao.DataView.create({owner: userId, name: threadName});
  viz.fetch(function(error) {
    if (error) {
      res.send('Not found ' + error.message, 404);
      return;
    }
    var threadData = viz.toTemplateJSON();
    var isOwner = (req.user && req.user.id == threadData.owner);
    res.render('dataview/timemap.html', {
        title: threadData.title
      , permalink: 'http://timemapper.okfnlabs.org/' + threadData.owner + '/' + threadData.name
      , authorLink: 'http://timemapper.okfnlabs.org/' + threadData.owner
      , embed: (req.query.embed !== undefined)
      , viz: threadData
      , vizJSON: JSON.stringify(threadData)
      , isOwner: isOwner
    });
  });
}

exports.dataViewEdit = function(req, res) {
  var userId = req.params.userId;
  var threadName = req.params.threadName;
  var viz = dao.DataView.create({owner: userId, name: threadName});
  viz.fetch(function(error) {
    if (error) {
      res.send('Not found ' + error.message, 404);
      return;
    }
    var dataview = viz.toTemplateJSON();
    res.render('dataview/edit.html', {
        dataview: dataview
      , dataviewJson: JSON.stringify(viz.toJSON())
    });
  });
}
