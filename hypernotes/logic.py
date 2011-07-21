from core import app
import pyes
import pyes.exceptions

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
    def upsert(cls, id_, data, state=None):
        conn, db = get_conn()
        conn.index(data, db, cls.__type__, id_)


class User(DomainObject):
    __type__ = 'user'

class Note(DomainObject):
    __type__ = 'note'

class Thread(DomainObject):
    __type__ = 'thread'

