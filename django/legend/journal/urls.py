from django.conf.urls.defaults import *
from legend import journal

urlpatterns = patterns('journal.views',
   url(r'^$', 'Entry', name='base'),
   (r'^(?P<page>\d*)/$', 'Entry'),
   (r'^(?P<slug>\w*)/$', 'Entry'),
   (r'^@(?P<slug>\w*)/$', 'Entry'),
   (r'^@(?P<slug>\w*)/(?P<page>\d*)/$', 'Entry'),

   (r'^cal/(?P<mth>\d*)/(?P<yr>\d*)/$', 'cal'),
   (r'^comment/(?P<entry>\d*)/$', 'comment'),
)
