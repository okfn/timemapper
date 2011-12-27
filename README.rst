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

This is a nodejs_ web-app built using express.

.. _nodejs: http://nodejs.org/

For storage it uses `ElasticSearch`_ which should be running in http mode on
port 9200.

.. _ElasticSearch: http://www.elasticsearch.org/

Install nodejs_ (>=0.4,<0.5) and npm_ then checkout the code::

  git clone https://github.com/okfn/hypernotes

Then install the dependencies:: 

  cd hypernotes
  npm install . 

.. _npm: http://npmjs.org/


Run Tests
---------

Ensure nodeunit is installed globally. Run::

  sudo npm install -g nodeunit

To run nodeunit, use::

  nodeunit {test-file-or-folder}

So to execute all hypernotes tests::

  cd hypernotes
  nodeunit test

To run javascript tests just open test/index.html in a browser.


Run Application
---------------

Start the application server::

  node app.js

To view the site, open localhost:3000 in a browser.


Background
==========

First version was Microfacts / Weaving History <http://weavinghistory.org>

The Plan
========

  1. [DONE] Basic Thread UI - see #8
  2. [DONE] Model + API - Note, Thread, User - see #2
  3. Wire UI up to API - see #3
  4. Fuller thread UI

    * Note full view
    * Note editing (inline and full)
    * Thread editing

  5. [DONE] User Signup and Login - see #4 and #5
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

