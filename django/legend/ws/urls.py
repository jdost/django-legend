from django.conf.urls.defaults import *
from legend import ws

urlpatters = patterns('ws.views',
   (r'^$', 'list'),
   (r'^entry/$', 'Entry'),
   (r'^entry/(?P<id>\d*)/$', 'Entry'),
)
