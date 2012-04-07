from django.conf.urls.defaults import patterns

urlpatterns = patterns('ws.views',
    (r'^verify/$', 'verify'),

    (r'^$', 'list'),
    (r'^entry/$', 'Entry'),
    (r'^entry/(?P<id>\d*)/$', 'Entry'),
    (r'^tags/$', 'Tag'),
    (r'^tags/(?P<id>\d*)/$', 'Tag'),

    (r'^album/$', 'Album'),
    (r'^album/(?P<id>\d*)/$', 'Album'),
    (r'^images/(?P<id>\d*)/$', 'Image')
)
