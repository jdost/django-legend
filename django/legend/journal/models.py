from django.db import models

# Create your models here.

class Tag(models.Model):
	name = models.CharField(max_length=30)
	url = models.SlugField(max_length=30)
	
#	@models.permalink
	def get_absolute_url(self):
#		return ('tag', (), {'slug': self.url})
		return "/journal/tag/%s/" % self.url

class Journal(models.Model):
	title = models.CharField(max_length=50)
	date = models.DateTimeField('date written')
	tags = models.ManyToManyField(Tag)
	content = models.TextField()
	url = models.SlugField(max_length=50)
	
#	@models.permalink
	def get_absolute_url(self):
#		return ('single', (), {'slug': self.url})
		return "/journal/%s/" % self.url

class Comment(models.Model):
	author = models.CharField(max_length=30)
	content = models.TextField()
	time = models.DateTimeField('date added')
	entry = models.ForeignKey(Journal)
	
