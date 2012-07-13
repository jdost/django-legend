import os
import os.path as p
import random
import legend.settings as s
import legend.gallery.models as gallery

from PIL import Image
from PIL.ExifTags import TAGS


def create_album(album_name):
    '''
    simple function, creates the directory structure for an <Album> model
    '''
    os.mkdir(p.join(s.GALLERY_ROOT, album_name))
    os.mkdir(p.join(s.GALLERY_ROOT, album_name, s.THUMBNAIL_DIR))
    return


def move_album(old_name, new_name):
    '''
    simple function, used to migrate an <Album>'s folders to a new name,
    this is used when an album gets renamed
    '''
    os.rename(p.join(s.GALLERY_ROOT, old_name),
            p.join(s.GALLERY_ROOT, new_name))
    return


def remove_album(album_name):
    '''
    simple function to remove the folder for an album, used upon deletion

    *NOTE: this is not currently used, possibly set up using this or remove?
    '''
    os.rmdir(p.join(s.GALLERY_ROOT, album_name))
    return


def gen_name(tgt_dir, ext):
    '''
    generates the random filename for the images, so as to randomize and
    anonymize the images.
    '''
    path = tgt_dir
    while p.exists(path):
        fname = str(random.randint(0x10000000, 0xFFFFFFFF)) + ext
        path = p.join(tgt_dir, fname)

    return fname


def setup_img(img_path, tgt_dir):
    '''
    This takes a newly uploaded Image and preps and creates the <Image>
    object for it.  This means extracting the date from the EXIF of the
    image, creating a thumbnail of the image, resizing the original down
    to a usable size, storing both in the proper location, and returning
    the resulting <Image> object.
    '''
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
            image.date = value.replace(':', '-', 2)
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
    '''
    This takes a recently uploaded file object and turns it into the images
    of an <Album> object.  The currently supported types of files are tarballs
    and gzipped tarballs.  This can be expanded easily, whenever that may be
    needed.

    Upon extracting the images, <setup_img> is called on each image file
    '''
    album = gallery.Album.objects.get(id=int(album_id))
    file_loc = p.join(s.MEDIA_ROOT, file_obj.name)
    holder = open(file_loc, 'wb+')
    for chunk in file_obj.chunks():
        holder.write(chunk)
    holder.close()

    handlers = {
        "application/x-gzip": "tar -xzf {0} -C {1}",
        "application/x-tar": "tar -xf {0} -C {1}"
    }
    ext_handlers = {
        "tar.gz": "tar -xzf {0} -C {1}",
        "tar": "tar -xf {0} -C {1}"
    }

    if file_obj.content_type == "application/octet-stream":
        ext = file_obj.name.split('.', 1)[1]
        if ext not in ext_handlers:
            return
        os.system(ext_handlers[ext].format(file_loc, s.MEDIA_ROOT))
    elif file_obj.content_type not in handlers:
        return
    else:
        os.system(handlers[file_obj.content_type].format(file_loc,
            s.MEDIA_ROOT))

    os.remove(file_loc)

    for root, d, files in os.walk(s.MEDIA_ROOT):
        for f in files:
            try:
                img = setup_img(p.join(root, f),
                        p.join(s.GALLERY_ROOT, album.url))
                img.album = album
                img.save()
            except IOError:
                os.remove(p.join(root, f))

    return


def square(img):
    '''
    utility function to turn a sized thumbnail into a nice square image (this
    is stylistic and avoids the multiple dimensions of images in a gallery).
    '''
    box = img.getbbox()

    A = box[2] - box[0]
    B = box[3] - box[1]

    if A > B:
        diff = (A - B) / 2
        return img.crop((diff, 0, A - diff, B))
    elif B > A:
        diff = (B - A) / 2
        return img.crop((0, diff, A, B - diff))

    return img
