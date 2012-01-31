from django.conf.urls.defaults import *
from legend import journal, style, gallery, views, ws

urlpatterns = patterns('',
   (r'^journal/', include('journal.urls')),
   (r'^style/', include('style.urls')),
   (r'^search/', include('search.urls')),
   (r'^gallery/', include('gallery.urls')),
   (r'^ws/', include('ws.urls')),
   (r'^$', 'journal.views.default'),
   (r'^data/cal/(?P<mth>\d*)/(?P<yr>\d*)/$', 'journal.views.cal'),
   (r'^journal.php$', 'journal.views.default'),

   (r'^rss$', 'views.rss'),
   (r'^rss.xml$', 'views.rss'),

   (r'^admin/$', 'views.admin'),
   (r'^admin/submit/journal/$', 'views.journalSubmit'),
   (r'^admin/submit/journal/(?P<id>\d+)$', 'views.journalSubmit'),
   (r'^admin/submit/gallery/$', 'views.albumSubmit'),
   (r'^admin/(?P<page>\w+)/(?P<ext>\w*)$', 'views.adminGet'),
)
