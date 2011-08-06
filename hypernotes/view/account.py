from flask import Blueprint, request, url_for, flash, redirect, render_template
from flaskext.login import login_user, logout_user
from flaskext.wtf import Form, TextField, PasswordField, validators

import hypernotes.logic as logic

blueprint = Blueprint('account', __name__)


@blueprint.route('/')
def index():
    return 'Accounts'


class LoginForm(Form):
    username = TextField('Username', [validators.Required()])
    password = PasswordField('Password', [validators.Required()])

@blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm(request.form, csrf_enabled=False)
    if request.method == 'POST' and form.validate():
        password = form.password.data
        username = form.username.data
        user = logic.get_user(username)
        if user and user.check_password(password):
            login_user(user, remember=True)
            flash('Welcome back', 'success')
            return redirect(url_for('home'))
        else:
            flash('Incorrect email/password', 'error')
    if request.method == 'POST' and not form.validate():
        flash('Invalid form')
    return render_template('account/login.html', form=form)


@blueprint.route('/logout')
def logout():
    logout_user()
    flash('You were logged out')
    return redirect(url_for('home'))


class RegisterForm(Form):
    username = TextField('Username', [validators.Length(min=3, max=25)])
    email = TextField('Email Address', [validators.Length(min=3, max=35)])
    password = PasswordField('New Password', [
        validators.Required(),
        validators.EqualTo('confirm', message='Passwords must match')
    ])
    confirm = PasswordField('Repeat Password')

@blueprint.route('/register', methods=['GET', 'POST'])
def register():
    # TODO: re-enable csrf
    form = RegisterForm(request.form, csrf_enabled=False)
    if request.method == 'POST' and form.validate():
        account = logic.User(id=form.username.data, email=form.email.data)
        account.set_password(form.password.data)
        account.save()
        flash('Thanks for signing-up', 'success')
        return redirect(url_for('.login'))
    if request.method == 'POST' and not form.validate():
        flash('Please correct the errors')
    return render_template('account/register.html', form=form)

