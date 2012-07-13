from django.db import models
from markdown import markdown


class Tag(models.Model):
    '''
    The tag is used as a ManyToMany classification of <Journal> entries,
    mostly consists of a name and each has a slug based URL that is used
    in url.py to reference viewing entries attached to the tag in the
    M2M linking.
    '''
    name = models.CharField(max_length=30)
    url = models.SlugField(max_length=30)

    @models.permalink
    def get_absolute_url(self):
        return ('journal:tag', [self.url])

    def __json__(self):
        '''
        Generates a JSON based summary of the <Tag> entry, used through the
        web service calls.
        '''
        return {
            "name": self.name,
            "url": self.get_absolute_url()
        }


class Journal(models.Model):
    '''
    The journal is the primary model for the <Journal> module.  It holds
    the bits used for each entry.  The title has an arbitrary limit, it
    can probably be increased if I ever need to (not sure if a title should
    ever be longer than 50 chars).  The content *for now* is meant to be in
    markdown.  The url is for future work where each entry will be reachable
    via a slug based URL.
    '''
    title = models.CharField(max_length=50)
    date = models.DateTimeField('date written')
    tags = models.ManyToManyField(Tag)
    content = models.TextField()
    url = models.SlugField(max_length=50)

    @models.permalink
    def get_absolute_url(self):
        return ('journal:single', [self.url])

    def __json__(self):
        '''
        Generates a JSON based summary of the <Journal> entry, used through the
        web services calls.
        '''
        return {
            "title": self.title,
            "content": markdown(self.content),
            "url": self.get_absolute_url(),
            "date": self.date.strftime("%A, %b %d"),
            "tags": [tag.__json__() for tag in self.tags.all()]
        }
