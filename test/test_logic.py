import util
import hypernotes.logic as logic
from nose.tools import assert_equal

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
        password = 'abc'
        user = logic.User(**inuser)
        user.set_password('abc')
        user.save()
        out = logic.get_user(self.username)
        assert out._data['fullname'] == 'The Tester'
        # because salt changes each time cannot guarantee repeatability so just
        # do startswith
        assert out._data['password'].startswith('sha1$')
        assert out.check_password(password)

