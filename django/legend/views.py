from django.http import HttpResponse, QueryDict
from django.shortcuts import render_to_response
from django.core.files import File
from legend.journal.models import *
from legend.gallery.models import *
from legend import settings

import json, datetime, os, string, dircache
from PIL import Image as ImageLib

PASSTHROUGH_IP = [	'192.168.1.6', # Zito
					'192.168.1.65', # Moses (laptop)
				  ]
GALL_SIZE = (400,300)
THUMB_SIZE = (150,150)
IMG_TYPES = ("png", "jpg", "gif", "jpeg")

def rss(request):
	j = Journal.objects.order_by('-date')[0:10]
	return render_to_response('rss.xml', {'entries': j}, mimetype="application/rss+xml")

def admin(request):
	# if IP is Passthrough, tell to request login
	if PASSTHROUGH_IP.count(request.META['REMOTE_ADDR']) > 0:
		return render_to_response('admin.html', {'pass': True})
	else:
		return render_to_response('admin.html', {'pass': False})

def adminGet(request, page, ext=-1):
	# login page, gives Username and Password to login into admin
	if page=="login":
		# if IP is Passthrough, auto login (should be called automatically)
		if PASSTHROUGH_IP.count(request.META['REMOTE_ADDR']) > 0:
			return HttpResponse(json.dumps({"login": 1}, indent=4), mimetype="application/json")
		else:
			if request.POST['name'].lower() == "jeff" and request.POST['pass'] == " ":
				return HttpResponse(json.dumps({"login": 1}, indent=4), mimetype="application/json")
			else:
				return HttpResponse(json.dumps({"login": 0}, indent=4), mimetype="application/json")
	elif page=="tags":
		tags = Tag.objects.all()
		resp = []
		for a in tags:
			resp.append(a.name)
		
		return HttpResponse(json.dumps({"tags": resp}, indent=4), mimetype="application/json")
	elif page=="entries":
		entries = Journal.objects.all()
		resp = []
		for a in entries:
			resp.append({"title": a.title, "date": a.date.isoformat(), "id": a.id})
		
		return HttpResponse(json.dumps({"entries": resp}, indent=4), mimetype="application/json")
	elif page=="entry":
		src = Journal.objects.get(id=int(ext))
		tagSet = []
		for e in src.tags.all():
			tagSet.append(e.name);
		return HttpResponse(json.dumps({"title": src.title, "content": src.content, "tags": tagSet}, indent=4), mimetype="application/json")
	elif page=="albums":
		albums = Album.objects.all()
		resp = []
		for a in albums:
			resp.append({"title": a.name, "description": a.description, "url": a.url})
		
		return HttpResponse(json.dumps({"albums": resp}, indent=4), mimetype="application/json")
	elif page=="album":
		src = Album.objects.get(url=ext)
		imgs = src.image_set.all()
		resp = []
		for a in imgs:
			resp.append({"url": a.file, "caption": a.caption, "loc": "/img/" + src.url + "/"})
		
		return HttpResponse(json.dumps({"title": src.name, "url": src.url, "imgs": resp}, indent=4), mimetype="application/json")
	else:
		return HttpResponse("NULL")
	
def journalSubmit(request, id=-1):
	if id == -1:
		entry = Journal()
		entry.title = request.POST["title"]
		entry.url = entry.title.lower().replace(" ", "_").replace(",", "")
		entry.content = request.POST["e"]
		
		entry.date = request.POST["d"]
		
		entry.save()
		
		tags = request.POST["tags"].split(",")
		for t in tags:
			t = t.strip()
			if len(t) == 0:
				continue
			nTag, created = Tag.objects.get_or_create(name=t)
			if created:
				nTag.url = t.lower().replace(" ", "_").replace(",", "")
				nTag.save()
			entry.tags.add(nTag)
		
		return HttpResponse(json.dumps({"title": entry.title, "date": entry.date, "entry": entry.content,
					"slug": entry.url, "tags": tags}, indent=4), mimetype="application/json")
	else:
		# save new/modified journal
		entry = Journal.objects.get(id=id)
		if entry.title != request.POST["title"]:
			entry.title = request.POST["title"]
			entry.url = entry.title.lower().replace(" ", "_").replace(",", "")
		
		if entry.content != request.POST["e"]:
			entry.content = request.POST["e"]
		
		entry.tags.clear()
		tags = request.POST["tags"].split(",")
		for t in tags:
			t = t.strip()
			nTag, created = Tag.objects.get_or_create(name=t)
			if created:
				nTag.url = t.lower().replace(" ", "_").replace(",", "")
				nTag.save()
			entry.tags.add(nTag)

		entry.save()
		
		return HttpResponse(json.dumps({"title": entry.title, "date": entry.date.isoformat(),
					"entry": entry.content, "slug": entry.url}, indent=4), mimetype="application/json")


