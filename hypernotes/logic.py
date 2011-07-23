import uuid
import pyes
import pyes.exceptions

from core import app

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

    @classmethod
    def get(cls, id_, state=None):
        conn, db = get_conn()
        out = conn.get(db, cls.__type__, id_)
        return out

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
        import pyes.query
        conn, db = get_conn()
        if not q:
            ourq = pyes.query.MatchAllQuery()
        else:
            ourq = pyes.query.StringQuery(q, default_operator='AND')
        out = conn.search(ourq, db, cls.__type__)
        return out


class User(DomainObject):
    __type__ = 'user'

class Note(DomainObject):
    __type__ = 'note'

class Thread(DomainObject):
    __type__ = 'thread'

