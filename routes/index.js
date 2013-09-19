var config = require('../lib/config.js')
  , dao = require('../lib/dao.js')
  , util = require('../lib/util.js')
  ;

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

exports.create = function(req, res) {
  res.render('create.html', {title: 'Create'});
}

// ======================================
// User Pages and Dashboards
// ======================================

exports.userShow = function(req, res) {
  var userId = req.params.userId;
  var account = dao.Account.create({id: userId});
  getUserInfoFull(userId, function(error, account) {
    if (error) {
      res.send('Not found', 404);
      return;
    }
    var isOwner = (req.currentUser && req.currentUser.id == userId);
    res.render('account/view.html', {
      account: account.toTemplateJSON()
      , views: account.views 
      , isOwner: isOwner
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
    res.render('viz/timemap.html', {
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
