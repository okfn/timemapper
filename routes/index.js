var config = require('../lib/config.js')
  , dao = require('../lib/dao.js')
  , util = require('../lib/util.js')
  ;

exports.userShow = function(req, res) {
  var userId = req.params.userId;
  var account = dao.Account.create({id: userId});
  account.fetch(function(error) {
    if (error) {
      res.send('Not found', 404);
      return;
    }
    var isOwner = (req.currentUser && req.currentUser.id == userId);
    dao.Viz.getByOwner(userId, function(error, views) {
      res.render('account/view.html', {
        account: account.toTemplateJSON()
        , views: views 
        , isOwner: isOwner
      });
    });
  });
};

