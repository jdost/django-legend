import os
import os.path as p
import random
import legend.settings as s
import legend.gallery.models as gallery

from PIL import Image
from PIL.ExifTags import TAGS

def create_album(album_name):
   os.mkdir(p.join(s.GALLERY_ROOT, album_name))
   os.mkdir(p.join(s.GALLERY_ROOT, album_name, s.THUMBNAIL_DIR))
   return

def move_album(old_name, new_name):
   os.rename(p.join(s.GALLERY_ROOT, old_name), p.join(s.GALLERY_ROOT, new_name))
   return

def remove_album(album_name):
   os.rmdir(p.join(s.GALLERY_ROOT, album_name))
   return

def gen_name(tgt_dir, ext):
   path = tgt_dir
   while p.exists(path):
      fname = str(random.randint(0x10000000, 0xFFFFFFFF)) + ext
      path = p.join(tgt_dir, fname)

   return fname

def setup_img(img_path, tgt_dir):
   temp, ext = p.splitext(img_path)
   fname = gen_name(tgt_dir, ext)
   #os.rename(img_path, p.join(tgt_dir, fname))

   image = gallery.Image()
   image.file = fname
   image.url, ta = p.splitext(fname)
   image.caption = ""

   # PIL stuff here
   main = Image.open(img_path)
   info = main._getexif()
   for tag, value in info.items():
      if TAGS.get(tag, tag) == 'DateTime':
         image.date = value.replace(':','-',2)
         break

   main.thumbnail(s.MAIN_DIM, Image.ANTIALIAS)
   main.save(p.join(tgt_dir, fname))

   thumb = Image.open(img_path)
   thumb = square(thumb)
   thumb.thumbnail(s.THUMBNAIL_DIM, Image.ANTIALIAS)
   thumb.save(p.join(tgt_dir, s.THUMBNAIL_DIR, fname))

   os.remove(img_path)

   return image

def handle_images(file_obj, album_id):
   album = gallery.Album.objects.get(id=int(album_id))
   file_loc = p.join(s.MEDIA_ROOT, file_obj.name)
   holder = open(file_loc, 'wb+')
   for chunk in file_obj.chunks():
      holder.write(chunk)
   holder.close()

   handlers = {
      "application/x-gzip" : "tar -xf {0} -C {1}"
   ,  "application/x-tar"  : "tar -xf {0} -C {1}"
   }

   if file_obj.content_type not in handlers:
      return

   os.system(handlers[file_obj.content_type].format(file_loc, s.MEDIA_ROOT))
   os.remove(file_loc)

   for root, d, files in os.walk(s.MEDIA_ROOT):
      for f in files:
         try:
            img = setup_img(p.join(root, f), p.join(s.GALLERY_ROOT, album.url))
            img.album = album
            img.save()
         except IOError:
            os.remove(p.join(root, f))

   return

def square(img):
   box = img.getbbox()

   A = box[2]-box[0]
   B = box[3]-box[1]

   if A > B:
      diff = (A-B)/2
      return img.crop((diff, 0, A-diff, B))
   elif B > A:
      diff = (B-A)/2
      return img.crop((0, diff, A, B-diff))

   return img
