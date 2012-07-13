from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.db.models.query import QuerySet
from django.db import models
import legend.settings as s
import json


class View(object):
    '''
    This is the base class for all of the actual view objects used throughout
    this project.  It just outlines a basic interface for the object to be
    callable.
    '''
    def __new__(cls, request, **kwargs):
        obj = super(View, cls).__new__(cls)
        return obj(request, **kwargs)

    def __init__(self):
        pass

    def __call__(self, request, **kwargs):
        pass


def isJSON(request):
    '''
    This just tests whether the request wants the data to be formatted as
    JSON.
    '''
    return "JSON" in request.GET


class ModelEncoder(json.JSONEncoder):
    '''
    This is a simple class that handles JSON encoding of the <Model> objects,
    it just detects whether a <QuerySet> or <Model> is passed in and generates
    the JSON for the object (as defined in the __json__ method of the object).
    '''
    def default(self, obj):
        if isinstance(obj, QuerySet):  # If a <QuerySet> loop over the set
            return [ModelEncoder.default(self, o) for o in obj]
        elif isinstance(obj, models.Model):  # If a <Model> use the __json__
            return obj.__json__()
            # Otherwise, use the default encoding of the variable
        return json.JSONEncoder.default(self, obj)

'''
    These are the dictionary structures for page based information, such as
    the styles, scripts, and JS values.  They dictate constant values across
    the specific scope (GALLERY for the gallery.views, JOURNAL for the
    journal.views, etc.).  These encapsulate the information away from the
    content logic, this is more of just template information held nicely.
'''
# DEFAULT: the default values, scripts, and styles for the base page, these
#  are used across all of the template pages
DEFAULT = {
    "scripts": [
        ["lib", "jQuery"],
        ["ui", "navbar.js"],
        ["utils.js"]
    ],
    "styles": [
        ["base"],
        ["ui", "navbar"]
    ],
    "values": {
        "STATIC": s.STATIC_URL,
        "DEBUG": s.DEBUG
    }
}
# JOURNAL: the base values for the Journal templates
JOURNAL = {
    "title": "Journal",
    "template": "journal.html",
    "scripts": DEFAULT["scripts"] + [
        ["ui", "cards.js"],
        ["utils", "tracker.js"],
        ["journal.js"]
    ],
    "styles": DEFAULT["styles"] + [
        ["journal"]
    ],
    "id": 1,
    "values": DEFAULT["values"]
}
# GALLERY: the base values for the Gallery templates
GALLERY = {
    "title": "Gallery",
    "template": "gallery.html",
    "scripts": DEFAULT["scripts"] + [
        ["gallery.js"],
        ["ui", "viewer.js"],
        ["ui", "cards.js"]
    ],
    "styles": DEFAULT["styles"] + [
        ["gallery"]
    ],
    "id": 2,
    "values": DEFAULT["values"]
}
# ABOUT: the values for the About page
ABOUT = {
    "title": "About",
    "template": "about.html",
    "scripts": DEFAULT["scripts"] + [
    ],
    "styles": DEFAULT["styles"] + [
        ["about"]
    ],
    "id": 3,
    "values": DEFAULT["values"]
}
# This is used to include the less.js file if the DEBUG flag is set
LESS_JS = ["lib", "less"]


def response(request, page, data):
    '''
    This is the general handler for taking the template data dictionary and
    the generated content information and converting it into the response
    document from the server.  This will return JSON if the condition
    <isJSON> checks for is true, using the custom encoding, else it will
    return the base.html template with the view specific page dictionary.

    If the app is in DEBUG mode, it will use the .less versions of the
    styles and load the less.js library.
    '''
    if isJSON(request):
        return HttpResponse(json.dumps(data, cls=ModelEncoder),
                mimetype="application/json")
    else:
        if s.DEBUG and LESS_JS not in page["scripts"]:
            page["scripts"].append(LESS_JS)
        return render_to_response('base.html', {"page": page, "data": data})
