var AUTHORIZATION = {
    'account': {
      anonymous: ['create']
    , user: []
    , owner: ['read', 'update', 'delete']
  }
  , 'note': {
      anonymous: ['read']
    , user: ['read']
    , owner: ['create', 'read', 'update', 'delete']

  }
  ,'thread': {
      anonymous: ['read']
    , user: ['read']
    , owner: ['create', 'read', 'update', 'delete']
  }
};

exports.isAuthorized = function(userId, action, object) {
  var userRole = '';
  if (userId === null) {
    userRole = 'anonymous';
  } else if (userId === object.getattr('owner')) {
    userRole = 'owner';
  } else {
    userRole = 'user';
  }
  var section = AUTHORIZATION[object.__type__][userRole];
  if (section.indexOf(action) != -1) {
    return true;
  } else {
    return false;
  }
};

