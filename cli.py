import os
import sys
import optparse
import inspect

# does setup of cfg
import hypernotes.core
import hypernotes.logic as logic


def rebuild_db():
    '''Rebuild the db'''
    conn, db = logic.get_conn()
    conn.delete_index(db)
    conn.create_index(db)

def fixtures():
    '''Create some fixtures (e.g. for demoing).'''
    acc = logic.User.get('tester')
    if acc is None:
        account_id = logic.User.upsert(dict(
            id='tester',
            email='tester@okfn.org'
            ))
    noteids = []
    for x in [1,2,3]:
        noteid = logic.Note.upsert(dict(
            owner=account_id,
            title='Note %s' % x
            ))
        noteids.append(noteid)
    logic.Thread.upsert(dict(
        id='testerdefault',
        name='default',
        title='Default Thread',
        description='Default thread - where notes go by default.',
        owner=account_id,
        notes=noteids
        ))
    print 'Fixtures created (tester@okfn.org / pass)'


def _module_functions(functions):
    local_functions = dict(functions)
    for k,v in local_functions.items():
        if not inspect.isfunction(v) or k.startswith('_'):
            del local_functions[k]
    return local_functions

def _main(functions_or_object):
    isobject = inspect.isclass(functions_or_object)
    if isobject:
        _methods = _object_methods(functions_or_object)
    else:
        _methods = _module_functions(functions_or_object)

    usage = '''%prog {action}

Actions:
    '''
    usage += '\n    '.join(
        [ '%s: %s' % (name, m.__doc__.split('\n')[0] if m.__doc__ else '') for (name,m)
        in sorted(_methods.items()) ])
    parser = optparse.OptionParser(usage)
    # Optional: for a config file
    # parser.add_option('-c', '--config', dest='config',
    #         help='Config file to use.')
    options, args = parser.parse_args()

    if not args or not args[0] in _methods:
        parser.print_help()
        sys.exit(1)

    method = args[0]
    if isobject:
        getattr(functions_or_object(), method)(*args[1:])
    else:
        _methods[method](*args[1:])

__all__ = [ '_main' ]

if __name__ == '__main__':
    _main(locals())


