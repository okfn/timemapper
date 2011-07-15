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

def note_get(id_, current_user=None):
    conn, db = get_conn()
    out = conn.get(db, 'note', id_)
    return out

def note_upsert(id_, data, current_user=None):
    conn, db = get_conn()
    conn.index(data, db, 'note', id_)

class Note(object):
    def __init__(self):
        self._data = {}


