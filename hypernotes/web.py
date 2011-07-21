import os
from flask import Flask, jsonify, render_template, json, request, redirect

from core import app
import logic

@app.route("/")
def home():
    return 'Nothing to see here - go to api'

@app.route('/api/v1/<objecttype>/<id>', methods=['GET', 'POST'])
def api_note(objecttype, id):
    if request.method == 'GET':
        klass = getattr(logic, objecttype.capitalize())
        out = klass.get(id)
        return jsonify(out)
    else:
        pass

@app.route('/api/v1/<objecttype>', methods=['GET', 'POST', 'PUT'])
def api_note_index(objecttype):
    klass = getattr(logic, objecttype.capitalize())
    if request.method == 'GET':
        # TODO: query
        pass
    else:
        data = json.loads(request.data)
        klass.upsert(data['id'], data)
        out = {
            'status': 'ok'
        }
        return jsonify(out)


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)

