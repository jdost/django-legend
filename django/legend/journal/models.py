from django.db import models
from markdown import markdown

# Create your models here.


class Tag(models.Model):
    name = models.CharField(max_length=30)
    url = models.SlugField(max_length=30)

    @models.permalink
    def get_absolute_url(self):
        return ('journal:tag', [self.url])

    def __json__(self):
        return {
            "name": self.name,
            "url": self.get_absolute_url()
        }


class Journal(models.Model):
    title = models.CharField(max_length=50)
    date = models.DateTimeField('date written')
    tags = models.ManyToManyField(Tag)
    content = models.TextField()
    url = models.SlugField(max_length=50)

    @models.permalink
    def get_absolute_url(self):
        return ('journal:single', [self.url])

    def __json__(self):
        return {
            "title": self.title,
            "content": markdown(self.content),
            "url": self.get_absolute_url(),
            "date": self.date.strftime("%A, %b %d"),
            "tags": [tag.__json__() for tag in self.tags.all()]
        }
