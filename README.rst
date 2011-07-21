==========
HyperNotes
==========

Note-taking meets the web.

A cross of a notebook, encyclopaedia and timemap.

Create notes about places, people, events and string them together into
'threads' at the click of a button.

Automatically visualize temporally and spatially, search by any attribute,
automatically import Wikipedia articles and much more ...


Install
======= 

Frontend
--------

Just open app/index.html in a browser.

Backend
-------

This is a Flask-based python web-app. For storage it uses elasticsearch which
should be running in http mode on port 9200.

Create a virtualenv (optional) then install the app and its requirements::

  pip install -e .

Run Tests
---------

Requires nose to be installed and for elasticsearch to be running::

  nose -v test/


Background
==========

First version was Microfacts / Weaving History <http://weavinghistory.org>

The Plan
========

  1. Start from the UI
  2. Model. Whatever you want.

    * Node: id, label 
    * Types ...
    * Revisioning

  3. Sync to remote storage


TODO
====

2011-07-21 handle not found in backend nicely (ie. 404 rather than 500)

