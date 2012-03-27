from django.http import HttpResponse, QueryDict
from legend.journal import models as journal
from legend.gallery import models as gallery
from legend.utils import gallery_tools as tools
from legend import settings
from legend.utils import archiver

import json
import hashlib

SALT='s`\(Xp;xEQ%s}Qc_'
def verify(request):
   '''
   This generates a cookie to authorize that this browser can talk with the web services,
   It is controlled by the VERIFY value held in this file, so would require access to this
   code on the server to allow for generating this cookie, should hold indefinitely
   '''
   if request.method != 'POST':
      if isVerified(request):
         return HttpResponse(status=202)
      else:
         return HttpResponse(status=405)
   elif request.method == 'POST' and 'name' not in request.POST:
      return HttpResponse(status=400)

   auth = open(settings.SITE_ROOT + "/ws/AUTH", "r")
   verify = auth.read().strip() == '1'
   name = request.POST['name']
   response = HttpResponse(status=202)
   if verify and 'wsAuth' not in request.COOKIES:
      key_hash = hashlib.sha256(name + SALT).hexdigest()
      response.set_cookie('computer', value=name)
      response.set_cookie('wsAuth', value=key_hash,
            max_age=60*60*24*7)
   else:
      key_hash = hashlib.sha256(name + SALT).hexdigest()
      if request.COOKIES['wsAuth'] == key_hash:
         response.set_cookie('computer', value=name)
      else:
         response.status_code = 401

   return response

BAD_LOGIN = HttpResponse(status=401)
def isVerified(req):
   '''
   This verifies that the cookie generated by the <verify> function exists and checks out.
   '''
   if 'wsAuth' not in req.COOKIES or 'computer' not in req.COOKIES:
      return False
   val = hashlib.sha256(req.COOKIES['computer'] + SALT).hexdigest()
   return val == req.COOKIES['wsAuth']

def format(data):
   return HttpResponse(json.dumps(data), mimetype="application/json")
def slugify(base):
   return base.lower().replace(" ", "_").replace(",", "")
def jsonDate(date):
   return {
         "year": date.year
      ,  "month": date.month
      ,  "day": date.day
      ,  "hour": date.hour
      ,  "minute": date.minute
      ,  "second": date.second
      }
class View(object):
   def __new__(cls, request, **kwargs):
      obj = super(View, cls).__new__(cls)
      return obj(request, **kwargs)

   def __init__(self):
      pass
   def __call__(self, request, **kwargs):
      pass

definitions = {}
def list(request):
   if not isVerified(request):
      return BAD_LOGIN
   resp = {
         "base": "/ws"
      ,  "actions": definitions
      }
   return format(resp)

definitions['entry'] = {
      "name": 'entry'
   ,  "command": 'entry'
   }
class Entry(View):
   def __call__(self, request, id=None):
      if not isVerified(request):
         return BAD_LOGIN

      if request.method == 'POST':
         return format(self.post(request, id))
      elif request.method == 'GET':
         return format(self.get(request, id))
      elif request.method == 'PUT':
         return format(self.put(request, id))
      elif request.method == 'DELETE':
         return format(self.delete(request, id))

   def get(self, request, id):
      resp = {}
      if id is None:
         resp["entries"] = []
         entry_set = journal.Journal.objects.all().values('title', 'date', 'id')
         for entry in entry_set:
            resp["entries"].append({
                  "title": entry["title"]
               ,  "date": jsonDate(entry["date"])
               ,  "id": entry["id"]
               })
      else:
         entry = journal.Journal.objects.get(id=int(id))
         tags = []
         for tag in entry.tags.all():
            tags.append(tag.id)

         resp["entry"] = {
               "title": entry.title
            ,  "content": entry.content
            ,  "date": jsonDate(entry.date)
            ,  "id": entry.id
            ,  "tags": tags
            }
      return resp

   def post(self, request, id):
      post = request.POST
      if id is None:
         entry = journal.Journal()

         entry.title = post["title"]
         entry.url = slugify(entry.title)
         entry.content = post["content"]
         entry.date = post["date"]

         entry.save()

         # tags too
         tags = json.loads(post["tags"])
         for tag in tags:
            try:
               tagObj = journal.Tag.objects.get(id=int(tag))
            except ValueError:
               tagObj = journal.Tag.objects.create(name=tag, url=slugify(tag))
               tagObj.save()
            entry.tags.add(tagObj)
      else:
         entry = journal.Journal.objects.get(id=int(id))
         if entry.title != post["title"]:
            entry.title = post["title"]
            entry.url = slugify(entry.title)
         if entry.content != post["content"]:
            entry.content = post["content"]

         entry.save()

         tags = json.loads(post["tags"])
         for tag in tags:
            try:
               tagObj = journal.Tag.objects.get(id=int(tag))
            except ValueError:
               tagObj = journal.Tag.objects.create(name=tag, url=slugify(tag))
               tagObj.save()
            entry.tags.add(tagObj)

      return self.get(request, entry.id)

   def put(self, request, id):
      return {}

   def delete(self, request, id):
      if id is None:
         return {}
      entry = journal.Journal.objects.get(id=int(id))
      archiver.entry_archive(id)
      entry.delete()
      return {}

