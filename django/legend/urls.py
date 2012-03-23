from django.conf.urls.defaults import *
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from legend import journal, gallery, views, ws
from legend import settings

urlpatterns = patterns('',
   (r'^journal/', include('journal.urls', namespace='journal')),
   (r'^gallery/', include('gallery.urls', namespace='gallery')),
   (r'^ws/', include('ws.urls')),
   (r'^$', 'journal.views.Entry'),

   url(r'^rss$', 'views.rss', name="rss"),
   (r'^rss.xml$', 'views.rss'),
   url(r'^admin/$', 'utils.views.admin', name="admin"),
   url(r'^about/$', 'utils.views.about', name="about")
)

