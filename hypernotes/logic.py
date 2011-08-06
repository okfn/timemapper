import uuid
import pyes
import pyes.query
import pyes.exceptions
from flaskext.login import UserMixin

from hypernotes.core import app, login_manager

def init_db():
    conn, db = get_conn()
    try:
        conn.create_index(db)
    except pyes.exceptions.IndexAlreadyExistsException:
        pass

def get_conn():
    host = app.config['ELASTIC_SEARCH_HOST']
    db_name = app.config['ELASTIC_DB']
    conn = pyes.ES([host])
    return conn, db_name


class DomainObject(object):
    __type__ = None

    def __init__(self, dict_):
        self._data = dict(dict_)

    @property
    def id(self):
        return self._data.get('id', None)

    @classmethod
    def get(cls, id_, state=None):
        conn, db = get_conn()
        try:
            out = conn.get(db, cls.__type__, id_)
            return out['_source']
        except pyes.exceptions.ElasticSearchException, inst:
            if inst.status == 404:
                return None
            else:
                raise

    @classmethod
    def upsert(cls, data, state=None):
        conn, db = get_conn()
        if 'id' in data:
            id_ = data['id']
        else:
            id_ = uuid.uuid4().hex
            data['id'] = id_
        conn.index(data, db, cls.__type__, id_)
        conn.refresh()
        return id_
    
    @classmethod
    def query(cls, q, state=None):
        conn, db = get_conn()
        if not q:
            ourq = pyes.query.MatchAllQuery()
        else:
            ourq = pyes.query.StringQuery(q, default_operator='AND')
        out = conn.search(ourq, db, cls.__type__)
        return out


class User(DomainObject, UserMixin):
    __type__ = 'account'

def get_user(userid):
    data = User.get(userid)
    if data:
        return User(data)

# the decorator appears to kill the function for normal usage ...
@login_manager.user_loader
def load_user_for_login_manager(userid):
    return get_user(userid)

class Note(DomainObject):
    __type__ = 'note'

class Thread(DomainObject):
    __type__ = 'thread'

    @classmethod
    def by_user(cls, userid, threadname):
        conn, db = get_conn()
        q1 = pyes.query.TermQuery('owner', userid)
        q2 = pyes.query.TermQuery('name', threadname)
        q = pyes.query.BoolQuery(must=[q1,q2])
        out = conn.search(q, db, cls.__type__)
        if out['hits']['total'] > 0:
            return out['hits']['hits'][0]['_source']
        else:
            return None

