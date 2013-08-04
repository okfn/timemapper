Create beautiful timelines and timemaps from Google Spreadsheets.


# Install

This is a Node web-app built using express.

Install Node (>=0.8 suggested) and npm then checkout the code:

    git clone https://github.com/okfn/hypernotes

Then install the dependencies:

    cd hypernotes
    npm install . 
    # for some vendor modules
    git submodule init && gitsubmodule update

Finally, you may wish to set configuration options such as database name, port
to run on etc. To do this:

    # copy the settings.json template to settings.json
    cp settings.json.tmpl settings.json
    # then edit as necessary

Now you can run the app:

    node app.js

To view the site, open localhost:3000 in a browser.

## Deploy (to Heroku)



# User Stories

Alice: user, who wants to create timelines, timemaps etc
Bob: visitor (and potential user)
Charlie: Admin of the website


## Register / Login

As Alice I want to signup (using Twitter?) so that I have an account and can login

As Alice I want to login (using Twitter?) so that I am identified to the system and the Vizs I create are owned by me

As Alice I want to see a terms of service when I signup so that I know what the licensing arrangements are for what I create and do

## Create Views

As Alice I want to create a timeline Viz quickly from my google spreadsheet so that I can share it with others

  - I want a nice url e.g. /alice/{name-of-viz}

As Alice I want to create a timemap Viz quickly from a google spreadsheet ...

As Alice I want to create an animated timemap in which the time and map interact ...

As Alice I want to create a timeline quickly from a gist so that I can share it with others
  - Structure of gist??

As Alice I want to create a map quickly from a google spreadsheet ...

As Alice I want to add a description (and attribution) to my Viz 

As Alice or Bob I want to embed my Viz in a website elsewhere so that people can see it there

As Alice I want to watch a short (video) tutorial introducing me to how this works so that I have help getting started

As Alice or Bob I want to create a Viz without logging in so that I can try out the system without signing up
  - Is this necessary if sign up is really easy?

## Forking

I want to "fork" someone elses visualization so that I can modify and extend it

## Listing and Admin

As Alice I want to list the "Vizs (viz?)" I've created 

As Bob I want to know what I can do with this service before I sign up so that I know whether it is worth doing so
  - Some featured timemaps ...

As Bob I want to see all the Vizs created by Alice so that I can see if there some I like

  - Most recent items ?

As Bob I want to see recent activity by Alice to get a sense of the cool stuff she has been doing so that I know to look at that stuff first

As Alice I want to delete a Viz so that it is not available anymore (because I don't want it visible)

As Alice I want to undo deletiion of a Viz that I accidentally deleted so that it is available again

As Alice I want to revert to previous versions of my Viz so that I can see what it was like before

As Alice I want to "hide" a Viz so that it is not visible to others (but is visible to me)
  - Is this hidden in the listing or more than that? What about people who already have the url

As Charlie I want to be able to delete someone's Viz (or account) so that it no longer is available (because they want it down or someone else does etc)

## Access Control

As Alice I want to allow a Viz built on a private spreadsheet in google docs so that I don't have to make that spreadsheet public to create a Viz of it

As Alice I want to restrict access to some of my Vizs so that only I can see them

As Alice I want to restrict access to some of my Vizs but allow specific other people to view it so that other people than me can see it

## Asides

- 2 types of data source - gists as well as google docs
  - data package structure in gists!

# History

First version was Microfacts / Weaving History <http://weavinghistory.org>

