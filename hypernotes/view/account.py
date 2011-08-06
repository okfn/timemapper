from flask import Blueprint, request, url_for, flash, redirect
from flaskext.login import login_user, logout_user

from hypernotes.logic import get_user

blueprint = Blueprint('account', __name__)


@blueprint.route('/')
def index():
    return 'Accounts'


@blueprint.route('/login', methods=['GET', 'POST'])
def login():
    user = get_user('tester')
    if user:
        login_user(user)
        return 'Logged in tester'
    else:
        return 'Failed to login'


@blueprint.route('/logout')
def logout():
    logout_user()
    flash('You were logged out')
    return redirect(url_for('home'))

