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
        conn.delete_index(TESTDB)

    @classmethod
    def make_fixtures(self):
        self.username = u'tester'
        inuser = {
            'id': self.username,
            'fullname': 'The Tester'
            }
        indata = {
            'title': 'My New Note',
            'body': '## Xyz',
            'tags': ['abc', 'efg'],
            'owner': self.username
        }
        self.app.post('/api/v1/user', data=json.dumps(inuser))
        out = self.app.post('/api/v1/note', data=json.dumps(indata))
        self.note_id = json.loads(out.data)['id']
        self.thread_name = 'default'
        inthread = {
            'name': self.thread_name,
            'title': 'My Test Thread',
            'description': 'None at the moment',
            'notes': [ self.note_id ],
            'owner': self.username
            }
        out = self.app.post('/api/v1/thread', data=json.dumps(inthread))
        self.thread_id = json.loads(out.data)['id']

    def test_user(self):
        res = self.app.get('/api/v1/user/%s' % self.username)
        data = json.loads(res.data)
        assert data['fullname'] == 'The Tester', data

    def test_note(self):
        res = self.app.get('/api/v1/note/%s' % self.note_id)
        assert res.status_code == 200, res.status
        data = json.loads(res.data)
        assert data['body'] == '## Xyz', data

    def test_note_search_no_query(self):
        res = self.app.get('/api/v1/note?q=')
        assert res.status_code == 200, res.status
        data = json.loads(res.data)
        count = data['result']['hits']['total']
        assert count == 1, count

    def test_note_search_2_basic_text(self):
        res = self.app.get('/api/v1/note?q=new')
        assert res.status_code == 200, res.status
        data = json.loads(res.data)
        count = data['result']['hits']['total']
        assert count == 1, count

    def test_note_search_3_should_not_match(self):
        res = self.app.get('/api/v1/note?q=nothing-that-should-match')
        assert res.status_code == 200, res.status
        data = json.loads(res.data)
        count = data['result']['hits']['total']
        assert count == 0, count

    def test_thread(self):
        res = self.app.get('/api/v1/thread/%s' % self.thread_id)
        assert res.status_code == 200, res.status
        data = json.loads(res.data)
        assert data['title'] == 'My Test Thread', data

        res = self.app.get('/api/v1/%s/thread/%s' % (self.username,
            self.thread_name), follow_redirects=True)
        assert res.status_code == 200, res.status
        data = json.loads(res.data)
        assert data['title'] == 'My Test Thread', data

    def test_thread_update(self):
        id_ = 'testupdate'
        indata = {
            'id': id_,
            'title': 'Abc'
            }
        res = self.app.post('/api/v1/thread', data=json.dumps(indata))
        indata2 = {
            'id': id_,
            'title': 'Xyz'
            }
        res = self.app.put('/api/v1/thread/%s' % id_, data=json.dumps(indata2))
        out = logic.Thread.get(id_)
        assert out['title'] == 'Xyz', out

