from hypernotes import web
from hypernotes import logic

TESTDB = 'hypernotes-test'
web.app.config['ELASTIC_SEARCH_HOST'] = '127.0.0.1:9200'
web.app.config['ELASTIC_DB'] = TESTDB

logic.init_db()

def clean_db():
    conn, db = logic.get_conn()
    conn.delete_index(db)
    conn.create_index(db)

