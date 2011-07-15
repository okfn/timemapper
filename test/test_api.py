import json
from hypernotes import web
from hypernotes import logic

TESTDB = 'hypernotes-test'

class TestApi(object):
    @classmethod
    def setup_class(cls):
        web.app.config['ELASTIC_SEARCH_HOST'] = '127.0.0.1:9200'
        web.app.config['ELASTIC_DB'] = TESTDB
        logic.init_db()
        cls.app = web.app.test_client()
        cls.make_fixtures()

    @classmethod
    def teardown_class(cls):
        conn, db = logic.get_conn()
        # TODO: breaks test at the moment ...
        # conn.delete_index(TESTDB)

    @classmethod
    def make_fixtures(self):
        id_ = 1
        indata = {
            'id': 1,
            'title': 'My New Note',
            'body': '## Xyz',
            'tags': ['abc', 'efg']
        }
        indatajs = json.dumps(indata)
        self.app.post('/api/v1/note', data=indatajs)

    def test_note(self):
        res = self.app.get('/api/v1/note/1')
        data = json.loads(res.data)
        print data
        assert data['_source']['body'] == '## Xyz', data

