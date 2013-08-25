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
    dao.Viz.getByOwner(userId, function(error, views) {
      account.views = views;
      cb(error, account);
    });
  });
}

