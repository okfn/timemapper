import os
from flask import Flask
import default_settings

app = Flask(__name__)

app.config.from_object(default_settings)
# parent directory
here = os.path.dirname(os.path.abspath( __file__ ))
config_path = os.path.join(os.path.dirname(here), 'app.cfg')
if os.path.exists(config_path):
    app.config.from_pyfile(config_path)
ADMINS = app.config.get('ADMINS', '')
if not app.debug and ADMINS:
    import logging
    from logging.handlers import SMTPHandler
    mail_handler = SMTPHandler('127.0.0.1',
                               'server-error@no-reply.com',
                               ADMINS, 'error')
    mail_handler.setLevel(logging.ERROR)
    app.logger.addHandler(mail_handler)

