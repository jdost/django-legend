from django.http import HttpResponse,HttpResponseRedirect
from django.shortcuts import render_to_response
from legend.gallery.models import *
from legend.utils import *

import json

# Create your views here.
def default(request):
   aList = Album.objects.all()
   h = gen_header()

   return render_to_response('gallery.html', {'gallery': True, 'pagename': "Gallery",
                              'albumlist': aList, 'header': h})

def album(request, album):
   src = Album.objects.get(url=album)
   imgSet = src.image_set.all()
   resp = []
   i = 0
   for img in imgSet:
      resp.append({"views": img.views, "caption": img.caption,
         "thumb": "/img/" + album + "/thumbs/" + img.file,
         "main": "/img/" + album + "/" + img.file, "index": i})
      i += 1
   return HttpResponse(json.dumps({"images": resp}, indent=4), mimetype="text/plain")

def albumStatic(request, album):
   src = Album.objects.get(url=album)
   h = gen_header()
   return render_to_response('album.html', {'pagename': src.name, 'gallery': True, 'header': h})

def image(request, album, img):
   image = Image.objects.get(url=img, album=Album.objects.get(url=album))
   image.views = image.views + 1
   # image.save()
   # increase view count of image
   return HttpResponseRedirect("/img/%s/%s" % (album, image.file), mimetype="image/jpeg")

def thumb(request, album, img):
#   image = Image.objects.get(url=img)
   i = Image.objects.filter(url=img, album=Album.objects.get(url=album))
   return HttpResponseRedirect("/img/%s/thumbs/%s" % (album, i[0].file))
