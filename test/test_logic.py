import util
import hypernotes.logic as logic

class TestUser:
    username = u'tester'

    @classmethod
    def teardown_class(cls):
        util.clean_db()

    def test_upsert_and_get(self):
        inuser = {
            'id': self.username,
            'fullname': 'The Tester'
            }
        logic.User.upsert(inuser)
        out = logic.get_user(self.username)
        assert out._data['fullname'] == 'The Tester'

