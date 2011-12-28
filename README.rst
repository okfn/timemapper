HyperNotes is the cross of a notebook, encyclopaedia and timemap built for the
internet age.

Create notes about places, people, events and anything else string them
together into 'threads' at the click of a button.

Automatically visualize temporally and spatially, search by any attribute,
automatically import Wikipedia articles and much more ...

Demo site: http://hypernotes.dev.okfn.org/


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

Load Fixtures
-------------

To load some fixture data use the command line interface::

  node cli.js fixtures
  node cli.js load test/data/napoloen.js tester

Then visit:

  http://localhost:3000/tester/default
  http://localhost:3000/tester/napoleon


Background
==========

First version was Microfacts / Weaving History <http://weavinghistory.org>

The Plan
========

This is now deprecated, see https://github.com/okfn/hypernotes/issues.

  1. [DONE] Basic Thread UI - see #8
  2. [DONE] Model + API - Note, Thread, User - see #2
  3. [DONE] Wire UI up to API - see #3
  4. Fuller thread UI

    * [DONE] Note full view
    * Note editing (inline and full)
    * Thread editing

  5. [DONE] User Signup and Login - see #4 and #5
  6. [DONE] Create Thread - see #6
  7. Authorization and Permissions (basic)

Further ahead:

  1. Import from Weaving History (and deploy)
  2. Activity object in Domain Model (and use of it)
  3. Visualizations

