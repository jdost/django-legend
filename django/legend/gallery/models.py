from django.db import models
import legend.settings as s


class Album(models.Model):
    '''
    The album is the containment object for the <Image> objects,
    this gives organization to the mass of <Image> objects that make
    up the gallery.  This holds a title and description describing
    the grouping of <Image>s.  The cover is used as a sampling of
    what the images are for (if the description isn't enough).  There
    is a slug based URL for easy access of this <Album>.
    '''
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=250)
    url = models.SlugField(max_length=50)
    cover = models.CharField(max_length=15, default="")

    @models.permalink
    def get_absolute_url(self):
        return ('gallery:album', [self.url])

    def get_cover_url(self):
        '''
    If the <cover> property is not set, defaults to the first image in the
    <Album>.  If there are no images, it will be blank
        '''
        if len(self.cover):
            return s.THUMBNAIL_URL.format(album=self.url, image=self.cover)
        elif self.image_set.count():
            return self.image_set.all()[0].get_thumbnail_url()
        else:
            return ""

    def __json__(self):
        '''
    Generates a JSON based summary of the <Album> object, used through the
    web service calls.
        '''
        return {
            "name": self.name,
            "url": self.get_absolute_url(),
            "description": self.description,
            "cover": self.get_cover_url()
        }


class Image(models.Model):
    '''
    The image is the main content of the <Gallery> module.  It is really
    just an information wrapper around a base image file.  The file itself
    has two copies of it stored.  The first is the original, used only for
    specified viewing, the second is a thumbnail version used as a basic
    preview of the image.  The image then has a short URL to access it,
    this is used to 302 to the static link, but also increments the view
    count on the image (for popularity tracking).  The <date> property is
    derived from the EXIF tags of the image.  The <Image> is then attached
    to an <Album> for organization.
    '''
    url = models.SlugField(max_length=15)
    file = models.CharField(max_length=15)
    views = models.IntegerField(default=0)
    caption = models.CharField(max_length=500)
    album = models.ForeignKey(Album)
    date = models.DateTimeField('date taken')

    @models.permalink
    def get_absolute_url(self):
        '''
    Generates the redirect URL to the original image (this one is used for
    stat gathering purposes)
        '''
        return ('gallery:image', (), {
            'album': self.album.url,
            'image': self.url
        })

    def get_static_url(self):
        '''
    Generates the static URL to the original image
        '''
        return s.GALLERYIMG_URL.format(album=self.album.url, image=self.file)

    def get_thumbnail_url(self):
        '''
    Generates the static URL to the thumbnail variant
        '''
        return s.THUMBNAIL_URL.format(album=self.album.url, image=self.file)

    def __json__(self):
        '''
    Generates a JSON based summary of the <Image> object, used through the
    web service calls
        '''
        return {
            "url": self.get_absolute_url(),
            "thumbnail": self.get_thumbnail_url(),
            "views": self.views,
            "caption": self.caption,
            "date": self.date.__str__()
        }
