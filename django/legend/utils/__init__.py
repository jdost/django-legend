from django.http import HttpResponse
from django.shortcuts import render_to_response
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

DEFAULT = {
   "scripts": [
      ["lib","jQuery"],
      ["ui", "navbar.js"]
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
      ["journal.js"]
   ],
   "styles": DEFAULT["styles"] + [
      ["journal"]
   ],
   "id": 1,
   "values": DEFAULT["values"]
}
GALLERY = 2
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
def response(request, page, data):
   if "JSON" in request.GET:
      return HttpResponse(json.dumps(data), mimetype="application/json")
   else:
      if s.DEBUG:
         page["scripts"].append(["lib", "less"])
      return render_to_response('base.html', {"page": page, "data": data})
