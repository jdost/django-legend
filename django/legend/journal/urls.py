from django.conf.urls.defaults import *
from legend import journal

urlpatterns = patterns('journal.views',
	(r'^$', 'default'),
	(r'^(?P<page>\d*)/$', 'default'),
	(r'^(?P<slug>\w*)/$', 'single'),
	(r'^@(?P<slug>\w*)/$', 'tag'),
	(r'^@(?P<slug>\w*)/(?P<page>\d*)/$', 'tag'),

	(r'^cal/(?P<mth>\d*)/(?P<yr>\d*)/$', 'cal'),
	(r'^comment/(?P<entry>\d*)/$', 'comment'),
)
