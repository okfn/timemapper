var AUTHORIZATION = {
    'account': {
      anonymous: ['create', 'read']
    , user: ['read']
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

exports.isAuthorized = function(accountId, action, object) {
  var accountRole = '';
  if (accountId === null) {
    accountRole = 'anonymous';
  } else if (
      (object.__type__ === 'account' && object.id === accountId)
      ||
      (accountId === object.getattr('owner'))
    ) {
    accountRole = 'owner';
  } else {
    accountRole = 'user';
  }
  var section = AUTHORIZATION[object.__type__][accountRole];
  if (section.indexOf(action) != -1) {
    return true;
  } else {
    return false;
  }
};

