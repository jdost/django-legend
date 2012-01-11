from django.db import models

# Create your models here.

class Album(models.Model):
   name = models.CharField(max_length=50)
   description = models.CharField(max_length=250)
   url = models.SlugField(max_length=50)

   def get_absolute_url(self):
      return "/gallery/%s/" % self.url

class Image(models.Model):
   url = models.SlugField(max_length=5)
   file = models.CharField(max_length=15)
   views = models.IntegerField(default=0)
   caption = models.CharField(max_length=200)
   album = models.ForeignKey(Album)

   def get_absolute_url(self):
      return "/gallery/%s/%s/" % self.album.url, self.file

class Header(models.Model):
   file = models.CharField(max_length=25)
   caption = models.CharField(max_length=200)
