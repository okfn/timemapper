import os
from flask import Flask, jsonify, render_template, json, request, redirect

from core import app
import logic

@app.route("/")
def home():
    return 'Nothing to see here - go to api'

@app.route('/api/v1/note/<id>', methods=['GET', 'POST'])
def api_note(id):
    if request.method == 'GET':
        out = logic.note_get(id)
        return jsonify(out)
    else:
        pass

@app.route('/api/v1/note', methods=['GET', 'POST', 'PUT'])
def api_note_index():
    if request.method == 'GET':
        # TODO: query
        pass
    else:
        data = json.loads(request.data)
        logic.note_upsert(data['id'], data)
        out = {
            'status': 'ok'
        }
        return jsonify(out)


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)

