from django.conf.urls.defaults import patterns, url, include

urlpatterns = patterns('',
    (r'^journal/', include('journal.urls', namespace='journal')),
    (r'^gallery/', include('gallery.urls', namespace='gallery')),
    (r'^ws/', include('ws.urls')),
    (r'^$', 'journal.views.Entry'),

    url(r'^rss$', 'journal.views.RSS', name="rss"),
    (r'^rss.xml$', 'journal.views.RSS'),
    url(r'^admin/$', 'utils.views.admin', name="admin"),
    url(r'^about/$', 'utils.views.about', name="about")
)