def albumSubmit(request):
	if "upload" in request.FILES:
		cpy = open(settings.MEDIA_ROOT + "/" + request.FILES["upload"].name, "w")
		cpy.write(request.FILES["upload"].read(request.FILES["upload"].size))
		cpy.close()
		
		type = request.FILES["upload"].name.split(".")[1].lower()
		album = Album.objects.get(id=(int(request.POST["id"])+1))
		cnt = album.image_set.count() + 1
		
		
		if type == "zip":
			# unzip
			os.system("unzip -q " + settings.MEDIA_ROOT + "/" + request.FILES["upload"].name + " -d " + settings.GALLERY_ROOT + "/" + album.url + "/drop/")
			os.remove(settings.MEDIA_ROOT + "/" + request.FILES["upload"].name)
			
			for img in dircache.listdir(settings.GALLERY_ROOT + "/" + album.url + "/drop/"):
				dst = Image(album=album)
				dst.url = str(cnt).zfill(3)
				dst.file = dst.url + "." + img.split(".")[1]
				dst.save()
				os.rename(settings.GALLERY_ROOT + "/" + album.url + "/drop/" + img, settings.GALLERY_ROOT + "/" + album.url + "/" + dst.file)
				
				src = ImageLib.open(settings.GALLERY_ROOT + "/" + album.url + "/" + dst.file)
				src.thumbnail(THUMB_SIZE, ImageLib.ANTIALIAS)
				src.save(settings.GALLERY_ROOT + "/" + album.url + "/thumbs/" + dst.file)
				cnt += 1
				
		elif type == "tar":
			# untar
			os.system("tar -xf " + settings.MEDIA_ROOT + "/" + request.FILES["upload"].name + " -C " + settings.GALLERY_ROOT + "/" + album.url + "/drop/")
			os.remove(settings.MEDIA_ROOT + "/" + request.FILES["upload"].name)
			
			for img in dircache.listdir(settings.GALLERY_ROOT + "/" + album.url + "/drop/"):
				dst = Image(album=album)
				dst.url = str(cnt).zfill(3)
				dst.file = dst.url + "." + img.split(".")[1]
				dst.save()
				os.rename(settings.GALLERY_ROOT + "/" + album.url + "/drop/" + img, settings.GALLERY_ROOT + "/" + album.url + "/" + dst.file)
				
				src = ImageLib.open(settings.GALLERY_ROOT + "/" + album.url + "/" + dst.file)
				src.thumbnail(THUMB_SIZE, ImageLib.ANTIALIAS)
				src.save(settings.GALLERY_ROOT + "/" + album.url + "/thumbs/" + dst.file)
				cnt += 1
		elif type == "rar":
			# unrar
			os.system("unrar x " + settings.MEDIA_ROOT + "/" + request.FILES["upload"].name + " " + settings.GALLERY_ROOT + "/" + album.url + "/drop/")
			os.remove(settings.MEDIA_ROOT + "/" + request.FILES["upload"].name)
			
			for img in dircache.listdir(settings.GALLERY_ROOT + "/" + album.url + "/drop/"):
				dst = Image(album=album)
				dst.url = str(cnt).zfill(3)
				dst.file = dst.url + "." + img.split(".")[1]
				dst.save()
				os.rename(settings.GALLERY_ROOT + "/" + album.url + "/drop/" + img, settings.GALLERY_ROOT + "/" + album.url + "/" + dst.file)
				
				src = ImageLib.open(settings.GALLERY_ROOT + "/" + album.url + "/" + dst.file)
				src.thumbnail(THUMB_SIZE, ImageLib.ANTIALIAS)
				src.save(settings.GALLERY_ROOT + "/" + album.url + "/thumbs/" + dst.file)
				cnt += 1
		elif type in IMG_TYPES:
			# mv
			types = 1
		else:
			none = 1
		
		return HttpResponse(type + ", " + settings.MEDIA_ROOT + "/" + request.FILES["upload"].name + ", " + settings.GALLERY_ROOT + "/" + album.url + "/drop/")
		# if Files are being uploaded
		i = []
		# thumbnail all images
		for img in i:
			src = ImageLib.open(settings.GALLERY_ROOT + "/" + img.album.url + "/" + img.file)
			src.thumbnail(THUMB_SIZE, ImageLib.ANTIALIAS)
			src.save(settings.GALLERY_ROOT + "/" + img.album.url + "/thumbs/" + img.file)
		
		return 0;
	elif "cover" in request.POST:
		# resize cover image
		url = request.POST["cover"]
		name = "/img/" + request.POST["name"] + ".png"
		crop = (int(request.POST["x1"]), int(request.POST["y1"]),
				int(request.POST["x2"]), int(request.POST["y2"]))
	
		img = ImageLib.open(settings.GALLERY_ROOT + "/" + url)
		img = img.crop(crop)
		img = img.resize(GALL_SIZE, ImageLib.ANTIALIAS)
		img.save(name, "PNG")
	elif "description" in request.POST:
		if request.POST.has_key("id"):
			id = int(request.POST["id"])
			album = Album.objects.get(id=id)
			mod = True
			old = album.url
		else:
			mod = False
			album = Album()
			
		
		album.name = request.POST["title"]
		album.url = album.name.lower().replace(" ", "_")
		if mod:
			if album.url != old:
				# find and rename cover and folder
				os.rename(settings.GALLERY_ROOT + "/" + old + "/", settings.GALLERY_ROOT + "/" + album.url + "/")
				if os.path.exists(settings.GALLERY_ROOT + "/" + old + ".png"):
					os.rename(settings.GALLERY_ROOT + "/" + old + ".png", settings.GALLERY_ROOT + "/" + album.url + ".png")
		else:
			# generate new directories
			os.mkdir(settings.GALLERY_ROOT + "/" + album.url + "/", 0777)
			os.mkdir(settings.GALLERY_ROOT + "/" + album.url + "/thumbs/", 0777)
			os.mkdir(settings.GALLERY_ROOT + "/" + album.url + "/drop/", 0777)
		
		album.description = request.POST["description"]
			
		album.save()
		
		return HttpResponse(json.dumps({"title": album.name, "url": album.url, "description": album.description},
					indent=4), mimetype="application/json")
		
	else:
		id = int(request.POST["id"])
		imgs = Album.objects.get(id=id).image_set
		ids = request.POST.getlist("img")
		capts = request.POST.getlist("caption")
		cnt = 0
		
		for img in ids:
			i = imgs.get(id=int(img))
			i.caption = capts[cnt]
			i.save()
			cnt += 1
		
		return HttpResponse(json.dumps({"count": cnt}, indent=4), mimetype="application/json")
