from django.db import models
import legend.settings as s

# Create your models here.


class Album(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=250)
    url = models.SlugField(max_length=50)
    cover = models.CharField(max_length=15, default="")

    @models.permalink
    def get_absolute_url(self):
        return ('gallery:album', [self.url])

    def get_cover_url(self):
        if len(self.cover):
            return s.THUMBNAIL_URL.format(album=self.url, image=self.cover)
        else:
            return self.image_set.all()[0].get_thumbnail_url()

    def __json__(self):
        return {
            "name": self.name,
            "url": self.get_absolute_url(),
            "description": self.description,
            "cover": self.get_cover_url()
        }


class Image(models.Model):
    url = models.SlugField(max_length=15)
    file = models.CharField(max_length=15)
    views = models.IntegerField(default=0)
    caption = models.CharField(max_length=500)
    album = models.ForeignKey(Album)
    date = models.DateTimeField('date taken')

    @models.permalink
    def get_absolute_url(self):
        return ('gallery:image', (), {
            'album': self.album.url,
            'image': self.url
        })

    def get_static_url(self):
        return s.GALLERYIMG_URL.format(album=self.album.url, image=self.file)

    def get_thumbnail_url(self):
        return s.THUMBNAIL_URL.format(album=self.album.url, image=self.file)

    def __json__(self):
        return {
            "url": self.get_absolute_url(),
            "thumbnail": self.get_thumbnail_url(),
            "views": self.views,
            "caption": self.caption,
            "date": self.date.__str__()
        }
