from django.conf.urls.defaults import *
from legend import journal, gallery, views, ws
import legend.settings as s

urlpatterns = patterns('',
   (r'^journal/', include('journal.urls', namespace='journal')),
   (r'^gallery/', include('gallery.urls')),
   (r'^ws/', include('ws.urls')),
   (r'^$', 'journal.views.Entry'),
   (r'^data/cal/(?P<mth>\d*)/(?P<yr>\d*)/$', 'journal.views.cal'),

   url(r'^rss$', 'views.rss', name="rss"),
   (r'^rss.xml$', 'views.rss'),
   url(r'^admin/$', 'utils.views.admin', name="admin"),
   url(r'^about/$', 'utils.views.about', name="about")
)
