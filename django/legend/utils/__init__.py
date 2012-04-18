from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.db.models.query import QuerySet
from django.db import models
import legend.settings as s
import json


class View(object):
    def __new__(cls, request, **kwargs):
        obj = super(View, cls).__new__(cls)
        return obj(request, **kwargs)

    def __init__(self):
        pass

    def __call__(self, request, **kwargs):
        pass


def isJSON(request):
    return "JSON" in request.GET


class ModelEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, QuerySet):
            return [ModelEncoder.default(self, o) for o in obj]
        elif isinstance(obj, models.Model):
            return obj.__json__()
        return json.JSONEncoder.default(self, obj)

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
LESS_JS = ["lib", "less"]


def response(request, page, data):
    if isJSON(request):
        return HttpResponse(json.dumps(data, cls=ModelEncoder),
                mimetype="application/json")
    else:
        if s.DEBUG and LESS_JS not in page["scripts"]:
            page["scripts"].append(LESS_JS)
        return render_to_response('base.html', {"page": page, "data": data})
