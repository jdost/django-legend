from django.conf.urls.defaults import url, patterns

urlpatterns = patterns('gallery.views',
    url(r'^$', 'Gallery', name='gallery'),
    url(r'^(?P<album>\w+)/$', 'Album', name='album'),
    url(r'^(?P<album>\w+)/(?P<page>\d+)/', 'Album', name='album_paged'),
    url(r'^(?P<album>\w+)/img/(?P<image>\w+)/', 'Album', name='image'),
)
