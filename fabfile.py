from __future__ import with_statement
from fabric.api import *
from fabric.contrib.files import exists, append
from StringIO import StringIO

@task
def install_nodejs():
    is_installed = True
    with settings(warn_only=True):
        is_installed = run('node --version')
    if is_installed:
        print('*** Node already installed with version: %s' % is_installed)
    else:
        print('*** Node does not appear to installed. Installing now\n')
        cmds = [
            'apt-get install python-software-properties -y',
            'add-apt-repository ppa:chris-lea/node.js',
            'apt-get update',
            'apt-get install nodejs -y'
            ]
        for cmd in cmds:
            sudo(cmd)
    with settings(warn_only=True):
        is_installed = run('npm --version')
    if not is_installed.failed:
        print('*** npm already installed with version: %s' % is_installed)
    else:
        with cd('/tmp'):
            sudo('curl http://npmjs.org/install.sh | sh')

@task
def deploy(service_name):
    '''Deploy (or upgrade) Hypernotes service named `service_name`'''
    install_nodejs()
    basedir = '/home/okfn/var/srvc' 
    code_dir = basedir + '/' + service_name
    if not exists(code_dir):
        run('git clone https://github.com/okfn/hypernotes ' + code_dir)
    with cd(code_dir):
        run('git pull')
        run('npm install .')
    supervisor_path = '/etc/supervisor/conf.d/%s.conf' % service_name
    if not exists(supervisor_path):
        log_path = code_dir + '/log'
        run('mkdir -p %s' % log_path)
        templated = supervisor_config % {
                'service_name': service_name,
                'log_path': log_path
                }
        put(StringIO(templated), supervisor_path, use_sudo=True) 
        sudo('/etc/init.d/supervisor status')
        sudo('/etc/init.d/supervisor force-reload')
    print('Restarting supervised process for %s' % service_name)
    sudo('supervisorctl restart %s' % service_name)
    print('You will now need to have your web server proxy to port 3000' % service_name)


supervisor_config = '''
[program:%(service_name)s]
command=node /home/okfn/var/srvc/%(service_name)s/app.js

; user that owns virtual environment.
user=okfn

numprocs=2
stdout_logfile=%(log_path)s/%(service_name)s.log
stderr_logfile=%(log_path)s/%(service_name)s.error.log
'''