definitions['tag'] = {
      "name": 'tag'
   ,  "command": 'tag'
   }
class Tag(View):
   def __call__(self, request, id=None):
      if not isVerified(request):
         return BAD_LOGIN

      if request.POST:
         return format(self.post(request, id))
      elif request.method == "GET":
         return format(self.get(request, id))
      elif request.method == "DELETE":
         return format(self.delete(request, id))
      else:
         return format({"method": request.method})

   def get(self, request, id):
      if id is None:
         resp = {"tags": []}
         tag_set = journal.Tag.objects.all()
         for tag in tag_set:
            resp["tags"].append({
               "name": tag.name
            ,  "id": tag.id
            ,  "count": tag.journal_set.count()
            })
      else:
         tag = journal.Tag.objects.get(id=int(id))
         resp = {"tag": {
               "name": tag.name
            ,  "id": tag.id
            },
            "entries": [],
         }
         tagged = tag.journal_set.all().values('id', 'title', 'date')
         entries = journal.Journal.objects.all().values('id', 'title', 'date')
         for entry in entries:
            entry["tagged"] = entry in tagged
            entry["date"] = entry["date"].isoformat()
            resp["entries"].append(entry)

      return resp

   def post(self, request, id):
      if id is None :
         resp = {}
      else :
         tag = journal.Tag.objects.get(id=int(id))
         additions = json.loads(request.POST["additions"])
         removals = json.loads(request.POST["removals"])
         for entry_id in additions:
            entry = journal.Journal.objects.get(id=int(entry_id))
            entry.tags.add(tag)
         for entry_id in removals:
            entry = journal.Journal.objects.get(id=int(entry_id))
            entry.tags.remove(tag)
         resp = {}
      return resp

   def delete(self, request, id):
      if id is None:
         resp = {}
      else:
         tag = journal.Tag.objects.get(id=int(id))
         archiver.tag_archive(id)
         tag.delete()
         resp = {}

      return resp


definitions['album'] = {
}
class Album(View):
   def __call__(self, request, id=None):
      if not isVerified(request):
         return BAD_LOGIN

      if request.FILES:
         return format(self.files(request, id))
      if request.method == 'POST':
         return format(self.post(request, id))
      elif request.method == 'GET':
         return format(self.get(request, id))
      elif request.method == 'DELETE':
         return format(self.delete(request, id))

   def get(self, request, id):
      if id is None:
         albums = gallery.Album.objects.all()
         album_set = []
         for album in albums:
            album_set.append({
               "id": album.id
            ,  "name": album.name
            ,  "description": album.description
            })

         return { "album_set": album_set }
      else:
         album = gallery.Album.objects.get(id=int(id))
         return { "album": {
            "id": id
         ,  "name": album.name
         ,  "description": album.description
         } }

   def post(self, request, id):
      post = request.POST

      if id is None:
         album = gallery.Album()
         album.name = post["name"]
         album.description = post["description"]
         album.url = slugify(album.name)
         tools.create_album(album.url)

         album.save()
      else:
         album = gallery.Album.objects.get(id=int(id))
         if "name" in post and album.name != post["name"]:
            album.name = post["name"]
            tools.move_album(album.url, slugify(album.name))
            album.url = slugify(album.name)
         if "description" in post and album.description != post["description"]:
            album.description = post["description"]
         if "cover" in post and album.cover != post["cover"]:
            album.cover = post["cover"]

         album.save()

      return self.get(request, album.id)

   def delete(self, request, id):
      album = gallery.Album.objects.get(id=int(id))
      archiver.album_archive(id)
      #tools.remove_album(album.url)
      album.delete()
      return {}

   def files(self, request, id):
      tools.handle_images(request.FILES['images'], id)
      return {}

class Image(View):
   def __call__(self, request, id=None):
      if not isVerified(request):
         return BAD_LOGIN

      if request.POST:
         return format(self.post(request, id))
      elif request.method == "GET":
         return format(self.get(request, id))
      elif request.method == "DELETE":
         return format(self.delete(request, id))

   def get(self, request, id):
      if not id:
         return {} # BAD_REQ

      album = gallery.Album.objects.get(id=str(id))
      images = album.image_set.all()
      image_set = []
      for image in images:
         image_set.append({
            "id": image.id
         ,  "thumbnail": image.get_thumbnail_url()
         ,  "url": image.get_static_url()
         ,  "caption": image.caption
         })

      return {
         "album": {
            "name": album.name
         }
      ,  "images": image_set
      }

   def post(self, request, id):
      post = request.POST

      image = gallery.Image.objects.get(id=str(id))
      image.caption = post["caption"]
      image.save()

      return {}

   def delete(self, request, id):
      image = gallery.Image.objects.get(id=str(id))
      archiver.image_archive(id)
      image.delete()
      return {}
