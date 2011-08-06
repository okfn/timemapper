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

This is a Flask-based python web-app. For storage it uses `ElasticSearch`_
which should be running in http mode on port 9200.

.. _ElasticSearch: http://www.elasticsearch.org/

Create a virtualenv (optional) then install the app and its requirements::

  pip install -e .

Run Tests
---------

Python tests require nose to be installed and for ElasticSearch to be running.
Then do::

  nose -v test/

Javascript tests just open test/index.html in a browser.


Background
==========

First version was Microfacts / Weaving History <http://weavinghistory.org>

The Plan
========

  1. Basic Thread UI (DONE) - see #8
  2. Model + API - Note, Thread, User (DONE) - see #2
  3. Wire UI up to API - see #3
  4. Fuller thread UI

    * Note full view
    * Note editing (inline and full)
    * Thread editing

  5. User Signup and Login - see #4 and #5
  6. Create Thread - see #6
  7. Authorization and Permissions (basic)

Further ahead:

  1. Import from Weaving History (and deploy)
  2. Activity object in Domain Model (and use of it)
  3. Visualizations


TODO
====

2011-07-21 #p.low generate api key for user on create

2011-07-21 #p.low generate created field and timestamp for all domain object on create

2011-07-21 #p.low update modified field with current timestamp on update for all domain objects

x 2011-07-23 || 2011-07-21 #p.low handle not found in backend nicely (ie. 404 rather than 500)

