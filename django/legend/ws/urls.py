from django.conf.urls.defaults import *
from legend import ws

urlpatterns = patterns('ws.views',
   (r'^verify/$', 'verify'),

   (r'^$', 'list'),
   (r'^entry/$', 'Entry'),
   (r'^entry/(?P<id>\d*)/$', 'Entry'),
   (r'^tags/$', 'Tag'),
   (r'^tags/(?P<id>\d*)/$', 'Tag')
)
