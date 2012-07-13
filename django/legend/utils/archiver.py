import json
import tarfile
import os
import os.path

import legend.settings as s
import legend.journal.models as journal
import legend.gallery.models as gallery


def entry_archive(entry_id):
    '''
    This is an archiving script to take an <Entry> object that is about to be
    deleted and store it's information in a .json file that get tarred up
    and gzipped.  These are all stored in an archive folder.  It is part of
    my habit on being a data hoarder.
    '''
    from markdown import markdown

    entry = journal.Journal.objects.get(id=entry_id)
    data_file = open(entry.url + ".json", "w")
    json.dump({
        "title": entry.title,
        "date": entry.date.isoformat(),
        "content": {
            "markdown": entry.content,
            "html": markdown(entry.content)
        },
        "slug": entry.url,
        "url": entry.get_absolute_url(),
        "tags": [tag.name for tag in entry.tags.all()]
    }, data_file, indent=3)
    data_file.close()

    tarball = tarfile.open(entry.url + ".tar.gz", "w:gz")
    tarball.add(entry.url + ".json")
    tarball.close()

    archive(entry.url + ".tar.gz", "entry")
    os.remove(entry.url + ".json")


def tag_archive(tag_id):
    '''
    This is an archiving script for the <Tag> object.  It creates a .json file
    that summarizes the properties of the <Tag> object and puts it into a nice
    gzipped tarball before the object gets removed from the DB.
    '''
    tag = journal.Tag.objects.get(id=tag_id)
    entries = tag.journal_set.all()
    data_file = open(tag.url + ".json", "w")
    json.dump({
        "name": tag.name,
        "slug": tag.url,
        "url": tag.get_absolute_url(),
        "entries": [entry.url for entry in entries]
    }, data_file, indent=3)
    data_file.close()

    tarball = tarfile.open(tag.url + ".tar.gz", "w:gz")
    tarball.add(tag.url + ".json")
    tarball.close()

    archive(tag.url + ".tar.gz", "tag")
    os.remove(tag.url + ".json")


def image_archive(image_id):
    '''
    This is an archiving script for the <Image> object.  This is called when
    the object is to be deleted.  It will store the properties of the object
    into a .json file and then copy the static images (original and thumb)
    into a gzipped tarball to be stored in the central archive folder.
    '''
    from markdown import markdown

    image = gallery.Image.objects.get(id=image_id)
    data_file = open("info.json", "w")
    json.dump({
        "caption": {
            "markdown": image.caption,
            "html": markdown(image.caption)
        },
        "album": image.album.url,
        "views": image.views,
        "url": {
            "main": image.get_absolute_url(),
            "static": image.get_static_url(),
            "thumb": image.get_thumbnail_url()
        }
    }, data_file, indent=3)
    data_file.close()

    os.rename(os.path.join(s.GALLERY_ROOT, image.album.url,
        image.file), image.file)
    os.rename(os.path.join(s.GALLERY_ROOT, image.album.url,
        s.THUMBNAIL_DIR, image.file), image.file + ".thumb")

    tarball = tarfile.open(image.album.url + "." + image.url +
            ".tar.gz", "w:gz")
    tarball.add("info.json")
    tarball.add(image.file)
    tarball.add(image.file + ".thumb")
    tarball.close()

    archive(image.album.url + "." + image.url + ".tar.gz", "image")
    os.remove("info.json")
    os.remove(image.file)
    os.remove(image.file + ".thumb")


def album_archive(album_id):
    '''
    This is an archiving script for the <Album> object.  This will store
    the album information into a .json file.  This also loops over all of
    the <Image> objects associated with this <Album> and store their
    information in the JSON file as well.  All of the images then get added
    to the final tarball and get transferred to the archive folder.
    '''
    from markdown import markdown

    album = gallery.Album.objects.get(id=album_id)
    data_file = open(album.url + ".json", "w")
    json.dump({
        "name": album.name,
        "description": {
            "markdown": album.description,
            "html": markdown(album.description)
        },
        "cover": album.get_cover_url(),
        "url": album.get_absolute_url()
    }, data_file, indent=3)
    data_file.close()

    tarball = tarfile.open(album.url + ".tar.gz", "w:gz")
    tarball.add(album.url + ".json")
    image_set = album.image_set.all()
    base = os.path.join(s.GALLERY_ROOT, album.url)
    for image in image_set:
        data_file = open(image.url + ".json", "w")
        json.dump({
            "caption": {
                "markdown": image.caption,
                "html": markdown(image.caption)
             },
             "views": image.views,
             "url": {
                "main": image.get_absolute_url(),
                "static": image.get_static_url(),
                "thumb": image.get_thumbnail_url()
             }
        }, data_file, indent=3)
        data_file.close()
        tarball.add(image.url + ".json")
        os.remove(image.url + ".json")

        os.rename(os.path.join(base, image.file), image.file)
        tarball.add(image.file)
        os.remove(image.file)

        os.rename(os.path.join(base, s.THUMBNAIL_DIR, image.file),
                image.file + ".thumb")
        tarball.add(image.file + ".thumb")
        os.remove(image.file + ".thumb")

    archive(album.url + ".tar.gz", "album")
    os.remove(album.url + ".json")

    os.rmdir(os.path.join(base, s.THUMBNAIL_DIR))
    os.rmdir(base)


def archive(tar_name, archive_type):
    '''
    This just copies the prepared tarball to the archive folder for the
    specified <archive_type> (which is something like "image", "album",
    etc.)
    '''
    os.rename(tar_name, os.path.join(s.ARCHIVE_LOC, archive_type, tar_name))
