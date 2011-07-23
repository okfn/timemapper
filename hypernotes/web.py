import os
from flask import Flask, jsonify, render_template, json, request, redirect, abort

from core import app
import logic


@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin']   = '*'
    response.headers['Access-Control-Expose-Headers'] = 'Location'
    response.headers['Access-Control-Allow-Methods']  = 'GET, POST, PUT, DELETE'
    response.headers['Access-Control-Max-Age']        = '86400'
    return response


@app.route("/")
def home():
    return 'Nothing to see here - go to api'

@app.route('/api/v1/<objecttype>/<id>', methods=['GET', 'POST'])
def api_v1_id(objecttype, id):
    if request.method == 'GET':
        klass = getattr(logic, objecttype.capitalize())
        out = klass.get(id)
        if out is None:
            abort(404)
        else:
            return jsonify(out)
    else:
        pass

@app.route('/api/v1/<userid>/thread/<threadname>', methods=['GET', 'POST'])
def api_user_thread(userid, threadname):
    out = logic.Thread.by_user(userid, threadname)
    if out:
        return redirect('/api/v1/thread/' + out['id'])
    else:
        abort(404)

@app.route('/api/v1/<objecttype>', methods=['GET', 'POST', 'PUT'])
def api_v1_index(objecttype):
    klass = getattr(logic, objecttype.capitalize())
    if request.method == 'GET':
        q = request.args.get('q', None)
        results = klass.query(q)
        out = {
            'status': 'ok',
            'q': q,
            'result': results
            }
        return jsonify(out)
    else:
        data = json.loads(request.data)
        id_ = klass.upsert(data)
        out = {
            'status': 'ok',
            'id': id_
        }
        return jsonify(out)


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)

